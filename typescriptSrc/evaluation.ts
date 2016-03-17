/**
 * Created by Jessica on 2/22/2016.
 */

import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import value = require('./value') ;
import world = require('./world');

module evaluation {

    import ExecStack = stack.execStack;
    import PNode = pnode.PNode;
    import VMS = vms.VMS;
    import VarMap = stack.VarMap;
    import Value = value.Value;
    import ClosureV = value.ClosureV;
    import World = world.World;
    import ObjectV = value.ObjectV;

    export class Evaluation {
        root : PNode;
        private stack : ExecStack;
        private pending : Array<number>;
        ready : Boolean;
        varmap : VarMap;

        next : Evaluation;


        constructor (root : PNode, obj: ObjectV) {
            this.root = root;
            this.pending = new Array<number>();
            this.pending = [];
            this.ready = false;
            this.stack = new ExecStack(obj);
            this.varmap = new VarMap();
        }

        getRoot()
        {
            return this.root;
        }

        getNext(){
            return this.next;
        }

        getPending(){
            return this.pending;
        }

        setPending(pending : Array<number>){
            this.pending = pending;
        }

        getVarMap(){
            return this.varmap;
        }

        getStack(){
            return this.stack;
        }

        setNext(next : Evaluation){
            this.next = next;
        }

        finishStep( v : Value ){
            if(this.pending != null && this.ready){

                var pending2 = Object.create(this.pending);
                this.varmap.put( pending2 , v);
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

                var pending2 = Object.create(this.pending);
                var topNode = this.root.get( pending2 );
                if( this.ready ){
                    topNode.label().step( vms );
                }
                else{
                    topNode.label().strategy.select( vms,  topNode.label()  );//strategy.select
                }
            }
        }



    }
}
export = evaluation;