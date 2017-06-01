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

// This test checks out the execution of a varDecl in excrutiating detail.
var varNode = labels.mkVar("aa");
var typeNode = labels.mkNoTypeNd() ;
var initExp = labels.mkNoExpNd();
var root = labels.mkVarDecl( varNode,typeNode, initExp ) ;

var evalmananger = new evaluationManager.EvaluationManager();
evalmananger.initialize(root, []);
var ms : vms.VMS  = evalmananger.getVMS() ;

describe ("initialize evaluation", function() {
    it('should not have null stack', function() {
        assert.check( ms.canAdvance() );
    });
    it('should not be ready', function() {
        assert.check(ms.isReady() == false);
    });
    it('the root should be pending', function() {
        assert.check(ms.getPending().size() === 0 );
        assert.check(ms.getPendingNode() === ms.getRoot() ) ;
    });
});

describe('first step', function() {

    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as [0]', function() {
        let pending = ms.getEval().getPending() ;
        assert.check( pending.size() === 1 );
        assert.check( pending.first() === 0 ) ;
    });
    it('should be ready', function() {
        assert.check( ms.isReady() );
    });
});

describe('second step', function() {

    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as []', function() {
        assert.check( ms.getPending().size() == 0);
    });
    it('should not be ready', function() {
        assert.check(! ms.isReady());
    });
    it('should have 1 thing in varmap', function() {
        assert.check(ms.getValMap().getEntries().length === 1);
        // TODO check the value
    });
});

describe('third step', function() {

    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as [2]', function() {
        let pending = ms.getPending() ;
        assert.check( pending.size() === 1 );
        assert.check( pending.first() === 2 ) ;
    });
    it('should be ready', function() {
        assert.check( ms.getEval().isReady() );
    });
});

describe('fourth step', function() {

    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as []', function() {
        assert.check(ms.getPending().size() === 0);
    });
    it('should not be ready', function() {
        assert.check( ! ms.getEval().isReady() );
    });
    it('should have 2 things in varmap', function() {
        assert.check(ms.getValMap().getEntries().length == 2);
        // TODO. Check the value at (2)
    });
});

describe('fifth step', function() {

    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as []', function() {
        assert.check(ms.getPending().size() === 0);
    });
    it('should be ready', function() {
        assert.check( ms.getEval().isReady() );
    });
});

describe('sixth step', function() {
    
    before( function() { evalmananger.next() ; } ) ;

    it('should have pending as null', function() {
        assert.check(ms.getPending() == null);
    });
    it('should be done', function() {
        assert.check(ms.isDone() == true);
    });
    it('should have 3 things in varmap', function() {
        assert.check(ms.getValMap().getEntries().length === 3);
    });
    it('should have something in stack named aa', function() {
        assert.check( ms.getStack().inStack("aa") );
        // TODO check the value
    });
});



