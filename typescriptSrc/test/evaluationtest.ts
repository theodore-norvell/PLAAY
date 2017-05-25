/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../labels.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../world.ts" />

import assert = require( '../assert' ) ;
import pnode = require( '../pnode' ) ;
import labels = require( '../labels' ) ;
import vms = require( '../vms' ) ;
import evaluationManager = require( '../evaluationManager' ) ;

var varNode = labels.mkStringLiteral("aa");
var typeNode = pnode.tryMake(labels.NoTypeLabel.theNoTypeLabel, []);
var val = labels.mkNoExpNd();

var ttype = typeNode.choose(
    p => p,
    () => {
        return null;
    });

var root = labels.mkVar( "hello" ) ;

var evalmananger = new evaluationManager.EvaluationManager();
evalmananger.initialize(root, null);
var ms : vms.VMS  = evalmananger.getVMS() ;

describe ("initialize evaluation", function() {
    it('should not have null stack', function() {
        assert.check(ms.evalStack != null);
    });
    it('should not be ready', function() {
        assert.check(ms.getEval().ready == false);
    });
    it('should have nothing in the pending', function() {
        assert.check(ms.getEval().getPending().length == 0);
        console.log( ms.getEval().getPending() )
    });
});

describe('first step', function() {

    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as [0]', function() {
        let pending = ms.getEval().getPending() ;
        assert.check( pending.length == 1 );
        assert.check( pending[0] == 0 ) ;
    });
    it('should be ready', function() {
        assert.check(ms.getEval().ready == true);
    });
});

describe('second step', function() {

    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as []', function() {
        assert.check(ms.getEval().getPending().length == 0);
    });
    it('should not be ready', function() {
        assert.check(ms.getEval().ready == false);
    });
    it('should have 1 thing in varmap', function() {
        assert.check(ms.getEval().getValMap().size == 1);
    });
});

describe('third step', function() {

    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as [2]', function() {
        let pending = ms.getEval().getPending() ;
        assert.check( pending.length == 1 );
        assert.check( pending[0] == 2 ) ;
    });
    it('should be ready', function() {
        assert.check(ms.getEval().ready == true);
    });
});

describe('fourth step', function() {

    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as []', function() {
        assert.check(ms.getEval().getPending().length == 0);
    });
    it('should not be ready', function() {
        assert.check(ms.getEval().ready == false);
    });
    it('should have 2 things in varmap', function() {
        assert.check(ms.getEval().getValMap().size == 2);
    });
});

describe('fifth step', function() {

    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as []', function() {
        assert.check(ms.getEval().getPending().length == 0);
    });
    it('should be ready', function() {
        assert.check(ms.getEval().ready == true);
    });
});

describe('sixth step', function() {
    
    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as null', function() {
        assert.check(ms.getEval().getPending() == null);
    });
    it('should be done', function() {
        assert.check(ms.getEval().isDone() == true);
    });
    it('should have 3 things in varmap', function() {
        assert.check(ms.getEval().getValMap().size == 3);
    });
    it('should have something in stack named aa', function() {
        assert.check(ms.getEval().getStack().inStack("aa") == true);
    });
});



