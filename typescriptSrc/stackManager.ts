
import evaluation = require( './evaluation' ) ;

module stack {

    import Evaluation = evaluation.Evaluation;

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
    export class VarMap {
        varName : String;
        varValue : String;

        getName(){
            return this.varName;
        }

        getValue(){
            return this.varValue;
        }

        setName(name : String){
            this.varName = name;
        }
        setValue(value : String){
            this.varValue = value;
        }
    }



}

export = stack;