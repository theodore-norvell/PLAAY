/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="edits.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />

import assert = require( './assert' )
import collections = require( './collections' ) ;
import edits = require('./edits');
import labels = require( './labels' ) ;
import pnode = require( './pnode' ) ;
import pnodeEdits = require ('./pnodeEdits');

/** The treemanager provides to the UI an interface for editing a tree.
 */
module treeManager {

    import ExprSeqLabel = labels.ExprSeqLabel;
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
            
            this.root = labels.mkExprSeq( [] )  ;

            var placeholder = labels.mkExprPH();
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
                case "type":
                    return this.makeNoTypeNode(selection);
                default:
                    assert.checkPrecondition( false, "Unexpected parameter to createNode" ) ;
                    throw null ; // Keep compiler happy
            }
        }

        private makeVarNode(selection:Selection) : Option<Selection> {

            const varnode = labels.mkVar( "" ) ;
            const edit = new pnodeEdits.InsertChildrenEdit( [varnode] ) ;
            return edit.applyEdit(selection) ;
        }

        // Loop and If Nodes
        private makeWhileNode(selection:Selection) : Option<Selection> {

            var cond = labels.mkExprPH();
            var seq = labels.mkExprSeq([]);

            var opt = pnode.tryMake(labels.WhileLabel.theWhileLabel, [cond, seq]);

            var whilenode = opt.first() ;

            var edit = new pnodeEdits.InsertChildrenEdit([whilenode]);
            return edit.applyEdit(selection);
        }

        private makeIfNode(selection:Selection) : Option<Selection> {

            var guard = labels.mkExprPH();
            var thn = labels.mkExprSeq([]);
            var els = labels.mkExprSeq([]);

            var opt = pnode.tryMake(labels.IfLabel.theIfLabel, [guard, thn, els]);

            var ifnode = opt.first() ;

            var edit = new pnodeEdits.InsertChildrenEdit([ifnode]);
            return edit.applyEdit(selection);
        }

        private makeLambdaNode(selection:Selection) : Option<Selection> {
            var paramList = labels.mkParameterList([]);
            var noTypeNode = labels.mkNoTypeNd() ;
            var body : PNode =labels.mkExprSeq([]);
            var lambdanode = labels.mkLambda( paramList, noTypeNode, body ) ;
            var edit = new pnodeEdits.InsertChildrenEdit([lambdanode]);
            return edit.applyEdit(selection);
        }

        private makeAssignNode(selection:Selection) : Option<Selection> {

            var left = labels.mkExprPH();
            var right = labels.mkExprPH();

            var opt = pnode.tryMake(labels.AssignLabel.theAssignLabel, [left, right]);

            var assignnode = opt.first() ;

            var edit = new pnodeEdits.InsertChildrenEdit([assignnode]);
            return edit.applyEdit(selection);

        }

        private makeVarDeclNode(selection:Selection) : Option<Selection> {

            const varNode = labels.mkVar("");
            const noTypeNode = labels.mkNoTypeNd();
            const initExp = labels.mkNoExpNd();

            const vardeclnode = labels.mkVarDecl( varNode, noTypeNode, initExp ) ;

            const edit = new pnodeEdits.InsertChildrenEdit([vardeclnode]);
            return edit.applyEdit(selection);

        }

        private makeWorldCallNode(selection:Selection) : Option<Selection> {

            const left = labels.mkExprPH();
            const right = labels.mkExprPH();
            const worldcallnode = labels.mkCallWorld( name, left, right);
            const edit = new pnodeEdits.InsertChildrenEdit([worldcallnode]);
            return edit.applyEdit(selection);

        }

        private makeCallNode(selection:Selection) : Option<Selection> {

            const callnode = labels.mkCall() ;
            const edit = new pnodeEdits.InsertChildrenEdit([callnode]);
            return edit.applyEdit(selection);
        }

        private makeNoTypeNode(selection:Selection) : Option<Selection> {

            const typenode = labels.mkNoTypeNd() ;
            const edit = new pnodeEdits.InsertChildrenEdit([typenode]);
            return edit.applyEdit(selection);
        }

        private makeStringLiteralNode(selection:Selection) : Option<Selection> {

            const literalnode = labels.mkStringLiteral( "hello" ) ;
            const edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeNumberLiteralNode(selection:Selection) : Option<Selection> {

            var literalnode = labels.mkNumberLiteral("123") ;

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeTrueBooleanLiteralNode(selection:Selection) : Option<Selection> {
            const literalnode = labels.mkNoTypeNd() ;
            const edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeFalseBooleanLiteralNode(selection:Selection) : Option<Selection> {
            const literalnode = labels.mkNoTypeNd() ;
            const edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeNullLiteralNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(labels.NullLiteralLabel.theNullLiteralLabel, []);

            var literalnode = opt.first() ;

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
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

        moveUp( selection:Selection ) : Option<Selection> {
            const edit = new pnodeEdits.UpEdit();
            return edit.applyEdit(selection);
        }

        moveDown( selection:Selection ) : Option<Selection> {
            const edit = new pnodeEdits.DownEdit();
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
