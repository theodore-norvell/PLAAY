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
            else if (label.match("for")) {
                return this.makeForNode(selection);
            }
            else if (label.match("while")) {
                return this.makeWhileNode(selection);
            }
            else if (label.match("assign")) {
                return this.makeAssignNode(selection);
            }
            else if (label.match("add")) {
               return this.makeAddNode(selection);
            }
            else if (label.match("sub")) {
                return this.makeSubNode(selection);
            }
            else if (label.match("mul")) {
                return this.makeMultNode(selection);
            }
            else if (label.match("div")) {
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
            var sel = editResult.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            this.root = sel.root();
            return sel;
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

        private makeAddNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.ExprLabel.theExprLabel, [left, right]);

            var addnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ addnode ] );
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

        private makeSubNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.ExprLabel.theExprLabel, [left, right]);

            var subnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ subnode ] );
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

        private makeMultNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.ExprLabel.theExprLabel, [left, right]);

            var multnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ multnode ] );
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

        private makeDivNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.ExprLabel.theExprLabel, [left, right]);

            var divnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ divnode ] );
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

        private makeLessNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.ExprLabel.theExprLabel, [left, right]);

            var lessnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ lessnode ] );
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

        private makeGreaterNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.ExprLabel.theExprLabel, [left, right]);

            var greaternode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ greaternode ] );
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

        private makeLessEqNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.ExprLabel.theExprLabel, [left, right]);

            var lesseqnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ lesseqnode ] );
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

        private makeGreaterEqNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.ExprLabel.theExprLabel, [left, right]);

            var greatereqnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ greatereqnode ] );
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

        private makeEqualNode(selection:Selection) : Selection {

            var left = pnode.mkExprPH();
            var right = pnode.mkExprPH();

            var opt = pnode.tryMake(pnode.ExprLabel.theExprLabel, [left, right]);

            var equalnode = opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });

            var edit = new pnodeEdits.InsertChildrenEdit( [ equalnode ] );
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