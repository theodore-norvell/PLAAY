/**
 * Created by Ryne on 24/02/2016.
 */

/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="world.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode');

module vms{

    import PNode = pnode.PNode;

    export class VMS {

        evalStack : EvalStack ;

        constructor(root : PNode, worlds: Array<ObjectI>) {
            assert.checkPrecondition( worlds.length > 0 ) ;
            var varStack = null ;
            for( let i = 0 ; i < worlds.length ; ++i ) {
                varStack = new VarStack( worlds[i], varStack ) ; }
            var evalu = new Evaluation(root, varStack);
            this.evalStack = new EvalStack();
            this.evalStack.push(evalu);
        }

        canAdvance() : boolean {
            return this.evalStack.notEmpty();
        }

        getEval() : Evaluation {
            return this.evalStack.top() ;
        }

        // TODO.  Since advance will need to 
        // call the interpreter, we should use 
        // dependence inversion to avoid 
        // circular dependence.  Instead the
        // VMS can depend on an interface that
        // the interpreter implements.
        advance(){
            if(this.canAdvance()){
                let ev = this.evalStack.top();
                assert.check( ev.getStack() != null ) ;
                
                if( ev.isDone() ) {
                    var value = ev.getValMap().get([]); //TODO get value from evaluation?
                    this.evalStack.pop() ;
                    if(this.evalStack.notEmpty()){
                        this.evalStack.top().setResult( value );
                    }
                }
                else{
                    assert.check( ev.getStack() != null ) ;
                    ev.advance(this);
                    assert.check( ev.getStack() != null ) ;
               }
            }
        }
    }

    export class Evaluation {
        // TODO root should be private
        root : PNode;
        private varStack : VarStack;
        private pending : Array<number>;
        // TODO ready should be private
        ready : Boolean;
        // TODO map should be private
        map : ValueMap;

        next : Evaluation; // TODO eliminate this field.

        constructor (root : PNode, varStack : VarStack) {
            this.root = root;
            this.pending = new Array();
            this.ready = false;
            this.varStack = varStack ;

            this.map = new ValueMap();
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

        getValMap(){
            return this.map;
        }

        getStack(){
            return this.varStack;
        }

        //setNext(next : Evaluation){
            //this.next = next;
        //}

        finishStep( v : Value ){
            if(this.pending != null && this.ready){

                var pending2 = new Array<number>();
                for (var i = 0; i < this.pending.length ; i ++){
                    pending2.push(this.pending[i]);
                }

                this.map.put( pending2 , v);
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
            var closure : Value = this.map.get( closurePath );
            assert.check( closure.isClosureV() ) ;
            var lambda = (closure as ClosureI).getLambdaNode() ;
            //TODO check if lambda has return type and make sure it is the same as value's type
            this.finishStep( value );
        }

        // setVarMap(map : ValueMap){
        //     this.map = map;
        // }


        isDone(){
            return this.pending == null; //check if pending is null
        }

        advance( vms : VMS ){
            assert.checkPrecondition( !this.isDone() ) ;

            var pending2 = Object.create(this.pending);
            var topNode = this.root.get( pending2 );
            if( this.ready ){
                assert.check( this.getStack() != null ) ;
                topNode.label().step(vms);
                assert.check( this.getStack() != null ) ;
            }
            else{
                assert.check( this.getStack() != null ) ;
                topNode.label().strategy.select( vms,  topNode.label()  ); //strategy.select
                assert.check( this.getStack() != null ) ;
            }
        }
    }


    export class ValueMap {
        size : number ;
        entries : Array<mapEntry>;

        constructor(){
            this.entries = new Array<mapEntry>();
            this.size = 0;
        }

        samePath(a : Array<number>, b : Array<number>){
            var flag = true;
            for(var p = 0; p < Math.max(a.length, b.length); p++){
                if(a[p] != b[p]){
                    flag = false;
                }
            }
            return flag;
        }

        get(p : Array<number>) : Value {
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    return this.entries[i].getValue();
                }
            }
            return null;
        }

        put(p : Array<number>, v : Value){
            var notIn = true;
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    this.entries[i].setValue(v);
                    notIn = false;
                }
            }
            if(notIn){

                var me = new mapEntry(p, v);
                this.entries.push(me);
                this.size++;
            }
        }

        remove(p : Array<number>){
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    this.size--;
                    const firstPart = this.entries.slice(0, i);
                    const lastPart = this.entries.slice(i+1, this.entries.length);
                    this.entries = firstPart.concat(lastPart);
                }
            }
            return;
        }

        inMap(p : Array<number>){
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    return true;
                }
            }
            return false;
        }
    }

    export class VarStack {

        obj : ObjectI;
        next : VarStack;

        constructor(object : ObjectI, next : VarStack ){
            this.obj = object;
            this.next = next;
        }

        top() : ObjectI {
            return this.obj;
        }

        getNext() : VarStack {
            return this.next;
        }

        //Return true if value was correctly set
        setField(name : string, val : Value) : boolean{
            if( this.obj.hasField( name ) ) {
                this.obj.getField(name).setValue( val ) ;
                return true ;
            } else if(this.next == null){
                return false;
            } else{
                return this.next.setField(name, val);
            }

        }

        getField(name : string) : FieldI {
            if( this.obj.hasField( name ) ) {
                return this.obj.getField( name ) ;
            } else if(this.next == null){
                return null;
            } else{
                return this.next.getField(name);
            }
        }

        inStack(name : string) : boolean {
            return this.obj.hasField( name ) 
                   ||  (this.next != null)
                       && this.next.inStack(name);
        }
    }

    export class EvalStack { 

        head : Evaluation;

        constructor(){
            this.head = null;
        }

        push(val : Evaluation ) {
            if (this.notEmpty()) {
                val.next = this.head;
                this.head = val;
            }
            else {
                this.head = val;
            }
        }

        pop() : Evaluation{
            var it = this.head;
            this.head = this.head.getNext();
            return it;
        }

        top() : Evaluation{
            return this.head;
        }

        public notEmpty() : boolean{
            if(this.head == null){return false;}
            else{return true;}
        }
    }

    export class mapEntry{
        path : Array<number>;
        val : Value;

        constructor (key : Array<number>, value : Value ){
            this.path = key;
            this.val = value;
        }

        getPath(){return this.path;}
        getValue(){return this.val;}
        setValue(v : Value ){this.val = v;}

    }

    export interface Value {
        isClosureV : () => boolean ;
        isBuiltInV : () => boolean ;
        isStringV : () => boolean ;
    }

    export interface ClosureI extends Value {
        getLambdaNode : () => PNode ;
    }

    export interface ObjectI extends Value {
        numFields : () => number ;
        hasField : (string) => boolean ;
        getFieldByNumber : (i:number) => FieldI ;
        getField : (fieldName:string) => FieldI ;
    }

    export interface FieldI  {
        getName : () => string ;
        getValue : () => Value ;
        setValue : ( Value ) => void ;
    }


    export enum Type {
        STRING,
        BOOL,
        NUMBER,
        ANY,
        METHOD,
        NULL
    }
}
export = vms;
