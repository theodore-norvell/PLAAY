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
        private readonly manager : TransactionManager ;
        private readonly name : string;
        private readonly value : TVar<Value>;
        private readonly type : Type;
        private readonly isConstant : boolean;
        private readonly isDeclared : TVar<boolean> ;

        constructor(name : string, initialValue : Value, type : Type, isConstant : boolean, isDeclared : boolean, manager : TransactionManager) {
            this.manager = manager ;
            this.name = name;
            this.value = new TVar<Value>( initialValue, manager ) ;
            this.type = type;
            this. isConstant = isConstant;
            this.isDeclared = new TVar<boolean>( isDeclared, manager ) ;
        }

        // getters and setters
        public getName() : string {
            return this.name;
        }

        public getValue() : Value {
            return this.value.get();
        }

        public setValue(value : Value) : void {
            this.value.set( value ) ;
        }

        public getType() : Type {
            return this.type;
        }

        public getIsConstant() : boolean {
            return this.isConstant;
        }

        public getIsDeclared() : boolean {
            return this.isDeclared.get() ;
        }

        public setIsDeclared() : void {
            this.isDeclared.set(true) ;
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

        public toString() : string {
            return '"' +this.contents+ '"' ;
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

        public isClosureV() : boolean {
            return false;
        }

        public isBuiltInV() : boolean {
            return false;
        }

        public isStringV() : boolean {
            return false ;
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

        public toString() : string {
            return "null" ;
        }

        public static  readonly theNullValue = new NullV() ;
    }

    /** The Done value. Used to indicate completion of a command. */
    export class DoneV implements Value {
        public isClosureV() : boolean {
            return false;
        }

        public isBuiltInV() : boolean {
            return false;
        }
      
        public isStringV() : boolean {
            return false ;
        }

        public toString() : string {
            return "done" ;
        }

        public static  readonly theDoneValue = new DoneV() ;
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

        public toString() : string {
            return "built-in" ;
        }

        public getStepper() : (vms: VMS, args: Array<Value>) => void {
          return this.stepper;
        }
    }

}
export = valueTypes ;