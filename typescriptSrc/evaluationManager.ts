import evaluation = require( './evaluation' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import workspace = require('./workspace') ;

module evaluationManager {

    import Evaluation = evaluation.Evaluation;
    import PNode = pnode.PNode;
    import VMS = vms.VMS;
    import Workspace = workspace.Workspace;

    export class EvaluationManager {

        private _vms : VMS;
        private workspace : Workspace;

        constructor(){
            this.workspace = new Workspace();
        }

        PLAAY(root : PNode, worlddecl : string) : VMS {
            var worlds = new Array();
            worlds.push(this.workspace.getWorld());
            if (worlddecl == "turtle"){
                worlds.push(this.workspace.getTurtleWorld());
            }
            this._vms = new VMS(root, worlds);
            return this._vms;
        }

        next() : VMS {
            this._vms.advance();
            return this._vms;
        }

    }
}

export = evaluationManager ;