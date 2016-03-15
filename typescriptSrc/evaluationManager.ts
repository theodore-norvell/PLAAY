import evaluation = require( './evaluation' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;

module evaluationManager {

    import Evaluation = evaluation.Evaluation;
    import PNode = pnode.PNode;
    import VMS = vms.VMS;

    export class evaluationManager {

        _vms : VMS;

        constructor(root : PNode) {
            this._vms.evalu = new Evaluation(root, []);
        }

        PLAAY() {


        }

        advance() {
            this._vms.advance();
        }

    }
}

export = evaluationManager ;