/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="edits.ts" />
/// <reference path="pnode.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import edits = require( './edits' ) ;
import pnode = require( './pnode' ) ;

/** pnodeEdits is responsible for edits that operate on selections.
 * 
 */
module pnodeEdits {
    import Option = collections.Option;
    import None = collections.None;
    import Some = collections.Some;
    import List = collections.List ;
    import cons = collections.cons ;
    import arrayToList = collections.arrayToList;
    import PNode = pnode.PNode ;
    import Edit = edits.Edit ;
    import AbstractEdit = edits.AbstractEdit ;
    import Label = pnode.Label;
    
    
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
        constructor( root : PNode, path : List<number>,
                    anchor : number, focus : number ) {
            assert.checkPrecondition( checkSelection( root, path, anchor, focus ), 
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
    export function checkSelection( tree : PNode, path : List<number>,
                    anchor : number, focus : number ) : boolean { 
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

    /** Replace all selected nodes with another set of nodes. */
    function singleReplace( selection : Selection, newNodes : Array<PNode> ) : Option<Selection> {
        let start = selection.anchor() ;
        let end = selection.focus() ;
        if( end < start ) { const t = start ; start = end ; end = t ; }
        return singleReplaceHelper( selection.root(), selection.path(), start, end, newNodes ) ;
    }
    
    function singleReplaceHelper( node : PNode, path : List<number>,
                           start : number, end : number, newNodes : Array<PNode> ) : Option<Selection>
    {
        if( path.isEmpty() ) {
            assert.checkPrecondition( 0 <= start && start <= end && end <= node.count() ) ;
            const newChildren = node.children(0, start).concat( newNodes, node.children(end, node.count()) ) ;
            const opt =  pnode.tryMake( node.label(), newChildren ) ;
            return opt.map( newNode => new Selection( newNode, path, start, start+newNodes.length ) ) ;
        } else {
            const k = path.first() ;
            const len = node.count() ;
            assert.check( 0 <= k, "Bad Path. k < 0" ) ;
            assert.check( k < len, "Bad Path. k >= len" ) ;
            const opt = singleReplaceHelper( node.child(k), path.rest(), start, end, newNodes ) ;
            return opt.bind( newSeln => {
                const p0 = node.children(0, k ) ;
                const p1 = [ newSeln.root() ] ;
                const p2 = node.children( k+1, len ) ;
                const newChildren = p0.concat( p1, p2 ) ;
                const opt = pnode.tryMake( node.label(), newChildren ) ;
                return opt.map( newNode => new Selection( newNode, path, newSeln.anchor(), newSeln.focus() ) ) ;
            } ) ;
        }
    }

    /** Replace all selected nodes with another set of nodes. */
    function doubleReplace( srcSelection, newNodes4Src : Array<PNode>,
                            trgSelection, newNodes4Trg : Array<PNode>,
                            allowSrcAncestorOverwrite : boolean = true, 
                            allowTrgAncestorOverwrite : boolean = true ) : Option<Selection> {
        let srcStart = srcSelection.anchor() ;
        let srcEnd = srcSelection.focus() ;
        if( srcEnd < srcStart ) { const t = srcStart ; srcStart = srcEnd ; srcEnd = t ; }

        let trgStart = trgSelection.anchor() ;
        let trgEnd = trgSelection.focus() ;
        if( trgEnd < trgStart ) { const t = trgStart ; trgStart = trgEnd ; trgEnd = t ; }

        const node = srcSelection.root() ;
        assert.checkPrecondition( node == trgSelection.root() ) ;
        return doubleReplaceHelper(node, srcSelection.path(), srcStart, srcEnd, newNodes4Src,
                                        trgSelection.path(), trgStart, trgEnd, newNodes4Trg,
                                        allowSrcAncestorOverwrite, allowTrgAncestorOverwrite ) ;
    }

    /** Handle the case where the src path is empty but the target path is not.
     * The selection return either comprise the new nodes at the source or the
     * new nodes at the target depending on the value of returnNewTargetSeln .
    */
    function doubleReplaceOnePathEmpty( node : PNode,
                            srcStart : number, srcEnd : number, newNodes4Src : Array<PNode>,
                            trgPath : List<number>, trgStart : number, trgEnd : number, newNodes4Trg : Array<PNode>,
                            allowTrgAncestorOverwrite : boolean, returnNewTargetSeln : boolean )
    : Option< Selection >
    {
        const k = trgPath.first() ;
        const len = node.count() ;
        assert.check( 0 <= k, "Bad Path. k < 0" ) ;
        assert.check( k < len, "Bad Path. k >= len" ) ;
        const child = node.child(k) ;
        if( k < srcStart ) {
            const opt = singleReplaceHelper( child, trgPath.rest(), trgStart, trgEnd, newNodes4Trg ) ;
            return opt.bind( newSeln => {
                const p0 = node.children(0, k) ;
                const p1 = [newSeln.root()] ;
                const p2 = node.children(k+1, srcStart ) ;
                const p3 = newNodes4Src ;
                const p4 = node.children( srcEnd, len ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                const opt = pnode.tryMake( node.label(), newChildren ) ; 
                return opt.map( newNode =>
                    returnNewTargetSeln
                    ? new Selection( newNode, trgPath, newSeln.anchor(), newSeln.focus() ) 
                    : new Selection( newNode, collections.nil<number>(), srcStart, srcStart+newNodes4Src.length ) ) ;
            } ) ;
        } else if( srcEnd <= k ) {
            const opt = singleReplaceHelper( child, trgPath.rest(), trgStart, trgEnd, newNodes4Trg ) ;
            return opt.bind( newSeln => {
                const p0 = node.children(0, srcStart) ;
                const p1 = newNodes4Src ;
                const p2 = node.children( srcEnd, k ) ;
                const p3 = [newSeln.root()];
                const p4 = node.children( k+1, len ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;    
                const opt = pnode.tryMake( node.label(), newChildren ) ;
                const k_new = k + newNodes4Src.length - (srcEnd-srcStart);
                return opt.map( newNode => 
                    returnNewTargetSeln
                    ? new Selection( newNode, cons( k_new, trgPath.rest()), newSeln.anchor(), newSeln.focus() )
                    : new Selection( newNode, collections.nil<number>(), srcStart, srcStart+newNodes4Src.length ) ) ;
                } ) ;
        } else if( allowTrgAncestorOverwrite ) {
            // The target is within the source selection. We delete the target and
            // ignore the nodes that replace the target.
            assert.checkPrecondition( ! returnNewTargetSeln ) ;
            const p0 = node.children(0, srcStart) ;
            const p1 = newNodes4Src ;
            const p2 = node.children( srcEnd, len ) ;
            const newChildren = p0.concat( p1, p2 ) ;
            const opt = pnode.tryMake( node.label(), newChildren ) ;
            return opt.map( newNode =>
                new Selection( node, collections.nil<number>(), srcStart, srcStart+newNodes4Src.length ) ) ;
        } else {
            return collections.none<Selection>() ;
        }
    }
    
    /** Replace all selected nodes in two places with two other sequences */
    function doubleReplaceHelper( node : PNode,
                            srcPath : List<number>, srcStart : number, srcEnd : number, newNodes4Src : Array<PNode>,
                            trgPath : List<number>, trgStart : number, trgEnd : number, newNodes4Trg : Array<PNode>,
                            allowSrcAncestorOverwrite : boolean = true,  allowTrgAncestorOverwrite : boolean = true )
    : Option<Selection>
    {
        if( srcPath.isEmpty() && trgPath.isEmpty() ) {
            if( srcEnd <= trgStart ) {
                const p0 = node.children( 0, srcStart ) ;
                const p1 = newNodes4Src ;
                const p2 = node.children( srcEnd, trgStart ) ;
                const p3 = newNodes4Trg ;
                const p4 = node.children( trgEnd , node.count() ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                const opt = pnode.tryMake( node.label(), newChildren ) ;
                const newStart = trgStart + newNodes4Src.length - (srcEnd-srcStart) ;
                const newEnd = newStart + newNodes4Trg.length ;
                return opt.map( newNode => new Selection( newNode, collections.nil<number>(), newStart, newEnd ) ) ;
            } else if( trgEnd <= srcStart ) {
                const p0 = node.children( 0, trgStart ) ;
                const p1 = newNodes4Trg ;
                const p2 = node.children( trgEnd, srcStart ) ;
                const p3 = newNodes4Src ;
                const p4 = node.children( srcEnd , node.count() ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                const opt = pnode.tryMake( node.label(), newChildren ) ;
                const newEnd = trgStart + newNodes4Trg.length ;
                return opt.map( newNode => new Selection( newNode, collections.nil<number>(), trgStart, newEnd ) ) ;
            } else {
                // Overlaping src and target ranges.  This is ambiguous unless either the new source nodes
                // or the new target nodes are empty.
                if( newNodes4Src.length != 0 && newNodes4Trg.length != 0 ) {
                    // Ambiguous case. This might happen if we swap a node with itself.
                    // It should fail.
                    return collections.none<Selection>() ;
                }
                const start = Math.min( srcStart, trgStart ) ;
                const end = Math.max( srcEnd, trgEnd ) ;
                const p0 = node.children( 0, start ) ;
                const p1 = node.children( end , node.count() ) ;
                const newChildren = p0.concat( newNodes4Trg, newNodes4Src, p1 ) ;
                const opt = pnode.tryMake( node.label(), newChildren ) ;
                const newEnd = start + newNodes4Trg.length ;
                return opt.map( newNode =>
                    new Selection( newNode, collections.nil<number>(), start, newEnd ) )  ;
            }
        } else if( srcPath.isEmpty() ) {
            return doubleReplaceOnePathEmpty( node, srcStart, srcEnd, newNodes4Src, trgPath, trgStart, trgEnd, newNodes4Trg, allowTrgAncestorOverwrite, true ) ;
        } else if( trgPath.isEmpty() ) {
            return doubleReplaceOnePathEmpty( node, trgStart, trgEnd, newNodes4Trg, srcPath, srcStart, srcEnd, newNodes4Src, allowSrcAncestorOverwrite, false ) ;
        } else if( srcPath.first() == trgPath.first() ) {
            const k = srcPath.first() ;
            const len = node.count() ;
            assert.check( 0 <= k, "Bad Path. k < 0" ) ;
            assert.check( k < len, "Bad Path. k >= len" ) ;
            const child = node.child( k ) ;
            const opt = doubleReplaceHelper( child, srcPath.rest(), srcStart, srcEnd, newNodes4Src, trgPath.rest(), trgStart, trgEnd, newNodes4Trg, allowSrcAncestorOverwrite, allowTrgAncestorOverwrite ) ;
            opt.bind( newSeln => {
                const p0 = node.children( 0, k ) ;
                const p1 = [newSeln.root()] ;
                const p2 = node.children( k+1, node.count()) ;
                const newChildren = p0.concat( p1, p2 ) ;
                const opt = pnode.tryMake( node.label(), newChildren ) ;
                return opt.map( newNode => 
                    new Selection( newNode, cons( k, newSeln.path()), newSeln.anchor(), newSeln.focus() ) ) ;
             } ) ;
        } else {
            // Neither path is empty
            const kSrc = srcPath.first() ;
            const kTrg = trgPath.first() ;
            const len = node.count() ;
            assert.check( 0 <= kSrc, "Bad Path. k < 0" ) ;
            assert.check( kSrc < len, "Bad Path. k >= len" ) ;
            assert.check( 0 <= kTrg, "Bad Path. k < 0" ) ;
            assert.check( kSrc < kTrg, "Bad Path. k >= len" ) ;
            const childSrc = node.child( kSrc ) ;
            const childTrg = node.child( kTrg ) ;
            const optSrc = singleReplaceHelper( childSrc, srcPath.rest(), srcStart, srcEnd, newNodes4Src ) ;
            const optTrg = singleReplaceHelper( childSrc, srcPath.rest(), srcStart, srcEnd, newNodes4Src ) ;
            optSrc.bind( newSrcSeln => optTrg.bind( newTrgSeln  => {
                let p0, p1, p2, p3, p4 ;
                if( kSrc < kTrg ) {
                    p0 = node.children( 0, kSrc ) ;
                    p1 = [newSrcSeln.root()] ;
                    p2 = node.children( kSrc+1, kTrg ) ;
                    p3 = [newTrgSeln.root()] ;
                    p4 = node.children( kTrg+1, len ) ; }
                else {
                    p0 = node.children( 0, kTrg ) ;
                    p1 = [newTrgSeln.root()] ;
                    p2 = node.children( kTrg+1, kSrc ) ;
                    p3 = [newSrcSeln.root()] ;
                    p4 = node.children( kSrc+1, len ) ; }
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                const opt =  pnode.tryMake( node.label(), newChildren ) ;
                return opt.map( newNode =>
                    new Selection( newNode, cons( kTrg, newTrgSeln.path()), newTrgSeln.anchor(), newTrgSeln.focus() ) ) ;
            } ) ) ; }
    }

    function extractSelectedNodes(selection : Selection) : Array<PNode> {
        function loop(node:PNode, path:List<number>,
                          start:number, end:number) : Array<PNode> {
            if (path.isEmpty()) {
                return node.children(start, end); }
            else {
                const k = path.first();
                const len = node.count();
                assert.check(0 <= k, "Bad Path. k < 0");
                assert.check(k < len, "Bad Path. k >= len");
                return loop(node.child(k), path.rest(), start, end); }
        }
        // Determine the start and end
        var start:number;
        var end:number;
        if (selection.anchor() <= selection.focus()) {
            start = selection.anchor();
            end = selection.focus(); }
        else {
            start = selection.focus();
            end = selection.anchor(); }
        return loop( selection.root(), selection.path(), start, end ) ;
    }

    /** Replace all selected nodes with another sequence of nodes. 
     * The resulting selection should comprise the inserted children.
     */
    export class InsertChildrenEdit extends AbstractEdit<Selection> {
        _newNodes : Array<PNode> ;

        constructor( newNodes : Array<PNode> ) {
            super() ;
            this._newNodes = newNodes ; }

        applyEdit( selection : Selection ) : Option<Selection> {

            // Determine the start and end
            const start : number = Math.min( selection.anchor(), selection.focus() );
            const end : number = Math.max( selection.anchor(), selection.focus() );

            // Try to make the replacement.
            const opt = singleReplace( selection, this._newNodes ) ;
            if(  this._newNodes.length == 0 ) {
                // Copy of zero nodes may require backfilling.
                return opt.recoverBy (
                    () => singleReplace( selection, [pnode.mkExprPH()] )
                ) ;
            } else {
                return opt ;
            }
        }
    }

    /** Delete all selected nodes, replacing them with either nothing, or with a placeholder.
     * The resulting selection indicates the position where the nodes
     * used to be.
     */
    export class DeleteEdit extends AbstractEdit<Selection> {

        constructor() {
            super() ; }

        applyEdit( selection : Selection ) : Option<Selection> {
            const opt = singleReplace( selection, [] ) ;
            // TODO add more choices for replacement, such as noType, noExp, etc.
            return opt.recoverBy(
                () => singleReplace( selection, [pnode.mkExprPH()] )
            ) ;
        }
    }

    /**  Changes the string value of a node's label.
     *  
     */
    export class ChangeLabelEdit extends AbstractEdit<Selection> {
        // TODO:  This edit applies not to the selected nodes, but
        // to their parent.  I think that's against the spirit of selections.
        // Furthermore I'm not thrilled that there is a changeValue method
        // that can be applied to any label.
        _newString:string;

        constructor(newString:string) {
            super();
            this._newString = newString;
        }

        applyEdit(selection:Selection):Option<Selection> {
            const loop = (node:PNode, path:List<number>,
                          start:number, end:number):Option<PNode> => {
                if (path.isEmpty()) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    var opt = node.label().changeValue(this._newString);
                    return opt.choose(
                        (label:Label):Option<PNode> => {
                        return node.tryModifyLabel(label);
                        },
                        () => {
                            return new None<PNode>();
                        });
                }
                else {
                    const k = path.first();
                    const len = node.count();
                    assert.check(0 <= k, "Bad Path. k < 0");
                    assert.check(k < len, "Bad Path. k >= len");
                    const opt = loop(node.child(k), path.rest(), start, end);
                    return opt.choose(
                        (newChild:PNode):Option<PNode> => {
                            return node.tryModify([newChild], k, k + 1);
                        },
                        () => {
                            return new None<PNode>();
                        });
                }
            };

            // Determine the start and end
            var start:number;
            var end:number;
            if (selection.anchor() <= selection.focus()) {
                start = selection.anchor();
                end = selection.focus();
            }
            else {
                start = selection.focus();
                end = selection.anchor();
            }
            // Loop down to find and modify the selections target node.
            const opt = loop(selection.root(), selection.path(), start, end);
            // If successful, build a new Selection object.
            return opt.choose(
                (newRoot:PNode):Option<Selection> => {
                    const f = start;
                    const newSelection = new Selection(newRoot,
                        selection.path(),
                        f, f);
                    return new Some(newSelection);
                },
                ():Option<Selection> => {
                    return new None<Selection>();
                });
        }
    }

    /** Copy all nodes in one selection over the selected nodes in another.
     * The selection returned indicates the newly added nodes.
    */
    export class CopyEdit extends AbstractEdit<Selection> {
        _srcNodes : Array<PNode> ;

        constructor(srcSelection:Selection) {
            super();
            this._srcNodes = extractSelectedNodes( srcSelection );
        }

        applyEdit(selection:Selection):Option<Selection> {
            const opt = singleReplace( selection, this._srcNodes ) ;
            if(  this._srcNodes.length == 0 ) {
                // Copy of zero nodes may require backfilling.
                return opt.recoverBy (
                    () => singleReplace( selection, [pnode.mkExprPH()] )
                ) ;
            } else {
                return opt ;
            }
        }
    }

    /** Move nodes by copying them and, at the same time deleting, the originals.
     * The nodes to be moved are indicated by the first parameter to the constuctor.
     * The source is given as a constructor parameter.
     * The target as a parameter to applyEdit.
     * The source and target selections must share the same tree. Otherwise the edit will fail.
     * The resuling selection will select the nodes inserted to overwrite the target selection.
     */
    export class MoveEdit extends AbstractEdit<Selection> {
        _srcSelection : Selection ;

        constructor( srcSelection:Selection ) {
            super();
            this._srcSelection = srcSelection ;
        }

        applyEdit( trgSelection:Selection ) : Option<Selection> {
            if( this._srcSelection.root() != trgSelection.root() ) return collections.none<Selection>() ;
            const newNodes = extractSelectedNodes( this._srcSelection );
            // Try filling in with the empty sequence first. Otherwise try some other defaults.
            const opt = doubleReplace( this._srcSelection, [], trgSelection, newNodes, true, false ) ;
            // TODO add more choices for replacement, such as noType, noExp, etc.
            return opt.recoverBy(
                () => doubleReplace( this._srcSelection, [pnode.mkExprPH()], trgSelection, newNodes, true, false ) 
            ) ;
        }
    }

    /** Swap.  Swap two selections that share the same root.
     * For example we should be able to swap the then and else part of an if node.
     * The source is given as a constructor parameter.
     * The target as a parameter to applyEdit.
     * The source and target selections must share the same tree. Otherwise the edit will fail.
     * The resuling selection will select the nodes inserted to overwrite the target selection.
    */
    export class SwapEdit extends AbstractEdit<Selection> {
        _srcSelection:Selection;

        constructor(srcSelection:Selection) {
            super();

            this._srcSelection = srcSelection;
        }

        applyEdit(trgSelection:Selection) : Option<Selection> {
            if( this._srcSelection.root() != trgSelection.root() ) return collections.none<Selection>() ;
            const newNodes4Trg = extractSelectedNodes( this._srcSelection ) ;
            const newNodes4Src = extractSelectedNodes( trgSelection ) ;
            return doubleReplace( this._srcSelection, newNodes4Src, trgSelection, newNodes4Trg, false, false ) ;
        }
    }
}

export = pnodeEdits ;
