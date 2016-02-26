/**
 * Created by Ryne on 24/02/2016.
 */

import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import evaluation = require( './evaluation' ) ;

module vms{

    import Stack = stack.Stack ;
    import Evaluation = evaluation.Evaluation;

    export class VMS{

        stack : Stack ;
        val : Evaluation;

        canAdvance(){
            return this.stack.notEmpty();//TODO add notEmpty to stack why can't this file see members?
        }

        advance(){
            if(this.canAdvance()){
               if(this.stack.top().isDone()) {//TODO add top to stack why can't this file see members?
                  // eval = stack.top();
                  this.val = this.stack.pop(); //TODO add pop to stack why can't this file see members?
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