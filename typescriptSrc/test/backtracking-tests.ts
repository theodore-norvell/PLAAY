/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../labels.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../backtracking.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../interpreter.ts" />
/// <reference path="../valueTypes.ts" />
/// <reference path="../world.ts" />

import backtracking = require( '../backtracking' ) ;
import assert = require( '../assert' ) ;
import pnode = require( '../pnode' ) ;
import vms = require( '../vms' ) ;
import interpreter = require('../interpreter') ;
import valueTypes = require( '../valueTypes' ) ;
import world = require('../world') ;
import labels = require('../labels') ;

import TVar = backtracking.TVar;
import TransactionManager = backtracking.TransactionManager;
import Transaction = backtracking.Transaction;
import States = backtracking.States;
import World = world.World;
import ObjectV = valueTypes.ObjectV;
import PNode = pnode.PNode;
import VMS = vms.VMS;
import EmptyVarStack = vms.EmptyVarStack;
import VarStack = vms.VarStack;
import Evaluation = vms.Evaluation;


const wld = new World();
const wlds : Array<ObjectV> = new Array();
wlds.push(wld);
const interp = interpreter.getInterpreter();

describe( 'backtracking.TransactionManager ', function() : void {
    const manager : TransactionManager = new TransactionManager();

    it('Should be initialized properly', function() : void {
        //TSN//  There should be no getState, no getUndoStack, no getCurrentTransaction
        // methods.  These all violate information hiding.
        // Implementation is private, not public.
        // Instead you can check that canUndo and canRedo both return false.
        assert.check(manager.getState() === States.NOTDOING, "Manager is in the wrong state.");
        assert.check(manager.getUndoStack().length == 0, "Manager's undo stack should be empty");
        //TSN// We don't use undefined. Null is better.  Better yet take a look at the
        // TM implementation which has no states and where there is always a current transaction.
        assert.check(manager.getCurrentTransaction() === undefined, "Manager should not have a current transaction.");
    } );

    it('Should transition states correctly', function() : void {
        let variable : TVar<number> = new TVar<number>(1, manager);
        assert.check(manager.getState() === States.DOING);
        manager.checkpoint();
        assert.check(manager.getState() === States.NOTDOING);
    } );
    
    it('Should undo/redo correctly (making variable)', function() : void {
        let variable : TVar<number> = new TVar<number>(1, manager);
        manager.undo();
        //TSN// Again we don't use undefined.  Access to an unborn variable should
        // result in an assertion failure.  Again see the TM implementation.
        assert.check(variable.get() === undefined);
        manager.redo();
        assert.check(variable.get() == 1, 'variable should be 1 after redo');
    } );

    it('Should undo/redo correctly (set variable)', function() : void {
        let variable : TVar<number> = new TVar<number>(1, manager);
        assert.check( variable.get() == 1, "variable should equal 1");
        manager.checkpoint();
        variable.set(2);
        assert.check( variable.get() == 2, "variable should equal 2");
        manager.undo();
        assert.check( variable.get() == 1, "variable should equal 1 after undo");
        manager.redo();
        assert.check( variable.get() == 2, "variable should equal 2 after redo");

    } );

    it('Should undo/redo correctly (differently typed variables)', function() : void {
        let var1 : TVar<number> = new TVar<number>(1, manager);
        let var2 : TVar<string> = new TVar<string>("test", manager);
        assert.check( var1.get() == 1, "number variable should equal 1");
        assert.check( var2.get() == "test", "string variable should equal 'test'");
        manager.checkpoint();
        var1.set(2)
        var2.set("set")
        assert.check( var1.get() == 2, "number variable should equal 2");
        assert.check( var2.get() == "set", "string variable should equal 'set'");
        manager.undo();
        assert.check( var1.get() == 1, "number variable should equal 1");
        assert.check( var2.get() == "test", "string variable should equal 'test'");
        manager.redo();
        assert.check( var1.get() == 2, "number variable should equal 2 after redo");
        assert.check( var2.get() == "set", "string variable should equal 'set' after redo");

    } );
} ) ;

describe( 'backtracking.TVar ', function() : void {
    const manager : TransactionManager = new TransactionManager();

    it('Should be initialized properly', function() : void {
        let variable : TVar<number> = new TVar<number>(1, manager);
        assert.check( variable.get() == 1 );
    } );

    it('Should set properly', function() : void {
        let variable : TVar<number> = new TVar<number>(1, manager);
        assert.check( variable.get() == 1 );
        variable.set(5);
        assert.check( variable.get() == 5 );
    } );
} ) ;

describe('vms.Evaluation isReady undo/redo', function() : void {
    const label = new labels.StringLiteralLabel( "hello", false );
    const root = new PNode( label, [] );
    const vm = new VMS(root, wlds, interp);
    const manager : TransactionManager = vm.getTransactionManager();
    const evaluation = new Evaluation(root, vm.getStack(), vm);

    it('Should be initialized properly', function() : void {
        assert.check(evaluation.isReady() == false, 'initialized value incorrectly');
        assert.check(manager.getState() == States.DOING, 'manager is in the wrong state')
    });

    it('Should undo/redo properly', function() : void {
        evaluation.setReady(true);
        assert.check(evaluation.isReady() == true, 'set value incorrectly');
        manager.undo();
        assert.check(evaluation.isReady() == false, 'var should be false after undo');
        assert.check(manager.getUndoStack().length == 0, 'undoStack should be empty');
        manager.redo();
        assert.check(evaluation.isReady() == true, 'var should be true after redo');
        assert.check(manager.getUndoStack().length != 0, 'undoStack should not be empty after redo');
    })
});

describe('vms.Evaluation root undo/redo', function() : void {
    const label = new labels.StringLiteralLabel( "hello", false );
    const root = new PNode( label, [] );
    const vm = new VMS(root, wlds, interp);
    const manager : TransactionManager = vm.getTransactionManager();
    const evaluation = new Evaluation(root, vm.getStack(), vm);

    it('Should be initialized properly', function() : void {
        assert.check(evaluation.getRoot() == root, 'initialized root PNode incorrectly');
        assert.check(manager.getState() == States.DOING, 'manager should be in the DOING state')
    });

    it('Should undo/redo properly', function() : void {
        //TSN// Since no checkpoint has happened, undo should not be
        // possible.
        // When the backtrack manager is created, it should be in a state
        // where undo is impossible. We can then create BTVars and so on
        // and then checkpoint. The first checkpoint defines the initial
        // state of the vms. We can't undo beyond this first checkpoint.
        manager.undo();
        //TSN// This must not happen!!
        assert.check(evaluation.getRoot() == undefined, 'root PNode should be undefined');
        assert.check(manager.getUndoStack().length == 0, 'undoStack should be empty');
        manager.redo();
        assert.check(evaluation.getRoot() == root, 'root PNode should be set after redo');
        assert.check(manager.getUndoStack().length != 0, 'undoStack should not be empty');
    })
});

describe('vms.Evaluation pending (List<number>>) undo/redo', function() : void {
    const varNode = labels.mkVar("aa");
    const typeNode = labels.mkNoTypeNd() ;
    const initExp = labels.mkNoExpNd();
    const root = labels.mkVarDecl( varNode,typeNode, initExp ) ;
    const vm = new VMS(root, wlds, interp);
    const manager : TransactionManager = vm.getTransactionManager();

    it('Should be initialized properly', function() : void {
        const evaluation = vm.getEval();
        assert.check(evaluation.getPending().size() === 0, 'get pending should be nil');
        assert.check(!evaluation.isDone(), 'pending shouldn\'t be null')
        assert.check(evaluation.getPendingNode() == vm.getRoot(), 'pending node should be root')
        assert.check(vm.canAdvance(), 'should be able to advance')
        assert.check( ! vm.isReady() );
    });

    it('Should undo/redo properly', function() : void {
        manager.undo();
        assert.check( vm.getEval().getPending() == undefined, 'pending should be undefined after undo');
        manager.redo();
        assert.check( vm.getEval().getPending() != undefined, 'pending shouldn\'t be undefined after redo');
        assert.check(vm.getEval().getPendingNode() == vm.getRoot(), 'pending node should be root after redo')

    })
});
