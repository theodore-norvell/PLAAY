/// <reference path="assert.ts" />
/// <reference path="collections.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;

/** Module dnode contains the DNode class.  DNodes are are used
 * to represent abstract syntax trees.
 */
module dnode {
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;


    /** Labels are used to label DNodes. Like DNodes, Labels are immutable objects. */
    export interface DLabel< L extends DLabel<L,T>, T extends DNode<L,T>> {
        isValid : (children:Array<T>) => boolean ;

        /** Get the string value associated with the node, if there is one.
         * For example for variables, this would be the name of the variable.
         * DLabels that don't have a string associated with them must return null.
         * DLabels that do must not return null .
         * TODO:  Better to return an option.
         * TODO: Change name to getString.
         */
        getVal : () => string ; 

        /** DLabels with string values can be open or closed.
         * When open they display in a way that permits the string value to be edited.
         * DLabels that don't have a string associated with them should return None.
         * DLabels that do have a string associated with them should return Some.
         */
        isOpen : () => boolean ;

        /** Attempt to open the label.
         * DLabels that don't have a string associated with them should return None. 
         * DLabels that don't have a string associated with them should return Some with
         * an argument that is open. 
         */
        open : () => Option<L> ; 

        /* Get the string value associated with the label if there is one */
        getString : () => Option<string> ;

        /** Possibly change the string value associated with this label. 
         * The argument must not be null!
         * DLabels that don't have a string associated with them should return None.
         * DLabels that do have a string associated with them should return Some unless
         * there is a validity problem.
         */
        changeString : (newString : string) => Option<L> ;

        /* Get the Boolean value associated with the label if there is one */
        getBoolean : () => Option<boolean> ;

        /** Possibly change the boolean value associated with this label.
         * DLabels that don't have a boolean associated with them should return None.
         * DLabels that do have a boolean associated with them should return Some unless
         * there is a validity problem.
         */
        changeBoolean : (newBoolean : boolean) => Option<L> ;

        /** Convert the label to an object that we can put out as JSON.
         * This object must of a "kind" field and the value of that field must be the name of the 
         * concrete class that implements DLabel.
         * 
         * Each concrete class implementing DLabel must also have a public
         * static method called fromJSON which takes an object such as the one returned from toJSON.
         */
        toJSON : () => object ;

        isPlaceHolder : () => boolean ;

        hasDropZonesAt : (start : number) => boolean ;

        hasVerticalLayout : () => boolean ;
            
        kind : () => string ;
    }

    /** DNodes are abstract syntax trees for the PLAAY language.
     * Each DNode consists of a DLabel and a sequence of 0 or more children.
     * 
     * DNodes are immutable objects.
     * 
     * Each DNode represents a valid tree in the sense that, if `l` is its label
     * and `chs` is an array of its children, then `l.isValid(chs)` must be true.
     */
    export abstract class DNode<L extends DLabel<L,T>, T extends DNode<L,T>> {
        protected _label:L;
        protected _children:Array<T>;

        /** Construct a DNode.
         *  recondition: label.isValid( children )
         * @param label A DLabel for the node.
         * @param children: A list (Array) of children
         */
        constructor(label:L, children:Array<T>) {
            //Precondition  would not need to be checked if the constructor were private.
            assert.check( label.isValid(children),
                          "Attempted to make an invalid program node");
            this._label = label;
            this._children = children.slice();  // Must make copy to ensure immutability.
        }

        public abstract make(label:L, children:Array<T>) : T ;

        public abstract tryMake(label:L, children:Array<T>) : Option<T> ;

        public abstract thisObject() : T ;

        /** How many children. */
        public count():number {
            return this._children.length;
        }

        public hasChildren(): boolean {
          return this.count() > 0;
        }

        /** Get some of the children as an array. */
        public children(start?:number, end?:number):Array<T> {
            if (start === undefined) start = 0;
            if (end === undefined) end = this._children.length;
            assert.checkPrecondition( 0 <= start && start <= this.count() ) ;
            assert.checkPrecondition( 0 <= end && end <= this.count() ) ;
            return this._children.slice(start, end);
        }

        /** Get one child. */
        public child(i:number):T {
            assert.checkPrecondition( 0 <= i && i < this.count() ) ;
            return this._children[i];
        }

        /** Get the label. */
        public label():L {
            return this._label;
        }

        /* Return the node at the path */
        public get(path : collections.List<number> ) : T {
             if(path.isEmpty() ) return this.thisObject() ;
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
        public tryModify(newChildren:Array<T>, start?:number, end?:number):Option<DNode<L,T>> {
            if (start === undefined) start = 0;
            if (end === undefined) end = this._children.length;
            assert.checkPrecondition( 0<= start && start <= end && end <= this._children.length ) ;
            const firstPart = this._children.slice(0, start);
            const lastPart = this._children.slice(end, this._children.length);
            const allChildren = firstPart.concat(newChildren, lastPart);
            //console.log("tryModify: start is " +start+ " end is " +end ) ; 
            //console.log("          firstPart is " +firstPart+ " lastPart is " +lastPart );
            //console.log("          newChildren is " +newChildren+ " allChildren is " +allChildren );
            return tryMake(this._label, allChildren, this.make );
        }

        /** Would tryModify succeed?
         */
        public canModify(newChildren:Array<T>, start:number, end:number):boolean {
            return ! this.tryModify(newChildren, start, end).isEmpty();
        }

        /** Return a copy of the node in which the children are replaced.
         * Precondition: canModify( newChildren, start, end )
         */
        public modify(newChildren:Array<T>, start: number, end:number):DNode<L,T> {
            const opt = this.tryModify(newChildren, start, end);
            return opt.choose(
                p => p,
                () => {
                    return assert.failedPrecondition("Precondition violation on DNode.modify");
                }) ;
        }

        /** Attempt to change the label at the root of this tree.
         * @Returns Either Some(t) where t is a tree with a new label or returns None, if such a tree is not valid.
         */
        public tryModifyLabel(newLabel:L) : Option<T> {
            return tryMake(newLabel, this._children, this.make );
        }

        /** Can the label be modified. See tryModifyLabel. */
        public canModifyLabel(newLabel:L,ctor:(lab:L, children: Array<T>) => T):boolean {
            return !this.tryModifyLabel(newLabel).isEmpty();
        }

        /** Return a tree with a different label and the same children.
         * 
         * Precondition: `canModifyLabel(newLabel)`
         */
        public modifyLabel(newLabel:L, ctor:(lab:L, children: Array<T>) => T):DNode<L,T> {
            const opt = this.tryModifyLabel(newLabel);
            return opt.choose(
                p => p,
                () => {
                    return assert.failedPrecondition("Precondition violation on DNode.modifyLabel");
                } ) ;
        }

        public isPlaceHolder():boolean { return this._label.isPlaceHolder() ; }

        public hasVerticalLayout():boolean { return this._label.hasVerticalLayout() ; }

        public hasDropZonesAt(start : number):boolean { return this._label.hasDropZonesAt(start) ;}

        /** Convert to a string for debugging purposes. */
        public toString ():string {
            const strs = this._children.map((p:T) => p.toString());
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

    }


    /** Try to make a DNode.
     * @returns `Some( t )` if a valid tree can be made. `None()` otherwise.
     */
    export function tryMake<L extends DLabel<L,T>, T extends DNode<L,T>>(
            label:L,
            children:Array<T>,
            make : (lab:L, children: Array<T>) => T )
    : Option<T> {
        if (label.isValid(children)) {
            //console.log("tryMake: label is " +label+ " children.length is " +children.length ) ; 
            return new Some( make(label, children));
        }
        else {
            return new None<T>();
        }
    }

    /** Equivalent to `label.isValid(children)`. Also equivalent to `! tryMake(label, children).isEmpty()`.
     */
    export function canMake<L extends DLabel<L,T>, T extends DNode<L,T>>(label:L, children:Array<T>):boolean {
        return label.isValid(children) ;
    }
    
    // JSON support

    export function fromDNodeToJSON<L extends DLabel<L,T>, T extends DNode<L,T>>( p : T ) : string {
        const json = p.toJSON() ;
        return JSON.stringify( json ) ; }

    export function fromJSONToDNode<L extends DLabel<L,T>, T extends DNode<L,T>>(
            s : string, registry : Registry<L,T>,
            ctor : (lab:L, children: Array<T>) => T )
    : T {
        const json : object = JSON.parse( s ) ;
        // TODO Cope with any parsing errors.
        return fromJSON<L,T>( json, registry, ctor ) ; }


    /** Convert a simple object created by toJSON to a DNode */
    function fromJSON<L extends DLabel<L,T>, T extends DNode<L,T>>(
                json : object,
                registry : Registry<L,T>,
                ctor : (lab:L, children: Array<T>) => T )
    : T {
         const label : L = fromJSONToLabel( json["label"], registry ) ;
         const children : Array<T> = json["children"].map( (o:object) => fromJSON<L,T>(o, registry, ctor) ) ;
         return ctor( label, children ) ;
    }

    function fromJSONToLabel<L extends DLabel<L,T>, T extends DNode<L,T>>( json : object, registry : Registry<L,T> ) : L {
        assert.check( json["kind"] !== undefined );
        assert.check( typeof( json["kind"] ) === "string" );
        const labelClass : LabelMaker<L,T>|undefined = registry[json["kind"]] ; // This line relies on
        //  (a) the json.kind field being the name of the concrete label class.
        //  (b) that all the concrete label classes have been resistered.
        assert.check( labelClass !== undefined ) ; //check that labelClass is not undefined
        const  fromJSON : (json : object) => L = (labelClass as LabelMaker<L,T>).fromJSON ; //
        assert.check( fromJSON !== undefined ) ; // check that fromJSON is not undefined
        return fromJSON( json ) ;
    }

    interface LabelMaker<L extends DLabel<L,T>, T extends DNode<L,T>> {
        fromJSON : (json : object) => L ;
    }

    export interface Registry<L extends DLabel<L,T>, T extends DNode<L,T>> { [key:string] : LabelMaker<L,T> ; }
}

export = dnode ;
