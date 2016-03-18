import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode') ;


module value {

    import Stack = stack.Stack;
    import list = collections.list;
    import List = collections.List;
    import LambdaNode = pnode.LambdaNode;

    export class Field {
        name : String;
        value : Value;
        type : Type;
        isConstant : boolean;

        constructor(name : String, value : Value, type : Type, isConstant : boolean) {
            this.name = name;
            this.value = value;
            this.type = type;
            this. isConstant = isConstant;
        }

        // getters and setters
        getName() {
            return this.name;
        }

        setName(name : String) {
            this.name = name;
        }

        getValue() {
            return this.value;
        }

        setValue(value : Value) {
            this.value = value;
        }

        getType() {
            return this.type;
        }

        setType(type : Type) {
            this.type = type;
        }

        getIsConstant() {
            return this.isConstant;
        }

        setIsConstant(isConstant :boolean) {
            this.isConstant = isConstant;
        }
    }

    export abstract class Value {
        abstract isClosureV() : boolean;
    }

    export class StringV extends Value {
        contents : String;
        isClosureV(){
            return false;
        }
    }

    export class ObjectV extends Value {
        fields : Array<Field>;

        constructor(){
            super();
            this.fields = new Array<Field>();
        }

        public numFields() : Number {
            return this.fields.length;
        }

        public addField(field : Field) {
            this.fields.push(field);
        }

        public deleteField(fieldName : String) {
            for (var i = 0 ; i < this.fields.length ; i++){
                if (this.fields[i].getName().match(fieldName.toString())) {
                    this.fields.splice(i, 1);
                }
            }
        }

        public getFieldValue(fieldName : String) : Value {
            for (var i = 0 ; i < this.fields.length ; i++){
                if (this.fields[i].getName().match(fieldName.toString())) {
                    return this.fields[i].getValue();
                }
            }
        }

        public getFieldType(fieldName : String) : Type {
            for (var i = 0 ; i < this.fields.length ; i++){
                if (this.fields[i].getName().match(fieldName.toString())) {
                    return this.fields[i].getType();
                }
            }
        }

        public getFieldisConstant(fieldName : String) : Boolean {
            for (var i = 0 ; i < this.fields.length ; i++){
                if (this.fields[i].getName().match(fieldName.toString())) {
                    return this.fields[i].getIsConstant();
                }
            }
        }

        isClosureV(){
            return false;
        }
    }

    export class ClosureV extends Value {
        //need function obj
        public function : LambdaNode;
        context : Stack;
        isClosureV(){
            return true;
        }
    }
    export class NullV extends Value {
        isClosureV(){
            return false;
        }

    }

    export class DoneV extends Value {
        isClosureV(){
            return false;
        }
    }

    export class BuiltInV extends Value {
        //var step : (vms : VMS) -> void;
        //constructor (  step : (vms : VMS) -> void ){
            //this.step = step;
        //}
        isClosureV(){
            return false;
        }
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

export = value;
