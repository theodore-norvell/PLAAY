/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="interpreter.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />


import assert = require('./assert') ;
import { TransactionManager } from './backtracking';
import collections = require( './collections' ) ;
import interpreter = require('./interpreter') ;
import library = require( './library' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;

/** The evaluation manager is a thin layer between the VMS and the animator.
 * 
 */
module evaluationManager {

    import World = library.World ;
    import List = collections.List ;
    import PNode = pnode.PNode;
    import Evaluation = vms.Evaluation;
    import VMS = vms.VMS;
    import VMStates = vms.VMStates ;

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
            this.run( 100000, stopper ) ;
        }
        
        public stepTillFinished() : void {
            const stopper = new TillFinishedStopper() ;
            this.run( 100000, stopper ) ;
        }

        public stepToReturn() : void {
            const stopper = new ReturnStopper();
            this.run( 100000, stopper);
        }

        public stepOver() : void {
            const stopper = new StepOverStopper();
            this.run( 100000, stopper);
        }

        public stepInto() : void {
            const stopper = new StepIntoStopper();
            this.run( 100000, stopper);
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
    // After that, stop when the top evaluation is done or is ready to step.
    class NextStopper extends Stopper {
        private count : number = 0 ;

        public shouldStop( vm : VMS ) : boolean {
            const state = vm.getState() ;
            return this.count > 0
                && (state === VMStates.EVAL_DONE
                    || state == VMStates.EVAL_READY_TO_FETCH
                    || state == VMStates.EVAL_READY_TO_STEP
                       && ! vm.getInterpreter().veryBoring(vm)) ;
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
                && (this.currentEval.evalIsDone()) ;
        }
        public step( vm : VMS ) : void {
            this.count += 1 ;
        }

    }

    //Stops when
    // at least one step has been made
    // and ()
    //    the initial evaluation is done
    // or the initial evaluation has been popped from the stack
    // or another line in the initial evaluation has been started
    //    and the vm is ready to be stepped
    // or a closure is about to be called
    // or a closure has been called and returned from.
    class StepOverStopper extends Stopper {
        protected count : number = 0 ;
        protected stackDepth : number ;
        protected aCallHasBeenMade : boolean ;
        protected currentEval : Evaluation;
        protected savedPath : List<number>;

        public init(vm : VMS) : void {
            this.currentEval = vm.getEval();
            this.stackDepth = vm.getEvalStack().getSize() ;
            this.aCallHasBeenMade = false ;
            this.savedPath = this.pathToLowestInterestingNode(vm) ;
        }

        protected pathToLowestInterestingNode(vm : VMS) : List<number> {
            const evaluationState = vm.getEval().getState() ;
            if( evaluationState === VMStates.EVAL_DONE )
                return collections.nil() ;
            // Find the path to the lowest node on the path that is the child of
            // a node with vertical layout.
            let path = vm.getPending();
            const pathSize : number = path.size();
            for (let i = 0; i < pathSize; i++){
                const temp : List<number> = path;
                path = collections.butLast(path);
                if (this.currentEval.getRoot().get(path).hasVerticalLayout()){
                    return temp ;
                }
            }
            return path ;
        }

        public shouldStop( vm : VMS ) : boolean {
            const state = vm.getState() ;
            return this.count > 0
                && (   this.currentEval.evalIsDone() 
                   ||  this.stackDepth > vm.getEvalStack().getSize()
                       && state === VMStates.EVAL_READY_TO_STEP
                       && ! vm.getInterpreter().veryBoring(vm)
                   ||  this.currentEval === vm.getEval()
                       && ! this.savedPath.equals( this.pathToLowestInterestingNode(vm) )
                       && state === VMStates.EVAL_READY_TO_STEP
                       && ! vm.getInterpreter().veryBoring(vm)
                   || this.currentEval === vm.getEval()
                      && state === VMStates.EVAL_READY_TO_STEP
                      && vm.getInterpreter().veryInteresting(vm) ) 
                   || this.aCallHasBeenMade
                      && this.currentEval === vm.getEval()
                      && state === VMStates.EVAL_READY_TO_STEP
                      && vm.getEvalStack().getSize() == this.stackDepth ;
        }

        public step( vm : VMS ) : void {
            this.count += 1 ;
            this.aCallHasBeenMade = this.aCallHasBeenMade
                                 || vm.getEvalStack().getSize() > this.stackDepth ;
        }

    }

    // Stops in all the same places as the StepOverStopper, but also
    //    When a call to a closure has been made and the selected node is not very boring
    //    of when a call has been made and that call is done.
    // The a latter case can happen when the closure called has only very boring nodes.
    class StepIntoStopper extends StepOverStopper {

        public shouldStop( vm : VMS ) : boolean {
            const state = vm.getState() ;
            return this.count > 0
                && (  super.shouldStop(vm)
                   || this.stackDepth < vm.getEvalStack().getSize()
                      && state === VMStates.EVAL_READY_TO_STEP
                      && ! vm.getInterpreter().veryBoring(vm) 
                   || this.aCallHasBeenMade
                      &&  state === VMStates.EVAL_DONE 
                   ) ;
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