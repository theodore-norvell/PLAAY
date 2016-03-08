/**
 * Created by Jessica on 2/22/2016.
 */

import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;

module evaluation {

    import Stack = stack.Stack;
    import ExprNode = pnode.ExprNode;
    import VMS = vms.VMS;
    import VarMap = stack.VarMap;

    export class Evaluation {
        root : ExprNode;
        stack : Stack;
        //map : Map;
        pending : Array<Number>;
        ready : Boolean;

        next : Evaluation;
        varmap : VarMap;

        constructor (name : String, value : String) {
            this.varmap = new VarMap();
            this.varmap.setName(name);
            this.varmap.setValue(value);
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

        setResult(value : Evaluation ){
            this.varmap.setName(value.getVarMap().getName());
            this.varmap.setValue(value.getVarMap().getValue());
        }
        setVarMap(map : VarMap){
            this.varmap = map;
        }


        isDone(){
            return this.pending == null; //check if pending is null
        }

        advance( vms : VMS ){
            if(!this.isDone()){
                //var topNode = this.root.get( this.pending );
                if( this.ready ){
                //    topNode.getLabel().step( vms );
                }
                else{
                 //   topNode.getLabel().select( vms );
                }
            }
        }
    }
}
export = evaluation;