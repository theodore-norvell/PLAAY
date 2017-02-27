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


    /** A field of an object. */
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

    /** A string value. */
    export class StringV implements Value {
        contents : string;

        constructor(val : string){
            this.contents = val;
        }

        getVal() : string {
            return this.contents;
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

    /** An object. Objects are used both to represent stack frames and objects created from classes. */
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

        // TODO: Is there really a good reason to be
        // able to add fields to an object.
        // Maybe we should just pass a list or array of
        // fields in to the constructor.
        public addField(field:Field) {
            assert.checkPrecondition( ! this.hasField( field.getName()) )
            this.fields.push(field);
        }

        // TODO: Do we really need to be able to
        // delete fields from an object.
        public deleteField(fieldName:string):boolean {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName()== fieldName) {
                    this.fields.splice(i, 1);
                    return true;
                }
            }
            return false;
        }

        public hasField( name : string ) : boolean {
            for (let i = 0, sz=this.numFields(); i < sz; i++) {
                if (name == this.getFieldByNumber(i).getName()) {
                    return true;
                }
            }
            return false ;
        }

        public getFieldByNumber( i : number ) : Field {
            assert.checkPrecondition( 0 <= i && i < this.fields.length,
                                      "ObjectV.getFieldByNumber called with bad argument." ) ;
            return this.fields[i] ;
        }

        public getField(fieldName:string):Field {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName()== fieldName) {
                    return this.fields[i];
                }
            }
            assert.checkPrecondition( false, "ObjectV.getField called with bad argument.") ;
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

    /** Closures.  */
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

    /** Null values.  */
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

    /** The Done value. Used to indicate completion of a command. */
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

    /** A built in function. */
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