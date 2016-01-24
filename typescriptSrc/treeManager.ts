import pnode = require( './pnode' ) ;
import assert = require( './assert' )

module treeManager {

    export class treeManager {
        private root:pnode.ExprSeqNode;

        private loadTree():pnode.ExprSeqNode {
            if (this.root == null) {
                this.createRoot();
            }

            return this.root;
        }

        private createRoot() {

            var testroot = pnode.tryMake(pnode.ExprSeqLabel.theExprSeqLabel, []);
            // not sure how option works but will keep this
            this.root = testroot.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                });
        }


// if this is going to be used for creating a node after dropping, need to also pass in the selection - JH
        private createNode(label:String) {

            // must be better way to do this? Seems to easy to break - JH
            if (label.match("If")) {
                var a:pnode.ExprNode = pnode.mkStringConst("a");
                console.log(a.toString());

                var b:pnode.ExprNode = pnode.mkStringConst("b");
                console.log(b.toString());

                var c:pnode.ExprNode = pnode.mkStringConst("c");
                console.log(c.toString());

                pnode.tryMake(pnode.IfLabel.theIfLabel, [a, b, c]);

            }
        }

    }
}

