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
import { TransactionManager } from '../backtracking';

// This test checks out the execution of a varDecl in excrutiating detail.
const varNode = labels.mkVar("aa");
const typeNode = labels.mkNoTypeNd() ;
const initExp = labels.mkNoExpNd();
const root = labels.mkVarDecl( varNode,typeNode, initExp ) ;

const evalmananger = new evaluationManager.EvaluationManager();
const manager = new TransactionManager ;
evalmananger.initialize(root, [], manager);
const ms : vms.VMS  = evalmananger.getVMS() ;

describe ("initialize evaluation", function() : void {
    it('should not have an empty evaluation stack', function() : void {
        assert.check( ms.canAdvance() );
    });
    it('should not be ready', function() : void {
        assert.check( ! ms.isReady() );
    });
    it('the root should be pending', function() : void {
        assert.check(ms.getPending().size() === 0 );
        assert.check(ms.getPendingNode() === ms.getRoot() ) ;
    });
});

describe('first step', function() : void {

    before( function() : void { evalmananger.next() ; } ) ;

    it('should have pending as [0]', function() : void {
        const pending = ms.getEval().getPending() ;
        assert.check( pending.size() === 1 );
        assert.check( pending.first() === 0 ) ;
    });
    it('should be ready', function() : void {
        assert.check( ms.isReady() );
    });
});

describe('second step', function() : void {

    before( function() : void { evalmananger.next() ; } ) ;

    it('should have pending as []', function() : void {
        assert.check( ms.getPending().size() === 0);
    });
    it('should not be ready', function() : void {
        assert.check(! ms.isReady());
    });
    it('should have 1 thing in varmap', function() : void {
        assert.check(ms.getValMap().getEntries().size() === 1);
        // TODO check the value
    });
});

describe('third step', function() : void {

    before( function() : void { evalmananger.next() ; } ) ;

    it('should have pending as [2]', function() : void {
        const pending = ms.getPending() ;
        assert.check( pending.size() === 1 );
        assert.check( pending.first() === 2 ) ;
    });
    it('should be ready', function() : void {
        assert.check( ms.getEval().isReady() );
    });
});

describe('fourth step', function() : void {

    before( function() : void { evalmananger.next() ; } ) ;

    it('should have pending as []', function() : void {
        assert.check(ms.getPending().size() === 0);
    });
    it('should not be ready', function() : void {
        assert.check( ! ms.getEval().isReady() );
    });
    it('should have 2 things in varmap', function() : void {
        assert.check(ms.getValMap().getEntries().size() === 2);
        // TODO. Check the value at (2)
    });
});

describe('fifth step', function() : void {

    before( function() : void { evalmananger.next() ; } ) ;

    it('should have pending as []', function() : void {
        assert.check(ms.getPending().size() === 0);
    });
    it('should be ready', function() : void {
        assert.check( ms.getEval().isReady() );
    });
});

describe('sixth step', function() : void {
    
    before( function() : void { evalmananger.next() ; } ) ;

    it('should have pending as null', function() : void {
        assert.check(ms.getPending() === null);
    });
    it('should be done', function() : void {
        assert.check( ms.isDone() );
    });
    it('should have 3 things in varmap', function() : void {
        assert.check(ms.getValMap().getEntries().size() === 3);
    });
    it('should have something in stack named aa', function() : void {
        const stack = ms.getStack() ;
        assert.check( stack.hasField("aa") );
        // TODO check the value
    });
});



