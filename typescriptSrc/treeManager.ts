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

    export class TreeManager {

        private root:PNode;

        public getRoot():PNode {
            return this.root;
        }

        createRoot() {

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
            var editResult = edit.applyEdit(sel);
            this.root = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                }).root();

            return this.root;

        }

        createNode(label:string, selection:Selection):Selection {


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

        private makeVarNode(selection:Selection):Selection {

            var opt = pnode.tryMake(pnode.VariableLabel.theVariableLabel, []);

            var varnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([varnode]);
            var editResult = edit.applyEdit(selection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        // Loop and If Nodes
        private makeWhileNode(selection:Selection):Selection {

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
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeIfNode(selection:Selection):Selection {

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
            var editResult = edit.applyEdit(selection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeLambdaNode(selection:Selection):Selection {

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
            var editResult = edit.applyEdit(selection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        //Arithmetic Nodes
        private makeAssignNode(selection:Selection):Selection {

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
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeWorldCallNode(selection:Selection):Selection {

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
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeCallNode(selection:Selection):Selection {

            var opt = pnode.tryMake(pnode.CallLabel.theCallLabel, []);

            var callnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([callnode]);
            var editResult = edit.applyEdit(selection);
            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeTypeNode(selection:Selection):Selection {

            var opt = pnode.tryMake(pnode.NoTypeLabel.theNoTypeLabel, []);

            var typenode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([typenode]);
            var editResult = edit.applyEdit(selection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeStringLiteralNode(selection:Selection):Selection {

            var opt = pnode.tryMake(pnode.StringLiteralLabel.theStringLiteralLabel, []);

            var literalnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            var editResult = edit.applyEdit(selection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeNumberLiteralNode(selection:Selection):Selection {

            var opt = pnode.tryMake(pnode.NumberLiteralLabel.theNumberLiteralLabel, []);

            var literalnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            var editResult = edit.applyEdit(selection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeBooleanLiteralNode(selection:Selection):Selection {

            var opt = pnode.tryMake(pnode.BooleanLiteralLabel.theBooleanLiteralLabel, []);

            var literalnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            var editResult = edit.applyEdit(selection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeNullLiteralNode(selection:Selection):Selection {

            var opt = pnode.tryMake(pnode.NullLiteralLabel.theNullLiteralLabel, []);

            var literalnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit([literalnode]);
            var editResult = edit.applyEdit(selection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        changeNodeString(selection:Selection, newString:string):Selection {
            var edit = new pnodeEdits.ChangeLabelEdit(newString);
            var editResult = edit.applyEdit(selection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Error applying edit to node");
                    return null;
                });

            this.root = sel.root();
            return sel;

        }

        deleteNode(selection:Selection):Selection {
            var edit = new pnodeEdits.DeleteEdit();
            var editResult = edit.applyEdit(selection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Error applying edit to node");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        moveNode(oldSelection:Selection, newSelection:Selection):Selection {
            var edit = new pnodeEdits.MoveNodeEdit(oldSelection);
            var editResult = edit.applyEdit(newSelection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Error applying edit to node");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        copyNode(oldSelection:Selection, newSelection:Selection):Selection {
            var edit = new pnodeEdits.CopyNodeEdit(oldSelection);
            var editResult = edit.applyEdit(newSelection);

            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Error applying edit to node");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }


        moveCopySwapEditList (oldSelection : Selection, newSelection : Selection) : Array< [string, string, Selection] > {

            var selectionList : Array< [string, string, Selection] > = [];

            var moveedit = new pnodeEdits.MoveNodeEdit(oldSelection);
            if (moveedit.canApply(newSelection)) {
                var sel = moveedit.applyEdit(newSelection).choose(
                    p => p,
                    () => {
                        assert.check(false, "Error applying edit to node");
                        return null;
                    });

                selectionList.push(["Moved", "Move", sel]);
            }

            var copyedit = new pnodeEdits.CopyNodeEdit(oldSelection);
            if (copyedit.canApply(newSelection)) {
                var sel = copyedit.applyEdit(newSelection).choose(
                    p => p,
                    () => {
                        assert.check(false, "Error applying edit to node");
                        return null;
                    });

                selectionList.push(['Copied', "Copy", sel]);
            }

           /*var swapedit = new pnodeEdits.SwapNodeEdit(oldSelection, newSelection);
            if (swapedit.canApply()) {
                var sel = swapedit.applyEdit().choose(
                    p => p,
                    () => {
                        assert.check(false, "Error applying edit to node");
                        return null;
                    });

                selectionList.push(['Swapped', "Swap", sel]);
            }*/

            return selectionList;

        }
    }
}

export = treeManager;
