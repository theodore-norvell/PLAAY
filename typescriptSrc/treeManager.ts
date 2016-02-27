import pnode = require( './pnode' ) ;
import assert = require( './assert' )
import pnodeEdits = require ('./pnodeEdits');
import collections = require( './collections' ) ;

module treeManager {

    import ExprSeq = pnode.ExprSeqNode;
    import ExprNode = pnode.ExprNode;
    import ExprSeqLabel = pnode.ExprSeqLabel;
    import Selection = pnodeEdits.Selection;
    import list = collections.list;
    import PNode = pnode.PNode;

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

        createNode(label:String, selection:Selection):Selection {


            switch(label) {

                //loops & if
                case "if":
                    return this.makeIfNode(selection);
                case "while":
                    return this.makeWhileNode(selection);

                //literals
                case "stringliteral":
                    break;
                case "numberliteral":
                    break;
                case "booleanliteral":
                    break;
                case "nullliteral":
                    break;

                //constants
                case "stringliteral":
                    break;
                case "numberliteral":
                    break;
                case "booleanliteral":
                    break;
                case "nullliteral":
                    break;

                //variables & variable manipulation
                case "var":
                    break;
                case "assign":
                    return this.makeAssignNode(selection);
                case "call":
                    return this.makeCallNode(selection);
                case "worldcall":
                    return this.makeWorldCallNode(selection);

                //misc
                case "this":
                    break;
                case "lambda":
                    break;
                case "method":
                    break;
            }
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

            var opt = pnode.tryMake(pnode.callWorldLabel.theCallWorldLabel, [left, right]);

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

            var opt = pnode.tryMake(pnode.callWorldLabel.theCallWorldLabel, []);

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

    }
}

export = treeManager;