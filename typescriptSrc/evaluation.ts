/**
 * Created by Jessica on 2/22/2016.
 */

import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import value = require('./value') ;

module evaluation {

    import Stack = stack.Stack;
    import ExprNode = pnode.ExprNode;
    import VMS = vms.VMS;
    import VarMap = stack.VarMap;
    import Value = value.Value;

    export class Evaluation {
        root : ExprNode;
        stack : Stack;
        //map : Map;
        pending : Array<Number>;
        ready : Boolean;

        next : Evaluation;
        varmap : VarMap;

        constructor (){//path : Array<Number>, value : Value) {
            //this.varmap = new VarMap();
            //this.varmap.put(path, value);
        }

        getNext(){
            return this.next;
        }

        getVarMap(){
            return this.varmap;
        }

        setNext(next : Evaluation){
            this.next = next;
        }

        finishStep( v : Value ){
            if(this.pending != null && this.ready){
                this.varmap.put( this.pending , v)
                if( this.pending.length == 0){
                    this.pending = null;
                }

                else{
                    this.pending.pop();
                }
                this.ready = false;
            }
        }

        setResult(value : Value ){
            var node = this.root.get( this.pending );
            var closurePath = this.pending ^ [0];
            var closure = this.varmap.get( closurePath );
            var lambda = closure.function;
            this.finishStep( value );
        }

        setVarMap(map : VarMap){
            this.varmap = map;
        }


        isDone(){
            return this.pending == null; //check if pending is null
        }

        advance( vms : VMS ){
            if(!this.isDone()){
                var topNode = this.root.get( this.pending );
                if( this.ready ){
                    topNode.getLabel().step( vms );
                }
                else{
                    topNode.getLabel().select( vms );
                }
            }
        }



    }
}
export = evaluation;