/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="dnode.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import dnode = require( './dnode' ) ;

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
    export interface PLabel extends dnode.DLabel<PLabel, PNode> {

        /** Is this label a label for a type node node? */
        isExprNode : () => boolean ;

        /** Is this label a label for a type node node? */
        isTypeNode : () => boolean ;

        /** Is this label a label for a type declaration node? */
        isVarDeclNode : () => boolean ;

        /* Is this a label for expression sequences */
        isExprSeqNode : () => boolean ;

        getPrecedence : () => number ;

        getChildPrecedence : (child : number) => number ;
    }

    /** PNodes are abstract syntax trees for the PLAAY language.
     * Each PNode consists of a Label and a sequence of 0 or more children.
     * 
     * PNodes are immutable objects.
     * 
     * Each PNode represents a valid tree in the sense that, if `l` is its label
     * and `chs` is an array of its children, then `l.isValid(chs)` must be true.
     */
    export class PNode extends dnode.DNode<PLabel, PNode> {

        constructor(label:PLabel, children:Array<PNode>) {
            super( label, children ) ;
        }

        public make(label:PLabel, children:Array<PNode>) : PNode {
            return make( label, children ) ;
        }

        public tryMake(label:PLabel, children:Array<PNode>) : Option<PNode> {
            return tryMake( label, children ) ;
        }

        public thisObject() : PNode {
            return this ;
        }

        public isExprNode() : boolean { return this._label.isExprNode() ; }

        public isTypeNode() : boolean { return this._label.isTypeNode() ; }

        public isVarDeclNode() : boolean { return this._label.isVarDeclNode() ; }

        public isExprSeqNode() : boolean { return this._label.isExprSeqNode() ; }
    }

    /** Try to make a PNode.
     * @returns `Some( t )` if a valid tree can be made. `None()` otherwise.
     */
    export function tryMake(label:PLabel, children:Array<PNode>):Option<PNode> {
        return dnode.tryMake( label, children, make ) ;
    }

    /** Equivalent to `label.isValid(children)`. Also equivalent to `! tryMake(label, children).isEmpty()`.
     */
    export function canMake(label:PLabel, children:Array<PNode>):boolean {
        return label.isValid(children) ;
    }

    /** Construct a PNode.
     * Precondition: label.isValid( children )
     * @param label A Label for the node.
     * @param children: A list (Array) of children
     */
    export function make(label:PLabel, children:Array<PNode>):PNode {
        return new PNode(label, children);
    }
    
    // JSON support

    export function fromPNodeToJSON( p : PNode ) : string {
        return dnode.fromDNodeToJSON<PLabel,PNode>( p ) ; }

    export function fromJSONToPNode( s : string ) : PNode {
        return dnode.fromJSONToDNode( s, registry, make ) ; }
    
    export const registry : dnode.Registry<PLabel,PNode> = {} ;
}

export = pnode ;
