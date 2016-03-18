/**
 * Created by Ryne on 24/02/2016.
 */

import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import evaluation = require( './evaluation' ) ;
import value = require('./value');
import world = require('./world');
import pnode = require('./pnode');

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

        constructor(root : PNode, world: World) {
            this.evalu = new Evaluation(root, world);
            this.stack = new Stack();
            this.stack.push(this.evalu);
            this.world = world;
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
                   this.stack.top().advance( this );
               }
            }
        }
    }
}
export = vms;