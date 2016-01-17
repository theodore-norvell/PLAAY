/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="edits.ts" />



module pnodeEdits {
    import Option = collections.Option;
    import None = collections.None;
    import Some = collections.Some;
    import List = collections.List;
    import Cons = collections.Cons;
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
    *   [...]
    */
    export class Selection {
        constructor( root : PNode, path : List<number>,
                    anchor : number, focus : number ) {
            // Should check invariant here.
            this._root = root;
            this._path = path;
            this._anchor = anchor ;
            this._focus = focus ; }
        _root : PNode ;
        _path : List<number> ;
        _anchor : number ;
        _focus : number ;
    }
    
    export class InsertChildrenEdit extends AbstractEdit<Selection> {
        _newNodes : Array<PNode> ;
        
        constructor( newNodes : Array<PNode> ) {
            super() ;
            this._newNodes = newNodes ; }
        
        applyEdit( selection : Selection ) : Option<Selection> {
            function loop( node : PNode, path : List<number>,
                           start : number, end : number ) : Option<PNode> 
            {
                if( path.isEmpty() ) {
                    return node.tryModify( this._newNodes, start, end ) ; }
                else {
                    const path0 = <Cons<number>> path ; // nonempty list must be Cons.
                    const k = path0.first() ;
                    const len = node.count() ;
                    assert.check( 0 <= k, "Bad Path. k < 0 in applyEdit" ) ;
                    assert.check( k < len, "Bad Path. k >= len in applyEdit" ) ;
                    const opt = loop( node.child(k), path0.rest(), start, end ) ;
                    return opt.choose(
                        function( newChild : PNode ) : Option<PNode> { return
                            node.tryModify( [newChild], k, k+1 ) ; },
                        function() { return new None<PNode>() ; } ) ; }
            }
                    
            var start : number ;
            var end : number ;
            if( selection._anchor <= selection._focus ) {
                start = selection._anchor ; end = selection._focus ; }
            else {
                start = selection._focus ; end = selection._anchor ; }
            const opt = loop( selection._root, selection._path, start, end ) ;
            return opt.choose(
                function( newRoot : PNode ) : Option<Selection> {
                    const f = start + this._newNodes.length() 
                    const newSelection = new Selection( selection._root,
                                                        selection._path,
                                                        f, f) ;
                    return new Some( newSelection ) ; },
                function() : Option<Selection> { return new None<Selection> () ; } ) ;
        }
    }

}