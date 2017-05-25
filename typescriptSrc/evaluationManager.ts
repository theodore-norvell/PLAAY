/// <reference path="assert.ts" />
/// <reference path="interpreter.ts" />
/// <reference path="pnode.ts" />
/// <reference path="seymour.ts" />
/// <reference path="vms.ts" />
/// <reference path="workspace.ts" />
/// <reference path="world.ts" />


import assert = require('./assert') ;
import interpreter = require('./interpreter') ;
import pnode = require('./pnode') ;
import seymour = require('./seymour') ;
import vms = require('./vms') ;
import workspace = require('./workspace') ;
import world = require('./world') ;

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

        initialize(root : PNode, turtleWorld : seymour.TurtleWorld ) : void {
            var worlds = new Array();
            worlds.push(this.workspace.getWorld());
            if (turtleWorld !=  null ) {
                worlds.push( new world.TurtleWorldObject( turtleWorld ) ) ;
            }
            const interp : vms.Interpreter = interpreter.getInterpreter() ;
            this._vms = new VMS(root, worlds, interp );
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