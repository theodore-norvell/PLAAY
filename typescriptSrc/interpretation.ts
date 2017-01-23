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

    export interface Selector {
        select(node: PNode): void;
    }

    export interface Stepper {
    }

    export class varSelector implements Selector {
        select(node: PNode) {
            
        }
    }

}