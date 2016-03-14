/**
 * Created by Ryne on 24/02/2016.
 */

import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import evaluation = require( './evaluation' ) ;
import value = require('./value');

module vms{

    import Stack = stack.Stack ;
    import Evaluation = evaluation.Evaluation;
    import Value = value.Value;

    export class VMS{

        stack : Stack ;
        evalu : Evaluation ;
        val : String ;

        canAdvance(){
            return this.stack.notEmpty();//TODO add notEmpty to stack why can't this file see members?
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