/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="edits.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import edits = require( './edits' ) ;
import labels = require( './labels' ) ;
import pnode = require( './pnode' ) ;

/** pnodeEdits is responsible for edits that operate on selections.
 * This module also includes the Selection class as well as
 * various edit classes.  Each edit class represents some
 * operation on Selections that might succeed or fail.
 */
module pnodeEdits {
    import Option = collections.Option;
    import None = collections.None;
    import Some = collections.Some;
    import none = collections.none;
    import some = collections.some;
    import List = collections.List ;
    import cons = collections.cons ;
    import snoc = collections.snoc;
    import last = collections.last;
    import butLast = collections.butLast;
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
            this._focus = focus ; }
        
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

        public selectedNodes() : Array<PNode> {
            return this.parent().children( this.start(), this.end() ) ;
        }
        
        public toString() : string { return "Selection( " + "_root:" + this._root.toString() +
                            " _path:" + this._path.toString() +
                            " _anchor: " + this._anchor +
                            " _focus: " + this._focus + ")"  ;}
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

    /** Move left. */
    function moveLeft( selection : Selection ) : Option<Selection> {
        const start = selection.start() ;
        const end = selection.end() ;
        const root = selection.root();
        const path = selection.path();

        if (start === end)
        {
            //there is node at start-1
            if(start > 0)
            {
                const newPath : List<number> = snoc(path, start-1);
                const numOfChildren : number = root.get(newPath).count();
                return some( new Selection(root, newPath, numOfChildren, numOfChildren));            
            }
            //the path is empty
            else if (path.isEmpty())
            {
                return none<Selection>();
            }
            //the parent of this position has no children
            else if(root.get(path).count() === 0)
            {
                return some( new Selection(root, butLast(path), last(path), last(path)+1));
            }
            else 
            {
                //return a selection representing the position to the left of the parent
                return some( new Selection(root, butLast(path), last(path), last(path)));
            }
        }      
        else
        {
            //return a selection representing the position to the left of the leftmost selected node
            return some( new Selection(root, path, start, start));
        } 
    }

    /** Move right. */
    function moveRight( selection : Selection ) : Option<Selection> {
        const start = selection.start() ;
        const end = selection.end() ;
        const root = selection.root();
        const path = selection.path();

        if (start === end)
        {
            //there is node at start
            if(root.get(path).count() > start)
            {
                return some( new Selection(root, snoc(path, start), 0, 0));
            }
            //the path is empty
            else if (path.isEmpty())
            {
                return none<Selection>();
            }
            //the parent of this position has no children
            else if(root.get(path).count() === 0)
            {
                return some( new Selection(root, butLast(path), last(path), last(path)+1));
            }
            else 
            {
                //return a selection representing the position to the right of the parent
                return some( new Selection(root, butLast(path), last(path) + 1, last(path) + 1));
            }
        }      
        else
        {
            //return a selection representing the position to the right of the rightmost selected node
            return some( new Selection(root, path, end, end));
        }
    }

    /** Move up. */
    function moveUp( selection : Selection ) : Option<Selection> {
        const start = selection.start() ;
        const end = selection.end() ;
        const root = selection.root();
        const path = selection.path();

        assert.todo( "moveUp()"); return none<Selection>() ;
    }

    /** Move down. */
    function moveDown( selection : Selection ) : Option<Selection> {
        const start = selection.start() ;
        const end = selection.end() ;
        const root = selection.root();
        const path = selection.path();

        assert.todo( "moveDown()"); return none<Selection>() ;
    }

    /** Replace all selected nodes with another set of nodes. */
    function singleReplace( selection : Selection, newNodes : Array<PNode> ) : Option<Selection> {
        const start = selection.start() ;
        const end = selection.end() ;
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
            return opt.bind<Selection>( (newSeln : Selection)  => {
                const p0 = node.children(0, k ) ;
                const p1 = [ newSeln.root() ] ;
                const p2 = node.children( k+1, len ) ;
                const newChildren = p0.concat( p1, p2 ) ;
                const opt0 = pnode.tryMake( node.label(), newChildren ) ;
                return opt0.map( (newNode : PNode) => new Selection( newNode, path, newSeln.anchor(), newSeln.focus() ) ) ;
            } ) ;
        }
    }

    /** Replace all selected nodes with another set of nodes. */
    function doubleReplace( srcSelection : Selection, newNodes4Src : Array<PNode>,
                            trgSelection : Selection, newNodes4Trg : Array<PNode>,
                            allowSrcAncestorOverwrite : boolean = true, 
                            allowTrgAncestorOverwrite : boolean = true ) : Option<Selection> {
        const srcStart = srcSelection.start() ;
        const srcEnd = srcSelection.end() ;

        const trgStart = trgSelection.start() ;
        const trgEnd = trgSelection.end() ;

        const node = srcSelection.root() ;
        assert.checkPrecondition( node === trgSelection.root() ) ;
        return doubleReplaceHelper( node,
                                    srcSelection.path(), srcStart, srcEnd, newNodes4Src,
                                    trgSelection.path(), trgStart, trgEnd, newNodes4Trg,
                                    allowSrcAncestorOverwrite, allowTrgAncestorOverwrite ) ;
    }

    /** Handle the case where the src path is empty but the target path is not.
     * The selection return either comprise the new nodes at the source or the
     * new nodes at the target depending on the value of returnNewTargetSeln .
    */
    function doubleReplaceOnePathEmpty(
                            node : PNode,
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
            return opt.bind<Selection>( newSeln => {
                const p0 = node.children(0, k) ;
                const p1 = [newSeln.root()] ;
                const p2 = node.children(k+1, srcStart ) ;
                const p3 = newNodes4Src ;
                const p4 = node.children( srcEnd, len ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                const opt0 = pnode.tryMake( node.label(), newChildren ) ; 
                return opt0.map( newNode =>
                    returnNewTargetSeln
                    ? new Selection( newNode, trgPath, newSeln.anchor(), newSeln.focus() ) 
                    : new Selection( newNode, collections.nil<number>(), srcStart, srcStart+newNodes4Src.length ) ) ;
            } ) ;
        } else if( srcEnd <= k ) {
            const opt = singleReplaceHelper( child, trgPath.rest(), trgStart, trgEnd, newNodes4Trg ) ;
            return opt.bind<Selection>( newSeln => {
                const p0 = node.children(0, srcStart) ;
                const p1 = newNodes4Src ;
                const p2 = node.children( srcEnd, k ) ;
                const p3 = [newSeln.root()];
                const p4 = node.children( k+1, len ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;    
                const opt0 = pnode.tryMake( node.label(), newChildren ) ;
                const kNew = k + newNodes4Src.length - (srcEnd-srcStart);
                return opt0.map( newNode => 
                    returnNewTargetSeln
                    ? new Selection( newNode, cons( kNew, trgPath.rest()), newSeln.anchor(), newSeln.focus() )
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
            return none<Selection>() ;
        }
    }
    
    /** Replace all selected nodes in two places with two other sequences */
    function doubleReplaceHelper(
                            node : PNode,
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
                return opt.map( newNode =>
                                   new Selection( newNode,
                                                  collections.nil<number>(),
                                                  newStart, newEnd ) ) ;
            } else if( trgEnd <= srcStart ) {
                const p0 = node.children( 0, trgStart ) ;
                const p1 = newNodes4Trg ;
                const p2 = node.children( trgEnd, srcStart ) ;
                const p3 = newNodes4Src ;
                const p4 = node.children( srcEnd , node.count() ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                const opt = pnode.tryMake( node.label(), newChildren ) ;
                const newEnd = trgStart + newNodes4Trg.length ;
                return opt.map( newNode =>
                                    new Selection( newNode,
                                                   collections.nil<number>(),
                                                   trgStart, newEnd ) ) ;
            } else {
                // Overlaping src and target ranges.  This is ambiguous unless either the new source nodes
                // or the new target nodes are empty.
                if( newNodes4Src.length !== 0 && newNodes4Trg.length !== 0 ) {
                    // Ambiguous case. This might happen if we swap a node with itself.
                    // It should fail.
                    return none<Selection>() ;
                }
                const start = Math.min( srcStart, trgStart ) ;
                const end = Math.max( srcEnd, trgEnd ) ;
                const p0 = node.children( 0, start ) ;
                const p1 = node.children( end , node.count() ) ;
                const newChildren = p0.concat( newNodes4Trg, newNodes4Src, p1 ) ;
                const opt = pnode.tryMake( node.label(), newChildren ) ;
                const newEnd = start + newNodes4Trg.length ;
                return opt.map( newNode =>
                                   new Selection( newNode,
                                                  collections.nil<number>(),
                                                  start, newEnd ) )  ;
            }
        } else if( srcPath.isEmpty() ) {
            return doubleReplaceOnePathEmpty( node,
                                              srcStart, srcEnd, newNodes4Src,
                                              trgPath, trgStart, trgEnd, newNodes4Trg,
                                              allowTrgAncestorOverwrite, true ) ;
        } else if( trgPath.isEmpty() ) {
            return doubleReplaceOnePathEmpty( node,
                                              trgStart, trgEnd, newNodes4Trg,
                                              srcPath, srcStart, srcEnd, newNodes4Src,
                                              allowSrcAncestorOverwrite, false ) ;
        } else if( srcPath.first() === trgPath.first() ) {
            // Neither path is empty and the two paths do not diverge at this level.
            // Recurse.
            const k = srcPath.first() ;
            const len = node.count() ;
            assert.check( 0 <= k, "Bad Path. k < 0" ) ;
            assert.check( k < len, "Bad Path. k >= len" ) ;
            const child = node.child( k ) ;
            const opt = doubleReplaceHelper( child,
                                             srcPath.rest(), srcStart, srcEnd, newNodes4Src,
                                             trgPath.rest(), trgStart, trgEnd, newNodes4Trg,
                                             allowSrcAncestorOverwrite, allowTrgAncestorOverwrite ) ;
            return opt.bind( newSeln => {
                const p0 = node.children( 0, k ) ;
                const p1 = [newSeln.root()] ;
                const p2 = node.children( k+1, node.count()) ;
                const newChildren = p0.concat( p1, p2 ) ;
                const opt0 = pnode.tryMake( node.label(), newChildren ) ;
                return opt0.map( newNode => 
                                     new Selection( newNode,
                                                    cons( k, newSeln.path()),
                                                    newSeln.anchor(), newSeln.focus() ) ) ;
             } ) ;
        } else {
            // Neither path is empty and the two paths diverge.
            // Treat it as two single replaces.
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
            return optSrc.bind( newSrcSeln => optTrg.bind( newTrgSeln  => {
                let p0 : Array<PNode> ;
                let p1 : Array<PNode> ;
                let p2 : Array<PNode> ;
                let p3 : Array<PNode> ;
                let p4 : Array<PNode> ;
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

    /** Replace all selected nodes with another sequence of nodes. 
     * The resulting selection should comprise the inserted children.
     */
    export class InsertChildrenEdit extends AbstractEdit<Selection> {
        private _newNodes : Array<PNode> ;

        constructor( newNodes : Array<PNode> ) {
            super() ;
            this._newNodes = newNodes ; }

        public applyEdit( selection : Selection ) : Option<Selection> {

            // Try to make the replacement.
            const opt = singleReplace( selection, this._newNodes ) ;
            if(  this._newNodes.length === 0 ) {
                // Copy of zero nodes may require backfilling.
                return opt.recoverBy (
                    () => singleReplace( selection, [labels.mkExprPH()] )
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

        public applyEdit( selection : Selection ) : Option<Selection> {
            const opt = singleReplace( selection, [] ) ;
            // TODO add more choices for replacement, such as noType, noExp, etc.
            return opt.recoverBy(
                () => singleReplace( selection, [labels.mkExprPH()] )
            ) ;
        }
    }

    /**  Changes the string value of a node's label.
     *  
     */
    export class ChangeLabelEdit extends AbstractEdit<Selection> {
        private _newString:string;

        constructor(newString:string) {
            super();
            this._newString = newString;
        }

        public applyEdit(selection:Selection):Option<Selection> {
            const nodes = selection.selectedNodes() ;
            const newNodes : Array<PNode> = [] ;
            let count = 0 ;
            // Loop through all the nodes, attempting to change the label on each.
            for( let i = 0 ; i < nodes.length; ++i ) {
                const optLabel = nodes[i].label().changeString( this._newString ) ;
                const optNode = optLabel.bind( l => nodes[i].tryModifyLabel(l) ) ;
                optNode.choose(
                    (node:PNode) => {newNodes.push( node ); count++ ;},
                    () => { newNodes.push( nodes[i] ) ; }
                ) ;
            }
            // Fail if no labels changed.
            if( count === 0 ) return none<Selection>() ;
            else return singleReplace( selection, newNodes ) ;
        }
    }

    /**  Open the labels of a selection.  Opening a label will make it editable in the editor.
     *  
     */
    export class OpenLabelEdit extends AbstractEdit<Selection> {

        constructor() {
            super();
        }

        public applyEdit(selection:Selection):Option<Selection> {
            const nodes = selection.selectedNodes() ;
            const newNodes : Array<PNode> = [] ;
            let count = 0 ;
            // Loop through all the nodes, attempting to open the label on each.
            for( let i = 0 ; i < nodes.length; ++i ) {
                const optLabel = nodes[i].label().open() ;
                const optNode = optLabel.bind( l => nodes[i].tryModifyLabel(l) ) ;
                optNode.choose(
                    (node:PNode) => {newNodes.push( node ); count++ ;},
                    () => { newNodes.push( nodes[i] ) ; }
                ) ;
            }
            // Fail if no labels changed.
            if( count === 0 ) return none<Selection>() ;
            else return singleReplace( selection, newNodes ) ;
        }
    }

    /** Copy all nodes in one selection over the selected nodes in another.
     * The selection returned indicates the newly added nodes.
    */
    export class CopyEdit extends AbstractEdit<Selection> {
        private _srcNodes : Array<PNode> ;

        constructor(srcSelection:Selection) {
            super();
            this._srcNodes = srcSelection.selectedNodes() ;
        }

        public applyEdit(selection:Selection):Option<Selection> {
            const opt = singleReplace( selection, this._srcNodes ) ;
            if(  this._srcNodes.length === 0 ) {
                // Copy of zero nodes may require backfilling.
                return opt.recoverBy (
                    () => singleReplace( selection, [labels.mkExprPH()] )
                ) ;
            } else {
                return opt ;
            }
        }
    }

    /** Move nodes by copying them and, at the same time deleting, the originals.
     * <p>The nodes to be moved are indicated by the first parameter to the constuctor.
     * The source is given as a constructor parameter.
     * The target is a parameter to applyEdit.
     * The source and target selections must share the same tree. Otherwise the edit will fail.
     * The resulting tree must be valid, otherwise the edit will fail.
     * The resuling selection will select the nodes inserted to overwrite the target selection.
     *
     *
     */
    export class MoveEdit extends AbstractEdit<Selection> {
        private readonly _srcSelection : Selection ;
        private readonly _backfills : Array<Array<PNode>> ;

        constructor( srcSelection:Selection, backfills : Array<Array<PNode>> ) {
            super();
            this._srcSelection = srcSelection ;
            this._backfills = backfills ;
        }

        public applyEdit( trgSelection:Selection ) : Option<Selection> {
            if( this._srcSelection.root() !== trgSelection.root() ) return none<Selection>() ;
            const newNodes = this._srcSelection.selectedNodes();
            // Try filling in with the empty sequence first. Otherwise try some other defaults.
            let opt = doubleReplace( this._srcSelection, [], trgSelection, newNodes, true, false ) ;
            // Try the various backfill options until one succeeds or we run out
            for( let i=0 ; opt.isEmpty() && i < this._backfills.length ; ++i) {
                opt = doubleReplace( this._srcSelection, this._backfills[i], 
                                     trgSelection, newNodes,
                                     true, false ) ;
            }
            return opt ;
        }
    }

    /** Swap.  Swap two selections that share the same root.
     * <p>For example we should be able to swap the then and else part of an if node.
     * The source is given as a constructor parameter.
     * The target is a parameter to applyEdit.
     * The source and target selections must share the same root. Otherwise the edit will fail.
     * The resuling selection will select the nodes inserted to overwrite the target selection.
     * 
     * <p>There are several cases to consider:
     * <ul>
     *     <li>If the two selections share a parent, the two sets of selected nodes must be disjoint,
     *         otherwise the edit will fail.  For example if the source is a( $ b c ^ d) and the
     *         target is a( b $ c d ^ ), the swap will fail, since node c is in the intersection.
     *    <li>If one selection includes a node that is the parent of the other or an ancestor of 
     *        the parent of the other, the swap will fail.  For example if the source is a( $ b( c(d) ) ^ )
     *        and the target is a( b( c( $d^ ) ) ), the swap will fail, since the b node is selected in
     *        the source and b is an ancestor of c, which is the parent of the target selection.
     *    <li>In all other cases the edit should succeed, provided the new tree is valid.
    */
    export class SwapEdit extends AbstractEdit<Selection> {
        private _srcSelection:Selection;

        constructor(srcSelection:Selection) {
            super();

            this._srcSelection = srcSelection;
        }

        public applyEdit(trgSelection:Selection) : Option<Selection> {
            if( this._srcSelection.root() !== trgSelection.root() ) {
                return none<Selection>() ; }
            const newNodes4Trg = this._srcSelection.selectedNodes() ;
            const newNodes4Src = trgSelection.selectedNodes() ;
            return doubleReplace( this._srcSelection, newNodes4Src,
                                  trgSelection, newNodes4Trg,
                                  false, false ) ;
        }
    }

    /** Is this a suitable selection to stop at for the left and right arrow keys.
     * 
    */
    function leftRightSuitable( opt : Option<Selection> ) : boolean {
        // Need to stop when we can go no further to the left or right.
        if( opt.isEmpty() ) return true ;
        // Otherwise stop on dropzones or placeholders and similar nodes.
        const sel = opt.first() ;
        const start = sel.start() ;
        const end = sel.end() ;
        if( end - start === 1 ) {
            // Placeholders and such are suitable
            const node = sel.selectedNodes()[0] ;
            return node.isPlaceHolder() ; }
        else if( end === start ) {
            const node = sel.root().get( sel.path() ) ;
            return node.hasDropZonesAt( start ) ;
        } else {
            return assert.failedPrecondition(
                "leftRightSuitable: selection should be empty or one node." ) ; 
        }
    }

    /** Is this a suitable selection to stop at for the up and down arrow keys.
     * 
    */
    function upDownSuitable( opt : Option<Selection> ) : boolean {
        // Need to stop when we can go no further to the up or down.
        if( opt.isEmpty() ) return true ;
        // Otherwise stop on dropzones or placeholders and similar nodes.
        const sel = opt.first() ;
        const start = sel.start() ;
        const end = sel.end() ; assert.todo("TODO: upDownSuitable()"); return false ;
    }
    /** 
     * Left edit
     */
    export class LeftEdit extends AbstractEdit<Selection> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection ) : Option<Selection> {
            let opt = moveLeft( selection ) ;
            while( ! leftRightSuitable(opt) ) opt = moveLeft( opt.first() ) ;
            return opt ;
        }
    }

    /** 
     * Right edit
     */
    export class RightEdit extends AbstractEdit<Selection> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection ) : Option<Selection> {
            let opt = moveRight( selection ) ;
            while( ! leftRightSuitable(opt) ) opt = moveRight( opt.first() ) ;
            return opt ;
        }
    }

    /** 
     * Up edit
     */
    export class UpEdit extends AbstractEdit<Selection> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection ) : Option<Selection> {
            let opt = moveUp( selection ) ;
            while( ! upDownSuitable(opt) ) opt = moveUp( opt.first() ) ;
            return opt ;
        }
    }

    /** 
     * Down edit
     */
    export class DownEdit extends AbstractEdit<Selection> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection ) : Option<Selection> {
            let opt = moveDown( selection ) ;
            while( ! upDownSuitable(opt) ) opt = moveDown( opt.first() ) ;
            return opt ;
        }
    }

}

export = pnodeEdits ;
