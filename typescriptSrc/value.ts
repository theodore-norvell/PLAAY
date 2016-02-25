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

    abstract class Value {


    }

    export class StringV extends Value {
        contents : String;
    }

    export class ObjectV extends Value {
        fields : (  ...args : Array<Field> ) => List<Field> = list;

        addField() {

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
