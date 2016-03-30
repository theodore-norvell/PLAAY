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
    import TurtleFields = world.TurtleFields;

    export class Evaluation {
        root : PNode;
        private stack : ExecStack;
        private pending : Array<number>;
        ready : Boolean;
        varmap : VarMap;
        private turtleFields : TurtleFields;

        next : Evaluation;

        constructor (root : PNode, obj: Array<ObjectV>, stack : ExecStack) {
            this.root = root;
            this.turtleFields = new TurtleFields();
            this.pending = new Array();
            this.ready = false;

            for (var i = 0; i < obj.length; i++){
                var stackpiece = new ExecStack(obj[i]);
                if (this.stack == null) {
                    this.stack = stackpiece;
                } else {
                    stackpiece.setNext(this.stack);
                    this.stack = stackpiece;
                }
            }

            if(stack == null){
                var evalObj = new ObjectV();
                var s = new ExecStack(evalObj);
                s.setNext(this.stack);
                this.stack = s;
            }

            else{
                if(stack.getNext() == null){
                    stack.setNext(this.stack);
                }

                else{
                    stack.getNext().setNext(this.stack);
                }
                this.stack = stack;
            }
/*

            if(obj != null){
                var st = new ExecStack(obj)
                st.setNext(this.stack.setNext());
                this.stack.setNext(st);
            }
*/

            this.varmap = new VarMap();
        }

        addToStack(){
            var evalObj = new ObjectV();
            var newstack = new ExecStack(evalObj);
            newstack.next=this.stack;
            this.stack = newstack;
        }

        popfromStack() {
            this.stack = this.stack.getNext()
        }

        getTurtleFields(){
            return this.turtleFields;
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

                var pending2 = new Array<number>();
                for (var i = 0; i < this.pending.length ; i ++){
                    pending2.push(this.pending[i]);
                }

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
            //TODO check if lambda has return type and make sure it is the same as value's type
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
                    topNode.label().step(vms);
                }
                else{
                    topNode.label().strategy.select( vms,  topNode.label()  ); //strategy.select
                }
            }
        }
    }
}
export = evaluation;