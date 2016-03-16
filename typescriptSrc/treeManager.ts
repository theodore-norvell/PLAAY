import pnode = require( './pnode' ) ;
import assert = require( './assert' )
import pnodeEdits = require ('./pnodeEdits');
import collections = require( './collections' ) ;
import edits = require('./edits');

module treeManager {

    import ExprSeq = pnode.ExprSeqNode;
    import ExprNode = pnode.ExprNode;
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
                case "booleanliteral":
                    return this.makeBooleanLiteralNode(selection);
                case "nullliteral":
                    return this.makeNullLiteralNode(selection);

                //constants
                case "stringconstant":
                    break;
                case "numberconstant":
                    break;
                case "booleanconstant":
                    break;
                case "nullconstant":
                    break;

                //variables & variable manipulation
                case "var":
                    return this.makeVarNode(selection);
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
                    return this.makeTypeNode(selection);
            }
        }

        private makeVarNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.VariableLabel.theVariableLabel, []);

            var varnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([varnode]);
            return edit.applyEdit(selection);
        }

        // Loop and If Nodes
        private makeWhileNode(selection:Selection) : Option<Selection> {

            var cond = pnode.mkExprPH();
            var seq = pnode.mkExprSeq([]);

            var opt = pnode.tryMake(pnode.WhileLabel.theWhileLabel, [cond, seq]);

            var whilenode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([whilenode]);
            return edit.applyEdit(selection);
        }

        private makeIfNode(selection:Selection) : Option<Selection> {

            var guard = pnode.mkExprPH();
            var thn = pnode.mkExprSeq([]);
            var els = pnode.mkExprSeq([]);

            var opt = pnode.tryMake(pnode.IfLabel.theIfLabel, [guard, thn, els]);

            var ifnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([ifnode]);
            return edit.applyEdit(selection);
        }

        private makeLambdaNode(selection:Selection) : Option<Selection> {

            var header = pnode.mkExprSeq([]);
            var lambdatype = pnode.tryMake(pnode.NoTypeLabel.theNoTypeLabel, []);
            var dothis = pnode.mkExprSeq([]);

            var ltype = lambdatype.choose(
                p => p,
                () => {
                    return null;
                });

            var opt = pnode.tryMake(pnode.LambdaLabel.theLambdaLabel, [header, ltype, dothis]);

            var lambdanode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([lambdanode]);
            return edit.applyEdit(selection);

        }

        //Arithmetic Nodes
        private makeAssignNode(selection:Selection) : Option<Selection> {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.AssignLabel.theAssignLabel, [left, right]);

            var assignnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([assignnode]);
            return edit.applyEdit(selection);

        }

        private makeWorldCallNode(selection:Selection) : Option<Selection> {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.CallWorldLabel.theCallWorldLabel, [left, right]);

            var worldcallnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([worldcallnode]);
            return edit.applyEdit(selection);

        }

        private makeCallNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.CallLabel.theCallLabel, []);

            var callnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([callnode]);
            return edit.applyEdit(selection);
        }

        private makeTypeNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.NoTypeLabel.theNoTypeLabel, []);

            var typenode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([typenode]);
           return edit.applyEdit(selection);
        }

        private makeStringLiteralNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.StringLiteralLabel.theStringLiteralLabel, []);

            var literalnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
           return edit.applyEdit(selection);
        }

        private makeNumberLiteralNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.NumberLiteralLabel.theNumberLiteralLabel, []);

            var literalnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        private makeBooleanLiteralNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.BooleanLiteralLabel.theBooleanLiteralLabel, []);

            var literalnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
           return edit.applyEdit(selection);
        }

        private makeNullLiteralNode(selection:Selection) : Option<Selection> {

            var opt = pnode.tryMake(pnode.NullLiteralLabel.theNullLiteralLabel, []);

            var literalnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            return edit.applyEdit(selection);
        }

        changeNodeString(selection:Selection, newString:string) : Option<Selection> {
            var edit = new pnodeEdits.ChangeLabelEdit(newString);
            return edit.applyEdit(selection);

        }

        deleteNode(selection:Selection) : Option<Selection> {
            var edit = new pnodeEdits.DeleteEdit();
            return edit.applyEdit(selection);
        }

        moveCopySwapEditList (oldSelection : Selection, newSelection : Selection) : Array< [string, string, Option<Selection>] > {

            var selectionList : Array< [string, string, Option<Selection>] > = [];

            var moveedit = new pnodeEdits.MoveNodeEdit(oldSelection);
            if (moveedit.canApply(newSelection)) {
                var sel = moveedit.applyEdit(newSelection);
                selectionList.push(["Moved", "Move", sel]);
            }

            var copyedit = new pnodeEdits.CopyNodeEdit(oldSelection);
            if (copyedit.canApply(newSelection)) {
                var sel = copyedit.applyEdit(newSelection)

                selectionList.push(['Copied', "Copy", sel]);
            }

           var swapedit = new pnodeEdits.SwapNodeEdit(oldSelection, newSelection);
            if (swapedit.canApply()) {
                var sel = swapedit.applyEdit()

                selectionList.push(['Swapped', "Swap", sel]);
            }

            return selectionList;

        }
    }
}

export = treeManager;
