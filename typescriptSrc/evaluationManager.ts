/// <reference path="assert.ts" />
/// <reference path="interpreter.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />
/// <reference path="collections.ts" />


import assert = require('./assert') ;
import { TransactionManager } from './backtracking';
import interpreter = require('./interpreter') ;
import collections = require( './collections' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import {World} from './world' ;

/** The evaluation manager is a thin layer between the VMS and the animator.
 * 
 * TODO. Get rid of this module.
 */
module evaluationManager {

    import Evaluation = vms.Evaluation;
    import PNode = pnode.PNode;
    import VMS = vms.VMS;
    import List = collections.List ;

    export class EvaluationManager {

        private _vms : VMS;

        constructor() {
        }

        public initialize(root : PNode, libraries : vms.ObjectI[], manager : TransactionManager ) : void {
            const worlds = new Array<vms.ObjectI>();
            worlds.push( new World( manager ) ) ;
            libraries.forEach( (w) => worlds.push( w ) ) ;
            const interp : vms.Interpreter = interpreter.getInterpreter() ;
            this._vms = new VMS(root, worlds, interp, manager );
        }

        public undo() : void {
            if( this._vms.getTransactionManager().canUndo() ) {
                this._vms.getTransactionManager().undo() ;
            }
        }

        public redo() : void {
            if( this._vms.getTransactionManager().canRedo() ) {
                this._vms.getTransactionManager().redo() ;
            }
        }

        public next() : void {
            const stopper = new NextStopper() ;
            this.run( 100, stopper ) ;
        }
        
        public stepTillFinished() : void {
            const stopper = new TillFinishedStopper() ;
            this.run( 10000, stopper ) ;
        }

        public stepToReturn() : void {
            const stopper = new ReturnStopper();
            this.run( 100, stopper);
        }

        public stepOver() : void {
            const stopper = new StepOverStopper();
            this.run( 100, stopper);
        }

        public stepInto() : void {
            const stopper = new StepIntoStopper();
            this.run( 100, stopper);
        }

        private run( limit : number, stopper : Stopper ) : void {
            stopper.init( this._vms ) ; 
            while ( this._vms.canAdvance() && limit > 0 && !stopper.shouldStop(this._vms) ) {
                this._vms.advance();
                stopper.step( this._vms ) ;
                limit -= 1 ;
            }
            this._vms.getTransactionManager().checkpoint() ;
        }

        public getVMS() : VMS {
            return this._vms ;
        }

    }

    abstract class Stopper {
        public init( vm : VMS ) : void {} 
        // Precondition: vm.canAdvance() 
        public abstract shouldStop(vm : VMS) : boolean ;
        public step(vm : VMS) : void {} 
    }

    // Advance at least once.
    // After that stop when the top evaluation is done or is ready to step.
    class NextStopper extends Stopper {
        private count : number = 0 ;

        public shouldStop( vm : VMS ) : boolean {
            return this.count > 0
                && (vm.isDone() || vm.isReady()) ;
        }
        public step( vm : VMS ) : void {
            this.count += 1 ;
        }

    }

    //Stops when the current evaluation is done
    class ReturnStopper extends Stopper {
        private count : number = 0 ;
        private currentEval : Evaluation;

        public init(vm : VMS) : void{
            this.currentEval = vm.getEval();
        }

        public shouldStop( vm : VMS ) : boolean {
            return this.count > 0
                && (this.currentEval.isDone()) ;
        }
        public step( vm : VMS ) : void {
            this.count += 1 ;
        }

    }

    //Stops when the current evaluation is done or when the current expression
    //is evaluated
    class StepOverStopper extends Stopper {
        private count : number = 0 ;
        private currentEval : Evaluation;
        private pending : List<number>;

        public init(vm : VMS) : void{
            this.currentEval = vm.getEval();
            this.pending = vm.getPending();
           // this.pendingNode = vm.getPendingNode().;
        }

        public shouldStop( vm : VMS ) : boolean {
            return this.count > 0
                && (this.currentEval.isDone() && vm.isReady() ||  (vm.isMapped(this.pending) && vm.isReady())) ;
        }
        public step( vm : VMS ) : void {
            this.count += 1 ;
        }

    }

    //Stops when the current evaluation is done or when the current expression
    //is evaluated, or when a new evaluation is popped onto the stack.
    class StepIntoStopper extends Stopper {
        private count : number = 0 ;
        private currentEval : Evaluation;
        private pending : List<number>;

        public init(vm : VMS) : void{
            this.currentEval = vm.getEval();
            this.pending = vm.getPending();
           // this.pendingNode = vm.getPendingNode().;
        }

        public shouldStop( vm : VMS ) : boolean {
            return this.count > 0
                && (this.currentEval.isDone() && vm.isReady() ||  (vm.isMapped(this.pending) && vm.isReady())
                    || (vm.getEval() != this.currentEval && vm.isReady())) ;
        }
        public step( vm : VMS ) : void {
            this.count += 1 ;
        }

    }


    // Advance until the vm can no longer advance.
    class TillFinishedStopper extends  Stopper {

        public shouldStop( vm : VMS ) : boolean {
            return false ;
        }
    }
}

export = evaluationManager ;