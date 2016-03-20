import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import evaluation = require('./evaluation');

module value {

    import PNode = pnode.PNode;
    import Stack = stack.Stack;
    import list = collections.list;
    import List = collections.List;
    import LambdaNode = pnode.LambdaNode;
    import VMS  = vms.VMS;
    import Evaluation = evaluation.Evaluation;

    export class Field {
        name : string;
        value : Value;
        type : Type;
        isConstant : boolean;

        constructor(name : string, value : Value, type : Type, isConstant : boolean) {
            this.name = name;
            this.value = value;
            this.type = type;
            this. isConstant = isConstant;
        }

        // getters and setters
        getName() {
            return this.name;
        }

        setName(name : string) {
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

    export interface Value {
        isClosureV : () => boolean ;
        isBuiltInV : () => boolean ;
    }

    export class StringV implements Value {
        contents : string;

        constructor(val : string){
            this.contents = val;
        }

        getVal(){
            return this.contents;
        }

        setVal(val : string){
            this.contents = val;
        }
        isClosureV(){
            return false;
        }
        isBuiltInV(){
            return false;
        }
    }

    export class ObjectV implements Value {
        fields:Array<Field>;

        constructor() {
            this.fields = new Array<Field>();
        }

        public numFields():Number {
            return this.fields.length;
        }

        public addField(field:Field) {
            this.fields.push(field);
        }

        public deleteField(fieldName:string):boolean {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName()== fieldName) {
                    this.fields.splice(i, 1);
                    return true;
                }
            }
            return false;
        }

        public getField(fieldName:string):Field {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName()== fieldName) {
                    return this.fields[i];
                }
            }
            return null;
        }


        isClosureV(){
            return false;
        }
        isBuiltInV(){
            return false;
        }
    }

    export class ClosureV implements Value {
        //need function obj
        public function : LambdaNode;
        context : Stack;
        isClosureV(){
            return true;
        }
        isBuiltInV(){
        return false;
    }
    }
    export class NullV implements Value {
        isClosureV(){
            return false;
        }
        isBuiltInV(){
            return false;
        }

    }

    export class DoneV implements Value {
        isClosureV(){
            return false;
        }
        isBuiltInV(){
            return false;
        }
    }

    export class BuiltInV implements Value {
        step : (node : PNode, evalu : Evaluation) => void;

        constructor ( step : (node : PNode, evalu : Evaluation)=>void ){
            this.step = step;
        }

        isClosureV(){
            return false;
        }

        isBuiltInV(){
            return true;
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
