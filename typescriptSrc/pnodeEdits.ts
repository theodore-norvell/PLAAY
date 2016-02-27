/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="edits.ts" />

import collections = require( './collections' ) ;
import assert = require( './assert' ) ;
import pnode = require( './pnode' ) ;
import edits = require( './edits' ) ;

module pnodeEdits {
    import Option = collections.Option;
    import None = collections.None;
    import Some = collections.Some;
    import List = collections.List;
    import PNode = pnode.PNode ;
    import Edit = edits.Edit ;
    import AbstractEdit = edits.AbstractEdit ;
    
    
    /** A Selection indicates a set of selected nodes within a tree.
    * The path must identify some node under the root in the following way.
    * If the path is empty, the root is identified. Otherwise the first
    * item of the path must identify a child of the root and the rest of
    * the path indicates a node equal to or under than child in the same way.
    * Let p be the node identified by the path.  The selected nodes are the
    * children of p numbered between the focus and the anchor.
    * We require 0 <= focus <= p.count() and 0 <= focus <= p.count().
    * <ul>
    * <li> If focus == anchor, no nodes are selected but the selection
    * defines a selection point.
    * <li> If focus < anchor, the selected nodes are the children of p numbered k
    * where focus <= k < anchor.
    * <li> If anchor < focus, the selected nodes are the children of p numbered k
    * where anchor <= k < focus.
    * </ul>
    * Invariant:
    *   - The path must identify a node under the root.
    *       I.e. the path can be empty or its first item must be
    *       the index of a child of the root and the rest of the path must
    *       identify a node under that child.
    *   - The focus and anchor must both be integers greater or equal to 0 and
    *     less or equal to the number of children of the node identified by the path.
    */
    export class Selection {
        constructor( root : PNode, path : List<number>,
                    anchor : number, focus : number ) {
            assert.check( checkSelection( root, path, anchor, focus ), 
                         "Attempt to make a bad selection" ) ;
            this._root = root;
            this._path = path;
            this._anchor = anchor ;
            this._focus = focus ; }

        private _root : PNode ;
        private _path : List<number> ;
        private _anchor : number ;
        private _focus : number ;
        
        root() : PNode { return this._root ; }
        
        path() : List<number> { return this._path ; }
        
        anchor() : number { return this._anchor ; }
        
        focus() : number { return this._focus ; }
        
        toString() : string { return "Selection( " + "_root:" + this._root.toString() +
                            " _path:" + this._path.toString() +
                            " _anchor: " + this._anchor +
                            " _focus: " + this._focus + ")"  ;}
    }
    
    function isInteger( n : number ) {
        return isFinite(n) && Math.floor(n) === n ; }
    
    /** Checks the invariant of Selection.  See the documentation of Selection. */
    function checkSelection( tree : PNode, path : List<number>,
                    anchor : number, focus : number ) { 
        if( path.isEmpty() ) {
            var start, end ;
            if( anchor < focus ) { start = anchor ; end = focus ; }
            else { start = focus ; end = anchor ; }
            return isInteger(start) && isInteger(end)
                && 0 <= start && end <= tree.count() ; }
        else {
            var head = path.first() ;
            return isInteger( head )
                && 0 <= head && head < tree.count()
                && checkSelection( tree.child(head), path.rest(), anchor, focus ) ; } }

    //TODO test this out
    export class DeleteEdit extends AbstractEdit<Selection> {

        constructor() {
            super() ; }

        applyEdit( selection : Selection ) : Option<Selection> {
            // The following function dives down the tree following the path
            // until it reaches the node to be changed.
            // As it climbs back out of the recursion it generates new
            // nodes along the path it followed.
            const loop = ( node : PNode, path : List<number>,
                           start : number, end : number ) : Option<PNode> =>
            {
                if( path.size() == 1 ) {
                    return node.tryModify( [], start, end ) ; }
                else {
                    const k = path.first() ;
                    const len = node.count() ;
                    assert.check( 0 <= k, "Bad Path. k < 0 in applyEdit" ) ;
                    assert.check( k < len, "Bad Path. k >= len in applyEdit" ) ;
                    const opt = loop( node.child(k), path.rest(), start, end ) ;
                    return opt.choose(
                        ( newChild : PNode ) : Option<PNode> => {
                            return node.tryModify( [newChild], k, k+1 ) ; },
                        () => { return new None<PNode>() ; } ) ; }
            };

            // Determine the start and end
            var start : number ;
            var end : number ;
            if( selection.anchor() <= selection.focus() ) {
                start = selection.anchor() ; end = selection.focus() ; }
            else {
                start = selection.focus() ; end = selection.anchor() ; }
            // Loop down to find and modify the selections target node.
            const opt = loop( selection.root(), selection.path(), start, end ) ;
            // If successful, build a new Selection object.
            return opt.choose(
                ( newRoot : PNode ) : Option<Selection> => {
                    const f = start;
                    const newSelection = new Selection( newRoot,
                        selection.path(),
                        f, f) ;
                    return new Some( newSelection ) ; },
                () : Option<Selection>  => { return new None<Selection> () ; } ) ;
        }
    }

    export class InsertChildrenEdit extends AbstractEdit<Selection> {
        _newNodes : Array<PNode> ;

        constructor( newNodes : Array<PNode> ) {
            super() ;
            this._newNodes = newNodes ; }

        applyEdit( selection : Selection ) : Option<Selection> {
            // The following function dives down the tree following the path
            // until it reaches the node to be changed.
            // As it climbs back out of the recursion it generates new
            // nodes along the path it followed.
            const loop = ( node : PNode, path : List<number>,
                           start : number, end : number ) : Option<PNode> =>
            {
                if( path.isEmpty() ) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    return node.tryModify( this._newNodes, start, end ) ; }
                else {
                    const k = path.first() ;
                    const len = node.count() ;
                    assert.check( 0 <= k, "Bad Path. k < 0 in applyEdit" ) ;
                    assert.check( k < len, "Bad Path. k >= len in applyEdit" ) ;
                    const opt = loop( node.child(k), path.rest(), start, end ) ;
                    return opt.choose(
                        ( newChild : PNode ) : Option<PNode> => {
                            return node.tryModify( [newChild], k, k+1 ) ; },
                        () => { return new None<PNode>() ; } ) ; }
            };

            // Determine the start and end
            var start : number ;
            var end : number ;
            if( selection.anchor() <= selection.focus() ) {
                start = selection.anchor() ; end = selection.focus() ; }
            else {
                start = selection.focus() ; end = selection.anchor() ; }
            // Loop down to find and modify the selections target node.
            const opt = loop( selection.root(), selection.path(), start, end ) ;
            // If successful, build a new Selection object.
            return opt.choose(
                ( newRoot : PNode ) : Option<Selection> => {
                    const f = start + this._newNodes.length;
                    const newSelection = new Selection( newRoot,
                        selection.path(),
                        f, f) ;
                    return new Some( newSelection ) ; },
                () : Option<Selection>  => { return new None<Selection> () ; } ) ;
        }
    }

    export class ReplaceNodeEdit extends AbstractEdit<Selection> {
        _newNodes : Array<PNode> ;

        constructor( newNodes : Array<PNode> ) {
            super() ;
            this._newNodes = newNodes ; }

        applyEdit( selection : Selection ) : Option<Selection> {
            // The following function dives down the tree following the path
            // until it reaches the node to be changed.
            // As it climbs back out of the recursion it generates new
            // nodes along the path it followed.
            const loop = ( node : PNode, path : List<number>,
                           start : number, end : number ) : Option<PNode> =>
            {
                if( path.isEmpty() ) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    return node.tryModify( this._newNodes, start, end ) ; }
                else {
                    const k = path.first() ;
                    const len = node.count() ;
                    assert.check( 0 <= k, "Bad Path. k < 0 in applyEdit" ) ;
                    assert.check( k < len, "Bad Path. k >= len in applyEdit" ) ;
                    const opt = loop( node.child(k), path.rest(), start, end ) ;
                    return opt.choose(
                        ( newChild : PNode ) : Option<PNode> => {
                            return node.tryModify( [newChild], k, k+1 ) ; },
                        () => { return new None<PNode>() ; } ) ; }
            };

            // Determine the start and end
            var start : number ;
            var end : number ;
            if( selection.anchor() <= selection.focus() ) {
                start = selection.anchor() ; end = selection.focus() ; }
            else {
                start = selection.focus() ; end = selection.anchor() ; }
            // Loop down to find and modify the selections target node.
            const opt = loop( selection.root(), selection.path(), start, end ) ;
            // If successful, build a new Selection object.
            return opt.choose(
                ( newRoot : PNode ) : Option<Selection> => {
                    const f = start + this._newNodes.length;
                    const newSelection = new Selection( newRoot,
                        selection.path(),
                        f, f) ;
                    return new Some( newSelection ) ; },
                () : Option<Selection>  => { return new None<Selection> () ; } ) ;
        }
    }
}

export = pnodeEdits ;
