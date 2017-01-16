/**
 * Created by Ryne on 24/02/2016.
 */

/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="evaluation.ts" />
/// <reference path="pnode.ts" />
/// <reference path="stackManager.ts" />
/// <reference path="value.ts" />
/// <reference path="world.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import evaluation = require( './evaluation' ) ;
import pnode = require('./pnode');
import stack = require( './stackManager' ) ;
import value = require('./value');
import world = require('./world');

module vms{

    import Stack = stack.Stack ;
    import Evaluation = evaluation.Evaluation;
    import Value = value.Value;
    import World = world.World;
    import PNode = pnode.PNode;

    export class VMS{

        stack : Stack ;
        evalu : Evaluation ;
        val : String ;
        private world : World;

        constructor(root : PNode, worlds: Array<World>) {
            this.evalu = new Evaluation(root, worlds, null);
            this.stack = new Stack();
            this.stack.push(this.evalu);
            this.world = worlds[0];
        }

        canAdvance() : boolean {
            return this.stack.notEmpty();//TODO add notEmpty to stack why can't this file see members?
        }

        getEval() : Evaluation {
            return this.evalu;
        }

        getWorld() : World {
            return this.world;
        }

        advance(){
            if(this.canAdvance()){
               if(this.stack.top().isDone()) {//TODO is done for evaluations?
                  // eval = stack.top();
                  var value = this.stack.pop().getVarMap().get([]); //TODO get value from evaluation?
                   if(this.stack.notEmpty()){
                       this.stack.top().setResult( value );
                   }
               }

               else{
                   this.stack.top().advance(this);
               }
            }
        }
    }
}
export = vms;
