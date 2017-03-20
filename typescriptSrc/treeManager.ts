/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="edits.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />

import assert = require( './assert' )
import collections = require( './collections' ) ;
import edits = require('./edits');
import pnode = require( './pnode' ) ;
import pnodeEdits = require ('./pnodeEdits');

module treeManager {

    import ExprSeqLabel = pnode.ExprSeqLabel;
    import Selection = pnodeEdits.Selection;
    import list = collections.list;
    import PNode = pnode.PNode;
    import Edit = edits.Edit;
    import Option = collections.Option;

    export class TreeManager {

        private root:PNode;

        public getRoot():PNode {
            return this.root;
        }

        createRoot() : Option<Selection>{

            var testroot = pnode.tryMake(ExprSeqLabel.theExprSeqLabel, []);
            // not sure how option works but will keep this
            this.root = testroot.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var placeholder = pnode.mkExprPH();
            var sel = new Selection(this.root, collections.list(0), 0, 1);
            var edit = new pnodeEdits.InsertChildrenEdit([placeholder]);
            return edit.applyEdit(sel);

        }

        createNode(label:string, selection:Selection) : Option<Selection> {


            switch (label) {

                //loops & if
                case "if":
                    return this.makeIfNode(selection);
                case "while":
                    return this.makeWhileNode(selection);

                //literals
                case "stringliteral":
                    return this.makeStringLiteralNode(selection);
                case "numberliteral":
                    return this.makeNumberLiteralNode(selection);
                case "trueliteral":
                    return this.makeTrueBooleanLiteralNode(selection);
                case "falseiteral":
                    return this.makeFalseBooleanLiteralNode(selection);
                case "nullliteral":
                    return this.makeNullLiteralNode(selection);

                //variables & variable manipulation
                case "var":
                    return this.makeVarNode(selection);
                case "vardecl":
                    return this.makeVarDeclNode(selection);
                case "assign":
                    return this.makeAssignNode(selection);
                case "call":
                    return this.makeCallNode(selection);
                case "worldcall":
                    return this.makeWorldCallNode(selection);

                //misc
                case "lambda":
                    return this.makeLambdaNode(selection);
                case "method":
                    break;
                case "type":
                    return this.makeNoTypeNode(selection);

                //turtleworldfunctions
                case "pen":
                    return this.makePenNode(selection);
                case "forward":
                    return this.makeForwardNode(selection);
                case "right":
                    return this.makeRightNode(selection);
                case "left":
                    return this.makeLeftNode(selection);
                case "hide":
                    return this.makeHideNode(selection);
                case "show":
                    return this.makeShowNode(selection);
                case "clear":
                    return this.makeClearNode(selection);
                default:
                    assert.check( false, "Unexpected parameter to createNode" ) ;
            }
        }

        private makeVarNode(selection:Selection) : Option<Selection> {

            const varnode = pnode.mkVar( "" ) ;
            const edit = new pnodeEdits.InsertChildrenEdit( [varnode] ) ;
            return edit.applyEdit(selection) ;
        }

        // Loop and If Nodes
        private makeWhileNode(selection:Selection) : Option<Selection> {

            var cond = pnode.mkExprPH();
            var seq = pnode.mkExprSeq([]);

            var opt = pnode.tryMake(pnode.WhileLabel.theWhileLabel, [cond, seq]);

            var whilenode = opt.first() ;

            var edit = new pnodeEdits.InsertChildrenEdit([whilenode]);
            return edit.applyEdit(selection);
        }

        private makeIfNode(selection:Selection) : Option<Selection> {

            var guard = pnode.mkExprPH();
            var thn = pnode.mkExprSeq([]);
            var els = pnode.mkExprSeq([]);

            var opt = pnode.tryMake(pnode.IfLabel.theIfLabel, [guard, thn, els]);

            var ifnode = opt.first() ;

            var edit = new pnodeEdits.InsertChildrenEdit([ifnode]);
            return edit.applyEdit(selection);
        }

        private makeLambdaNode(selection:Selection) : Option<Selection> {
            var paramList = pnode.mkParameterList([]);
            var noTypeNode = pnode.mkNoTypeNd() ;
            var body : PNode = pnode.mkExprSeq([]);
            var lambdanode = pnode.mkLambda("", paramList, noTypeNode, body ) ;
            var edit = new pnodeEdits.InsertChildrenEdit([lambdanode]);
            return edit.applyEdit(selection);
        }

        private makeAssignNode(selection:Selection) : Option<Selection> {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.AssignLabel.theAssignLabel, [left, right]);

            var assignnode = opt.first() ;

            var edit = new pnodeEdits.InsertChildrenEdit([assignnode]);
            return edit.applyEdit(selection);

        }

        private makeVarDeclNode(selection:Selection) : Option<Selection> {

            const varNode = pnode.mkVar("");
            const noTypeNode = pnode.mkNoTypeNd();
            const initExp = pnode.mkNoExpNd();

            const vardeclnode = pnode.mkVarDecl( varNode, noTypeNode, initExp ) ;

            const edit = new pnodeEdits.InsertChildrenEdit([vardeclnode]);
            return edit.applyEdit(selection);

        }

        private makeWorldCallNode(selection:Selection) : Option<Selection> {

            const left = pnode.mkExprPH();
            const right = pnode.mkExprPH();
            const worldcallnode = pnode.mkCallWorld( name, left, right);
            const edit = new pnodeEdits.InsertChildrenEdit([worldcallnode]);
            return edit.applyEdit(selection);

        }

        private makeCallNode(selection:Selection) : Option<Selection> {

            const callnode = pnode.mkCall() ;
            const edit = new pnodeEdits.InsertChildrenEdit([callnode]);
            return edit.applyEdit(selection);
        }

        private makeNoTypeNode(selection:Selection) : Option<Selection> {

            const typenode = pnode.mkNoTypeNd() ;
            const edit = new pnodeEdits.InsertChildrenEdit([typenode]);
            return edit.applyEdit(selection);
        }

        private makeStringLiteralNode(selection:Selection) : Option<Selection> {

            const literalnode = pnode.mkStringLiteral( "hello" ) ;
            const edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeNumberLiteralNode(selection:Selection) : Option<Selection> {

            var literalnode = pnode.mkNumberLiteral("123") ;

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeTrueBooleanLiteralNode(selection:Selection) : Option<Selection> {
            const literalnode = pnode.mkNoTypeNd() ;
            const edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeFalseBooleanLiteralNode(selection:Selection) : Option<Selection> {
            const literalnode = pnode.mkNoTypeNd() ;
            const edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeNullLiteralNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.NullLiteralLabel.theNullLiteralLabel, []);

            var literalnode = opt.first() ;

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        // TODO: Use CallWorld.
        private makePenNode(selection:Selection) : Option<Selection> {

            var val = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.PenLabel.thePenLabel, [val]);

            var pennode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([pennode]);
            return edit.applyEdit(selection);
        }

        // TODO: Use CallWorld.
        private makeForwardNode(selection:Selection) : Option<Selection> {

            var val = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.ForwardLabel.theForwardLabel, [val]);

            var forwardnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([forwardnode]);
            return edit.applyEdit(selection);
        }

        // TODO: Use CallWorld.
        private makeRightNode(selection:Selection) : Option<Selection> {

            var val = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.RightLabel.theRightLabel, [val]);

            var rightnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([rightnode]);
            return edit.applyEdit(selection);
        }

        // TODO: Use CallWorld.
        private makeLeftNode(selection:Selection) : Option<Selection> {

            var val = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.LeftLabel.theLeftLabel, [val]);

            var leftnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([leftnode]);
            return edit.applyEdit(selection);
        }

        // TODO: Use CallWorld.
        private makeHideNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.HideLabel.theHideLabel, []);

            var hidenode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([hidenode]);
            return edit.applyEdit(selection);
        }

        // TODO: Use CallWorld.
        private makeShowNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.ShowLabel.theShowLabel, []);

            var showLabelnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([showLabelnode]);
            return edit.applyEdit(selection);
        }

        // TODO: Use CallWorld.
        private makeClearNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.ClearLabel.theClearLabel, []);

            var clearnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([clearnode]);
            return edit.applyEdit(selection);
        }

        changeNodeString(selection:Selection, newString:string) : Option<Selection> {
            var edit = new pnodeEdits.ChangeLabelEdit(newString);
            return edit.applyEdit(selection);
        }

        selectAll( selection:Selection ) : Option<Selection> {
            const root = selection.root() ;
            const n = root.count() ;
            return collections.some( new Selection( root, list<number>(), 0, n ) ) ;
        }

        moveLeft( selection:Selection ) : Option<Selection> {
            const edit = new pnodeEdits.LeftEdit();
            return edit.applyEdit(selection);
        }

        moveRight( selection:Selection ) : Option<Selection> {
            const edit = new pnodeEdits.RightEdit();
            return edit.applyEdit(selection);
        }

        delete(selection:Selection) : Option<Selection> {
            const edit = new pnodeEdits.DeleteEdit();
            return edit.applyEdit(selection);
        }

        copy( srcSelection : Selection, trgSelection : Selection ) : Option<Selection> {
            const copyEdit = new pnodeEdits.CopyEdit(srcSelection);
            return copyEdit.applyEdit( trgSelection ) ;
        }

        swap( srcSelection : Selection, trgSelection : Selection ) : Option<Selection> {
            const swapEdit = new pnodeEdits.SwapEdit(srcSelection);
            return swapEdit.applyEdit( trgSelection ) ;
        }

        /** Create a list of up to three possible actions. */
        moveCopySwapEditList (srcSelection : Selection, trgSelection : Selection) : Array< [string, string, Selection] > {

            const selectionList : Array< [string, string, Selection] > = [];

            const copyEdit = new pnodeEdits.CopyEdit(srcSelection);
            const copyResult = copyEdit.applyEdit( trgSelection ) ;
            copyResult.map( newSel => selectionList.push(['Copied', "Copy", newSel]) ) ;

            const moveEdit = new pnodeEdits.MoveEdit(srcSelection);
            const moveResult = moveEdit.applyEdit(trgSelection);
            // TODO: Suppress the push if newSel equals an earlier result
            moveResult.map( newSel => selectionList.push(['Moved', "Move", newSel]) ) ;

            const swapEdit = new pnodeEdits.SwapEdit(srcSelection);
            const swapResult = swapEdit.applyEdit( trgSelection ) ;
            // TODO: Suppress the push if newSel equals an earlier result
            swapResult.map( newSel => selectionList.push(['Swapped', "Swap", newSel]) ) ;

            return selectionList;

        }
    }
}

export = treeManager;
