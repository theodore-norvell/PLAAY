/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;

module valueTypes {

    import PNode = pnode.PNode ;
    import Value = vms.Value ;
    import VarStack = vms.VarStack ;
    import Evaluation = vms.Evaluation ;
    import ClosureI = vms.ClosureI ;
    import ObjectI = vms.ObjectI ;
    import FieldI = vms.FieldI ;
    import Type = vms.Type ;


    export class Field implements FieldI {
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
        getName() : string {
            return this.name;
        }

        setName(name : string) : void {
            this.name = name;
        }

        getValue() {
            return this.value;
        }

        setValue(value : Value) : void {
            this.value = value;
        }

        getType() : Type {
            return this.type;
        }

        setType(type : Type) : void  {
            this.type = type;
        }

        getIsConstant() {
            return this.isConstant;
        }

        setIsConstant(isConstant :boolean) {
            this.isConstant = isConstant;
        }
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

    export class ObjectV implements ObjectI {
        // TODO make this private and enforce invariant
        // that no two fields have the same name.
        protected fields:Array<Field>;

        constructor() {
            this.fields = new Array<Field>();
        }

        public numFields():number {
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

    export class ClosureV implements ClosureI {

        private func : PNode ;
        private context : VarStack;

        constructor( func : PNode, context : VarStack ) {
            console.log('LambdaLabel as JSON: %j', pnode.LambdaLabel ) ; //TODO Delete debug statement.
            assert.check( func.label() instanceof pnode.LambdaLabel ) ;
            this.func = func ;
            this.context = context ;
        }

        getContext() : VarStack {
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

}
export = valueTypes ;