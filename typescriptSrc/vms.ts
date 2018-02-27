/**
 * Created by Ryne on 24/02/2016.
 */

/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="world.ts" />
/// <reference path="backtracking.ts" />

import assert = require( './assert' ) ;
import backtracking = require( './backtracking' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode');
import {Field, ObjectV} from "./valueTypes";

/** The vms module provides the types that represent the state of the
 * virtual machine.
 */
module vms{

    import PNode = pnode.PNode;
    import TVar = backtracking.TVar;
    import TransactionManager = backtracking.TransactionManager;

    import List = collections.List ;
    import nil = collections.nil ;
    import cons = collections.cons ;
    import list = collections.list ;

    export interface Interpreter {
        step : (vms:VMS) => void ;
        select : (vms:VMS) => void ;
    }

    /** The execution state of a virtual machine.
     * 
     * The state of the machine includes
     * 
     * * An evaluation stack.
     */
    export class VMS {

        private readonly evalStack : EvalStack ;

        private readonly manager : TransactionManager ;

        private readonly interpreter : Interpreter ;

        constructor(root : PNode, worlds: Array<ObjectI>, interpreter : Interpreter) {
            assert.checkPrecondition( worlds.length > 0 ) ;
            this.interpreter = interpreter ;
            this.manager = new TransactionManager();
            let varStack : VarStack = EmptyVarStack.theEmptyVarStack ;
            for( let i = 0 ; i < worlds.length ; ++i ) {
                varStack = new NonEmptyVarStack( worlds[i], varStack ) ;
            }
            varStack = new DynamicNonEmptyVarStack(new ObjectV(), varStack);
            const evalu = new Evaluation(root, varStack, this);
            this.evalStack = new EvalStack();
            this.evalStack.push(evalu);
        }

        public getTransactionManager() : TransactionManager { //testing purposes
            return this.manager ;
        }

        public canAdvance() : boolean {
            return this.evalStack.notEmpty();
        }

        public getInterpreter() : Interpreter {
            return this.interpreter ;
        }

        public getRoot() : PNode {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getRoot() ;
        }

        public isReady() : boolean {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().isReady() ;
        }

        public setReady( newReady : boolean ) : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            this.evalStack.top().setReady( newReady ) ;
        }

        public getPending() : List<number> {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getPending() ;
        }

        public getPendingNode() : PNode {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getPendingNode() ;
        }

        public pushPending( childNum : number ) : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            this.evalStack.top().pushPending( childNum ) ;
        }
        
        public popPending( ) : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            this.evalStack.top().popPending( ) ;
        }

        public getValMap() : ValueMap {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getValMap() ;
        }

        public isMapped( path : List<number> ) : boolean {
            return this.canAdvance() && this.evalStack.top().isMapped( path ) ;
        }
        
        public getVal( path : List<number> ) : Value {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getVal( path ) ;
        }

        public isChildMapped( childNum : number ) : boolean {
            return this.canAdvance()
                && this.evalStack.top().isChildMapped( childNum ) ;
        }

        public getChildVal( childNum : number ) : Value {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getChildVal( childNum ) ;
        }

        public hasExtraInformation(  ) : boolean {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().hasExtraInformation( ) ;
        }

        public getExtraInformation( ) : {} {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getExtraInformation( ) ;
        }

        public putExtraInformation( v : {} ) : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            this.evalStack.top().putExtraInformation( v ) ;
        }

        public scrub( path : List<number> ) : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            this.evalStack.top().scrub( path ) ;
        }

        public getStack() : VarStack {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getStack() ;
        }

        public getEval() : Evaluation {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top() ;
        }

        public finishStep( value : Value ) : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().finishStep( value ) ;
        }

        public setResult(value : Value ) : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().setResult( value ) ;
        }

        public isDone() : boolean {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().isDone( ) ;
        }

        public advance() : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            const ev = this.evalStack.top();
            
            if( ev.isDone() ) {
                const value = ev.getVal(nil()) ;
                this.evalStack.pop() ;
                if(this.evalStack.notEmpty()){
                    this.evalStack.top().setResult( value );
                }
            }
            else{
                ev.advance( this.interpreter, this);
            }
        }

        public addVariable(name : string, value : Value, type : Type, isConstant : boolean) : void {
            let currentStack : VarStack = this.evalStack.top().getStack();
            //find the dynamic variable stack
            while (!(currentStack instanceof DynamicNonEmptyVarStack) && currentStack instanceof NonEmptyVarStack) {
                currentStack = (<NonEmptyVarStack> currentStack).getNext();
            }
            //end result should be either the empty stack or the dynamic stack
            assert.check(currentStack instanceof DynamicNonEmptyVarStack, "No dynamic variable stack exists, cannot declare a variable!");
            (<DynamicNonEmptyVarStack> currentStack).addField(name, value, type, isConstant);

        }

        public updateVariable(name: string, value: Value) {
            const stack : VarStack = this.evalStack.top().getStack();
            if (stack.hasField(name)) {
                stack.setField(name, value);
            }
            else {
                assert.failedPrecondition("No variable with name " + name + " exists.");
            }
        }

        public reportError( message : String ) : void {
            console.log(message);
        }
    }

    /** An evaluation is the state of evaluation of one PLAAY expression.
     * Typically it will  be the evaluatio of one method body.
     * See the run-time model documentation for details.
     * */
    export class Evaluation {
        private readonly root : TVar<PNode>;
        private readonly varStack : VarStack ;
        private readonly pending : TVar<List<number> | null> ;
        private readonly ready : TVar<boolean>;
        private readonly map : ValueMap;
        private readonly extraInformationMap : AnyMap;

        constructor (root : PNode, varStack : VarStack, vm : VMS) {
            const manager = vm.getTransactionManager();
            this.root = new TVar<PNode>(root, manager) ;
            this.pending = new TVar<List<number> | null>(nil<number>(), manager);
            this.ready = new TVar<boolean>(false, manager);
            this.varStack = varStack ;
            this.map = new ValueMap();
            this.extraInformationMap = new AnyMap() ;
        }

        public getRoot() : PNode {
            return this.root.get() ;
        }

        public isReady() : boolean {
            return this.ready.get() ;
        }

        public setReady( newReady : boolean ) : void {
            this.ready.set(newReady) ;
        }

        public getStack() : VarStack {
            return this.varStack ;
        }

        public getPending() : List<number> {
            assert.checkPrecondition( !this.isDone() ) ;
            const p = this.pending.get() as List<number> ;
            return p ;
        }

        public getPendingNode() : PNode {
            assert.checkPrecondition( !this.isDone() ) ;
            const p = this.pending.get() as List<number> ;
            return this.root.get().get(p) ;
        }

        public pushPending( childNum : number ) : void {
            assert.checkPrecondition( !this.isDone() ) ;
            const p = this.pending.get() as List<number> ;
            this.pending.set( p.cat( list( childNum ) ) ) ;
        }
        
        public popPending( ) : void {
            assert.checkPrecondition( !this.isDone() ) ;
            const p = this.pending.get() as List<number> ;
            if( p.size() === 0 ) {
                this.pending.set( null ) ;
            } else {
                this.pending.set( collections.butLast( p ) ) ; }
        }

        public scrub( path : List<number> ) : void {
            this.map.removeAllBelow( path ) ;
            this.extraInformationMap.removeAllBelow( path ) ;
        }

        public getValMap( ) : ValueMap {
            return this.map ; 
        }

        /** Is the path associated with a value in this evaluation.
         * 
         * @param path 
         */
        public isMapped( path : List<number> ) : boolean {
            return this.map.isMapped( path ) ;
        }

        /** 
         * Precondition isMapped( path )
         * 
         * @param path 
         */
        public getVal( path : List<number> ) : Value {
            return this.map.get( path ) ; 
        }

        public isChildMapped( childNum : number ) : boolean {
            if( this.isDone() ) return false ;
            const p = this.pending.get() as List<number> ;
            return this.map.isMapped( collections.snoc(p, childNum ) ) ; 
        }

        /**
         * Precondition: isChildMapped( childNum )
         *   
         * @param childNum 
         */
        public getChildVal( childNum : number ) : Value {
            assert.checkPrecondition( !this.isDone() ) ;
            const p = this.pending.get() as List<number> ;
            return this.map.get( collections.snoc(p, childNum ) ) ; 
        }

        public hasExtraInformation(  ) : boolean {
            if( this.pending.get() === null ) return false ;
            const p = this.pending.get() as List<number> ;
            return this.extraInformationMap.isMapped( p ) ; 
        }

        public getExtraInformation( ) : {} {
            assert.checkPrecondition( this.pending.get() !== null ) ;
            const p = this.pending.get() as List<number> ;
            return this.extraInformationMap.get( p ) ; 
        }

        public putExtraInformation( v : {} ) : void {
            assert.checkPrecondition( this.pending.get() !== null ) ;
            const p = this.pending.get() as List<number> ;
            this.extraInformationMap.put( p, v ) ; 
        }

        public finishStep( value : Value ) : void {
            assert.checkPrecondition( !this.isDone() ) ;
            assert.checkPrecondition( this.ready.get() ) ;
            const p = this.pending.get() as List<number> ;
            this.map.put( p, value ) ;
            this.popPending() ;
            this.setReady( false ) ;
        }

        public setResult(value : Value ) : void {
            // This is used for function calls.
            assert.checkPrecondition( !this.isDone() ) ;
            assert.checkPrecondition( this.ready.get() ) ;
            const p = this.pending.get() as List<number> ;
            this.map.put( p, value ) ;
            // At this point, the evaluation is
            // ready and the call node is pending.
            // Thus the call is stepped a second time.
            // On the second step, the type of the
            // result should be checked.
        }

        public isDone() : boolean {
            return this.pending.get() === null;
        }

        public advance( interpreter : Interpreter, vm : VMS ) : void {
            assert.checkPrecondition( !this.isDone() ) ;

            if( this.ready.get() ){
                interpreter.step( vm ) ;
            }
            else{
                interpreter.select( vm ) ;
            }
        }
    }

    export class MapEntry<T> {
        private readonly path : List<number>;
        private val : T;

        constructor (key : List<number>, value : T ){
            this.path = key;
            this.val = value;
        }

        public getPath() : List<number> {return this.path;}
        
        public getValue() : T {return this.val;}
        
        public setValue( v : T ) : void { this.val = v ; }
    }
    
    class Map<T> {
        private size : number ;
        private entries : Array<MapEntry<T>>;

        constructor(){
            this.entries = new Array<MapEntry<T>>();
            this.size = 0;
        }

        private samePath(a : List<number>, b : List<number>) : boolean {
            return a.equals(b) ;
        }

        private isPrefix(a : List<number>, b : List<number>) : boolean {
            while( ! a.isEmpty() ) {
                if( b.isEmpty() ) return false ;
                if( a.first() !== b.first() ) return false ;
                a = a.rest() ;
                b = b.rest() ;
            }
            return true ;
        }

        public getEntries() : Array<MapEntry<T>> {
            return this.entries.concat() ;
        }

        public isMapped(p : List<number>) : boolean {
            for(let i = 0; i < this.size; i++){
                const tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    return true ;
                }
            }
            return false ;
        }

        public get(p : List<number>) : T {
            for(let i = 0; i < this.size; i++){
                const tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    return this.entries[i].getValue();
                }
            }
            return assert.failedPrecondition(
                "Map.get: Tried to get a value for an unmapped tree location.") ;
        }

        public put(p : List<number>, v : T) : void {
            let notIn = true;
            for(let i = 0; i < this.size; i++){
                const tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    this.entries[i].setValue(v);
                    notIn = false;
                }
            }
            if(notIn){
                const me = new MapEntry(p, v);
                this.entries.push(me);
                this.size++;
            }
        }

        public remove(p : List<number>) : void {
            for(let i = 0; i < this.size; i++){
                const tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    this.size--;
                    const firstPart = this.entries.slice(0, i);
                    const lastPart = this.entries.slice(i+1, this.entries.length);
                    this.entries = firstPart.concat(lastPart);
                }
            }
            return;
        }

        public removeAllBelow(p : List<number>) : void {
            for(let i = 0; i < this.size; i++){
                const tmp = this.entries[i].getPath();
                if( this.isPrefix(p, tmp) ) {
                    this.size--;
                    const firstPart = this.entries.slice(0, i);
                    const lastPart = this.entries.slice(i+1, this.entries.length);
                    this.entries = firstPart.concat(lastPart);
                }
            }
            return;
        }
    }

    /** A map from paths to values.
     * Each evaluation has such a map to record the values of already evaluated nodes.
     */
    export class ValueMap extends Map<Value> {}

    class AnyMap extends Map<{}> {} 

    /* A VarStack is the context for expression evaluation. I.e. it is where
    * variables are looked up.  See the run-time model for more detail.
    */
    export abstract class VarStack {
        public abstract hasField(name : string) : boolean ;
        public abstract setField(name : string, val : Value) : void ;
        public abstract getField(name : string) : FieldI ;
        public abstract getAllFrames() : Array<ObjectI> ;
    }
    export class EmptyVarStack extends VarStack {
        constructor() { super() ; }

        public static readonly theEmptyVarStack = new EmptyVarStack() ;

        public hasField(name : string) : boolean {
            return false ;
        }
        
        public setField(name : string, val : Value) : void {
            return assert.failedPrecondition(
                "VarStack.setField: Tried to set field that does not exist.") ;
        }

        public getField(name : string) : FieldI {
            return assert.failedPrecondition(
                "VarStack.getField: Tried to get field that does not exist.") ;
        }

        public getAllFrames() : Array<ObjectI> {
            return [] ;
        }
    }

    export class NonEmptyVarStack extends VarStack {

        protected _top : ObjectI;
        private _next : VarStack;

        constructor(object : ObjectI, next : VarStack ) {
            super() ;
            this._top = object;
            this._next = next;
        }

        // TODO Is this ever used?
        public getTop() : ObjectI {
            return this._top;
        }

        public getNext() : VarStack {
            return this._next;
        }

        //Return true if value was correctly set
        public setField(name : string, val : Value) : void {
            if( this._top.hasField( name ) ) {
                this._top.getField(name).setValue( val ) ;
            } else {
                this._next.setField(name, val);
            }

        }

        public hasField(name : string) : boolean {
            return this._top.hasField( name ) || this._next.hasField( name ) ;
        }

        public getField(name : string) : FieldI {
            if( this._top.hasField( name ) ) {
                return this._top.getField( name ) ;
            } else{
                return this._next.getField(name);
            }
        }

        public getAllFrames() : Array<ObjectI> {
            return [this._top].concat( this._next.getAllFrames() ) ;
        }
    }

    //extension of a non empty var stack that has an add field method
    export class DynamicNonEmptyVarStack extends NonEmptyVarStack {
        constructor(object : ObjectI, next : VarStack){
            super(object, next);
        }

        //only add if it isn't there
        public addField(name : string, val : Value, type : Type, isConstant : boolean) : void {
            if (!this._top.hasField(name) && this._top instanceof ObjectV) {
                (<ObjectV> this._top).addField(new Field(name, val, type, isConstant));
            }
            else {
                assert.failedPrecondition("Cannot declare an already existing variable.");
            }
        }
    }

    /** An EvalStack is simply a stack of evaluations.
     * 
     */
    export class EvalStack { 

        private readonly stk : Array<Evaluation> = [] ;

        constructor(){
        }

        public push(evaluation : Evaluation ) : void {
            this.stk.push( evaluation ) ;
        }

        public pop() : Evaluation {
            assert.checkPrecondition( this.stk.length > 0 ) ;
            return this.stk.pop() as Evaluation;
        }

        public top() : Evaluation{
            assert.checkPrecondition( this.stk.length > 0 ) ;
            return this.stk[ this.stk.length - 1 ] ;
        }

        public notEmpty() : boolean{
            return this.stk.length !== 0 ;
        }
    }

    /** A Value is a value of the PLAAY language.
     * Concrete value classes can be found elsewhere.
     */
    export interface Value {
        isClosureV : () => boolean ;
        isBuiltInV : () => boolean ;
        isStringV : () => boolean ;
    }

    export interface ClosureI extends Value {
        getLambdaNode : () => PNode ;
    }

    export interface ObjectI extends Value {
        numFields : () => number ;
        hasField : (name:string) => boolean ;
        getFieldByNumber : (i:number) => FieldI ;
        /**
         * Get Field by name
         * Precondition: hasField( name ) ;
         */
        getField : (name:string) => FieldI ;
    }

    export interface FieldI  {
        getName : () => string ;
        getValue : () => Value ;
        setValue : ( value : Value ) => void ;
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
export = vms;
