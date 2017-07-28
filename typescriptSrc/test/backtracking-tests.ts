/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../backtracking.ts" />

import backtracking = require( '../backtracking' ) ;
import assert = require( '../assert' ) ;

import TVar = backtracking.TVar;
import TransactionManager = backtracking.TransactionManager;
import Transaction = backtracking.Transaction;
import States = backtracking.States;

const manager : TransactionManager = new TransactionManager();

describe( 'backtracking.TransactionManager ', function() : void {

    it('Should be initialized properly', function() : void {
        assert.check(manager.getState() === States.NOTDOING, "Manager is in the wrong state.");
        assert.check(manager.getUndoStack().length == 0, "Manager's undo stack should be empty");
        assert.check(manager.getCurrentTransaction() === undefined, "Manager should not have a current transaction.");
    } );

    it('Should transition states correctly', function() : void {
        let variable : TVar<number> = new TVar<number>(1, manager);
        assert.check(manager.getState() === States.DOING);
        manager.checkpoint();
        assert.check(manager.getState() === States.NOTDOING);
    } );
    
    it('Should undo correctly (making variable)', function() : void {
        let variable : TVar<number> = new TVar<number>(1, manager);
        manager.undo();
        assert.check(variable.get() === undefined);
    } );

    it('Should undo correctly (set variable)', function() : void {
        let variable : TVar<number> = new TVar<number>(1, manager);
        assert.check( variable.get() == 1, "variable should equal 1");
        manager.checkpoint();
        variable.set(2)
        assert.check( variable.get() == 2, "variable should equal 2");
        manager.undo();
        assert.check( variable.get() == 1, "variable should equal 1 after undo");
    } );

    it('Should undo correctly (differently typed variables)', function() : void {
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
    } );
} ) ;

describe( 'backtracking.TVar ', function() : void {

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
