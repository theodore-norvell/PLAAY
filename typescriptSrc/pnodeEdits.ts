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
    import Label = pnode.Label;
    
    
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
    export function checkSelection( tree : PNode, path : List<number>,
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

    //changes the id inside the label
    export class ChangeLabelEdit extends AbstractEdit<Selection> {
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
            var edit = new pnodeEdits.DeleteEdit();
            var oldSel = edit.applyEdit(this._oldSelection).choose(
                p => p,
                    () => {
                        assert.check(false, "Error applying edit to node");
                        return null;
                    });

            var newSel = new Selection(oldSel.root(), selection.path(), selection.anchor(), selection.focus());

            var edit2 = new InsertChildrenEdit(this._newNodes);
            return edit2.applyEdit(newSel);
        }
    }

    export class SwapNodeEdit extends AbstractEdit<Selection> {
        _newNode1 : PNode ;
        _newNode2 : PNode ;
        _firstSelection : Selection;
        _secondSelection : Selection;

        constructor(firstSelection:Selection, secondSelection:Selection) {
            super();

            this._firstSelection = firstSelection;
            this._secondSelection = secondSelection;

            this._newNode1 = this.getChildrenToSwap(firstSelection);
            this._newNode2 = this.getChildrenToSwap(firstSelection);
        }

        getChildrenToSwap(selection : Selection) : PNode {
            const loop = (node:PNode, path:List<number>,
                          start:number, end:number) => {
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
            var node = loop(selection.root(), selection.path(), start, end);
            return node.pop();
        }

        applyEdit():Option<Selection> {
            var edit1 = new pnodeEdits.InsertChildrenEdit([this._newNode1]);

            var firstSel = edit1.applyEdit(this._secondSelection).choose(
                p => p,
                () => {
                    assert.check(false, "Error applying edit to node");
                    return null;
                });

            var sel =  new Selection(firstSel._root, this._firstSelection.path(), this._firstSelection.anchor(), this._firstSelection.focus() );
            var edit2 = new pnodeEdits.InsertChildrenEdit([this._newNode2]);
            return edit2.applyEdit(sel);

        }
    }

}

export = pnodeEdits ;
