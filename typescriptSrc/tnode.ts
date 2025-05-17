/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="dnode.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import dnode = require( './dnode' ) ;

/** Module tnode contains the TNode class.  TNodes are Test Nodes and are used
 * to represent text nodes, such as comments and documents.
 * See also the tlabels modules.
 */
module tnode {
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;
    import none = collections.none;
    import some = collections.some;
    import arrayToList = collections.arrayToList;


    /** Labels are used to label TNodes. Like TNodes, Labels are immutable objects. */
    export interface TLabel extends dnode.DLabel<TLabel, TNode> {

        isMathNode : () => boolean ;
    }

    /** TNodes are abstract syntax trees for text.
     * Each TNode consists of a Label and a sequence of 0 or more children.
     * 
     * TNodes are immutable objects.
     * 
     * Each TNode represents a valid tree in the sense that, if `l` is its label
     * and `chs` is an array of its children, then `l.isValid(chs)` must be true.
     */
    export class TNode extends dnode.DNode<TLabel, TNode> {

        constructor(label:TLabel, children:Array<TNode>) {
            super( label, children ) ;
        }

        public make(label:TLabel, children:Array<TNode>) : TNode {
            return make( label, children ) ;
        }

        public tryMake(label:TLabel, children:Array<TNode>) : Option<TNode> {
            return tryMake( label, children ) ;
        }

        public thisObject() : TNode {
            return this ;
        }
    }

    /** Try to make a TNode.
     * @returns `Some( t )` if a valid tree can be made. `None()` otherwise.
     */
    export function tryMake(label:TLabel, children:Array<TNode>):Option<TNode> {
        return dnode.tryMake( label, children, make ) ;
    }

    /** Equivalent to `label.isValid(children)`. Also equivalent to `! tryMake(label, children).isEmpty()`.
     */
    export function canMake(label:TLabel, children:Array<TNode>):boolean {
        return label.isValid(children) ;
    }

    /** Construct a TNode.
     * Precondition: label.isValid( children )
     * @param label A Label for the node.
     * @param children: A list (Array) of children
     */
    export function make(label:TLabel, children:Array<TNode>):TNode {
        return new TNode(label, children);
    }
    
    // JSON support

    export function fromTNodeToJSON( p : TNode ) : string {
        return dnode.fromDNodeToJSON<TLabel,TNode>( p ) ; }

    export function fromJSONToTNode( s : string ) : TNode {
        return dnode.fromJSONToDNode( s, registry, make ) ; }
    
    export const registry : dnode.Registry<TLabel,TNode> = {} ;
}

export = tnode ;
