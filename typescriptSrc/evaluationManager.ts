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

        PLAAY(root : PNode) : VMS {
            this._vms = new VMS(root, this.workspace.getWorld());
            return this._vms;
        }

        next() : VMS {
            this._vms.advance();
            return this._vms;
        }

    }
}

export = evaluationManager ;