/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="edits.ts" />
/// <reference path="pnode.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import pnode = require( './pnode' ) ;

/** Module selection exports the Selection class q.v.
 */
module selection {
    import List = collections.List ;
    import PNode = pnode.PNode ;

    /** A Selection indicates a set of selected nodes within a tree.
    * The path must identify some node under the root in the following way.
    * If the path is empty, the root is identified. Otherwise the first
    * item of the path must identify a child of the root and the rest of
    * the path indicates a node equal to or under than child in the same way.
    * Let `p` be the node identified by the path.  The selected nodes are the
    * children of `p` numbered between the `focus` and the `anchor`.
    * We require `0 <= focus <= p.count()` and `0 <= anchor <= p.count()`.
    * 
    * * If `focus == anchor`, no nodes are selected but the selection
    * defines a selection point.
    * * If `focus < anchor`, the selected nodes are the children of p numbered k
    * where `focus <= k < anchor`.
    * * If `anchor < focus`, the selected nodes are the children of p numbered k
    * where `anchor <= k < focus`.
    * 
    * Invariant:
    * 
    * * The path must identify a node under the root.
    *       I.e. the path can be empty or its first item must be
    *       the index of a child of the root and the rest of the path must
    *       identify a node under that child.
    * * The focus and anchor must both be integers greater or equal to 0 and
    *     less or equal to the number of children of the node identified by the path.
    */
    export class Selection {

        private readonly _root : PNode ;
        private readonly _path : List<number> ;
        private readonly _anchor : number ;
        private readonly _focus : number ;

        constructor( root : PNode, path : List<number>,
                     anchor : number, focus : number ) {
            assert.checkPrecondition( checkSelection( root, path, anchor, focus ), 
                                      "Attempt to make a bad selection" ) ;
            this._root = root;
            this._path = path;
            this._anchor = anchor ;
            this._focus = focus ;
        }
        
        public root() : PNode { return this._root ; }
        
        public path() : List<number> { return this._path ; }
        
        public anchor() : number { return this._anchor ; }
        
        public focus() : number { return this._focus ; }

        public start() : number { return Math.min( this._anchor, this._focus ) ; }

        public end() : number { return Math.max( this._anchor, this._focus ) ; }

        public parent() : PNode {
            let node : PNode = this._root ;
            let path : List<number> = this._path ;
            while( ! path.isEmpty() ) {
                node = node.child( path.first() ) ;
                path = path.rest() ;
            }
            return node ;
        }

        public swap() : Selection {
            return new Selection( this._root, this._path, this._focus, this._anchor ) ;
        }

        public size() : number { return this.end() - this.start() ; }

        public selectedNodes() : Array<PNode> {
            return this.parent().children( this.start(), this.end() ) ;
        }
        
        public toString() : string { return "Selection( " + "_root:" + this._root.toString() +
                            " _path:" + this._path.toString() +
                            " _anchor: " + this._anchor +
                            " _focus: " + this._focus + ")"  ; }
    }
    
    function isInteger( n : number ) : boolean {
        return isFinite(n) && Math.floor(n) === n ; }
    
    /** Checks the invariant of Selection.  See the documentation of Selection. */
    export function checkSelection( tree : PNode, path : List<number>,
                                    anchor : number, focus : number ) : boolean { 
        if( path.isEmpty() ) {
            let start : number ;
            let end : number ;
            if( anchor < focus ) { start = anchor ; end = focus ; }
            else { start = focus ; end = anchor ; }
            return isInteger(start) && isInteger(end)
                && 0 <= start && end <= tree.count() ; }
        else {
            const head = path.first() ;
            return isInteger( head )
                && 0 <= head && head < tree.count()
                && checkSelection( tree.child(head), path.rest(), anchor, focus ) ; } }
}

export = selection ;
