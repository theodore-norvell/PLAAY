/**
 * Created by Jessica on 3/17/2016.
 */


import assert = require( '../assert' ) ;
import pnode = require( '../pnode' ) ;
import evaluationManager = require( '../evaluationManager' ) ;

var a : pnode.ExprNode = pnode.mkStringLiteral( "5" ) ;
var b : pnode.ExprNode = pnode.mkStringLiteral( "2" ) ;
var s0 : pnode.ExprNode = pnode.mkWorldCall(a,b) ;

var s1 = s0.label().changeValue("+");
describe ("worldcall label", () => {
    it('should have a + as var', () => {
        s1.choose(
            p => {
                assert.check(p.getVal().toString() == "+" );
            },
            () => {
                assert.check(false);
            });
    });

    var ss = s1.choose(
        p => {
            return p;
        },
        () => {
            return null;
        });

    var newwc = s0.tryModifyLabel(ss);
    it('should change in the node label', () => {
        newwc.choose(
            p => {
                assert.check(p.label().getVal().toString() == "+" );
            },
            () => {
                assert.check(false);
            });
    })

});

var ss = s1.choose(
    p => {
        return p;
    },
    () => {
        return null;
    });
var newwc = s0.tryModifyLabel(ss);
var newroot = newwc.choose(
    p => {
        return p;
    },
    () => {
        return null;
    });

var root : pnode.ExprSeqNode = pnode.mkExprSeq([newroot]);
var evalmananger = new evaluationManager.EvaluationManager();
describe ("initialize evaluation", () => {
    var ms = evalmananger.PLAAY(root);
    it('should have null stack', () => {
        assert.check(ms.stack != null);
    });
    it('should not be ready', () => {
        assert.check(ms.getEval().ready == false);
    });
    it('should have a plus world call', () => {
        assert.check(ms.getWorld().getField("+") != null);
    });
    it('should have nothing in the pending', () => {
        assert.check(ms.getEval().getPending().length == 0);
    });
});

var ms2 = evalmananger.next();
describe('first step', () => {
    it('should have pending as [0]', () => {
        assert.check(ms2.getEval().getPending().length == 1);
    });
    it('should not be ready', () => {
        assert.check(ms2.getEval().ready == false);
    });
});

var ms3 = evalmananger.next();
describe('secon step step', () => {
    it('should have pending as [0,0]', () => {
        assert.check(ms3.getEval().getPending().length == 2);
    });
    it('should not be ready', () => {
        assert.check(ms3.getEval().ready == false);
    });
});



