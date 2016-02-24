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

        /*
        constructor() {
            this.createRoot();
        }*/

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
            var sel = new Selection( this.root, collections.list(0), 0, 1 );
            var edit = new pnodeEdits.InsertChildrenEdit( [ placeholder ] );
            var editResult = edit.applyEdit( sel );
            this.root = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                }).root();

            return this.root;

        }

        createNode(label:String, selection:Selection) : Selection {

            if (label.match("if")) {
                return this.makeIfNode(selection);
            }
            else if (label.match("this")) {
                return this.makeThisNode(selection);
            }
            else if (label.match("while")) {
                return this.makeWhileNode(selection);
            }
            else if (label.match("assign")) {
                return this.makeAssignNode(selection);
            }
            else if (label.match("var")) {
               return this.makeVarNode(selection);
            }
            else if (label.match("literal")) {
                return this.makeLiteralNode(selection);
            }
            else if (label.match("call")) {
               //return this.makeCallNode(selection);
            }
            else {
                //throw error stating label not recognized
            }
        }

        // Loop and If Nodes

        private makeWhileNode(selection:Selection) : Selection {

            var cond = pnode.mkExprPH();
            var seq = pnode.mkExprSeq( [] );

            var opt = pnode.tryMake(pnode.WhileLabel.theWhileLabel, [cond, seq]);

            var whilenode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ whilenode ] );
            var editResult = edit.applyEdit( selection );
            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeIfNode(selection: Selection) : Selection {

            var guard = pnode.mkExprPH();
            var thn = pnode.mkExprSeq( [] );
            var els = pnode.mkExprSeq( [] );

            var opt = pnode.tryMake(pnode.IfLabel.theIfLabel, [guard, thn, els]);

            var ifnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ ifnode ] );
            var editResult = edit.applyEdit( selection );

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
        private makeAssignNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.AssignLabel.theAssignLabel, [left, right]);

            var assignnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ assignnode ] );
            var editResult = edit.applyEdit( selection );
            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeVarNode(selection:Selection) : Selection {

            var left = pnode.mkExpr([]);
            var right = pnode.mkExpr([]);

            var opt = pnode.tryMake(pnode.VarLabel.theVarLabel, [left, right]);

            var varnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ varnode ] );
            var editResult = edit.applyEdit( selection );
            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeLiteralNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.LiteralLabel.theLiteralLabel, [left, right]);

            var literalnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ literalnode ] );
            var editResult = edit.applyEdit( selection );
            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
        }

        private makeThisNode(selection:Selection) : Selection {

            var thiss = pnode.mkExpr( [] );
            var opt = pnode.tryMake(pnode.ExprLabel.theExprLabel, [thiss]);
            var thisnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ thisnode ] );
            var editResult = edit.applyEdit( selection );
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