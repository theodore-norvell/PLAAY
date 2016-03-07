
import evaluation = require( './evaluation' ) ;
import value = require( './value')
import math = require('./math');

module stack {

    import Evaluation = evaluation.Evaluation;
    import Value = value.Value;

    export class Stack {

        head : Evaluation;

        constructor(){
            this.head = new Evaluation(null, null);
        }

        push(val : Evaluation ) {
            val.next = this.head;
            this.head = val;
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

 /*   export class StackObject {
        next : StackObject;
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

        setNext(next : StackObject){
            this.next = next;
        }
        setVarMap(map : VarMap){
            this.varmap = map;
        }
    }
*/

    export class mapEntry{
        path : Array<Number>;
        val : Value;

        constructor (key : Array<Number>, value : Value ){
            this.path = key;
            this.val = value;
        }

        getPath(){return this.path;}
        getValue(){return this.val;}
        setValue(v : Value ){this.val = v;}


    }

    export class VarMap {
        size : Number ;
        entries : Array<mapEntry>;

        samePath(a : Array<Number>, b : Array<Number>){
            var flag = true;
            for(var p = 0; p < Math.max(a.length, b.length); p++){
                if(a[p] != b[p]){
                    flag = false;
                }
            }
            return flag;
        }

        get(p : Array<Number>){
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
            }
            if(this.samePath(tmp, p)){
                return this.entries[i].getValue();
            }
        }

        put(p : Array<Number>, v : Value){
            var notIn = true;
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    this.entries[i].setValue(v);
                    notIn = false;
                }
            }
            if(notIn){
//                this.entries[this.size++] = new mapEntry(p, v); //would this go out of bounds for the array?
                this.entries.push(new mapEntry(p, v));
                this.size++;
            }
        }

        remove(p : Array<Number>){
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    this.size--;
                    var j = i;
                    for(; j < this.size; j++){
                        this.entries[j] = this.entries[j+1];//move all values down by one
                    }
                    this.entries[j] = null;//don't think this is necessary
                }
            }
        }

        inMap(p : Array<Number>){
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

export = stack;