/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="edits.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />

import assert = require( './assert' ) ;
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

        public createRoot() : Option<Selection>{
            
            this.root = labels.mkExprSeq( [] )  ;

            const placeholder = labels.mkExprPH();
            const sel = new Selection(this.root, collections.list(0), 0, 1);
            const edit = new pnodeEdits.InsertChildrenEdit([placeholder]);
            return edit.applyEdit(sel);

        }

        public createNode(label:string, selection:Selection) : Option<Selection> {
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
                    return assert.failedPrecondition("Unexpected parameter to createNode" ) ;
            }
        }

        //Only for things like variables, numeric constants, and strings.
        createNodeWithText(label:string, selection:Selection, text: string) : Option<Selection> {
            switch (label) {

                case "stringliteral":
                    return this.makeStringLiteralNode(selection, text);
                case "numberliteral":
                    return this.makeNumberLiteralNode(selection, text);
                case "var":
                    return this.makeVarNode(selection, text);

                default:
                    return this.createNode(label, selection) ;
            }
        }

        private makeVarNode(selection:Selection, text = "") : Option<Selection> {

            const varnode = labels.mkVar(text) ;
            const edit = new pnodeEdits.InsertChildrenEdit( [varnode] ) ;
            return edit.applyEdit(selection) ;
        }

        // Loop and If Nodes
        private makeWhileNode(selection:Selection) : Option<Selection> {

            const cond = labels.mkExprPH();
            const seq = labels.mkExprSeq([]);

            const opt = pnode.tryMake(labels.WhileLabel.theWhileLabel, [cond, seq]);

            const whilenode = opt.first() ;

            const edit = new pnodeEdits.InsertChildrenEdit([whilenode]);
            return edit.applyEdit(selection);
        }

        private makeIfNode(selection:Selection) : Option<Selection> {

            const guard = labels.mkExprPH();
            const thn = labels.mkExprSeq([]);
            const els = labels.mkExprSeq([]);

            const opt = pnode.tryMake(labels.IfLabel.theIfLabel, [guard, thn, els]);

            const ifnode = opt.first() ;

            const edit = new pnodeEdits.InsertChildrenEdit([ifnode]);
            return edit.applyEdit(selection);
        }

        private makeLambdaNode(selection:Selection) : Option<Selection> {
            const paramList = labels.mkParameterList([]);
            const noTypeNode = labels.mkNoTypeNd() ;
            const body : PNode =labels.mkExprSeq([]);
            const lambdanode = labels.mkLambda( paramList, noTypeNode, body ) ;
            const edit = new pnodeEdits.InsertChildrenEdit([lambdanode]);
            return edit.applyEdit(selection);
        }

        private makeAssignNode(selection:Selection) : Option<Selection> {

            const left = labels.mkExprPH();
            const right = labels.mkExprPH();

            const opt = pnode.tryMake(labels.AssignLabel.theAssignLabel, [left, right]);

            const assignnode = opt.first() ;

            const edit = new pnodeEdits.InsertChildrenEdit([assignnode]);
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

        private makeStringLiteralNode(selection:Selection, text = "hello") : Option<Selection> {

            const literalnode = labels.mkStringLiteral(text) ;
            const edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeNumberLiteralNode(selection:Selection, text = "123") : Option<Selection> {

            const literalnode = labels.mkNumberLiteral(text) ;

            const edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
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

            const opt = pnode.tryMake(labels.NullLiteralLabel.theNullLiteralLabel, []);

            const literalnode = opt.first() ;

            const edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        public changeNodeString(selection:Selection, newString:string) : Option<Selection> {
            const edit = new pnodeEdits.ChangeLabelEdit(newString);
            return edit.applyEdit(selection);
        }

        public selectAll( selection:Selection ) : Option<Selection> {
            const root = selection.root() ;
            const n = root.count() ;
            return collections.some( new Selection( root, list<number>(), 0, n ) ) ;
        }

        public moveLeft( selection:Selection ) : Option<Selection> {
            const edit = new pnodeEdits.LeftEdit();
            return edit.applyEdit(selection);
        }

        public moveRight( selection:Selection ) : Option<Selection> {
            const edit = new pnodeEdits.RightEdit();
            return edit.applyEdit(selection);
        }

        public moveUp( selection:Selection ) : Option<Selection> {
            const edit = new pnodeEdits.UpEdit();
            return edit.applyEdit(selection);
        }

        public moveDown( selection:Selection ) : Option<Selection> {
            const edit = new pnodeEdits.DownEdit();
            return edit.applyEdit(selection);
        }

        public delete(selection:Selection) : Option<Selection> {
            const edit = new pnodeEdits.DeleteEdit();
            return edit.applyEdit(selection);
        }

        public copy( srcSelection : Selection, trgSelection : Selection ) : Option<Selection> {
            const copyEdit = new pnodeEdits.CopyEdit(srcSelection);
            return copyEdit.applyEdit( trgSelection ) ;
        }

        public swap( srcSelection : Selection, trgSelection : Selection ) : Option<Selection> {
            const swapEdit = new pnodeEdits.SwapEdit(srcSelection);
            return swapEdit.applyEdit( trgSelection ) ;
        }

        /** Create a list of up to three possible actions. */
        public moveCopySwapEditList (srcSelection : Selection, trgSelection : Selection) : Array< [string, string, Selection] > {

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
