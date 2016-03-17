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
describe ("start evaluation", () => {

    var evalmananger = new evaluationManager.EvaluationManager();
    var ms = evalmananger.PLAAY(root);
    it('should initialize', () => {
        assert.check(ms.stack != null);
        assert.check(ms.getEval().getRoot() != null);
        assert.check(ms.getEval().ready == false);
        assert.check(ms.getWorld().getField("+") != null);
        assert.check(ms.getWorld().numFields() == 1);
    });
    var ms2 = evalmananger.next();
    it('should step ok', () => {
        assert.check(ms2.stack != null);
    })

});


