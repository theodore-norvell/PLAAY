/// <reference path="assert.ts" />
/// <reference path="interpreter.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />


import assert = require('./assert') ;
import { TransactionManager } from './backtracking';
import interpreter = require('./interpreter') ;
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

        public next() : void {
            const stopper = new NextStopper() ;
            this.run( 100, stopper ) ;
        }
        
        public stepTillFinished() : void {
            const stopper = new TillFinishedStopper() ;
            this.run( 10000, stopper ) ;
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

    // Advance until the vm can no longer advance.
    class TillFinishedStopper extends  Stopper {

        public shouldStop( vm : VMS ) : boolean {
            return false ;
        }
    }
}

export = evaluationManager ;