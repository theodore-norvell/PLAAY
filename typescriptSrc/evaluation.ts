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
    import PNode = pnode.PNode;
    import VMS = vms.VMS;
    import VarMap = stack.VarMap;
    import Value = value.Value;
    import ClosureV = value.ClosureV;

    export class Evaluation {
        root : PNode;
        stack : execStack;
        pending : Array<number>;
        ready : Boolean;
        varmap : VarMap;

        next : Evaluation;


        constructor (root : PNode) {
            this.root = root;
            this.pending = [];
            this.ready = false;
            this.stack = new execStack();
            this.varmap = new VarMap();
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
                this.varmap.put( this.pending , v);
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
            var closurePath = this.pending.concat([0]);
            var closure = <ClosureV>this.varmap.get( closurePath );
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
                    topNode.label().step( vms );
                }
                else{
                    topNode.label().select( vms );//strategy.select
                }
            }
        }



    }
}
export = evaluation;