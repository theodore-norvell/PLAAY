import pnode = require( './pnode' ) ;
import assert = require( './assert' )
import pnodeEdits = require ('./pnodeEdits');
import collections = require( './collections' ) ;

module treeManager {

    import Selection = pnodeEdits.Selection;
    import list = collections.list;

    export class treeManager {

        // make root a selection - JH
        //optiontype, maybetype
        private root:pnode.PNode;

        private loadTree():pnode.PNode {
            if (this.root == null) {
                this.createRoot();
            }

            var placeholder = pnode.mkExprPH();
            var sel = new pnodeEdits.Selection( this.root, collections.list(0), 0, 1 );
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

        private createRoot() {

            var testroot = pnode.tryMake(pnode.ExprSeqLabel.theExprSeqLabel, []);
            this.root = testroot.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

        }

        public createNode(label:String, selection:Selection) : Selection {

            if (label.match("If")) {
                return this.makeIfNode(selection);
            }
            else if (label.match("For")) {
                return this.makeForNode(selection);
            }
            else if (label.match("While")) {
                return this.makeWhileNode(selection);
            }
            else if (label.match("Add")) {
                return this.makeAddNode(selection);
            }
            else if (label.match("Subtract")) {
                return this.makeSubNode(selection);
            }
            else if (label.match("Multiply")) {
                return this.makeMultNode(selection);
            }
            else if (label.match("Divide")) {
                return this.makeDivNode(selection);
            }

            else {
                //throw error stating label not recognized

            }
        }

        // Loop and If Nodes
        private makeForNode(selection:Selection) : Selection {

            var init = pnode.mkExprPH();
            var cond = pnode.mkExpr( [] );
            var seq = pnode.mkExprSeq( [] );

            var opt = pnode.tryMake(pnode.ForLabel.theForLabel, [init, cond, seq]);

            var fornode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ fornode ] );
            var editResult = edit.applyEdit( selection );
            return editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });
        }

        private makeWhileNode(selection:Selection) : Selection {

            var cond = pnode.mkExpr( [] );
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
            return editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });
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

            return editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

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
            return editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });
        }

        private makeAddNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.AddLabel.theAddLabel, [left, right]);

            var addnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ addnode ] );
            var editResult = edit.applyEdit( selection );
            return editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });
        }

        private makeSubNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.SubtractLabel.theSubtractLabel, [left, right]);

            var subnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ subnode ] );
            var editResult = edit.applyEdit( selection );
            return editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });
        }

        private makeMultNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.MultiplyLabel.theMultiplyLabel, [left, right]);

            var multnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ multnode ] );
            var editResult = edit.applyEdit( selection );
            return editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });
        }

        private makeDivNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.DivideLabel.theDivideLabel, [left, right]);

            var divnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ divnode ] );
            var editResult = edit.applyEdit( selection );
            return editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });
        }
    }
}
