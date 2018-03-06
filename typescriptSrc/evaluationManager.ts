/// <reference path="assert.ts" />
/// <reference path="interpreter.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />
/// <reference path="workspace.ts" />


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
            if( this._vms.canAdvance() ) this._vms.advance();
        }

        public getVMS() : VMS {
            return this._vms ;
        }

    }
}

export = evaluationManager ;