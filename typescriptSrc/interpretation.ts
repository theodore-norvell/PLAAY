/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="evaluation.ts" />
/// <reference path="pnode.ts" />
/// <reference path="stackManager.ts" />
/// <reference path="vms.ts" />
/// <reference path="value.ts" />

import assert = require('./assert');
import collections = require('./collections');
import evaluation = require('./evaluation');
import pnode = require('./pnode');
import stack = require('./stackManager');
import value = require('./value');
import vms = require('./vms');

module interpretation {
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;
    import VMS = vms.VMS;
    import PNode = pnode.PNode;
    import Label = pnode.Label;

    export interface Selector {
        select: (vms: VMS, label: Label) => void;

    }

    export class lrSelector implements Selector {
        select(vms: VMS, label: Label) {

        }
    }

    export class varSelector implements Selector {
           select(vms:VMS, label:Label){
                var evalu = vms.getStack().top();
                var pending = evalu.getPending();
                if (pending != null) {
                    var node = evalu.root.get(pending);
                    if (node.label() == label) {
                        //TODO how to highlight  look up the variable in the stack and highlight it.
                        if (!evalu.getStack().inStack(label.getVal())) { } //error} //there is no variable in the stack with this name TODO THIS FUNCTION IS BROKEN
                        else { evalu.ready = true; }
                    }
                }
            }
    }

    export class whileSelector implements Selector {
        select(vms: VMS, label: Label) {
        }
    }

    export class lambdaSelector implements Selector {
        select(vms: VMS, label: Label) {
        }
    }

    export class assignSelector implements Selector {
        select(vms: VMS, label: Label) {
        }
    }

    export class literalSelector implements Selector {
        select(vms: VMS, label: Label) {
        }
    }

    export class ifSelector implements Selector {
        select(vms: VMS, label: Label) {
        }
    }

    export class declareSelector implements Selector {
        select(vms: VMS, label: Label) {
        }
    }

    export class callSelector implements Selector {
        select(vms: VMS, label: Label) {
        }
    }

    export class turtleSelector implements Selector {
        select(vms: VMS, label: Label) {
        }
    }

    export class miscSelector implements Selector {
        select(vms: VMS, label: Label) {
        }
    }

    export interface Stepper {
        step: (vms: VMS, label: Label) => void;
    }

    export class lrStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

    export class varStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

    export class whileStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

    export class lambdaStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

    export class assignStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

    export class literalStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

    export class ifStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

    export class declareStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

    export class callStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

    export class turtleStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

    export class miscStepper implements Stepper {
        step(vms: VMS, label: Label) {
        }
    }

}