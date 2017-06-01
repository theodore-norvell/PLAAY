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

        step( vms : VMS ) : void {
            assert.checkPrecondition( vms.isReady() )
        }

        select( vms : VMS ) : void {
            // 
        }
    }

    const theInterpreter = new PlaayInterpreter ;

    export function getInterpreter() : vms.Interpreter {
        return theInterpreter ;
    }

    interface StepperRegistry { [key:string] : Stepper }

    const theStepperRegistry : StepperRegistry = {} ;

    interface SelectorRegistry { [key:string] : Selector }

    const theSelctorRegistry : SelectorRegistry = {} ;

    abstract class Stepper {
        abstract step( vms : VMS ) : void ;
    }
    
    abstract class Selector {
        abstract step( vms : VMS ) : void ;
    }
}

export = interpreter ;