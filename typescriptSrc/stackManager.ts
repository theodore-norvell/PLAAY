/// <reference path="evaluation.ts" />
/// <reference path="value.ts" />

import evaluation = require( './evaluation' ) ;
import value = require( './value') ;

// TODO At least rename this compilation unit to stack.
// Although we might also question why it exists at all.
module stackManager {

    import Evaluation = evaluation.Evaluation;
    import Value = value.Value;
    import Field = value.Field;
    import ObjectV = value.ObjectV;


    export class execStack { // TODO Rename as FrameStack or something.

        obj : ObjectV;
        next : execStack;

        constructor(object : ObjectV){
            this.obj = object;
            this.next = null;
        }

        setNext(stack : execStack){
            this.next = stack;
        }

        top() : ObjectV{
            return this.obj;
        }

        getNext() : execStack {
            return this.next;
        }

        //Return true if value was correctly set
        setField(name : string, val : Value) : boolean{
            for(var i = 0; i < this.obj.numFields(); i++){
                if(name == this.obj.fields[i].getName()){
                    this.obj.fields[i].setValue(val);
                    return true;
                }
            }
            if(this.next == null){
                return false;
            }
            else{
                var here = this.next.setField(name, val);
                return here;
            }

        }

        getField(name : string) : Field {
            for(var i = 0; i < this.obj.numFields(); i++){
//                if(name.match(this.obj.fields[i].getName().toString())){
                if(name == this.obj.fields[i].getName()){
                    return this.obj.fields[i];
                }
            }
            if(this.next == null){
                return null;
            }
            else{
                return this.next.getField(name);
            }
        }

        inStack(name : string) : boolean {
            for (var i = 0; i < this.obj.numFields(); i++) {
//                if(name.match(this.obj.fields[i].getName().toString())){
                if (name == this.obj.fields[i].getName()) {
                    return true;
                }
            }
            if (this.next == null) {
                return false;
            }
            else {
                return this.next.inStack(name);
            }
        }
    }

    export class Stack { // TODO rename as EvalStack or something

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

    export class VarMap {
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
}

export = stackManager ;