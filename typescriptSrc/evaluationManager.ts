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
 * TODO. Get rid of this module.
 */
module evaluationManager {

    import World = library.World ;
    import List = collections.List ;
    import PNode = pnode.PNode;
    import Evaluation = vms.Evaluation;
    import VMS = vms.VMS;

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
        protected count : number = 0 ;
        protected stackDepth : number ;
        protected currentEval : Evaluation;
        protected savedPath : List<number>;

        public init(vm : VMS) : void {
            this.currentEval = vm.getEval();
            this.stackDepth = vm.getEvalStack().getSize() ;
            this.savedPath = this.pathToLowestInterestingNode(vm) ;
        }

        protected pathToLowestInterestingNode(vm : VMS) : List<number> {
            if( vm.isDone() ) return collections.nil() ;
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
            return this.count > 0
                && (   this.currentEval.isDone() 
                   ||  this.stackDepth > vm.getEvalStack().getSize() && vm.isReady()
                   ||  this.currentEval === vm.getEval()
                       && ! this.savedPath.equals( this.pathToLowestInterestingNode(vm) )
                       && vm.isReady() ) ;
        }
        public step( vm : VMS ) : void {
            this.count += 1 ;
        }

    }

    //Stops when the current evaluation is done or when the current expression
    //is evaluated, or when a new evaluation is popped onto the stack.
    class StepIntoStopper extends StepOverStopper {

        public shouldStop( vm : VMS ) : boolean {
            return super.shouldStop(vm)
                || this.stackDepth < vm.getEvalStack().getSize()
                   && vm.isReady() ;
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