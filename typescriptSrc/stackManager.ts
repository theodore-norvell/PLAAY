
import evaluation = require( './evaluation' ) ;
import value = require( './value') ;

module stack {

    import Evaluation = evaluation.Evaluation;
    import Value = value.Value;
    import Field = value.Field;
    import ObjectV = value.ObjectV;

    export class execStack {

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

        getField(name : String) : Field {
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
                var here = this.next.getField(name);
                return here;
            }
        }


        inStack(name : string) : boolean {
            for(var i = 0; i < this.obj.numFields(); i++){
//                if(name.match(this.obj.fields[i].getName().toString())){
                if(name == this.obj.fields[i].getName()){
                    return true;
                }
            }
            if(this.next == null){
                return false;
            }
            else{
                var here = this.next.inStack(name);
                return here;
            }
        }

    }

    export class Stack {

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

        get(p : Array<number>) : Value{
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
            }
            if(this.samePath(tmp, p)){
                return this.entries[i].getValue();
            }
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
                    var j = i;
                    for(; j < this.size; j++){
                        this.entries[j] = this.entries[j+1];//move all values down by one
                    }
                    this.entries[j] = null;//don't think this is necessary
                }
            }
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

export = stack;