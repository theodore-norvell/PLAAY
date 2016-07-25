import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import evaluation = require('./evaluation');
import assert = require('./assert') ;

module value {

    import PNode = pnode.PNode;
    import execStack = stack.execStack;
    import list = collections.list;
    import List = collections.List;
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
        isStringV : () => boolean ;
    }

    export class StringV implements Value {
        contents : string;

        constructor(val : string){
            this.contents = val;
        }

        getVal() : string {
            return this.contents;
        }

        setVal(val : string) : void {
            this.contents = val;
        }
        isClosureV() : boolean {
            return false;
        }
        isBuiltInV() : boolean {
            return false;
        }
        isStringV() : boolean {
            return true;
        }

        toString() : string {
            return '"' +this.contents+ '"' ;
        }
    }

    export class ObjectV implements Value {
        // TODO make this private and enforce invariant
        // that no two field have the same name.
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

        public getFieldByNumber( i : number ) : Field {
            assert.check( 0 <= i && i < this.fields.length ) ;
            return this.fields[i] ;
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
        isStringV() : boolean {
            return false ;
        }

        toString() : string {
            return "object" ;
        }
    }

    export class ClosureV implements Value {

        private func : PNode ;
        private context : execStack;

        constructor( func : PNode, context : execStack ) {
            assert.check( func.label() instanceof pnode.LambdaLabel ) ;
            this.func = func ;
            this.context = context ;
        }

        getContext() : execStack {
            return this.context ;
        }

        getLambdaNode() : PNode {
            return this.func ;
        }

        isClosureV(){
            return true;
        }
        isBuiltInV(){
            return false;
         }
      
        isStringV() : boolean {
            return false ;
        }

        toString() : string {
            return "closure" ;
        }
    }

    export class NullV implements Value {
        isClosureV(){
            return false;
        }
        isBuiltInV(){
            return false;
        }
      
        isStringV() : boolean {
            return false ;
        }

        toString() : string {
            return "null" ;
        }

    }

    export class DoneV implements Value {
        isClosureV(){
            return false;
        }
        isBuiltInV(){
            return false;
        }
      
        isStringV() : boolean {
            return false ;
        }

        toString() : string {
            return "done" ;
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
      
        isStringV() : boolean {
            return false ;
        }

        toString() : string {
            return "built-in" ;
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
