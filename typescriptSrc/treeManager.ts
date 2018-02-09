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
    import replaceOrEngulfTemplateEdit = pnodeEdits.replaceOrEngulfTemplateEdit ;
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

        //Only for nodes that can contain text, such as variables and strings.
        public createNodeWithText( label:string, selection:Selection, text: string ) : Option<Selection> {
            switch (label) {
                case "stringliteral":
                    return this.makeStringLiteralNode(selection, text);
                case "numberliteral":
                    return this.makeNumberLiteralNode(selection, text);
                case "var":
                    return this.makeVarNode(selection, text);
                case "worldcall":
                    return this.makeWorldCallNode(selection, text);

                default:
                    return assert.failedPrecondition("Unexpected parameter to createNodeWithText" ) ;
            }
        }

        private makeVarNode(selection:Selection, text : string = "") : Option<Selection> {

            const varnode = labels.mkVar(text) ;
            const edit = new pnodeEdits.InsertChildrenEdit( [varnode] ) ;
            return edit.applyEdit(selection) ;
        }

        // While nodes
        private makeWhileNode(selection:Selection) : Option<Selection> {

            const cond = labels.mkExprPH();
            const seq = labels.mkExprSeq([]);

            const whilenode = pnode.make(labels.WhileLabel.theWhileLabel, [cond, seq]);
            const template = new Selection( whilenode, list<number>(), 0, 1 ) ;
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection);
        }

        // If nodes
        private makeIfNode(selection:Selection) : Option<Selection> {

            const guard = labels.mkExprPH();
            const thn = labels.mkExprSeq([]);
            const els = labels.mkExprSeq([]);

            const ifNode = pnode.make(labels.IfLabel.theIfLabel, [guard, thn, els]);

            // console.log( "makeIfNode: Making template") ;
            const template = new Selection( ifNode, list<number>(), 0, 1 ) ;
            // console.log( "makeIfNode: Making edit") ;
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            // console.log( "makeIfNode: Applying edit") ;
            return edit.applyEdit(selection);
        }

        private makeLambdaNode(selection:Selection) : Option<Selection> {
            const paramList = labels.mkParameterList([]);
            const noTypeNode = labels.mkNoTypeNd() ;
            const body : PNode =labels.mkExprSeq([]);
            const lambdanode = labels.mkLambda( paramList, noTypeNode, body ) ;

            const template = new Selection( lambdanode, list(2), 0, 0 ) ;
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection);
        }

        private makeAssignNode(selection:Selection) : Option<Selection> {

            const left = labels.mkExprPH();
            const right = labels.mkExprPH();

            const opt = pnode.tryMake(labels.AssignLabel.theAssignLabel, [left, right]);

            const assignnode = opt.first() ;

            const template = new Selection( assignnode, list<number>(), 0, 1 ) ;
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection);

        }

        private makeVarDeclNode(selection:Selection) : Option<Selection> {

            const varNode = labels.mkVar("");
            const noTypeNode = labels.mkNoTypeNd();
            const initExp = labels.mkNoExpNd();

            const vardeclnode = labels.mkVarDecl( varNode, noTypeNode, initExp ) ;

            const template = new Selection( vardeclnode, list<number>(), 0, 1 ) ;
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection);

        }

        private makeWorldCallNode(selection:Selection, name : string = "") : Option<Selection> {
            // TODO: Allow a variable number of place holders.
            // console.log( ">> Calling makeWorldCallNode") ;
            const left = labels.mkExprPH();
            const right = labels.mkExprPH();
            let worldcallnode : PNode|null = null;
            if(name === "")
            {
                worldcallnode = labels.mkCallWorld( name, left, right);
                const template = new Selection( worldcallnode, list<number>(), 0, 1 ) ;
                const edit = replaceOrEngulfTemplateEdit( template ) ;
                return edit.applyEdit(selection);
            }
            else
            {
                worldcallnode = labels.mkClosedCallWorld(name, left, right);
                const template = new Selection( worldcallnode, list<number>(), 0, 1 ) ;
                const edit = replaceOrEngulfTemplateEdit( template ) ;
                const result =  edit.applyEdit(selection);
                // console.log( "<< result of world call is " + result.toString() ) ;
                return result ;
            }
        }

        private makeCallNode(selection:Selection) : Option<Selection> {

            const func = labels.mkExprPH();
            const callnode = labels.mkCall(func) ;

            const template = new Selection( callnode, list<number>(), 0, 1 ) ;
            const edit = replaceOrEngulfTemplateEdit( template ) ;
            return edit.applyEdit(selection);
        }

        private makeNoTypeNode(selection:Selection) : Option<Selection> {

            const typenode = labels.mkNoTypeNd() ;
            const edit = new pnodeEdits.InsertChildrenEdit([typenode]);
            return edit.applyEdit(selection);
        }

        private makeStringLiteralNode(selection:Selection, text : string = "hello") : Option<Selection> {

            const literalnode = labels.mkStringLiteral(text) ;
            const edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeNumberLiteralNode(selection:Selection, text : string = "123") : Option<Selection> {

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

        public moveOut( selection:Selection ) : Option<Selection> {
            return pnodeEdits.moveOutNormal.applyEdit(selection) ;
        }

        public moveLeft( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.leftEdit;
            return edit.applyEdit(selection);
        }

        public moveRight( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.rightEdit;
            return edit.applyEdit(selection);
        }

        public moveUp( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.upEdit;
            return edit.applyEdit(selection);
        }

        public moveDown( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.downEdit;
            return edit.applyEdit(selection);
        }

        public moveFocusLeft( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.moveFocusLeftEdit;
            return edit.applyEdit(selection);
        }

        public moveFocusRight( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.moveFocusRightEdit;
            return edit.applyEdit(selection);
        }

        public moveFocusUp( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.moveFocusUpEdit;
            return edit.applyEdit(selection);
        }

        public moveFocusDown( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.moveFocusDownEdit;
            return edit.applyEdit(selection);
        }

        public moveTabForward( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.tabForwardEdit;
            return edit.applyEdit(selection);
        }
         
        public moveTabBack( selection:Selection ) : Option<Selection> {
            const edit = pnodeEdits.tabBackEdit;
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
            copyResult.map( newSel => selectionList.push(['Replaced', "Replace", newSel]) ) ;

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
