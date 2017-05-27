/// <reference path="assert.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />
/// <reference path="workspace.ts" />


import assert = require('./assert') ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import workspace = require('./workspace') ;

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

        initialize(root : PNode, libraries : vms.ObjectI[] ) : void {
            var worlds = new Array<vms.ObjectI>();
            worlds.push(this.workspace.getWorld());
            libraries.forEach( (w) => worlds.push( w ) ) ;
            this._vms = new VMS(root, worlds);
        }

        next() : void {
            this._vms.advance();
        }

        getVMS() : VMS {
            return this._vms ;
        }

        getTopEvaluation() : Evaluation {
            return this._vms.getEval() ;
        }

    }
}

export = evaluationManager ;