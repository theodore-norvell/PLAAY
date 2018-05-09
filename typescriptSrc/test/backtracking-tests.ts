/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../labels.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../backtracking.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../interpreter.ts" />
/// <reference path="../valueTypes.ts" />
/// <reference path="../world.ts" />
/// <reference path="../collections.ts" />

import collections = require( '../collections' ) ;
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
import StringV = valueTypes.StringV;

import nil = collections.nil ;
import list = collections.list ;


const interp = interpreter.getInterpreter();

describe( 'backtracking.TransactionManager ', function() : void {
    const manager : TransactionManager = new TransactionManager();
    let x : TVar<number> ;
    let y : TVar<string> ;
    let z : TVar<string> ;

    it('Should be initialized properly', function() : void {
        assert.check(!manager.canUndo(), "Manager is in the wrong state: should not be able to undo.");
        assert.check(!manager.canRedo(), "Manager is in the wrong state: should not be able to redo.");
    } );

    it('Should allow us to create an initial state', function() : void {
        x = new TVar<number>(0, manager);
        assert.check( x.get() === 0, "x should be initialized to 0" ) ;
        x.set( 1 ) ;
        assert.check( x.get() === 1, "x should be set to 1") ;
        assert.check( !manager.canUndo(), "Manager is in the wrong state: initial undo check.");
        assert.check( !manager.canRedo(), "Manager is in the wrong state: initial redo check.");
        // This is the first checkpoint.  It defines the root state.
        // We can always get back to this state by some number of undos.
        // But we can never go back past the initial state.
        manager.checkpoint(); // Call this state A: {x -> 1} no parent
        assert.check( !manager.canUndo(), "Manager is in the wrong state: !canUndo after initial checkpoint.");
        assert.check( !manager.canRedo(), "Manager is in the wrong state: !canRedo after initial checkpoint..");
        assert.check( x.get() === 1, "x should still be 1 at this point") ;
        x.set( 2 ) ;
        assert.check( x.get() === 2, "x should be set to 2") ;
        assert.check( manager.canUndo(), "Manager is in the wrong state: canUndo should be true after set without checkpoint.");

        manager.undo() ; // This should take us back to state A
        // It also implicitely checkpoints.
        // So call this state B: {x -> 2} parent is A
        
        assert.check( !manager.canUndo(), "Manager is in the wrong state: canUndo should be false after first undo.");
        assert.check( x.get() === 1, "x should be undone to 1") ;

        // Back to state B.
        assert.check( manager.canRedo(), "Manager is in the wrong state: canRedo should be true after first undo.");
        manager.redo() ;
        assert.check( x.get() === 2, "x should be redone to 2") ;
        assert.check( !manager.canRedo(), "Manager is in the wrong state: canRedo should be false after redo.");
    } );
    
    it('Should undo/redo correctly (making variable)', function() : void {
        y = new TVar<string>("c", manager);
        // We've created a new variable that doesn't exist in states A and B
        assert.check( y.get() === "c", "y should be initialized properly" );
        manager.undo() ; // This makes an implicit checkpoint, so
        // call this state C: { x -> 2, y -> "c" } parent state is B
        // And we should now be back to state B

        assert.check(x.get() === 2, "x should be 2 after first undo");
        let ok = true ;
        try {
            y.get() ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "get of dead variable 'y' should fail" ) ;
        try {
            y.set( "d" ) ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "set of dead variable 'y' should fail" ) ;

        manager.redo() ; // Back to state C.
        assert.check(y.isAlive(), "y should be alive")
        assert.check( y.get() === "c", "y should be alive and set to 'c' after redo") ;
        assert.check( x.get() === 2, "x should still be '2' after redo" ) ;

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
        manager.checkpoint() ; // Explicitly creating a new state.
        // Call it D: { x -> 2, z -> "z" } parent state is B
        manager.checkpoint() ; // Redundant checkpoint should have not effect
        manager.checkpoint() ;  // One more. Why not.

        manager.undo() ;
        // We should be in state B
        assert.check(x.get() === 2, "x should be 2 at this point.");
        let ok = true ;
        try {
            y.get() ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "get of a dead variable should fail" ) ;
        try {
            y.set( "d" ) ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "set of a dead variable should fail" ) ;
        try {
            z.get() ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "get of a dead variable should fail" ) ;
        try {
            z.set( "d" ) ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "set of a dead variable should fail" ) ;
        assert.check( manager.canRedo(), "Manager is in the wrong state.");
        assert.check( manager.canUndo(), "Manager is in the wrong state.");

        // Go back to state A
        manager.undo() ;
        // We should be in state A
        assert.check(x.get() === 1, "x should be 1 after undo");
        try {
            y.get() ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "get of a dead variable should fail" ) ;
        try {
            y.set( "d" ) ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "set of a dead variable should fail" ) ;
        try {
            z.get() ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "get of a dead variable should fail" ) ;
        try {
            z.set( "d" ) ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "set of a dead variable should fail" ) ;

        assert.check( manager.canRedo(), "Manager is in the wrong state.");
        assert.check( !manager.canUndo(), "Manager is in the wrong state.");

        // Forward to state B
        manager.redo() ;
        assert.check(x.get() === 2, "x should be 2 after redo");
        try {
            y.get() ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "set of a dead variable should fail" ) ;
        try {
            y.set( "d" ) ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "set of a dead variable should fail" ) ;
        try {
            z.get() ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "get of a dead variable should fail" ) ;
        try {
            z.set( "d" ) ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "set of a dead variable should fail" ) ;
        assert.check( manager.canRedo(), "Manager is in the wrong state.");
        assert.check( manager.canUndo(), "Manager is in the wrong state.");

        // Forward to state D
        manager.redo() ;
        assert.check(x.get() === 2, "x should be 2 after second redo");
        try {
            y.get() ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "get of a dead variable should fail" ) ;
        try {
            y.set( "d" ) ;
            ok = false ;
        } catch( ex ) {}
        assert.check(ok, "set of a dead variable should fail" ) ;
        assert.check( z.get() === "z", "z should be 'z' after second redo") ;
        assert.check( !manager.canRedo(), "Manager is in the wrong state." ) ;
        assert.check( manager.canUndo(), "Manager is in the wrong state." ) ;
    } );

} ) ;

describe( 'backtracking.TVar ', function() : void {
    const manager : TransactionManager = new TransactionManager();

    it('Should be initialized properly', function() : void {
        const variable : TVar<number> = new TVar<number>(1, manager);
        assert.check( variable.get() === 1 );
    } );

    it('Should set properly', function() : void {
        const variable : TVar<number> = new TVar<number>(1, manager);
        assert.check( variable.get() === 1 );
        variable.set(5);
        assert.check( variable.get() === 5 );
    } );
} ) ;

describe('Backtracking.TArray', function() : void {
    const manager : TransactionManager = new TransactionManager();

    it('Should be initialized properly', function() : void{
        const a : TArray<number> = new TArray<number>(manager);
        assert.check( a.size() === 0 );
        let ok = true ;
        try {
            a.get(1);
            ok = false ;
        } catch(ex){}
        assert.check(ok, "get of an element in empty array should fail");
        try {
            a.pop();
            ok = false ;
        }catch(ex){}
        assert.check(ok, "calling pop on empty array should fail");
    });

    it('Should set properly', function() : void {
        const a : TArray<any> = new TArray<any>(manager);
        a.push('a'); a.push('b'); a.push('c');

        assert.check( a.size() === 3, "Size of TArray should be 3" );
        assert.check( a.get(0) === 'a', "Element at index 0 should be 'a'");
        assert.check( a.get(1) === 'b', "Element at index 1 should be 'b'");
        assert.check( a.get(2) === 'c', "Element at index 2 should be 'c'");

        a.set(1, 'z');
        assert.check( a.size() === 3, "Size of array should still be 3");
        assert.check( a.get(1) === 'z', "Element at index 1 should now be 'z");
        let ok = true ;
        try {
            a.set(4, 'q');
            ok = false ;
        }catch(ex){}
        assert.check(ok, "set at out of bounds index should fail");
    });

    it('Should pop properly', function() : void {
        const a : TArray<any> = new TArray<any>(manager);
        a.push('a'); a.push('b'); a.push('c');
        assert.check( a.size() === 3, "Size should be 3");

        const v1 : any = a.pop();
        assert.check(v1 === 'c', "Popped element should be c")
        assert.check( a.size() === 2, "size should be 2 after pop()");
        assert.check( a.get(1) === 'b', "Element at index 1 should be 'b'");

        const v2 : any = a.pop();
        assert.check(v2 === 'b', "Popped element should be c")
        assert.check( a.size() === 1, "Size should be 1 after 2 pops");
        assert.check( a.get(0) === 'a', "Element at index 0 should be 'a'");

        a.pop();
        assert.check( a.size() === 0, "Size should be 0 after 3 pops") ;
        let ok = true ;
        try{
            a.pop();
            ok = false ;
        }catch(ex){}
        assert.check(ok, "Pop on empty TArray should fail");
    });

    it('Should undo/redo properly', function() : void {
        const a : TArray<any> = new TArray<any>(manager);
        a.push('a'); a.push('b'); a.push('c');
        //State A
        manager.checkpoint();

        a.push('d');
        //State B
        assert.check( a.size() === 4, "Size should be 4");
        assert.check( a.get(3) === 'd', "Value at index 3 should be d after checkpoint");

        //Back to State A
        manager.undo();

        assert.check( a.size() === 3, "Size should be 3 after undo");
        assert.check( a.get(0) === 'a', "Value at index 0 should still be a after undo");

        //Forward to state B
        manager.redo();

        assert.check( a.size() === 4, "Size should be 4 after redo");
        assert.check( a.get(3) === 'd', "Value at index 3 should be d after redo");

        a.push('y');
        //State C
        assert.check( a.size() === 5, "Size should be 5 after unshifting a value");
        assert.check( a.get(4) === 'y', "Value at index 4 should be y after unshift");

        //Undo from state C back to B
        manager.undo();
        assert.check( a.size() === 4, "Size should be 4 after second undo");
        assert.check( a.get(3) === 'd', "Value at index 3 should be d after second undo");

        //Branch from state B to state D
        a.push('z');
        assert.check(!manager.canRedo(), "Shouldn't be able to redo to a dead state");
        assert.check(a.size() === 5, "Size should be 5 after pushing a value.");
        assert.check(a.get(4) === 'z', "Value at index 4 should be z after pushing.");
        manager.checkpoint();
        
        a.set(4, 'a');
        //State E
        assert.check(a.get(4) === 'a', "Value at index 4 should be a after setting.");

        //Back to state D
        manager.undo();
        assert.check(a.size() === 5, "Size should remain 5 after third undo");
        assert.check(a.get(4) === 'z', "Value at index 4 should be z after third undo.");

        //Forward again to state E
        manager.redo();
        assert.check(a.size() === 5, "Size should remain 5 after second redo.");
        assert.check(a.get(4) === 'a', "Value at index 4 should be a after second redo.");

    });
});

describe('vms.Evaluation isReady undo/redo', function() : void {
    const label = new labels.StringLiteralLabel( "hello", false );
    const root = new PNode( label, [] );
    const manager = new TransactionManager() ;
    const wld = new World(manager);
    const wlds : Array<ObjectV> = new Array();
    wlds.push(wld);
    const vm = new VMS(root, wlds, interp, manager);
    const evaluation = new Evaluation(root, vm.getStack(), vm);

    it('Should be initialized properly', function() : void {
        assert.check(evaluation.isReady() === false, 'initialized value incorrectly');
        assert.check( !manager.canUndo(), 'manager is in the wrong state') ;
        assert.check( !manager.canRedo(), 'manager is in the wrong state') ;
    });

    it('Should undo/redo properly', function() : void {
        //State A
        manager.checkpoint() ;

        //State B
        evaluation.setReady(true);
        assert.check(evaluation.isReady() === true, 'set value incorrectly');

        //Back to State A
        manager.undo();
        assert.check(evaluation.isReady() === false, 'var should be false after undo');
        assert.check( !manager.canUndo(), 'manager is in the wrong state') ;
        assert.check( manager.canRedo(), 'manager is in the wrong state') ;

        //To State B
        manager.redo();
        assert.check(evaluation.isReady() === true, 'var should be true after redo');
        assert.check( manager.canUndo(), 'manager is in the wrong state') ;
        assert.check( !manager.canRedo(), 'manager is in the wrong state') ;
    })
});

describe('vms.Evaluation / EvalStack pending undo/redo', function() : void {
    const rootlabel = new labels.CallWorldLabel("/", false);
    const op1 = labels.mkNumberLiteral("9");
    const op2 = labels.mkNumberLiteral("3");
    const root = new PNode(rootlabel, [op1, op2]);
    const manager = new TransactionManager() ;
    const wld = new ObjectV(manager) ;
    const wlds : Array<ObjectV> = new Array();
    wlds.push(wld);
    // The program is 9/3
    const vm = new VMS(root, wlds, interp, manager);
    const emptyList = collections.nil<number>() ;

    it('Should be initialized properly', function() : void {
        assert.check( !manager.canRedo(), "Manager shouldn't be able to redo before checkpoint." ) ;
        assert.check( !manager.canUndo(), "Manager shouldn't be able to undo before checkpoint" ) ;
        assert.check(vm.getPending().size() === 0, 'get pending should be nil');
        const evaluation = vm.getEval();
        assert.check(!evaluation.isDone(), 'pending shouldn\'t be null')
        assert.check(evaluation.getPendingNode() === vm.getRoot(), 'pending node should be root')
        assert.check(vm.canAdvance(), 'should be able to advance') ;
        assert.check( !vm.isReady() );
    });
    it('Should undo/redo properly', function() : void {
        //State A
        //console.log("Before first checkpoint") ;
        //vm.dump( "  " ) ;
        //manager.dump( "  " ) ;
        manager.checkpoint() ;
        //console.log("After first checkpoint") ;
        //vm.dump( "  " ) ;
        //manager.dump( "  " ) ;
        assert.check(vm.getPendingNode() === vm.getRoot(), "Root should be the pending node");
        assert.check( ! vm.isReady() ) ;
        const pending : collections.List<number> = vm.getPending();
        assert.check( pending.equals( nil() )) ;

        vm.advance() ; // select the 9
        //console.log("After first advance") ;
        //vm.dump( "  " ) ;
        //manager.dump( "  " ) ;
        assert.check(  vm.isReady() ) ;
        assert.check( vm.getPendingNode() === op1, "Root should not be the pending node");
        assert.check( !manager.canRedo(), "Manager shouldn't be able to redo after checkpoint." ) ;
        assert.check( manager.canUndo(), "Manager should be able to undo after checkpoint" ) ;
        assert.check( ! vm.isMapped(nil()), "The root should not be mapped.");
        assert.check( ! vm.isMapped(list(0)), "The 9 should not be mapped.");

        vm.advance() ; // Step the 9, mapping it to a value
        //console.log("After second advance") ;
        //vm.dump( "  " ) ;
        //manager.dump( "  " ) ;
        assert.check(  ! vm.isReady() ) ;
        assert.check( !manager.canRedo(), "Manager shouldn't be able to redo after checkpoint." ) ;
        assert.check( manager.canUndo(), "Manager should be able to undo after checkpoint" ) ;
        assert.check( ! vm.isMapped(nil()), "The root should not be mapped.");
        assert.check( vm.isMapped(list(0)), "The 9 should be mapped.");
        //console.log("Before undo") ;
        //vm.dump( "  " ) ;
        //manager.dump("  ") ;
        // State B
        //Undo should make an implicit chekpoint (state B) and then go back to State A
        manager.undo();
        //console.log("After undo") ;
        //vm.dump( "  " ) ;
        //manager.dump("  ") ;
        assert.check( vm.getPending().equals( nil() ), "pending should be nil") ;
        assert.check(  ! vm.isReady(), "machine should not be ready" ) ;
        assert.check( vm.getPendingNode() === vm.getRoot(), "Root should be the pending node" );
        assert.check( manager.canRedo(), "Manager should be able to redo after undo" ) ;
        assert.check( !manager.canUndo(), "Manager shouldn't be able to undo a second time" ) ;
        //assert.check(vm.isMapped(vm.getPending()), "path of pending should be mapped");

        //Forward to state B
        manager.redo();
        //console.log("After redo") ;
        //vm.dump( "  " ) ;
        //manager.dump("  ") ;
        assert.check(  ! vm.isReady() ) ;
        assert.check( !manager.canRedo(), "Manager shouldn't be able to redo after checkpoint." ) ;
        assert.check( manager.canUndo(), "Manager should be able to undo after checkpoint" ) ;
        assert.check( ! vm.isMapped(nil()), "The root should not be mapped.");
        assert.check( vm.isMapped(list(0)), "The 9 should be mapped.");
    }) ;
});




/*
//This only fails because of mkVarDecl() not because of backtracking, 'pending' functionality tested above
//leaving this here for later
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
        assert.check(evaluation.getPendingNode() === vm.getRoot(), 'pending node should be root')
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
*/