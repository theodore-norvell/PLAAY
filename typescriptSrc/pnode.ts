/// <reference path="assert.ts" />
/// <reference path="collections.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;

/** Module pnode contains the PNode class.  PNodes are Program Nodes and are used
 * to represent abstract syntax trees.  See also the labels module.
 */
module pnode {
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;
    import none = collections.none;
    import some = collections.some;
    import arrayToList = collections.arrayToList;


    /** Labels are used to label PNodes. Like PNodes, Labels are immutable objects. */
    export interface Label {
        isValid : (children:Array<PNode>) => boolean ;

        /** Get the string value associated with the node, if there is one.
         * For example for variables, this would be the name of the variable.
         * Labels that don't have a string associated with them must return null.
         * Labels that do must not return null .
         * TODO:  Better to return an option.
         * TODO: Change name to getString.
         */
        getVal : () => string ; 

        /** Labels with string values can be open or closed.
         * When open they display in a way that permits the string value to be edited.
         * Labels that don't have a string associated with them should return None.
         * Labels that do have a string associated with them should return Some.
         */
        isOpen : () => boolean ;

        /** Attempt to open the label.
         * Labels that don't have a string associated with them should return None. 
         * Labels that don't have a string associated with them should return Some with
         * an argument that is open. 
         */
        open : () => Option<Label> ; 

        /** Possibly change the string value associated with this label. 
         * The argument must not be null!
         * Labels that don't have a string associated with them should return None.
         * Labels that do have a string associated with them should return Some unless
         * there is a validity problem. E.g. the string associated with a number should be
         * properly formatted.  If it returns Some, the new label should be closed.
         */
        changeString : (newString : string) => Option<Label> ;

        /** Convert the label to an object that we can put out as JSON.
         * This object must of a "kind" field and the value of that field must be the name of the 
         * concrete class that implements Label.
         * 
         * Each concrete class implementing Label must also have a public
         * static method called fromJSON which takes an object such as the one returned from toJSON.
         */
        toJSON : () => object ;

        /** Is this label a label for an expression node? */
        isExprNode : () => boolean ;

        /** Is this label a label for an expression sequence node? */
        isExprSeqNode : () => boolean ;

        /** Is this label a label for a type node node? */
        isTypeNode : () => boolean ;

        isPlaceHolder : () => boolean ;

        hasDropZonesAt : (start : number) => boolean ;

        hasVerticalLayout : () => boolean ;
            
        kind : () => string ;
    }

    /** PNodes are abstract syntax trees for the PLAAY language.
     * Each PNode consists of a Label and a sequence of 0 or more children.
     * 
     * PNodes are immutable objects.
     * 
     * Each PNode represents a valid tree in the sense that, if `l` is its label
     * and `chs` is an array of its children, then `l.isValid(chs)` must be true.
     */
    export class PNode {
        private _label:Label;
        private _children:Array<PNode>;

        /** Construct a PNode.
         *  recondition: label.isValid( children )
         * @param label A Label for the node.
         * @param children: A list (Array) of children
         */
        constructor(label:Label, children:Array<PNode>) {
            //Precondition  would not need to be checked if the constructor were private.
            assert.check( label.isValid(children),
                          "Attempted to make an invalid program node");
            this._label = label;
            this._children = children.slice();  // Must make copy to ensure immutability.
        }

        /** How many children. */
        public count():number {
            return this._children.length;
        }

        public hasChildren(): boolean {
          return this.count() > 0;
        }

        /** Get some of the children as an array. */
        public children(start?:number, end?:number):Array<PNode> {
            if (start === undefined) start = 0;
            if (end === undefined) end = this._children.length;
            assert.checkPrecondition( 0 <= start && start <= this.count() ) ;
            assert.checkPrecondition( 0 <= end && end <= this.count() ) ;
            return this._children.slice(start, end);
        }

        /** Get one child. */
        public child(i:number):PNode {
            assert.checkPrecondition( 0 <= i && i < this.count() ) ;
            return this._children[i];
        }

        /** Get the label. */
        public label():Label {
            return this._label;
        }

        /* Return the node at the path */
        public get(path : collections.List<number> ) : PNode {
             if(path.isEmpty() ) return this ;
             else return this.child( path.first() ).get( path.rest() ) ;
        }


        /** Possibly return a copy of the node in which the children are replaced.
         * The result will have children
         * ~~~
         *    [c[0], c[1], c[start-1]] ++ newChildren ++ [c[end], c[end+1], ...]
         * ~~~
         * where `c` is `this.children()`.
         * I.e. the segment `c[ start,.. end]` is replaced by `newChildren`.
         * The method succeeds iff the node required to be constructed would be valid.
         * Node that start and end can be any number value including negative.
         * Negative numbers `k` are treated as `length + k`, where `length`
         * is the number of children.
         * @param newChildren An array of children to be added
         * @param start The first child to omit. Default 0.
         * @param end The first child after start to not omit. Default this.children().length.
         */
        public tryModify(newChildren:Array<PNode>, start?:number, end?:number):Option<PNode> {
            if (start === undefined) start = 0;
            if (end === undefined) end = this._children.length;
            const firstPart = this._children.slice(0, start);
            const lastPart = this._children.slice(end, this._children.length);
            const allChildren = firstPart.concat(newChildren, lastPart);
            //console.log("tryModify: start is " +start+ " end is " +end ) ; 
            //console.log("          firstPart is " +firstPart+ " lastPart is " +lastPart );
            //console.log("          newChildren is " +newChildren+ " allChildren is " +allChildren );
            return tryMake(this._label, allChildren);
        }

        /** Would tryModify succeed?
         */
        public canModify(newChildren:Array<PNode>, start:number, end:number):boolean {
            return ! this.tryModify(newChildren, start, end).isEmpty();
        }

        /** Return a copy of the node in which the children are replaced.
         * Precondition: canModify( newChildren, start, end )
         */
        public modify(newChildren:Array<PNode>, start:number, end:number):PNode {
            const opt = this.tryModify(newChildren, start, end);
            return opt.choose(
                p => p,
                () => {
                    return assert.failedPrecondition("Precondition violation on PNode.modify");
                }) ;
        }

        /** Attempt to change the label at the root of this tree.
         * @Returns Either Some(t) where t is a tree with a new label or returns None, if such a tree is not valid.
         */
        public tryModifyLabel(newLabel:Label):Option<PNode> {
            return tryMake(newLabel, this._children);
        }

        /** Can the label be modified. See tryModifyLabel. */
        public canModifyLabel(newLabel:Label):boolean {
            return !this.tryModifyLabel(newLabel).isEmpty();
        }

        /** Return a tree with a different label and the same children.
         * 
         * Precondition: `canModifyLabel(newLabel)`
         */
        public modifyLabel(newLabel:Label):PNode {
            const opt = this.tryModifyLabel(newLabel);
            return opt.choose(
                p => p,
                () => {
                    return assert.failedPrecondition("Precondition violation on PNode.modifyLabel");
                } ) ;
        }

        public isExprNode():boolean { return this._label.isExprNode() ; }

        public isExprSeqNode():boolean  { return this._label.isExprSeqNode() ; }

        public isTypeNode():boolean  { return this._label.isTypeNode() ; }

        public isPlaceHolder():boolean { return this._label.isPlaceHolder() ; }

        public hasVerticalLayout():boolean { return this._label.hasVerticalLayout() ; }

        public hasDropZonesAt(start : number):boolean { return this._label.hasDropZonesAt(start) ;}

        /** Convert to a string for debugging purposes. */
        public toString ():string {
            const strs = this._children.map((p:PNode) => p.toString());
            const args = strs.reduce((a:string, p:string) => a + " " + p.toString(), "");

            return this._label.toString() + "(" + args + ")";
        }

        /** Convert a node to a simple object that can be stringified with JSON */
        public toJSON () : object {
            const result : object = {} ;
            result["label"] = this._label.toJSON() ;
            result["children"] = [] ;
            for( let i = 0 ; i < this._children.length ; ++i ) {
                result["children"].push( this._children[i].toJSON() ) ; }
            return result ;
        }

        /** Convert a simple object created by toJSON to a PNode */
        public static fromJSON( json : object ) : PNode {
             const label : Label = fromJSONToLabel( json["label"] ) ;
             const children : Array<PNode> = json["children"].map( (o:object) => PNode.fromJSON(o) ) ;
             return make( label, children ) ;
        }

    }


    /** Try to make a PNode.
     * @returns `Some( t )` if a valid tree can be made. `None()` otherwise.
     */
    export function tryMake(label:Label, children:Array<PNode>):Option<PNode> {
        if (label.isValid(children)) {
            //console.log("tryMake: label is " +label+ " children.length is " +children.length ) ; 
            return new Some(new PNode(label, children));
        }
        else {
            return new None<PNode>();
        }
    }

    /** Equivalent to `label.isValid(children)`. Also equivalent to `! tryMake(label, children).isEmpty()`.
     */
    export function canMake(label:Label, children:Array<PNode>):boolean {
        return label.isValid(children) ;
    }

    /** Construct a PNode.
     * Precondition: label.isValid( children )
     * @param label A Label for the node.
     * @param children: A list (Array) of children
     */
    export function make(label:Label, children:Array<PNode>):PNode {
        return new PNode(label, children);
    }
    
    // JSON support

    export function fromPNodeToJSON( p : PNode ) : string {
        const json = p.toJSON() ;
        return JSON.stringify( json ) ; }

    export function fromJSONToPNode( s : string ) : PNode {
        const json : object = JSON.parse( s ) ;
        // TODO Cope with any parsing errors.
        return PNode.fromJSON( json ) ; }

    function fromJSONToLabel( json : object ) : Label {
        assert.check( json["kind"] !== undefined );
        assert.check( typeof( json["kind"] ) === "string" );
        const labelClass : LabelMaker|undefined = registry[json["kind"]] ; // This line relies on
        //  (a) the json.kind field being the name of the concrete label class.
        //  (b) that all the concrete label classes have been resistered.
        assert.check( labelClass !== undefined ) ; //check that labelClass is not undefined
        const  fromJSON : (json : object) => Label = labelClass.fromJSON ; //
        assert.check( fromJSON !== undefined ) ; // check that fromJSON is not undefined
        return fromJSON( json ) ;
    }

    interface LabelMaker {
        fromJSON : (json : object) => Label ;
    }

    interface Registry { [key:string] : LabelMaker ; }
    
    export const registry : Registry = {} ;
}

export = pnode ;
