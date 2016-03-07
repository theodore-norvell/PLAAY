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
               if(this.stack.top().isDone()) {//TODO add top to stack why can't this file see members?
                  // eval = stack.top();
                  this.val = this.stack.pop().getVarMap().getValue(); //TODO add pop to stack why can't this file see members?
                   if(this.stack.notEmpty()){
                       this.stack.top().setResult( this.val );
                   }
                   else{
                       this.stack.top().advance( this );
                   }
               }
            }
        }
    }
}
export = vms;