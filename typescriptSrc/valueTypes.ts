/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />
/// <reference path="backtracking.ts" />

import assert = require( './assert' ) ;
import backtracking = require( './backtracking' ) ;
import collections = require( './collections' ) ;
import labels = require('./labels') ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;

/** Value types provides classes that represent the values of Plaay programs
 * at runtime.
 */
module valueTypes {

    import Option = collections.Option ;
    import none = collections.none ;
    import some = collections.some ;
    import PNode = pnode.PNode ;
    import Value = vms.Value ;
    import VarStack = vms.VarStack ;
    import Evaluation = vms.Evaluation ;
    import ClosureI = vms.ClosureI ;
    import ObjectI = vms.ObjectI ;
    import FieldI = vms.FieldI ;
    import Type = vms.Type ;
    import VMS = vms.VMS;
    import TVar = backtracking.TVar ;
    import TArray = backtracking.TArray ;
    import TransactionManager = backtracking.TransactionManager ;


    /** A field of an object. */
    export class Field implements FieldI {
        private readonly name : string;
        private readonly value : TVar<Option<Value>>;
        private readonly type : Type;

        constructor(name : string, type : Type, manager : TransactionManager, value? : Value) {
            this.name = name;
            if( value === undefined ) {
                this.value = new TVar<Option<Value>>( none(), manager ) ; }
            else {
                this.value = new TVar<Option<Value>>( some( value), manager ) ; }
            this.type = type;
        }

        // getters and setters
        public getName() : string {
            return this.name;
        }

        public getValue() : Option<Value> {
            return this.value.get();
        }

        public setValue(value : Value) : void {
            assert.checkPrecondition( this.value.get().isEmpty() ) ;
            this.value.set( some(value) ) ;
        }

        public getType() : Type {
            return this.type;
        }
    }

    /** A string value. */
    export class StringV implements Value {
        private readonly contents : string;

        constructor(val : string){
            this.contents = val ;
        }

        public getVal() : string {
            return this.contents;
        }

        public isClosureV() : boolean {
            return false;
        }

        public isBuiltInV() : boolean {
            return false;
        }

        public isStringV() : boolean {
            return true;
        }

        public isNumberV() : boolean {
            return false;
        }

        public isBoolV() : boolean {
            return false;
        }

        public isTupleV() : boolean {
            return false;
        }

        public isObjectV() : boolean {
            return false;
        }

        public isNullV() : boolean {
            return false;
        }

        public toString() : string {
            return '"' +this.contents+ '"' ;
        }
    }

    /** A number value. */
    export class NumberV implements Value {
        private readonly contents : number;

        constructor(val : number) {
            this.contents = val;
        }

        public getVal() : number {
            return this.contents;
        }

        public canConvertToNumber() :boolean {
           let val = this.getVal();
           return /^([0-9, ]+(\.[0-9, ]*)?|\.[0-9, ]+)$/.test(val.toString()) ;
        }

        public converToNumber() : number {
            let num = this.getVal();
            assert.check( ! isNaN( num ) ) ;
            return num ;
        }
        

        public isNumberV() : boolean {
            return true;
        }

        public isBoolV() : boolean {
            return false;
        }

        public isClosureV() : boolean {
            return false;
        }

        public isBuiltInV() : boolean {
            return false;
        }

        public isStringV() : boolean {
            return false;
        }

        public isTupleV() : boolean {
            return false;
        }

        public isObjectV() : boolean {
            return false;
        }

        public isNullV() : boolean {
            return false;
        }

        public toString() : string {
            return this.contents.toString() ;
        }
    }

    /** A boolean value. */
    export class BoolV implements Value {
        private readonly contents : boolean;
        public static trueValue : BoolV = new BoolV(true);
        public static falseValue : BoolV = new BoolV(false);

        private constructor(val : boolean) {
            this.contents = val;    
        }

        public static getVal(val : boolean) : BoolV {
            if ( val ) {
                return this.trueValue;
            }
            else {
                return this.falseValue;
            }
        }

        public getVal() : boolean {
            return this.contents;
        }

        public isNumberV() : boolean {
            return false;
        }

        public isBoolV() : boolean {
            return true;
        }

        public isClosureV() : boolean {
            return false;
        }

        public isBuiltInV() : boolean {
            return false;
        }

        public isStringV() : boolean {
            return false;
        }

        public isTupleV() : boolean {
            return false;
        }

        public isObjectV() : boolean {
            return false;
        }

        public isNullV() : boolean {
            return false;
        }

        public toString() : string {
            return this.contents.toString() ;
        }
    }



    /** An object. Objects are used both to represent stack frames and objects created from classes. */
    export class ObjectV implements ObjectI {

        protected readonly fields:TArray<Field> ;

        constructor(manager : TransactionManager) {
            this.fields = new TArray( manager ) ;
        }

        public numFields():number {
            return this.fields.size() ;
        }

        public addField(field:Field) : void {
            assert.checkPrecondition( ! this.hasField( field.getName()) ) ;
            this.fields.push( field ) ;
        }

        public hasField( name : string ) : boolean {
            for (let i = 0, sz=this.numFields(); i < sz; i++) {
                if (name === this.getFieldByNumber(i).getName()) {
                    return true;
                }
            }
            return false ;
        }

        public getFieldByNumber( i : number ) : Field {
            return this.fields.get(i) ;
        }

        public getField(fieldName:string) : Field {
            for (let i = 0, sz=this.fields.size(); i < sz; i++) {
                const f = this.fields.get(i) ;
                if (f.getName( ) === fieldName) {
                    return f;
                }
            }
            return assert.failedPrecondition( "ObjectV.getField called with bad argument.") ;
        }

        public popField() : void {
          assert.checkPrecondition(this.fields.size() > 0);
          this.fields.pop();
        }

        public isClosureV() : boolean {
            return false;
        }

        public isBuiltInV() : boolean {
            return false;
        }

        public isStringV() : boolean {
            return false ;
        }

        public isNumberV() : boolean {
            return false;
        }

        public isBoolV() : boolean {
            return false;
        }

        public isTupleV() : boolean {
            return false;
        }

        public isObjectV() : boolean {
            return true;
        }

        public isNullV() : boolean {
            return false;
        }

        public toString() : string {
            return "object" ;
        }
    }

    /** Closures.  */
    export class ClosureV implements ClosureI {

        private readonly func : PNode ;
        private readonly context : VarStack;

        constructor( func : PNode, context : VarStack ) {
            assert.check( func.label() instanceof labels.LambdaLabel ) ;
            this.func = func ;
            this.context = context ;
        }

        public getContext() : VarStack {
            return this.context ;
        }

        public getLambdaNode() : PNode {
            return this.func ;
        }

        public isClosureV() : boolean {
            return true;
        }

        public isBuiltInV() : boolean {
            return false;
         }
      
        public isStringV() : boolean {
            return false ;
        }

        public isNumberV() : boolean {
            return false;
        }

        public isBoolV() : boolean {
            return false;
        }

        public isTupleV() : boolean {
            return false;
        }

        public isObjectV() : boolean {
            return false;
        }

        public isNullV() : boolean {
            return false;
        }

        public toString() : string {
            return "closure" ;
        }
    }

    /** Null values.  */
    export class NullV implements Value {
        public isClosureV() : boolean {
            return false;
        }

        public isBuiltInV() : boolean {
            return false;
        }
      
        public isStringV() : boolean {
            return false ;
        }

        public isNumberV() : boolean {
            return false;
        }

        public isBoolV() : boolean {
            return false;
        }

        public isTupleV() : boolean {
            return false;
        }

        public isObjectV() : boolean {
            return false;
        }

        public isNullV() : boolean {
            return true;
        }

        public toString() : string {
            return "null" ;
        }

        private constructor() {

        }

        public static  readonly theNullValue = new NullV() ;
    }

    /** The Tuple value */
    export class TupleV implements Value {

        private readonly values : Array<Value>;

        private constructor(vals : Array<Value>) {
            if(vals.length > 0 ) {
                this.values = vals.slice(0,vals.length);
            }
            else {
                this.values = vals.slice(0,vals.length);
                return TupleV.theDoneValue;
            }
        }

        public static createTuple(vals : Array<Value>) : TupleV {
            assert.checkPrecondition(vals.length !== 1,"Cannot create tuple with one element.");
            return new TupleV(vals); 
        }

        public numFields():number {
            return this.values.length;
        } 

        public getValueByIndex(index : number) : Value {
            return this.values[index];
        }
  
        public isClosureV() : boolean {
            return false;
        }

        public isBuiltInV() : boolean {
            return false;
        }
      
        public isStringV() : boolean {
            return false ;
        }

        public isNumberV() : boolean {
            return false;
        }
        
        public isBoolV() : boolean {
            return false;
        }

        public isTupleV() : boolean {
            return true;
        }

        public isObjectV() : boolean {
            return false;
        }

        public isNullV() : boolean {
            return false;
        }

        public toString() : string {
            return "done" ;
        }

        public static  readonly theDoneValue = new TupleV(new Array<Value>(0)) ;
    }

    /** A built in function. */
    export class BuiltInV implements Value {
        private stepper : (vms : vms.VMS, args : Array<Value> ) => void;

        constructor ( step : (vms : vms.VMS, args : Array<Value> ) => void ){
            this.stepper = step;
        }

        public isClosureV() : boolean {
            return false;
        }

        public isBuiltInV() : boolean {
            return true;
        }
      
        public isStringV() : boolean {
            return false ;
        }

        public isNumberV() : boolean {
            return false;
        }

        public isBoolV() : boolean {
            return false;
        }

        public isTupleV() : boolean {
            return false;
        }

        public isObjectV() : boolean {
            return false;
        }

        public isNullV() : boolean {
            return false;
        }

        public toString() : string {
            return "built-in" ;
        }

        public getStepper() : (vms: VMS, args: Array<Value>) => void {
          return this.stepper;
        }
    }

}
export = valueTypes ;