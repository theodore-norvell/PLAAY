/// <reference path="assert.ts" />
/// <reference path="interpreter.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />
/// <reference path="workspace.ts" />


import assert = require('./assert') ;
import interpreter = require('./interpreter') ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import workspace = require('./workspace') ;

/** The evaluation manager is a thin layer between the VMS and the animator.
 * 
 * TODO. Get rid of this module.
 */
module evaluationManager {

    import Evaluation = vms.Evaluation;
    import PNode = pnode.PNode;
    import VMS = vms.VMS;
    import Workspace = workspace.Workspace;

    export class EvaluationManager {

        private _vms : VMS;
        private workspace : Workspace;

        constructor() {
            this.workspace = new Workspace();
        }

        public initialize(root : PNode, libraries : vms.ObjectI[] ) : void {
            const worlds = new Array<vms.ObjectI>();
            worlds.push(this.workspace.getWorld());
            libraries.forEach( (w) => worlds.push( w ) ) ;
            const interp : vms.Interpreter = interpreter.getInterpreter() ;
            this._vms = new VMS(root, worlds, interp);
        }

        public next() : void {
            this._vms.advance();
        }

        public getVMS() : VMS {
            return this._vms ;
        }

    }
}

export = evaluationManager ;