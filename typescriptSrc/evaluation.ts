/**
 * Created by Jessica on 2/22/2016.
 */

import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import value = require('./value') ;

module evaluation {

    import execStack = stack.execStack;
    import ExprNode = pnode.ExprNode;
    import VMS = vms.VMS;
    import VarMap = stack.VarMap;
    import Value = value.Value;
    import ClosureV = value.ClosureV;

    export class Evaluation {
        root : ExprNode;
        stack : execStack;
        pending : Array<Number>;
        ready : Boolean;
        varmap : VarMap;

        next : Evaluation;


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
            //TODO how to cast this correctly var lambda = <ClosureV>closure.function;
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