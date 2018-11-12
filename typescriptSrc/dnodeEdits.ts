/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="dnode.ts" />
/// <reference path="edits.ts" />
/// <reference path="selection.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import dnode = require( './dnode' ) ;
import edits = require( './edits' ) ;
import selection = require( './selection' ) ;

/** dnodeEdits is responsible for edits that operate on selections.
 * This module also includes the Selection<L,T> class as well as
 * various edit classes.  Each edit class represents some
 * operation on Selections that might succeed or fail.
 */
module dnodeEdits {
    import Option = collections.Option;
    import none = collections.none;
    import some = collections.some;
    import List = collections.List ;
    import list = collections.list ;
    import cons = collections.cons ;
    import snoc = collections.snoc;
    import last = collections.last;
    import butLast = collections.butLast;
    import DNode = dnode.DNode ;
    import DLabel = dnode.DLabel ;
    import Edit = edits.Edit ;
    import AbstractEdit = edits.AbstractEdit ;
    import compose = edits.compose ;
    import alt = edits.alt ;
    import optionally = edits.optionally ;
    import testEdit = edits.testEdit ;
    import Selection = selection.Selection ;
    
    /** Move out. I.e. to the parent if possible.
     * @param selection
     * @param normal iff the anchor preceeds the focus.
    */
    function moveOut<L extends DLabel<L,T>, T extends DNode<L,T>>( selection : Selection<L,T>, normal : boolean ) : Option<Selection<L,T>> {
        const root = selection.root();
        const path = selection.path();
        if( path.isEmpty() ) { return none<Selection<L,T>>() ; }
        else {
            const l = collections.last(path) ;
            return some( new Selection<L,T>( root, collections.butLast( path ),
                                        normal ? l : l+1,
                                        normal ? l+1 : l ) ) ;
        }

    }

    /** Move left. */
    function moveLeft<L extends DLabel<L,T>, T extends DNode<L,T>>( selection : Selection<L,T> ) : Option<Selection<L,T>> {
        const start = selection.start() ;
        const end = selection.end() ;
        const root = selection.root();
        const path = selection.path();

        // If this is a point (empty) selection.
        if (start === end)
        {
            //If there is there is node to the point's left
            if(start > 0)
            {
                // Select the right most point under that node.
                const newPath : List<number> = snoc(path, start-1);
                const numOfChildren : number = root.get(newPath).count();
                return some( new Selection<L,T>(root, newPath, numOfChildren, numOfChildren));            
            }
            //If there is no node to the left and the parent is the root.
            else if (path.isEmpty())
            {
                // This is the start of the line. Fail
                return none<Selection<L,T>>();
            }
            //If there is no node to the point's left. Select the parent of the point.
            else {
                return some( new Selection<L,T>(root, butLast(path), last(path), last(path)+1));
            }
        }      
        else // This is a nonempty selection.
        {
            //return a selection representing the position to the left of the leftmost selected node
            return some( new Selection<L,T>(root, path, start, start));
        } 
    }

    /** Move right. */
    function moveRight<L extends DLabel<L,T>, T extends DNode<L,T>>( selection : Selection<L,T> ) : Option<Selection<L,T>> {
        const start = selection.start() ;
        const end = selection.end() ;
        const root = selection.root();
        const path = selection.path();

        // If this is a point selection:
        if (start === end)
        {
            // If there is a node to the right.
            if(root.get(path).count() > start)
            {
                // Select that node
                return some( new Selection<L,T>(root, path, start, start+1));
            }
            //If there is no node to the right and the parent is the root"
            else if (path.isEmpty())
            {
                // This is the end of the line. Fail.
                return none<Selection<L,T>>();
            }
            //If there is no node to the right and the parent is
            // not the root.
            else {
                //return a selection representing the position to the right of the parent
                return some( new Selection<L,T>(root, butLast(path), last(path) + 1, last(path) + 1));
            }
        }      
        else // This is a nonempty selection
        {
            // Go to the first point under the first node
            return some( new Selection<L,T>(root, snoc(path, start), 0, 0));
        }
    }

    /** Move up. */
    function moveUp<L extends DLabel<L,T>, T extends DNode<L,T>>( selection : Selection<L,T> ) : Option<Selection<L,T>> {
        return moveLeft(selection) ; //In our case this is the same.
    }

    /** Move down. */
    function moveDown<L extends DLabel<L,T>, T extends DNode<L,T>>( selection : Selection<L,T> ) : Option<Selection<L,T>> {
        return moveRight(selection) ; //In our case this is the same.
    }
    
    /** Move Tab forward. */
    function moveTabForward<L extends DLabel<L,T>, T extends DNode<L,T>>( selection : Selection<L,T> ) : Option<Selection<L,T>> {
        return moveRight(selection) ; //In our case this is the same.
    }

    /** Move Tab back. */
    function moveTabBack<L extends DLabel<L,T>, T extends DNode<L,T>>( selection : Selection<L,T> ) : Option<Selection<L,T>> {
        return moveLeft(selection) ; //In our case this is the same.
    }

    /** Move the focus one place to the right if possible.
     * Otherwise, move up the tree.*/
    function moveFocusRight<L extends DLabel<L,T>, T extends DNode<L,T>>( selection : Selection<L,T> ) : Option<Selection<L,T>> {
        const anchor = selection.anchor() ;
        const focus = selection.focus() ;
        const root = selection.root();
        const path = selection.path();
        const parent = selection.parent() ;
        console.log( "moveFocusRight: anchor is " +anchor+
                     " focus is " +focus+ 
                     " parent.count() is " +parent.count() ) ;
        if( focus < parent.count() ) {
            return some( new Selection<L,T>(root, path, anchor, focus+1) ) ; }
        else {
            return moveOut( selection, true ) ; }
    }

    /** Move the focus one place to the left if possible.
     * Otherwise, move up the tree.*/
    function moveFocusLeft<L extends DLabel<L,T>, T extends DNode<L,T>>( selection : Selection<L,T> ) : Option<Selection<L,T>> {
        const anchor = selection.anchor() ;
        const focus = selection.focus() ;
        const root = selection.root();
        const path = selection.path();
        if( focus > 0 ) {
            return some( new Selection<L,T>(root, path, anchor, focus-1) ) ; }
        else {
            return moveOut( selection, false ) ; }
    }

    /** Replace all selected nodes with another set of nodes. */
    function singleReplace<L extends DLabel<L,T>, T extends DNode<L,T>>(
            selection : Selection<L,T>, newNodes : Array<T> ) : Option<Selection<L,T>> {
        const start = selection.start() ;
        const end = selection.end() ;
        return singleReplaceHelper( selection.root(), selection.path(), start, end, newNodes ) ;
    }
    
    function singleReplaceHelper<L extends DLabel<L,T>, T extends DNode<L,T>>( node : T, path : List<number>,
                                  start : number, end : number, newNodes : Array<T> ) : Option<Selection<L,T>>
    {
        if( path.isEmpty() ) {
            assert.checkPrecondition( 0 <= start && start <= end && end <= node.count() ) ;
            const newChildren = node.children(0, start).concat( newNodes, node.children(end, node.count()) ) ;
            const opt =  node.tryMake( node.label(), newChildren ) ;
            return opt.map( newNode => new Selection<L,T>( newNode, path, start, start+newNodes.length ) ) ;
        } else {
            const k = path.first() ;
            const len = node.count() ;
            assert.check( 0 <= k, "Bad Path. k < 0" ) ;
            assert.check( k < len, "Bad Path. k >= len" ) ;
            const opt = singleReplaceHelper( node.child(k), path.rest(), start, end, newNodes ) ;
            return opt.bind<Selection<L,T>>( (newSeln : Selection<L,T>) => {
                const p0 = node.children(0, k ) ;
                const p1 = [ newSeln.root() ] ;
                const p2 = node.children( k+1, len ) ;
                const newChildren = p0.concat( p1, p2 ) ;
                const opt0 = node.tryMake( node.label(), newChildren ) ;
                return opt0.map( (newNode : T) => new Selection<L,T>( newNode, path, newSeln.anchor(), newSeln.focus() ) ) ;
            } ) ;
        }
    }

    /** Replace all selected nodes with another set of nodes. */
    function doubleReplace<L extends DLabel<L,T>, T extends DNode<L,T>>( srcSelection : Selection<L,T>, newNodes4Src : Array<T>,
                            trgSelection : Selection<L,T>, newNodes4Trg : Array<T>,
                            allowSrcAncestorOverwrite : boolean = true, 
                            allowTrgAncestorOverwrite : boolean = true ) : Option<Selection<L,T>> {
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
    function doubleReplaceOnePathEmpty<L extends DLabel<L,T>, T extends DNode<L,T>> (
                            node : T,
                            srcStart : number, srcEnd : number, newNodes4Src : Array<T>,
                            trgPath : List<number>, trgStart : number, trgEnd : number, newNodes4Trg : Array<T>,
                            allowTrgAncestorOverwrite : boolean, returnNewTargetSeln : boolean )
    : Option< Selection<L,T> >
    {
        const k = trgPath.first() ;
        const len = node.count() ;
        assert.check( 0 <= k, "Bad Path. k < 0" ) ;
        assert.check( k < len, "Bad Path. k >= len" ) ;
        const child = node.child(k) ;
        if( k < srcStart ) {
            const opt = singleReplaceHelper( child, trgPath.rest(), trgStart, trgEnd, newNodes4Trg ) ;
            return opt.bind<Selection<L,T>>( newSeln => {
                const p0 = node.children(0, k) ;
                const p1 = [newSeln.root()] ;
                const p2 = node.children(k+1, srcStart ) ;
                const p3 = newNodes4Src ;
                const p4 = node.children( srcEnd, len ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                const opt0 = node.tryMake( node.label(), newChildren ) ; 
                return opt0.map( newNode =>
                    returnNewTargetSeln
                    ? new Selection<L,T>( newNode, trgPath, newSeln.anchor(), newSeln.focus() ) 
                    : new Selection<L,T>( newNode, collections.nil<number>(), srcStart, srcStart+newNodes4Src.length ) ) ;
            } ) ;
        } else if( srcEnd <= k ) {
            const opt = singleReplaceHelper( child, trgPath.rest(), trgStart, trgEnd, newNodes4Trg ) ;
            return opt.bind<Selection<L,T>>( newSeln => {
                const p0 = node.children(0, srcStart) ;
                const p1 = newNodes4Src ;
                const p2 = node.children( srcEnd, k ) ;
                const p3 = [newSeln.root()];
                const p4 = node.children( k+1, len ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;    
                const opt0 = node.tryMake( node.label(), newChildren ) ;
                const kNew = k + newNodes4Src.length - (srcEnd-srcStart);
                return opt0.map( newNode => 
                    returnNewTargetSeln
                    ? new Selection<L,T>( newNode, cons( kNew, trgPath.rest()), newSeln.anchor(), newSeln.focus() )
                    : new Selection<L,T>( newNode, collections.nil<number>(), srcStart, srcStart+newNodes4Src.length ) ) ;
                } ) ;
        } else if( allowTrgAncestorOverwrite ) {
            // The target is within the source selection. We delete the target and
            // ignore the nodes that replace the target.
            assert.checkPrecondition( ! returnNewTargetSeln ) ;
            const p0 = node.children(0, srcStart) ;
            const p1 = newNodes4Src ;
            const p2 = node.children( srcEnd, len ) ;
            const newChildren = p0.concat( p1, p2 ) ;
            const opt = node.tryMake( node.label(), newChildren ) ;
            return opt.map( newNode =>
                new Selection<L,T>( node, collections.nil<number>(), srcStart, srcStart+newNodes4Src.length ) ) ;
        } else {
            return none<Selection<L,T>>() ;
        }
    }
    
    /** Replace all selected nodes in two places with two other sequences */
    function doubleReplaceHelper<L extends DLabel<L,T>, T extends DNode<L,T>> (
                            node : T,
                            srcPath : List<number>,
                            srcStart : number,
                            srcEnd : number,
                            newNodes4Src : Array<T>,
                            trgPath : List<number>,
                            trgStart : number,
                            trgEnd : number,
                            newNodes4Trg : Array<T>,
                            allowSrcAncestorOverwrite : boolean = true,
                            allowTrgAncestorOverwrite : boolean = true )
    : Option<Selection<L,T>>
    {
        if( srcPath.isEmpty() && trgPath.isEmpty() ) {
            // Common parent
            if( srcEnd <= trgStart ) {
                // Source region is before target region
                const p0 = node.children( 0, srcStart ) ;
                const p1 = newNodes4Src ;
                const p2 = node.children( srcEnd, trgStart ) ;
                const p3 = newNodes4Trg ;
                const p4 = node.children( trgEnd , node.count() ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                const opt = node.tryMake( node.label(), newChildren ) ;
                const newStart = trgStart + newNodes4Src.length - (srcEnd-srcStart) ;
                const newEnd = newStart + newNodes4Trg.length ;
                return opt.map( newNode =>
                                    new Selection<L,T>( newNode, collections.nil<number>(), newStart, newEnd ) ) ;
            } else if( trgEnd <= srcStart ) {
                // Target region is before source region
                const p0 = node.children( 0, trgStart ) ;
                const p1 = newNodes4Trg ;
                const p2 = node.children( trgEnd, srcStart ) ;
                const p3 = newNodes4Src ;
                const p4 = node.children( srcEnd , node.count() ) ;
                const newChildren = p0.concat( p1, p2, p3, p4 ) ;
                const opt = node.tryMake( node.label(), newChildren ) ;
                const newEnd = trgStart + newNodes4Trg.length ;
                return opt.map( newNode => new Selection<L,T>( newNode, collections.nil<number>(), trgStart, newEnd ) ) ;
            } else {
                // Overlaping src and target ranges.  This is ambiguous unless either the new source nodes
                // or the new target nodes are empty.
                if( newNodes4Src.length !== 0 && newNodes4Trg.length !== 0 ) {
                    // Ambiguous case. This might happen if we swap a node with itself.
                    // It should fail.
                    return none<Selection<L,T>>() ;
                }
                const start = Math.min( srcStart, trgStart ) ;
                const end = Math.max( srcEnd, trgEnd ) ;
                const p0 = node.children( 0, start ) ;
                const p1 = node.children( end , node.count() ) ;
                const newChildren = p0.concat( newNodes4Trg, newNodes4Src, p1 ) ;
                const opt = node.tryMake( node.label(), newChildren ) ;
                const newEnd = start + newNodes4Trg.length ;
                return opt.map( newNode =>
                    new Selection<L,T>( newNode, collections.nil<number>(), start, newEnd ) )  ;
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
            // Neither path is empty and they agree on their first item.
            const k = srcPath.first() ;
            const len = node.count() ;
            assert.check( 0 <= k, "Bad Path. k < 0" ) ;
            assert.check( k < len, "Bad Path. k >= len" ) ;
            const child = node.child( k ) ;
            const opt = doubleReplaceHelper( child, srcPath.rest(), srcStart, srcEnd, newNodes4Src, trgPath.rest(), trgStart, trgEnd, newNodes4Trg, allowSrcAncestorOverwrite, allowTrgAncestorOverwrite ) ;
            return opt.bind( newSeln => {
                const p0 = node.children( 0, k ) ;
                const p1 = [newSeln.root()] ;
                const p2 = node.children( k+1, node.count()) ;
                const newChildren = p0.concat( p1, p2 ) ;
                const opt0 = node.tryMake( node.label(), newChildren ) ;
                return opt0.map( newNode => 
                    new Selection<L,T>( newNode, cons( k, newSeln.path()), newSeln.anchor(), newSeln.focus() ) ) ;
             } ) ;
        } else {
            // Neither path is empty and they disagree. 
            // Here the paths diverge.
            const kSrc = srcPath.first() ;
            const kTrg = trgPath.first() ;
            const len = node.count() ;
            assert.check( 0 <= kSrc, "Bad Path. 0 > kSrc" ) ;
            assert.check( kSrc < len, "Bad Path. kSrc >= len" ) ;
            assert.check( 0 <= kTrg, "Bad Path. 0 > kTrg" ) ;
            assert.check( kTrg < len, "Bad Path. kTrg >= len" ) ;
            const childSrc = node.child( kSrc ) ;
            const childTrg = node.child( kTrg ) ;
            const optSrc = singleReplaceHelper( childSrc, srcPath.rest(), srcStart, srcEnd, newNodes4Src ) ;
            const optTrg = singleReplaceHelper( childTrg, trgPath.rest(), trgStart, trgEnd, newNodes4Trg ) ;
            return optSrc.bind( newSrcSeln => optTrg.bind( newTrgSeln  => {
                let p0 : Array<T> ;
                let p1 : Array<T> ;
                let p2 : Array<T> ;
                let p3 : Array<T> ;
                let p4 : Array<T> ;
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
                const opt =  node.tryMake( node.label(), newChildren ) ;
                return opt.map( newNode =>
                    new Selection<L,T>( newNode, cons( kTrg, newTrgSeln.path()), newTrgSeln.anchor(), newTrgSeln.focus() ) ) ;
            } ) ) ; }
    }

    /** Replace all selected nodes with another sequence of nodes. 
     * The resulting selection should comprise the inserted children.
     */
    class InsertChildrenEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {
        private _newNodes : Array<T> ;

        constructor( newNodes : Array<T> ) {
            super() ;
            this._newNodes = newNodes ; }

        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {

            // Try to make the replacement.
            return singleReplace( selection, this._newNodes ) ;
        }
    }

    export function insertChildrenEdit<L extends DLabel<L,T>, T extends DNode<L,T>>( newNodes : Array<T> ) : Edit<Selection<L,T>> {
        return new InsertChildrenEdit( newNodes ) ;
    }

    /** Replace with one of a sequence of choices. Picks the first that succeeds. */
    export function replaceWithOneOf<L extends DLabel<L,T>, T extends DNode<L,T>>( choices : Array<Array<T>>  ) : AbstractEdit<Selection<L,T>> {
        return alt( choices.map( (choice) => new InsertChildrenEdit( choice ) ) ) ;
    }

    /**  Changes the string value of a node's label.
     *  
     */
    export class ChangeStringEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {
        private _newString:string;

        constructor(newString:string) {
            super();
            this._newString = newString;
        }

        public applyEdit(selection:Selection<L,T>):Option<Selection<L,T>> {
            const nodes = selection.selectedNodes() ;
            const newNodes : Array<T> = [] ;
            let count = 0 ;
            // Loop through all the nodes, attempting to change the label on each.
            for( let i = 0 ; i < nodes.length; ++i ) {
                const optLabel = nodes[i].label().changeString( this._newString ) ;
                const optNode = optLabel.bind( l => nodes[i].tryModifyLabel(l) ) ;
                optNode.choose(
                    (node:T) => {newNodes.push( node ); count++ ;},
                    () => { newNodes.push( nodes[i] ) ; }
                ) ;
            }
            // Fail if no labels changed.
            if( count === 0 ) return none<Selection<L,T>>() ;
            else return singleReplace( selection, newNodes ) ;
        }
    }
    
    /**  Toggles boolean edit
     *  
     */
    /**  Changes the string value of a node's label.
     *  
     */
    export class ToggleBooleanEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() {
            super();
        }

        public applyEdit(selection:Selection<L,T>):Option<Selection<L,T>> {
            const nodes = selection.selectedNodes() ;
            const newNodes : Array<T> = [] ;
            let count = 0 ;
            // Loop through all the nodes, attempting to change the label on each.
            for( let i = 0 ; i < nodes.length; ++i ) {
                const optNode = nodes[i].label().getBoolean()
                .bind( (q:boolean) => nodes[i].label().changeBoolean( !q ) )
                .bind( l => nodes[i].tryModifyLabel(l) ) ;
                optNode.choose(
                    (node:T) => {newNodes.push( node ); count++ ;},
                    () => { newNodes.push( nodes[i] ) ; } ) ;
            }
            // Fail if no labels changed.
            if( count === 0 ) return none<Selection<L,T>>() ;
            else return singleReplace( selection, newNodes ) ;
        }
    }

    export function toggleBooleanEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return new ToggleBooleanEdit() ; }

    /**  Open the labels of a selection.  Opening a label will make it editable in the editor.
     *  
     */
    export class OpenLabelEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() {
            super();
        }

        public applyEdit(selection:Selection<L,T>):Option<Selection<L,T>> {
            const nodes = selection.selectedNodes() ;
            const newNodes : Array<T> = [] ;
            let count = 0 ;
            // Loop through all the nodes, attempting to open the label on each.
            for( let i = 0 ; i < nodes.length; ++i ) {
                const optLabel = nodes[i].label().open() ;
                const optNode = optLabel.bind( l => nodes[i].tryModifyLabel(l) ) ;
                optNode.choose(
                    (node:T) => {newNodes.push( node ); count++ ;},
                    () => { newNodes.push( nodes[i] ) ; }
                ) ;
            }
            // Fail if no labels changed.
            if( count === 0 ) return none<Selection<L,T>>() ;
            else return singleReplace( selection, newNodes ) ;
        }
    }

    export function openLabelEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return new OpenLabelEdit() ; }
        
    /** Copy all nodes in the src selection over the selected nodes of the target selection.
     * The selection returned indicates the newly added nodes.
     * If the src selection is empty, also try replacing the target with something from the backfill list.
    */
    export function pasteEdit<L extends DLabel<L,T>, T extends DNode<L,T>>(srcSelection:Selection<L,T>, backFillList : Array<Array<T>> ) : Edit<Selection<L,T>> {
        const srcNodes = srcSelection.selectedNodes() ;
        if( srcNodes.length === 0 ) {
            return alt( [ insertChildrenEdit( srcNodes ), replaceWithOneOf( backFillList ) ] ) ; }
        else {
            return insertChildrenEdit( srcNodes ) ; }
    }

    /** Move nodes by copying them and, at the same time deleting, the originals.
     * The nodes to be moved are indicated by the first parameter to the constuctor.
     * The source is given as a constructor parameter.
     * The target as a parameter to applyEdit.
     * The source and target selections must share the same tree. Otherwise the edit will fail.
     * The resuling selection will select the nodes inserted to overwrite the target selection.
     */
    class MoveEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {
        private _srcSelection : Selection<L,T> ;
        private replacementNodes : Array<T> ;

        constructor( srcSelection:Selection<L,T>, replacementNodes : Array<T> ) {
            super();
            this._srcSelection = srcSelection ;
            this.replacementNodes = replacementNodes ;
        }

        public applyEdit( trgSelection:Selection<L,T> ) : Option<Selection<L,T>> {
            if( this._srcSelection.root() !== trgSelection.root() ) return none<Selection<L,T>>() ;
            const newNodes = this._srcSelection.selectedNodes();
            return doubleReplace( this._srcSelection, this.replacementNodes, trgSelection, newNodes, true, false ) ;
        }
    }

    export function moveEdit<L extends DLabel<L,T>, T extends DNode<L,T>>(srcSelection:Selection<L,T>, backFillList : Array<Array<T>> ) : Edit<Selection<L,T>> {
        // First try filling place where the source was with no nodes
        const listOfReplacements = [[] as Array<T>].concat( backFillList ) ;
        const moveEdits = listOfReplacements.map( replacements => new MoveEdit(srcSelection, replacements)) ;
        return alt( moveEdits ) ;
    }

    /** Swap.  Swap two selections that share the same root.
     * For example we should be able to swap the then and else part of an if node.
     * The source is given as a constructor parameter.
     * The target as a parameter to applyEdit.
     * The source and target selections must share the same tree. Otherwise the edit will fail.
     * The resuling selection will select the nodes inserted to overwrite the target selection.
    */
    class SwapEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {
        private _srcSelection:Selection<L,T>;

        constructor(srcSelection:Selection<L,T>) {
            super();

            this._srcSelection = srcSelection;
        }

        public applyEdit(trgSelection:Selection<L,T>) : Option<Selection<L,T>> {
            if( this._srcSelection.root() !== trgSelection.root() ) {
                return none<Selection<L,T>>() ; }
            const newNodes4Trg = this._srcSelection.selectedNodes() ;
            const newNodes4Src = trgSelection.selectedNodes() ;
            return doubleReplace( this._srcSelection, newNodes4Src,
                                  trgSelection, newNodes4Trg,
                                  false, false ) ;
        }
    }


    export function swapEdit<L extends DLabel<L,T>, T extends DNode<L,T>>(srcSelection:Selection<L,T> ) : Edit<Selection<L,T>> {
        return new SwapEdit( srcSelection ) ;
    }

    /** Is this a suitable selection to stop at for the left and right arrow keys.
     * 
    */
    function leftRightSuitable<L extends DLabel<L,T>, T extends DNode<L,T>>( opt : Option<Selection<L,T>> ) : boolean {
        // Need to stop when we can go no further to the left or right.
        if( opt.isEmpty() ) return true ;
        // Otherwise stop on dropzones or placeholders and similar nodes.
        const sel = opt.first() ;
        const start = sel.start() ;
        const end = sel.end() ;
        if( end - start >= 1 ) {
            // Any selection containing 1 or more nodes is
            return true ; }
        else if( end === start ) {
            // Dropzones are suitable
            return sel.parent().hasDropZonesAt( start ) ;
        } else {
            return false ;
        }
    }

    /** Is this a suitable selection to stop at for the up and down arrow keys.
     * 
    */
    function upDownSuitable<L extends DLabel<L,T>, T extends DNode<L,T>>( opt : Option<Selection<L,T>> ) : boolean {
        // Need to stop when we can go no further to the up or down.
        if( opt.isEmpty() ) return true ;
        // Otherwise stop only on point selections whose
        // parents have vertical layout.
        const sel = opt.first() ;
        const start = sel.start() ;
        const end = sel.end() ;
        if(end - start === 1)
        {
            return false ;
        }
        else if( end === start ) {
            return sel.parent().hasVerticalLayout() ;
        }
        else
        {
            return false ;
        }
    }

    /** Is this a suitable selection to stop at for the shift-up arrow and shift-down arrow keys are used to move the focus.
    */
    function upDownFocusMoveSuitable<L extends DLabel<L,T>, T extends DNode<L,T>>( opt : Option<Selection<L,T>> ) : boolean {
        // Need to stop when we can go no further to the up or down.
        if( opt.isEmpty() ) return true ;
        // Otherwise stop only on selections whose
        // parents have vertical layout.
        const sel = opt.first() ;
        return sel.parent().hasVerticalLayout() ;
    }

    /** Is this a suitable selection to stop at for tab keys.
     * 
    */
    function tabSuitable<L extends DLabel<L,T>, T extends DNode<L,T>>( opt : Option<Selection<L,T>> ) : boolean {
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
            // Dropzones are suitable unless there is a place holder
            // (or similar) immediately to the right or left
            return sel.parent().hasDropZonesAt( start )
                && ! (   sel.parent().count() > start
                      && sel.parent().child( start ).isPlaceHolder() ) 
                && ! (   start > 0
                      && sel.parent().child( start-1 ).isPlaceHolder() ) ;
        } else {
            return false ;
        }
    }

    /** 
     * OutEdit
     */
    class OutEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {
        private readonly normal : boolean ;

        constructor(normal : boolean ) { super() ; this.normal = normal ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            return moveOut( selection, this.normal ) ;
        }
    }

    export function moveOutNormal<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return new OutEdit( true ) ; }

    export function moveOutReversed<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return new OutEdit( false ) ; }

    /** 
     * Left edit
     */
    class LeftEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            let opt = moveLeft( selection ) ;
            while( ! leftRightSuitable(opt) ) opt = moveLeft( opt.first() ) ;
            return opt ;
        }
    }

    export function leftEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return new LeftEdit() ; }

    /** 
     * Right edit
     */
    class RightEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            let opt = moveRight( selection ) ;
            while( ! leftRightSuitable(opt) ) opt = moveRight( opt.first() ) ;
            return opt ;
        }
    }

    export function rightEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return  new RightEdit() ; }

    /** 
     * Up edit
     */
    class UpEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            let opt = moveUp( selection ) ;
            while( ! upDownSuitable(opt) ) opt = moveUp( opt.first() ) ;
            return opt ;
        }
    }

    export function upEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return  new UpEdit() ; }

    /** 
     * Down edit
     */
    export class DownEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            let opt = moveDown( selection ) ;
            while( ! upDownSuitable(opt) ) opt = moveDown( opt.first() ) ;
            return opt ;
        }
    }

    export function downEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return  new DownEdit() ; }

    /** 
     * Move Focus Left edit
     */
    class MoveFocusLeftEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            if( selection.anchor() + 1 === selection.focus() ) {
                selection = selection.swap() ;
            }
            let opt = moveFocusLeft( selection ) ;
            while( ! leftRightSuitable(opt) ) {
                const sel = opt.first() ;
                opt = moveFocusLeft( sel ) ; }
            return opt ;
        }
    }

    export function moveFocusLeftEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return  new MoveFocusLeftEdit() ; }

    /** 
     * Move Focus Right edit
     */
    class MoveFocusRightEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            if( selection.anchor() === selection.focus() + 1) {
                selection = selection.swap() ;
            }
            let opt = moveFocusRight( selection ) ;
            while( ! leftRightSuitable(opt) ) {
                const sel = opt.first() ;
                opt = moveFocusRight( sel ) ; }
            return opt ;
        }
    }

    export function moveFocusRightEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return  new MoveFocusRightEdit() ; }

    /** 
     * Move Focus Up edit
     */
    class MoveFocusUpEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            if( selection.anchor() +1  === selection.focus()) {
                selection = selection.swap() ;
            }
            let opt = moveFocusLeft( selection ) ;
            while( ! upDownFocusMoveSuitable(opt) ) {
                const sel = opt.first() ;
                opt = moveFocusLeft( sel ) ; }
            return opt ;
        }
    }

    export function moveFocusUpEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return  new MoveFocusUpEdit() ; }

    /** 
     * Move Focus Down edit
     */
    class MoveFocusDownEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            if( selection.anchor() === selection.focus() + 1) {
                selection = selection.swap() ;
            }
            let opt = moveFocusRight( selection ) ;
            while( ! upDownFocusMoveSuitable(opt) ) {
                const sel = opt.first() ;
                opt = moveFocusRight( sel ) ; }
            return opt ;
        }
    }

    export function moveFocusDownEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return new MoveFocusDownEdit() ; }

    /** 
     * Tab edit
     */
    class TabForwardEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        private readonly moveFirst : boolean;
        constructor(moveFirst : boolean ) { super() ; this.moveFirst = moveFirst ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            let opt = this.moveFirst ? moveTabForward( selection ) : some( selection ) ;
            while( ! tabSuitable(opt) ) opt = moveTabForward( opt.first() ) ;
            return opt ;
        }
    }

    export function tabForwardEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return new TabForwardEdit( true ) ; }

    export function tabForwardIfNeededEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return new TabForwardEdit( false ) ; }

    /** 
     * Tab edit
     */
    class TabBackEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            let opt = moveTabBack( selection ) ;
            while( ! tabSuitable(opt) ) opt = moveTabBack( opt.first() ) ;
            return opt ;
        }
    }

    export function tabBackEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return  new TabBackEdit() ; }

    /** 
     * Select Parent Edit
     */
    class SelectParentEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        constructor() { super() ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            const path = selection.path() ;
            if( path.isEmpty() ) { return none<Selection<L,T>>() ; }
            else { return some( new Selection<L,T>( selection.root(),
                                               butLast( path ),
                                               last(path),
                                               last(path)+1 ) ) ; }
        }
    }

    export function selectParentEdit<L extends DLabel<L,T>, T extends DNode<L,T>>() : Edit<Selection<L,T>> {
        return  new SelectParentEdit() ; }

    /** replaceWithTemplateEdit is basically an InsertChidren 
     */
    export function replaceWithTemplateEdit<L extends DLabel<L,T>, T extends DNode<L,T>>( templates : Array<Selection<L,T>> ) : Edit<Selection<L,T>> {
        const editList : Array<Edit<Selection<L,T>>>
           = templates.map( (template) =>
                            new InsertChildrenEdit( [ template.root() ] ) ) ;
        return alt( editList )  ;
    }

    /** 
     * Engulf the selected nodes with a template
     */
    class EngulfEdit<L extends DLabel<L,T>, T extends DNode<L,T>> extends AbstractEdit<Selection<L,T>> {

        private  t : Selection<L,T> ;

        constructor(template : Selection<L,T> ) {
            super() ;
            this.t = template ; }
        
        public applyEdit( selection : Selection<L,T> ) : Option<Selection<L,T>> {
            // console.log( ">> EngulfEdit.applyEdit") ;
            const nodes = selection.selectedNodes() ;
            // First step: Insert the selected nodes into the template.
            const i0 = insertChildrenEdit( nodes ) ;
            // console.log( "   EngulfEdit.applyEdit: Applying first step") ;
            const opt0 = i0.applyEdit( this.t ) ;
            const res = opt0.bind( sel0 => {
                // Second step: Insert the result into the selection
                const i1 = insertChildrenEdit( [sel0.root() ] );
                // Do the second steps
                // console.log( "   EngulfEdit.applyEdit: Applying second step") ;
                const opt1 =  i1.applyEdit( selection ) ;
                // console.log( "   EngulfEdit.applyEdit: Done second step") ;
                return opt1.map( sel1 => {
                    // The third step adjusts the selection so that it is a point
                    // selection with the point being to the right of the engulfed nodes.
                    // console.log( "   EngulfEdit.applyEdit: Applying third step") ;
                    const sel1Nodes = sel1.selectedNodes() ;
                    assert.check( sel1Nodes.length === 1 && sel1Nodes[0] === sel0.root() ) ;
                    const path2 = sel1.path().cat( list( sel1.start() ) ).cat( sel0.path() ) ;
                    const anchor2 = sel0.end() ;
                    return new Selection<L,T>( sel1.root(), path2, anchor2, anchor2 ) ;
                }) ; } ) ;
            // console.log( "<< EngulfEdit.applyEdit") ;
            return res ;
        }
    }

    /** Engulf the selected nodes with a template. */
    export function engulfWithTemplateEdit<L extends DLabel<L,T>, T extends DNode<L,T>>( templates : Array<Selection<L,T>> ) : Edit<Selection<L,T>> {
        const editList : Array<Edit<Selection<L,T>>>
            = templates.map( (template) => new EngulfEdit( template ) ) ;
        return alt( editList )  ;
    }

    /** Either replace the current seletion with a given template or
     * engulf the current selection with the template.
     * If the target selection is empty, replace is prefered. Otherwise engulf is
     * preferred.
     * 
     * @param template 
     */
    export function replaceOrEngulfTemplateEdit<L extends DLabel<L,T>, T extends DNode<L,T>>( template : Selection<L,T> ) : Edit<Selection<L,T>> {
        return replaceOrEngulfTemplatesEdit( [template] ) ;
    }

    /** Either replace the current seletion with a given template or
     * engulf the current selection with the template.
     * If the target selection is empty, replace is prefered. Otherwise engulf is
     * preferred.
     * 
     * @param template 
     */
    export function replaceOrEngulfTemplatesEdit<L extends DLabel<L,T>, T extends DNode<L,T>>( templates : Array<Selection<L,T>> ) : Edit<Selection<L,T>> {
        const replace : Edit<Selection<L,T>> = compose( replaceWithTemplateEdit( templates ), optionally( tabForwardEdit() ) ) ;
        const engulf : Edit<Selection<L,T>> = compose( engulfWithTemplateEdit( templates ), optionally( tabForwardIfNeededEdit() ) ) ;
        const selectionIsAllPlaceHolder : Edit<Selection<L,T>>
            = testEdit( (sel:Selection<L,T>) =>
                           sel.selectedNodes().every( (p : T) =>
                                                       p.isPlaceHolder() ) ) ;
        return  alt( [compose( selectionIsAllPlaceHolder, replace ),
                      engulf,
                      replace] ) ;
    }

}

export = dnodeEdits ;
