/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="valueTypes.ts" />
/// <reference path="vms.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import valueTypes = require( './valueTypes' ) ;
import vms = require('./vms' ) ;

/** Module pnode contains the PNode class and the implementations of the labels. */
module pnode {
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;
    import VMS = vms.VMS;
    import Evaluation = vms.Evaluation;
    import VarStack = vms.VarStack;
    import EvalStack = vms.EvalStack;
    import Value = vms.Value;
    import BuiltInV = valueTypes.BuiltInV;
    import ValueMap = vms.ValueMap;
    import FieldI = vms.FieldI ;
    import Field = valueTypes.Field;
    import ClosureV = valueTypes.ClosureV;
    import StringV = valueTypes.StringV;
    import arrayToList = collections.arrayToList;
    import Type = vms.Type;
    import ObjectV = valueTypes.ObjectV;

    /** Labels are used to label PNodes. Like PNodes, Labels are immutable objects. */
    export interface Label {
        isValid: (children: Array<PNode>) => boolean;
        strategy: nodeStrategy;
        step: (vms: VMS) => void;

        getVal: () => string;

        /** Possibly change the label associated with a node. 
         * TODO: This seems a hack. Do we need it?
        */
        changeValue: (newString: string) => Option<Label>;

        /** Convert the label to an object that we can put out as JSON.
         * This object must of a "kind" field and the value of that field must be the name of the 
         * concrete class that implements Label.
         * 
         * Each concrete class implementing Label must also have a public
         * static method called fromJSON which takes an object such as the one returned from toJSON.*/
        toJSON: () => any;

        /** Is this label a label for an expression node? */
        isExprNode: () => boolean;

        /** Is this label a label for an expression sequence node? */
        isExprSeqNode: () => boolean;

        /** Is this label a label for a type node node? */
        isTypeNode: () => boolean;
    }
    
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
            assert.check(label.isValid(children),
                "Attempted to make an invalid program node");
            this._label = label;
            this._children = children.slice();  // Must make copy to ensure immutability.
        }

        /** How many children. */
        public count():number {
            return this._children.length;
        }

        /** Get some of the children as an array. */
        public children(start:number, end:number):Array<PNode> {
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
        public get(path : collections.List<number> | Array<number> ) : PNode {
            // TODO. Do we really need to be able to pass in an array?
             if( path instanceof Array ) 
                 return this.listGet( collections.arrayToList( path ) ) ;
             else if( path instanceof collections.List ) {
                return this.listGet( path ) ; }
             else { assert.checkPrecondition( false, "Bad path argument.") ; return null ; }
        }

        private listGet(path : collections.List<number> ) : PNode {
             if(path.isEmpty() ) return this ;
             else return this.child( path.first() ).listGet( path.rest() ) ;
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
        public tryModify(newChildren:Array<PNode>, start:number, end:number):Option<PNode> {
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
            var opt = this.tryModify(newChildren, start, end);
            return opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                })
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
            var opt = this.tryModifyLabel(newLabel);
            return opt.choose(
                p => p,
                () => {
                    assert.checkPrecondition(false, "Precondition violation on PNode.modifyLabel");
                    return null;
                })
        }

        public isExprNode():boolean { return this._label.isExprNode() ; }

        public isExprSeqNode():boolean  { return this._label.isExprSeqNode() ; }

        public isTypeNode():boolean  { return this._label.isTypeNode() ; }

        /** Convert to a string for debugging purposes. */
        toString ():string {
            var strs = this._children.map((p:PNode) => p.toString());
            var args = strs.reduce((a:string, p:string) => a + " " + p.toString(), "");

            return this._label.toString() + "(" + args + ")";
        }

        /** Convert a node to a simple object that can be stringified with JSON */
        toJSON () : any {
            var result : any = {} ;
            result.label = this._label.toJSON() ;
            result.children = [] ;
            var i ;
            for( i = 0 ; i < this._children.length ; ++i )
                result.children.push( this._children[i].toJSON() ) ;
            return result ;
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
        return label.isValid(children)
    }

    /** Construct a PNode.
     * Precondition: label.isValid( children )
     * @param label A Label for the node.
     * @param children: A list (Array) of children
     */
    export function make(label:Label, children:Array<PNode>):PNode {
        return new PNode(label, children);
    }







 
}

export = pnode ;
