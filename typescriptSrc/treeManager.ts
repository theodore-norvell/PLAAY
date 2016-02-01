import pnode = require( './pnode' ) ;
import assert = require( './assert' )
import pnodeEdits = require ('./pnodeEdits');
import collections = require( './collections' ) ;

module treeManager {

    import Selection = pnodeEdits.Selection;
    import list = collections.list;

    export class treeManager {
        private root:pnode.PNode;

        private loadTree():pnode.PNode {
            if (this.root == null) {
                this.createRoot();
            }

            var placeholder = pnode.mkExprPH();

            var sel = new pnodeEdits.Selection( this.root, collections.list(0), 0, 1 );
            var edit = new pnodeEdits.InsertChildrenEdit( [ placeholder ] );
            var editResult = edit.applyEdit( sel );

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


// if this is going to be used for creating a node after dropping, need to also pass in the selection - JH
        private createNode(label:String, selection:Selection) {

            if (label.match("If")) {

                var guard = pnode.mkExprPH();
                var thn = pnode.mkExprSeq( [] );
                var els = pnode.mkExprSeq( []);

                var opt = pnode.tryMake(pnode.IfLabel.theIfLabel, [guard, thn, els]);

                var ifnode = opt.choose(
                    p => p,
                    () => {
                        assert.check(false, "Precondition violation on PNode.modify");
                        return null;
                    });

                var edit = new pnodeEdits.InsertChildrenEdit( [ ifnode ] );
                var editResult = edit.applyEdit( selection );

                return editResult;

            }
        }
    }
}

