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
import TArray = backtracking.TArray;
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
    var x : TVar<number> ;
    var y : TVar<string> ;
    var z : TVar<string> ;

    it('Should be initialized properly', function() : void {
        assert.check(!manager.canUndo(), "Manager is in the wrong state: should not be able to undo.");
        assert.check(!manager.canRedo(), "Manager is in the wrong state: should not be able to redo.");
    } );

    it('Should allow us to create an initial state', function() : void {
        x = new TVar<number>(0, manager);
        assert.check( x.get() == 0, "x should be initialized to 0" ) ;
        x.set( 1 ) ;
        assert.check( x.get() == 1, "x should be set to 1") ;
        assert.check( !manager.canUndo(), "Manager is in the wrong state: initial undo check.");
        assert.check( !manager.canRedo(), "Manager is in the wrong state: initial redo check.");
        // This is the first checkpoint.  It defines the root state.
        // We can always get back to this state by some number of undos.
        // But we can never go back past the initial state.
        manager.checkpoint(); // Call this state A: {x -> 1} no parent
        assert.check( !manager.canUndo(), "Manager is in the wrong state: !canUndo after initial checkpoint.");
        assert.check( !manager.canRedo(), "Manager is in the wrong state: !canRedo after initial checkpoint..");
        assert.check( x.get() == 1, "x should still be 1 at this point") ;
        x.set( 2 ) ;
        assert.check( x.get() == 2, "x should be set to 2") ;
        assert.check( manager.canUndo(), "Manager is in the wrong state: canUndo should be true after set without checkpoint.");

        manager.undo() ; // This should take us back to state A
        // It also implicitely checkpoints.
        // So call this state B: {x -> 2} parent is A
        
        assert.check( !manager.canUndo(), "Manager is in the wrong state: canUndo should be false after first undo.");
        assert.check( x.get() == 1, "x should be undone to 1") ;

        // Back to state B.
        assert.check( manager.canRedo(), "Manager is in the wrong state: canRedo should be true after first undo.");
        manager.redo() ;
        assert.check( x.get() == 2, "x should be redone to 2") ;
        assert.check( !manager.canRedo(), "Manager is in the wrong state: canRedo should be false after redo.");
    } );
    
    it('Should undo/redo correctly (making variable)', function() : void {
        y = new TVar<string>("c", manager);
        // We've created a new variable that doesn't exist in states A and B
        assert.check( y.get() == "c", "y should be initialized properly" );
        manager.checkpoint();
        manager.undo() ; // This makes an implicit checkpoint, so
        // call this state C: { x -> 2, y -> "c" } parent state is B
        // And we should now be back to state B

        assert.check(x.get() === 2, "x should be 2 after first undo");
        try {
            y.get() ;
            assert.check(false, "get of dead variable 'y' should fail" ) ;
        } catch( ex ) {}
        try {
            y.set( "d" ) ;
            assert.check(false, "set of dead variable 'y' should fail" ) ;
        } catch( ex ) {}

        manager.redo() ; // Back to state C.
        assert.check(y.isAlive(), "y should be alive")
        assert.check( y.get() == "c", "y should be alive and set to 'c' after redo") ;
        assert.check( x.get() == 2, "x should still be '2' after redo" ) ;

        manager.undo() ; // Back to state B
        // But we can go forward to C if we like
        assert.check( manager.canRedo(), "Manager is in the wrong state: should be able to redo into state C.");
    } );

    it('Should allow braching to new states', function() : void {

        z = new TVar<string>("z", manager);
        // By creating a new variable, we have moved
        // forward from state B.
        // State C should no longer be reached.
        assert.check( !manager.canRedo(), "Manager is in the wrong state.");
        manager.checkpoint() ; // Explicitly createing a new state.
        // Call it D: { x -> 2, z -> "z" } parent state is B

        manager.undo() ;
        // We should be in state B
        assert.check(x.get() === 2, "x should be 2 at this point.");
        try {
            y.get() ;
            assert.check(false, "get of a dead variable should fail" ) ;
        } catch( ex ) {}
        try {
            y.set( "d" ) ;
            assert.check(false, "set of a dead variable should fail" ) ;
        } catch( ex ) {}
        try {
            z.get() ;
            assert.check(false, "get of a dead variable should fail" ) ;
        } catch( ex ) {}
        try {
            z.set( "d" ) ;
            assert.check(false, "set of a dead variable should fail" ) ;
        } catch( ex ) {}
        assert.check( manager.canRedo(), "Manager is in the wrong state.");
        assert.check( manager.canUndo(), "Manager is in the wrong state.");

        // Go back to state A
        manager.undo() ;
        // We should be in state A
        assert.check(x.get() === 1, "x should be 1 after undo");
        try {
            y.get() ;
            assert.check(false, "get of a dead variable should fail" ) ;
        } catch( ex ) {}
        try {
            y.set( "d" ) ;
            assert.check(false, "set of a dead variable should fail" ) ;
        } catch( ex ) {}
        try {
            z.get() ;
            assert.check(false, "get of a dead variable should fail" ) ;
        } catch( ex ) {}
        try {
            z.set( "d" ) ;
            assert.check(false, "set of a dead variable should fail" ) ;
        } catch( ex ) {}
        assert.check( manager.canRedo(), "Manager is in the wrong state.");
        assert.check( !manager.canUndo(), "Manager is in the wrong state.");

        // Forward to state B
        manager.redo() ;
        assert.check(x.get() === 2, "x should be 2 after redo");
        try {
            y.get() ;
            assert.check(false, "get of a dead variable should fail" ) ;
        } catch( ex ) {}
        try {
            y.set( "d" ) ;
            assert.check(false, "set of a dead variable should fail" ) ;
        } catch( ex ) {}
        try {
            z.get() ;
            assert.check(false, "get of a dead variable should fail" ) ;
        } catch( ex ) {}
        try {
            z.set( "d" ) ;
            assert.check(false, "set of a dead variable should fail" ) ;
        } catch( ex ) {}
        assert.check( manager.canRedo(), "Manager is in the wrong state.");
        assert.check( manager.canUndo(), "Manager is in the wrong state.");

        // Forward to state D
        manager.redo() ;
        assert.check(x.get() === 2, "x should be 2 after second redo");
        try {
            y.get() ;
            assert.check(false, "get of a dead variable should fail" ) ;
        } catch( ex ) {}
        try {
            y.set( "d" ) ;
            assert.check(false, "set of a dead variable should fail" ) ;
        } catch( ex ) {}
        assert.check( z.get() === "z", "z should be 'z' after second redo") ;
        assert.check( !manager.canRedo(), "Manager is in the wrong state." ) ;
        assert.check( manager.canUndo(), "Manager is in the wrong state." ) ;
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

describe('Backtracking.TArray', function() : void {
    const manager : TransactionManager = new TransactionManager();

    it('Should be initialized properly', function() : void{
        let a : TArray<number> = new TArray<number>(manager);
        assert.check( a.size() == 0 );
        try {
            a.get(1);
            assert.check(false, "get of an element in empty array fail");
        } catch(ex){}
        try {
            a.pop();
            assert.check(false, "calling pop on empty array should fail");
        }catch(ex){}
    });

    it('Should set properly', function() : void {
        let a : TArray<any> = new TArray<any>(manager);
        a.push('a'); a.push('b'); a.push('c');

        assert.check( a.size() == 3, "Size of TArray should be 3" );
        assert.check( a.get(0) == 'a', "Element at index 0 should be 'a'");
        assert.check( a.get(1) == 'b', "Element at index 1 should be 'b'");
        assert.check( a.get(2) == 'c', "Element at index 2 should be 'c'");

        a.set(1, 'z');
        assert.check( a.size() == 3, "Size of array should still be 3");
        assert.check( a.get(1) == 'z', "Element at index 1 should now be 'z");
        try {
            a.set(4, 'q');
            assert.check(false, "set at out of bounds index should fail");
        }catch(ex){}
    });

    it('Should pop properly', function() : void {
        let a : TArray<any> = new TArray<any>(manager);
        a.push('a'); a.push('b'); a.push('c');
        assert.check( a.size() == 3, "Size should be 3");

        let v1 : any = a.pop();
        assert.check(v1 == 'c', "Popped element should be c")
        assert.check( a.size() == 2, "size should be 2 after pop()");
        assert.check( a.get(1) == 'b', "Element at index 1 should be 'b'");

        let v2 : any = a.pop();
        assert.check(v2 == 'b', "Popped element should be c")
        assert.check( a.size() == 1, "Size should be 1 after 2 pops");
        assert.check( a.get(0) == 'a', "Element at index 0 should be 'a'");

        a.pop();
        assert.check( a.size() == 0, "Size should be 0 after 3 pops")
        try{
            a.pop();
            assert.check(false, "Pop on empty TArray should fail");
        }catch(ex){}
    });

    it('Should unshift properly', function() : void {
        let a : TArray<any> = new TArray<any>(manager);

        a.unshift(1);
        assert.check(a.size() == 1, "Size should be 1 after unshift on empth TArray");
        assert.check(a.get(0) == 1, "Element at index 0 should be 1");
        a.push(2); a.push(3);
        assert.check( a.size() == 3, "Size should be 3");

        a.unshift(7);
        assert.check( a.size() == 4, "TArray size should be 4 after unshift");
        assert.check( a.get(0) == 7, "Element at index 0 should be 7 after unshift");
    })
});

describe('vms.Evaluation isReady undo/redo', function() : void {
    const label = new labels.StringLiteralLabel( "hello", false );
    const root = new PNode( label, [] );
    const vm = new VMS(root, wlds, interp);
    const manager : TransactionManager = vm.getTransactionManager();
    const evaluation = new Evaluation(root, vm.getStack(), vm);

    it('Should be initialized properly', function() : void {
        assert.check(evaluation.isReady() == false, 'initialized value incorrectly');
        assert.check( !manager.canUndo(), 'manager is in the wrong state') ;
        assert.check( !manager.canRedo(), 'manager is in the wrong state') ;
    });

    it('Should undo/redo properly', function() : void {
        manager.checkpoint() ;
        evaluation.setReady(true);
        assert.check(evaluation.isReady() === true, 'set value incorrectly');
        manager.undo();
        assert.check(evaluation.isReady() === false, 'var should be false after undo');
        assert.check( !manager.canUndo(), 'manager is in the wrong state') ;
        assert.check( manager.canUndo(), 'manager is in the wrong state') ;
        manager.redo();
        assert.check(evaluation.isReady() === true, 'var should be true after redo');
        assert.check( manager.canUndo(), 'manager is in the wrong state') ;
        assert.check( !manager.canRedo(), 'manager is in the wrong state') ;
    })
});

describe('vms.Evaluation root undo/redo', function() : void {
    const label = new labels.StringLiteralLabel( "hello", false );
    const root = new PNode( label, [] );
    const vm = new VMS(root, wlds, interp);
    const manager : TransactionManager = vm.getTransactionManager();
    const evaluation = new Evaluation(root, vm.getStack(), vm);

    it('Should be initialized properly', function() : void {
        assert.check( !manager.canRedo(), "Manager is in the wrong state." ) ;
        assert.check( !manager.canUndo(), "Manager is in the wrong state." ) ;
        manager.checkpoint() ;
        assert.check( !manager.canRedo(), "Manager is in the wrong state." ) ;
        assert.check( !manager.canUndo(), "Manager is in the wrong state." ) ;
    });
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
        assert.check( !vm.isReady() );
    });

    it('Should undo/redo properly', function() : void {
        manager.checkpoint();
        while( vm.canAdvance() ) vm.advance() ;
        manager.undo() ;
        assert.check(vm.canAdvance(), 'should be able to advance')
        manager.redo() ;
        assert.check( !vm.canAdvance(), 'should be able to advance') ;
    })
}) ;