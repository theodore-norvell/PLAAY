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
    import List = collections.List
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
    function singleReplace( node : PNode, path : List<number>,
                           start : number, end : number, newNodes : Array<PNode> ) : Option<PNode>
    {
        if( path.isEmpty() ) {
            assert.checkPrecondition( 0 <= start && start <= end && end <= node.count() ) ;
            var newChildren = node.children(0, start).concat( newNodes, node.children(end, node.count()) ) ;
            return pnode.tryMake( node.label(), newChildren ) ;
        } else {
            const k = path.first() ;
            const len = node.count() ;
            assert.check( 0 <= k, "Bad Path. k < 0 in singleReplace" ) ;
            assert.check( k < len, "Bad Path. k >= len in singleReplace" ) ;
            return singleReplace( node.child(k), path.rest(), start, end, newNodes ) ;
        }
    }

    /** Handle the case where the src path is empty but the target path is not. */
    function doubleReplaceHelper( node : PNode,
                            srcStart : number, srcEnd : number, newNodes4Src : Array<PNode>,
                            trgPath : List<number>, trgStart : number, trgEnd : number, newNodes4Trg : Array<PNode>,
                            allowTrgAncestorOverwrite : boolean )
    : Option<PNode>
    {
        const k = trgPath.first() ;
        const len = node.count() ;
        assert.check( 0 <= k, "Bad Path. k < 0 in doubleReplace" ) ;
        assert.check( k < len, "Bad Path. k >= len in doubleReplace" ) ;
        const child = node.child(k) ;
        if( k < srcStart ) {
            const opt = singleReplace( child, trgPath.rest(), trgStart, trgEnd, newNodes4Trg ) ;
            return opt.bind( newChild => {
                const p0 = node.children(0, k) ;
                const p1 = [newChild] ;
                const p2 = node.children(k+1, srcStart ) ;
                const p3 = newNodes4Src ;
                const p4 = node.children( srcEnd, len ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                return pnode.tryMake( node.label(), newChildren ) ; } ) ;
        } else if( srcEnd <= k ) {
            const opt = singleReplace( child, trgPath.rest(), trgStart, trgEnd, newNodes4Trg ) ;
            return opt.bind( newChild => {
                const p0 = node.children(0, srcStart) ;
                const p1 = newNodes4Src ;
                const p2 = node.children( srcEnd, k ) ;
                const p3 = [newChild];
                const p4 = node.children( k+1, len ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                return pnode.tryMake( node.label(), newChildren ) ; } ) ;
        } else if( allowTrgAncestorOverwrite ) {
            // The target is within the source selection. We delete the target and
            // ignore the nodes that replace the target.
            const p0 = node.children(0, srcStart) ;
            const p1 = newNodes4Src ;
            const p2 = node.children( srcEnd, len ) ;
            const newChildren = p0.concat( p1, p2 ) ;
            return pnode.tryMake( node.label(), newChildren ) ;
        } else {
            return collections.none<PNode>() ;
        }
    }
    
    /** Replace all selected nodes in two places with two other sequences */
    function doubleReplace( node : PNode,
                            srcPath : List<number>, srcStart : number, srcEnd : number, newNodes4Src : Array<PNode>,
                            trgPath : List<number>, trgStart : number, trgEnd : number, newNodes4Trg : Array<PNode>,
                            allowSrcAncestorOverwrite : boolean = true,  allowTrgAncestorOverwrite : boolean = true )
    : Option<PNode>
    {
        if( srcPath.isEmpty() && trgPath.isEmpty() ) {
            if( srcEnd <= trgStart ) {
                const p0 = node.children( 0, srcStart ) ;
                const p1 = newNodes4Src ;
                const p2 = node.children( srcEnd, trgStart ) ;
                const p3 = newNodes4Trg ;
                const p4 = node.children( trgEnd , node.count() ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                return pnode.tryMake( node.label(), newChildren ) ;
            } else if( trgEnd <= srcStart ) {
                const p0 = node.children( 0, trgStart ) ;
                const p1 = newNodes4Trg ;
                const p2 = node.children( trgEnd, srcStart ) ;
                const p3 = newNodes4Src ;
                const p4 = node.children( srcEnd , node.count() ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                return pnode.tryMake( node.label(), newChildren ) ;
            } else {
                // Overlaping src and target ranges.  This is ambiguous.
                // We'll try it both ways and pick one that works.
                // If both work, we'll arbitrarily put the source nodes first.
                const start = Math.min( srcStart, trgStart ) ;
                const end = Math.max( srcEnd, trgEnd ) ;
                const p0 = node.children( 0, start ) ;
                const p1 = node.children( end , node.count() ) ;
                const newChildrenA = p0.concat( newNodes4Src, newNodes4Trg, p1 ) ;
                const newChildrenB = p0.concat( newNodes4Trg, newNodes4Src, p1 ) ;
                return   pnode.tryMake( node.label(), newChildrenA )
                       .orElse(
                         pnode.tryMake( node.label(), newChildrenB ) ) ;
            }
        } else if( srcPath.isEmpty() ) {
            return doubleReplaceHelper( node, srcStart, srcEnd, newNodes4Src, trgPath, trgStart, trgEnd, newNodes4Trg, allowTrgAncestorOverwrite ) ;
        } else if( trgPath.isEmpty() ) {
            return doubleReplaceHelper( node, trgStart, trgEnd, newNodes4Trg, srcPath, srcStart, srcEnd, newNodes4Src, allowSrcAncestorOverwrite ) ;
        } else if( srcPath.first() == trgPath.first() ) {
            const k = srcPath.first() ;
            const len = node.count() ;
            assert.check( 0 <= k, "Bad Path. k < 0 in doubleReplace" ) ;
            assert.check( k < len, "Bad Path. k >= len in doubleReplace" ) ;
            const child = node.child( k ) ;
            const opt = doubleReplace( child, srcPath.rest(), srcStart, srcEnd, newNodes4Src, trgPath.rest(), trgStart, trgEnd, newNodes4Trg, allowSrcAncestorOverwrite, allowTrgAncestorOverwrite ) ;
            opt.bind( newChild => {
                const p0 = node.children( 0, k ) ;
                const p2 = node.children( k+1, node.count()) ;
                const newChildren = p0.concat( [newChild], p2 ) ;
                return pnode.tryMake( node.label(), newChildren ) ;
            } ) ;
        } else {
            // Neither path is empty
            const kSrc = srcPath.first() ;
            const kTrg = trgPath.first() ;
            const len = node.count() ;
            assert.check( 0 <= kSrc, "Bad Path. k < 0 in doubleReplace" ) ;
            assert.check( kSrc < len, "Bad Path. k >= len in doubleReplace" ) ;
            assert.check( 0 <= kTrg, "Bad Path. k < 0 in doubleReplace" ) ;
            assert.check( kSrc < kTrg, "Bad Path. k >= len in doubleReplace" ) ;
            const childSrc = node.child( kSrc ) ;
            const childTrg = node.child( kTrg ) ;
            const optSrc = singleReplace( childSrc, srcPath.rest(), srcStart, srcEnd, newNodes4Src ) ;
            const optTrg = singleReplace( childSrc, srcPath.rest(), srcStart, srcEnd, newNodes4Src ) ;
            optSrc.bind( newSrcChild => optTrg.bind( newTrgChild  => {
                let p0, p1, p2, p3, p4 ;
                if( kSrc < kTrg ) {
                    p0 = node.children( 0, kSrc ) ;
                    p1 = [newSrcChild] ;
                    p2 = node.children( kSrc+1, kTrg ) ;
                    p3 = [newTrgChild] ;
                    p4 = node.children( kTrg+1, len ) ; }
                else {
                    p0 = node.children( 0, kTrg ) ;
                    p1 = [newTrgChild] ;
                    p2 = node.children( kTrg+1, kSrc ) ;
                    p3 = [newSrcChild] ;
                    p4 = node.children( kSrc+1, len ) ; }
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                return pnode.tryMake( node.label(), newChildren ) ;
            } ) ) ;
        }
    }

    /** Replace all selected nodes with another sequence of nodes. 
     * 
     */
    export class InsertChildrenEdit extends AbstractEdit<Selection> {
        _newNodes : Array<PNode> ;

        constructor( newNodes : Array<PNode> ) {
            super() ;
            this._newNodes = newNodes ; }

        applyEdit( selection : Selection ) : Option<Selection> {

            // Determine the start and end
            var start : number ;
            var end : number ;
            if( selection.anchor() <= selection.focus() ) {
                start = selection.anchor() ; end = selection.focus() ; }
            else {
                start = selection.focus() ; end = selection.anchor() ; }
            // Loop down to find and modify the selections target node.
            const opt = singleReplace( selection.root(), selection.path(), start, end, this._newNodes ) ;
            // If successful, build a new Selection object.
            return opt.map(
                    ( newRoot : PNode ) => {
                        const f = start + this._newNodes.length;
                        return new Selection( newRoot, selection.path(), start, f) ; } ) ;
        }
    }

    /** Delete all selected nodes, replacing them with either nothing, or with a placeholder.
     * 
     */
    export class DeleteEdit extends AbstractEdit<Selection> {

        constructor() {
            super() ; }

        applyEdit( selection : Selection ) : Option<Selection> {
            var noPH = new pnodeEdits.InsertChildrenEdit([]);
            var withPH = new pnodeEdits.InsertChildrenEdit([pnode.mkExprPH()]);
            var alt = edits.alt(noPH, withPH);

            return alt.applyEdit(selection);
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
                    assert.check(0 <= k, "Bad Path. k < 0 in applyEdit");
                    assert.check(k < len, "Bad Path. k >= len in applyEdit");
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

    /** Copy all nodes in one selection over the selected nodes in another. */
    export class CopyNodeEdit extends AbstractEdit<Selection> {
        _newNodes : Array<PNode> ;

        constructor(selection:Selection) {
            super();

            const loop = (node:PNode, path:List<number>,
                          start:number, end:number) => {
                if (path.isEmpty()) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    this._newNodes = node.children(start, end);
                }
                else {
                    const k = path.first();
                    const len = node.count();
                    assert.check(0 <= k, "Bad Path. k < 0 in applyEdit");
                    assert.check(k < len, "Bad Path. k >= len in applyEdit");
                    loop(node.child(k), path.rest(), start, end);
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
            loop(selection.root(), selection.path(), start, end);

        }

        applyEdit(selection:Selection):Option<Selection> {

            var edit = new pnodeEdits.InsertChildrenEdit(this._newNodes);
            return edit.applyEdit(selection);
        }

    }

    /** Move nodes by first copying them and then deleting the originals.
     * The nodes to be moved are indicated by the parameter to the constuctor.
     */
    export class MoveNodeEdit extends AbstractEdit<Selection> {
        _newNodes : Array<PNode> ;
        _oldSelection : Selection;

        constructor(selection:Selection) {
            super();
            const loop = (node:PNode, path:List<number>,
                          start:number, end:number) => {
                if (path.isEmpty()) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    this._newNodes = node.children(start, end);
                }
                else {
                    const k = path.first();
                    const len = node.count();
                    assert.check(0 <= k, "Bad Path. k < 0 in applyEdit");
                    assert.check(k < len, "Bad Path. k >= len in applyEdit");
                    loop(node.child(k), path.rest(), start, end);
                }
            };

            // Determine the start and end
            var start:number;
            var end:number;
            this._oldSelection = selection;
            if (selection.anchor() <= selection.focus()) {
                start = selection.anchor();
                end = selection.focus();
            }
            else {
                start = selection.focus();
                end = selection.anchor();
            }
            // Loop down to find and modify the selections target node.
            loop(selection.root(), selection.path(), start, end);
        }

        applyEdit(selection:Selection):Option<Selection> {
            if (selection.root().get(selection.path()).children(selection.anchor(), selection.focus()).length != 0){
                //if you are moving to an occupied space, you cannot move
                return new None<Selection>();
            }
            
            var edit = new InsertChildrenEdit(this._newNodes);
            var selwithchildren = edit.applyEdit(selection).choose(
                p => p,
                    () => {
                        // TODO This assert is troubling.  I think the move
                        // should fail if the copy can not be done.
                        assert.check(false, "Error applying edit to node");
                        return null;
                    });
            // TODO What if this selection violates the invariant.
            // I think the move should fail.
            var newSel = new Selection(selwithchildren.root(), this._oldSelection.path(), this._oldSelection.anchor(), this._oldSelection.focus());
            var edit2 = new DeleteEdit();
            return edit2.applyEdit(newSel);
        }
    }

    /** Swap.  TODO document after code is reviewed. */
    export class SwapEdit extends AbstractEdit<Selection> {
        _srcNodes:Array<PNode>;
        _trgNodes:Array<PNode>;
        _srcSelection:Selection;
        _trgSelection:Selection;

        // TODO: Why does this need two constructor parameters?
        constructor(srcSelection:Selection, trgSelection:Selection) {
            super();

            this._srcSelection = srcSelection;
            this._trgSelection = trgSelection;
            this._srcNodes = this.getChildrenToSwap(srcSelection);
            this._trgNodes = this.getChildrenToSwap(trgSelection);

            if (this._srcNodes == null) {
                this._srcNodes = []; //TODO why would this ever be a thing??? It's been happening
            }
            if (this._trgNodes == null) {
                this._trgNodes = [];
            }

        }

        canApply():boolean {
            return this.applyEdit().choose(
                a => true,
                () => false);
        }

        getChildrenToSwap(selection:Selection):Array<PNode> {
            const loop = (node:PNode, path:List<number>,
                          start:number, end:number):Array<PNode> => {
                if (path.isEmpty()) {
                    //console.log("this._newNodes is " + this._newNodes ) ;
                    return node.children(start, end);
                }
                else {
                    const k = path.first();
                    const len = node.count();
                    assert.check(0 <= k, "Bad Path. k < 0 in applyEdit");
                    assert.check(k < len, "Bad Path. k >= len in applyEdit");
                    loop(node.child(k), path.rest(), start, end);
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
            return loop(selection.root(), selection.path(), start, end);
        }

        applyEdit():Option<Selection> {
            // The following function dives down the tree following the path
            // until it reaches the node to be changed.
            // As it climbs back out of the recursion it generates new
            // nodes along the path it followed.
            const loop = (srcnode:PNode, srcpath:List<number>, trgpath:List<number>,
                          srcstart:number, srcend:number, trgstart:number, trgend:number):Option<PNode> => {
                if (srcpath.isEmpty() && trgpath.isEmpty()) {
                    if (srcend <= trgstart) {
                        var newchildren = srcnode.children(0, srcstart).concat(this._srcNodes).concat(
                            srcnode.children(srcend, trgstart)).concat(this._trgNodes).concat(
                            srcnode.children(trgend, srcnode.count()));

                        return srcnode.tryModify(newchildren, 0, srcnode.count());
                    }
                    else if (trgstart <= srcend) {
                        var newchildren = srcnode.children(0, trgstart).concat(this._srcNodes).concat(
                            srcnode.children(trgend, srcstart)).concat(this._trgNodes).concat(
                            srcnode.children(srcend, srcnode.count()));

                        return srcnode.tryModify(newchildren, 0, srcnode.count());
                    }
                    else {
                        //they overlap, fail
                        return new None<PNode>();
                    }
                }
                else if (srcpath.isEmpty() && !trgpath.isEmpty()) {
                    if (trgpath.first() < srcstart) {
                        var singleReplaceTest = new InsertChildrenEdit(this._trgNodes);
                        var sel = new Selection(srcnode.child(trgpath.first()), trgpath.rest(), trgstart, trgend);
                        var opt = singleReplaceTest.applyEdit(sel);

                        var sel1 = opt.choose(
                            p => p,
                            () => {
                                // TODO. What the FUCH is going on here?
                                return null;
                            });

                        if (sel1 != null) {
                            var newchildren = srcnode.children(0, trgpath.first()).concat(sel1.root()).concat(
                                srcnode.children(trgpath.first() + 1, srcstart)).concat(this._srcNodes).concat(
                                srcnode.children(srcend, srcnode.count()));

                            return srcnode.tryModify(newchildren, 0, srcnode.count());
                        }

                    } else if (srcend <= trgpath.first()) {

                        var singleReplaceTest = new InsertChildrenEdit(this._trgNodes);
                        var sel = new Selection(srcnode.child(trgpath.first()), trgpath.rest(), trgstart, trgend);
                        var opt = singleReplaceTest.applyEdit(sel);

                        var sel1 = opt.choose(
                            p => p,
                            () => {
                                // TODO. What the FUCH is going on here?
                                return null;
                            });

                        if (sel1 != null) {
                            var newchildren = srcnode.children(0, srcstart).concat(this._srcNodes).concat(
                                srcnode.children(srcend, trgpath.first())).concat(sel1.root()).concat(
                                srcnode.children(trgpath.first() + 1, srcnode.count()));

                            return srcnode.tryModify(newchildren, 0, srcnode.count());
                        }
                    }
                    else {
                        // srcstart <= trgpath.first() and trgpath.first() < srcend
                        return new None<PNode>();
                    }
                }
                else if (!srcpath.isEmpty() && trgpath.isEmpty()) {
                    if (srcpath.first() < trgstart) {
                        var singleReplaceTest = new InsertChildrenEdit(this._trgNodes);
                        var sel = new Selection(srcnode.child(srcpath.first()), srcpath.rest(), srcstart, srcend);
                        var opt = singleReplaceTest.applyEdit(sel);

                        var sel1 = opt.choose(
                            p => p,
                            () => {
                                return null;
                            });

                        if (sel1 != null) {
                            var newchildren = srcnode.children(0, srcpath.first()).concat(sel1.root()).concat(
                                srcnode.children(srcpath.first() + 1, trgstart)).concat(this._srcNodes).concat(
                                srcnode.children(trgend, srcnode.count()));

                            return srcnode.tryModify(newchildren, 0, srcnode.count());
                        }

                    } else if (trgend <= srcpath.first()) {

                        var singleReplaceTest = new InsertChildrenEdit(this._trgNodes);
                        var sel = new Selection(srcnode.child(srcpath.first()), srcpath.rest(), srcstart, srcend);
                        var opt = singleReplaceTest.applyEdit(sel);

                        var sel1 = opt.choose(
                            p => p,
                            () => {
                                return null;
                            });

                        if (sel1 != null) {
                            var newchildren = srcnode.children(0, trgstart).concat(this._srcNodes).concat(
                                srcnode.children(trgend, srcpath.first())).concat(sel1.root()).concat(
                                srcnode.children(srcpath.first() + 1, srcnode.count()));

                            return srcnode.tryModify(newchildren, 0, srcnode.count());
                        }
                        else {
                            // trgstart <= src.first() and src.first() < trgend
                            return new None<PNode>();
                        }
                    }
                else if (srcpath.first() != trgpath.first()) {
                        var singleReplaceTest = new InsertChildrenEdit(this._srcNodes);
                        var sel = new Selection(srcnode.child(srcpath.first()), trgpath.rest(), trgstart, trgend);
                        var opt = singleReplaceTest.applyEdit(sel);

                        var sel1 = opt.choose(
                            p => p,
                            () => {
                                return null;
                            });

                        if (sel1 != null) {
                            var replace2 = new InsertChildrenEdit(this._trgNodes);
                            var sel2 = new Selection(sel1.root(), srcpath.rest(), srcstart, srcend);
                            var opt2 = singleReplaceTest.applyEdit(sel2);

                            var sel3 = opt2.choose(
                                p => p,
                                () => {
                                    return null;
                                });

                            if (sel3 != null) {
                                return new Some(sel3);
                            }
                        }
                        return new None<PNode>();
                    }
                }
                else {
                    const srck = srcpath.first();
                    const srclen = srcnode.count();
                    const trgk = trgpath.first();

                    assert.check(0 <= srck && 0 <= trgk, "Bad Path. k < 0 in applyEdit");
                    assert.check(srck < srclen && trgk < srclen, "Bad Path. k >= len in applyEdit");
                    const opt = loop(srcnode.child(srck), srcpath.rest(), trgpath.rest(), srcstart, srcend, trgstart, trgend);
                    return opt.choose(
                        (newChild:PNode):Option<PNode> => {
                            return srcnode.tryModify([newChild], trgk, trgk + 1);
                        },
                        () => {
                            return new None<PNode>();
                        });
                }
            };

            if (this._trgNodes.length == 0){
                //if the space you are moving to is unoccupied, then you can't swap
                return new None<Selection>();
            }

            // Determine the start and end
            var srcstart:number;
            var srcend:number;
            var trgstart:number;
            var trgend:number;
            if (this._srcSelection.anchor() <= this._srcSelection.focus()) {
                srcstart = this. _srcSelection.anchor();
                srcend = this._srcSelection.focus();
            }
            else {
                srcstart = this. _srcSelection.focus();
                srcend = this._srcSelection.anchor();
            }
            if (this._trgSelection.anchor() <= this._trgSelection.focus()) {
                trgstart = this. _trgSelection.anchor();
                trgend = this._trgSelection.focus();
            }
            else {
                trgstart = this. _trgSelection.focus();
                trgend = this._trgSelection.anchor();
            }
            // Loop down to find and modify the selections target node.
            const opt = loop(this._srcSelection.root(), this._srcSelection.path(), this._trgSelection.path(), srcstart, srcend, trgstart, trgend);
            // If successful, build a new Selection object.
            return opt.choose(
                (newRoot:PNode):Option<Selection> => {
                    const f = srcstart;
                    const newSelection = new Selection(newRoot,
                        this._srcSelection.path(),
                        f, f);
                    return new Some(newSelection);
                },
                ():Option<Selection> => {
                    return new None<Selection>();
                });
        }
    }
}

export = pnodeEdits ;
