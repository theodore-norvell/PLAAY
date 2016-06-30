/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../evaluation.ts" />
/// <reference path="../world.ts" />

import assert = require( '../assert' ) ;
import pnode = require( '../pnode' ) ;
import evaluationManager = require( '../evaluationManager' ) ;

var varNode = pnode.mkStringLiteral("aa");
var typeNode = pnode.tryMake(pnode.NoTypeLabel.theNoTypeLabel, []);
var val = pnode.mkExprOpt();

var ttype = typeNode.choose(
    p => p,
    () => {
        return null;
    });

var opt = pnode.tryMake(pnode.VarDeclLabel.theVarDeclLabel, [varNode, ttype, val]);

var root = opt.choose(
    p => p,
    () => {
        assert.check(false, "Precondition violation on PNode.modify");
        return null;
    });

var evalmananger = new evaluationManager.EvaluationManager();
var ms = evalmananger.PLAAY(root, null);
describe ("initialize evaluation", () => {
    it('should not have null stack', () => {
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
        console.log( ms.getEval().getPending() )
    });
});

var ms2 = evalmananger.next();
describe('first step', () => {
    it('should have pending as [0]', () => {
        assert.check(ms2.getEval().getPending().length == 1);
    });
    it('should be ready', () => {
        assert.check(ms2.getEval().ready == true);
    });
});

var ms3 = evalmananger.next();
describe('second step', () => {
    it('should have pending as []', () => {
        assert.check(ms3.getEval().getPending().length == 0);
    });
    it('should not be ready', () => {
        assert.check(ms3.getEval().ready == false);
    });
    it('should have 1 thing in varmap', () => {
        assert.check(ms3.getEval().getVarMap().size == 1);
    });
});

var ms4 = evalmananger.next();
describe('third step', () => {
    it('should have pending as [2]', () => {
        assert.check(ms4.getEval().getPending().length == 1);
    });
    it('should be ready', () => {
        assert.check(ms4.getEval().ready == true);
    });
});

var ms5 = evalmananger.next();
describe('fourth step', () => {
    it('should have pending as []', () => {
        assert.check(ms5.getEval().getPending().length == 0);
    });
    it('should not be ready', () => {
        assert.check(ms5.getEval().ready == false);
    });
    it('should have 2 things in varmap', () => {
        assert.check(ms5.getEval().getVarMap().size == 2);
    });
});

var ms6 = evalmananger.next();
describe('fifth step', () => {
    it('should have pending as []', () => {
        assert.check(ms6.getEval().getPending().length == 0);
    });
    it('should be ready', () => {
        assert.check(ms6.getEval().ready == true);
    });
});

var ms7 = evalmananger.next();
describe('sixth step', () => {
    it('should have pending as null', () => {
        assert.check(ms5.getEval().getPending() == null);
    });
    it('should be done', () => {
        assert.check(ms5.getEval().isDone() == true);
    });
    it('should have 3 things in varmap', () => {
        assert.check(ms5.getEval().getVarMap().size == 3);
    });
    it('should have something in stack named aa', () => {
        assert.check(ms5.getEval().getStack().inStack("aa") == true);
    });
});



