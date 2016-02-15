module stack {

    export class Stack {

        head : StackObject;

        constructor(){
            var obj = new StackObject();


        }

        push(stackobj : StackObject ) {

            var it = this.head;
            while (it.getNext() !=null){
                it.getNext();
            }

            it.setNext(stackobj);
        }

        pop() {
            var it = this.head;
            this.head = this.head.getNext();
            return it;
        }


    }

    class StackObject {
        next : StackObject;
        varmap : VarMap;

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

    class VarMap {
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