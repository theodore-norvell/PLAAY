/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />
/// <reference path="vms.ts" />
/// <reference path="backtracking.ts" />

import backtracking = require( './backtracking' ) ;
import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import labels = require('./labels') ;
import pnode = require('./pnode') ;
import vms = require('./vms') ;
import { TransactionManager } from './backtracking';

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


    /** A field of an object. */
    export class Field implements FieldI {
        private name : string;
        private value : Value;
        private type : Type;
        private isConstant : boolean;

        constructor(name : string, value : Value, type : Type, isConstant : boolean) {
            this.name = name;
            this.value = value;
            this.type = type;
            this. isConstant = isConstant;
        }

        // getters and setters
        public getName() : string {
            return this.name;
        }

        public setName(name : string) : void {
            this.name = name;
        }

        public getValue() : Value {
            return this.value;
        }

        public setValue(value : Value) : void {
            this.value = value;
        }

        public getType() : Type {
            return this.type;
        }

        public setType(type : Type) : void  {
            this.type = type;
        }

        public getIsConstant() : boolean {
            return this.isConstant;
        }

        public setIsConstant(isConstant :boolean) : void {
            this.isConstant = isConstant;
        }
    }

    /** A string value. */
    export class StringV implements Value {
        private contents : TVar<string>;
        private manager : TransactionManager;

        constructor(val : string, manager : TransactionManager){
            this.contents = new TVar<string>(val, manager);
            this.manager = manager;
        }

        public getVal() : string {
            return this.contents.get();
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
            return '"' +this.contents.get()+ '"' ;
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
        public addField(field:Field) : void {
            assert.checkPrecondition( ! this.hasField( field.getName()) ) ;
            this.fields.push(field);
        }

        // TODO: Do we really need to be able to
        // delete fields from an object.
        public deleteField(fieldName:string):boolean {
            for (let i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName() === fieldName) {
                    this.fields.splice(i, 1) ;
                    return true ;
                }
            }
            return false ;
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
            assert.checkPrecondition( 0 <= i && i < this.fields.length,
                                      "ObjectV.getFieldByNumber called with bad argument." ) ;
            return this.fields[i] ;
        }

        public getField(fieldName:string) : Field {
            for (let i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName( )=== fieldName) {
                    return this.fields[i];
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

        private func : PNode ;
        private context : VarStack;

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
    }

}
export = valueTypes ;