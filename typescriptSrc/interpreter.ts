/// <reference path="assert.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />
/// <reference path="world.ts" />


import assert = require('./assert') ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import world = require('./world') ;

module interpreter {

    import Evaluation = vms.Evaluation;
    import PNode = pnode.PNode;
    import VMS = vms.VMS;

    class PlaayInterpreter implements vms.Interpreter {

        step( vms : VMS ) {
            // TODO
        }

        select( vms : VMS ) {
            // TODO
        }
    }

    const theInterpreter = new PlaayInterpreter ;

    export function getInterpreter() : vms.Interpreter {
        return theInterpreter ;
    }

}

export = interpreter ;