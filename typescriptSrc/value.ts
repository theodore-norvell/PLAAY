import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;


module value {

    import Stack = stack.Stack;
    import list = collections.list;
    import List = collections.List;

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

    }

    export class StringV extends Value {
        contents : String;
    }

    export class ObjectV extends Value {
        fields : Array<Field>;

        constructor(){
            super();
            this.fields = new Array<Field>();
        }

        addField(field : Field) {
            this.fields.push(field);
        }

        deleteField(fieldName : String) {
            for (var i = 0 ; i < this.fields.length ; i++){
                if (this.fields[i].getName().match(fieldName.toString())) {
                    this.fields.splice(i, 1);
                }
            }
        }

        getFieldValue(fieldName : String) : Value {
            for (var i = 0 ; i < this.fields.length ; i++){
                if (this.fields[i].getName().match(fieldName.toString())) {
                    return this.fields[i].getValue();
                }
            }
        }

        getFieldType(fieldName : String) : Value {
            for (var i = 0 ; i < this.fields.length ; i++){
                if (this.fields[i].getName().match(fieldName.toString())) {
                    return this.fields[i].getType();
                }
            }
        }

        getFieldisConstant(fieldName : String) : Value {
            for (var i = 0 ; i < this.fields.length ; i++){
                if (this.fields[i].getName().match(fieldName.toString())) {
                    return this.fields[i].getIsConstant();
                }
            }
        }
    }

    export class ClosureV extends Value {
        //need function obj
        context : Stack;
    }
    export class NullV extends Value {


    }

    export class DoneV extends Value {

    }

    export class BuiltInV extends Value {
        //var step : (vms : VMS) -> void;
        //constructor (  step : (vms : VMS) -> void ){
            //this.step = step;
        //}

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
