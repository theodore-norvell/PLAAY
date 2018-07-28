/**
 * Created by Ryne on 24/02/2016.
 */

/// <reference path="assert.ts" />
/// <reference path="backtracking.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />

import assert = require( './assert' ) ;
import backtracking = require( './backtracking' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode');
import types = require('./types');

/** The vms module provides the types that represent the state of the
 * virtual machine.
 */
module vms{

    import PNode = pnode.PNode;
    import TVar = backtracking.TVar;
    import TArray = backtracking.TArray;
    import TransactionManager = backtracking.TransactionManager;
    import Type = types.TypeKind;

    import List = collections.List ;
    import nil = collections.nil ;
    import cons = collections.cons ;
    import list = collections.list ;
    import Option = collections.Option ;

    export interface Interpreter {
        step : (vms:VMS) => void ;
        select : (vms:VMS) => void ;
    }

    /** The execution state of a virtual machine.
     * 
     * The state of the machine includes
     * 
     * * An evaluation stack.
     * * a last error.
     * 
     * The states of the vms are
     * 
     * * RUNNING: In the running state,the interpreter can be advanced by by calling the advance method.
     *   You can tell if the machine is in the running state by calling `vms.canAdvance()`.
     *   The running state has three substates
     *
     *      * DONE.   In the RUNNING and DONE, the top evaluation is done and can not be advanced. Use
     *         `vms.canAdvance() && vms.isDone()`
     *         to tell if the top evaluation is done.  When the vms is in the DONE substate, an advance will
     *         pop the top evaluation off the evaluation stack.
     *      * READY.  In the RUNNING and READY state, there is a selected node, so the next advance will step that node.
     *         The machine is in the READY substate iff `vms.canAdvance() && !vms.isDone() && vms.isReady()`
     *      * NOT READY. In the RUNNING and NOT READY state, there is no selected node, so the next advance will.
     *         The machine is in the NOT READY substate iff `vms.canAdvance() && !vms.isDone() && !vms.isReady()`
     * 
     * * ERROR:  In the error state, the machine has encountered a run time error and can not advance because of that.
     *   Use `vms.hasError()` to check if the machine has encountered an error.  Use `vms.getError()` to
     *   Retrieve a string describing the error
     * 
     * * FINISHED: In the finished state. The evaluation has completely finished. If `vms.canAdvance()` an
     *   `vms.hasError()` are both false, then the machine is in the FINISHED state and the value of
     *   the last expression evaluated can be found with a call to getValue().
     */
    export class VMS {

        private readonly evalStack : EvalStack ;
        // Invariant: this.evalStack.notEmpty()
        private readonly manager : TransactionManager ;
        private readonly interpreter : Interpreter ;
        private readonly lastError : TVar<string|null> ;
        // Invariant: this.lastError.get() !== null iff this.hasError() 

        constructor(root : PNode, worlds: Array<ObjectI>, interpreter : Interpreter, manager : TransactionManager ) {
            assert.checkPrecondition( worlds.length > 0 ) ;
            this.interpreter = interpreter ;
            this.manager = manager;
            let varStack : VarStack = EmptyVarStack.theEmptyVarStack ;
            for( let i = 0 ; i < worlds.length ; ++i ) {
                varStack = new NonEmptyVarStack( worlds[i], varStack ) ;
            }
            const evalu = new Evaluation(root, varStack, this);
            this.evalStack = new EvalStack(this.manager);
            this.evalStack.push(evalu);
            this.lastError = new TVar<string|null>( null, manager ) ;
        }

//        public dump( indent : string ) : void { /*dbg*/
//            console.log( indent+"VMS" ) ; /*dbg*/
//            this.evalStack.dump( indent+"|  ") ; /*dbg*/
//        } /*dbg*/

        public getTransactionManager() : TransactionManager { //testing purposes
            return this.manager ;
        }

        public canAdvance() : boolean {
            return !this.hasError()
                 && this.evalStack.notEmpty()
                 && (this.evalStack.getSize() > 1 ||
                     ! this.evalStack.top().isDone() ) ;
        }

        public getInterpreter() : Interpreter {
            return this.interpreter ;
        }

        public getRoot() : PNode {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().getRoot() ;
        }

        public isReady() : boolean {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().isReady() ;
        }

        public setReady( newReady : boolean ) : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            this.evalStack.top().setReady( newReady ) ;
        }

        public getPending() : List<number> {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().getPending() ;
        }

        public getPendingNode() : PNode {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().getPendingNode() ;
        }

        public pushPending( childNum : number ) : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().pushPending( childNum ) ;
        }
        
        public popPending( ) : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().popPending( ) ;
        }

        public rContext() : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().rContext() ;
        }

        public lContext() : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().lContext() ;
        }

        public isRContext() : boolean {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().isRContext() ;
        }

        public getValMap() : ValueMap {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().getValMap() ;
        }

        public isMapped( path : List<number> ) : boolean {
            return this.evalStack.notEmpty() && this.evalStack.top().isMapped( path ) ;
        }
        
        public getVal( path : List<number> ) : Value {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().getVal( path ) ;
        }

        public isChildMapped( childNum : number ) : boolean {
            return this.evalStack.notEmpty()
                && this.evalStack.top().isChildMapped( childNum ) ;
        }

        public getChildVal( childNum : number ) : Value {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().getChildVal( childNum ) ;
        }

        public hasExtraInformation(  ) : boolean {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().hasExtraInformation( ) ;
        }

        public getExtraInformation( ) : {} {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().getExtraInformation( ) ;
        }

        public putExtraInformation( v : {} ) : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().putExtraInformation( v ) ;
        }

        public scrub( path : List<number> ) : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().scrub( path ) ;
        }

        public getStack() : VarStack {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().getStack() ;
        }

        public getEval() : Evaluation {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top() ;
        }

        public getEvalStack() : EvalStack {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack;
        }

        public finishStep( value : Value, fetch : boolean ) : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().finishStep( value, fetch, this ) ;
        }

        public getFinalValue( ) : Value {
            assert.checkPrecondition( this.isDone() ) ;
            return this.getVal( nil() ) ;
        }

        public isDone() : boolean {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().isDone( ) ;
        }

        public advance() : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            assert.check( this.evalStack.notEmpty() ) ;
            const ev = this.evalStack.top();
            
            if( ev.isDone() ) {
                const value = ev.getVal(nil()) ;
                this.evalStack.pop() ;
                this.finishStep( value, true ) ;
            }
            else{
                ev.advance( this.interpreter, this);
            }
        }

        public pushEvaluation(root: PNode, varStack: VarStack) : void {
          const evaluation = new Evaluation(root, varStack, this);
          this.evalStack.push(evaluation);
        }

        public reportError( message : string ) : void {
            console.log(message);
            this.lastError.set( message ) ;
        }

        public hasError( ) : boolean {
            return this.lastError.get() !== null ;
        }

        public getError( ) : string {
            assert.checkPrecondition( this.hasError() ) ;
            return this.lastError.get() as string ;
        }
    }

    export enum Context {
        L, R
    }
    /** An evaluation is the state of evaluation of one PLAAY expression.
     * Typically it will  be the evaluatio of one method body.
     * See the run-time model documentation for details.
     * */
    export class Evaluation {
        private readonly root : TVar<PNode>;
        private readonly varStack : TVar<VarStack> ;
        private readonly pending : TVar<List<number> | null> ;
        private readonly context : TVar<Context> ;
        private readonly ready : TVar<boolean>;
        private readonly map : ValueMap;
        private readonly extraInformationMap : AnyMap;

        constructor (root : PNode, varStack : VarStack, vm : VMS) {
            const manager = vm.getTransactionManager();
            this.root = new TVar<PNode>(root, manager) ;
            this.pending = new TVar<List<number> | null>(nil<number>(), manager);
            this.context = new TVar<Context>( Context.R, manager ) ;
            this.ready = new TVar<boolean>(false, manager);
            this.varStack = new TVar<VarStack>( varStack, manager ) ;
            this.map = new ValueMap(manager);
            this.extraInformationMap = new AnyMap(manager) ;
        }
        
//        public dump( indent : string ) : void { /*dbg*/
//            console.log( indent + "pending: " ) ; /*dbg*/
//            this.pending.dump( indent + "|   " ) ; /*dbg*/
//        } /*dbg*/

        public getRoot() : PNode {
            return this.root.get() ;
        }

        public isReady() : boolean {
            return this.ready.get() ;
        }

        public setReady( newReady : boolean ) : void {
            this.ready.set(newReady) ;
        }

        public lContext() : void { this.context.set( Context.L ) ; }
        
        public rContext() : void { this.context.set( Context.R ) ; }

        public isRContext() : boolean { return this.context.get() === Context.R ; }
        
        public getStack() : VarStack {
            return this.varStack.get() ;
        }

        public varStackIsEmpty( ) : boolean {
            return this.varStack.get().isEmpty() ;
        }

        public pushOntoVarStack( newFrame : ObjectI ) : void {
            const oldStack = this.varStack.get() ;
            this.varStack.set( new NonEmptyVarStack(newFrame, oldStack)) ;
        }

        public popFromVarStack(  ) : void {
            const oldStack = this.varStack.get() ;
            this.varStack.set( oldStack.getNext() ) ;
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
                this.pending.set( collections.nil<number>() ) ; }
            this.rContext() ;
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

        public hasExtraInformation( path ? : List<number> ) : boolean {
            const p : List<number>| null = typeof(path)==="undefined" ? this.pending.get() : path ;
            if( p === null ) return false ;
            return this.extraInformationMap.isMapped( p ) ; 
        }

        public getExtraInformation( path ? : List<number> ) : {} {
            const p : List<number>| null = typeof(path)==="undefined" ? this.pending.get() : path ;
            if( p === null ) return assert.failedPrecondition() ;
            assert.checkPrecondition( this.extraInformationMap.isMapped( p ) ) ;
            return this.extraInformationMap.get( p ) ; 
        }

        public putExtraInformation( v : {} ) : void {
            assert.checkPrecondition( this.pending.get() !== null ) ;
            const p = this.pending.get() as List<number> ;
            this.extraInformationMap.put( p, v ) ; 
        }

        /** Complete the step by mapping the value to the pending node and
         * then setting pending to point to the root.
         * @param value -- The value the pending node should be mapped to
         * @param fetch -- Whether the value should be fetched from if it is a
         * location and the current context is R.
         * @param vm  -- Virtual machine for error reporting.
         */
        public finishStep( value : Value, fetch : boolean, vm : VMS ) : void {
            assert.checkPrecondition( !this.isDone() ) ;
            assert.checkPrecondition( this.ready.get() ) ;
            if( fetch && value.isLocationV() && this.isRContext() ) {
                const loc = value as Location ;
                const opt = loc.getValue() ;
                if( opt.isEmpty() ) {
                    vm.reportError( "The location has no value." ) ;
                    return ;
                }
                value = opt.first() ;
            }
            const p = this.pending.get() as List<number> ;
            this.map.put( p, value ) ;
            this.popPending() ;
            this.setReady( false ) ;
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
        private val : TVar<T>;

        constructor (key : List<number>, value : T , manager : TransactionManager){
            this.path = key;
            this.val = new TVar(value, manager);
        }

        public getPath() : List<number> {return this.path;}
        
        public getValue() : T {return this.val.get();}
        
        public setValue( v : T ) : void { this.val.set(v) ; }
    }
    
    class Map< T > {
        private readonly entries : TArray<MapEntry<T>>;
        private readonly manager : TransactionManager;

        constructor(manager : TransactionManager){
            this.entries = new TArray<MapEntry<T>>(manager);
            this.manager = manager;
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

        // public getEntries() : TArray<MapEntry<T>> {
        //     return this.entries.concat();
        // }

        public isMapped(p : List<number>) : boolean {
            for(let i = 0; i < this.entries.size(); i++){
                const tmp = this.entries.get(i).getPath();
                if(this.samePath(tmp, p)) {
                    return true ;
                }
            }
            return false ;
        }
        
        public get(p : List<number>) : T {
            for(let i = 0; i < this.entries.size(); i++){
                const tmp = this.entries.get(i).getPath();
                if(this.samePath(tmp, p)){
                    return this.entries.get(i).getValue();
                }
            }
            return assert.failedPrecondition(
                "Map.get: Tried to get a value for an unmapped tree location.") ;
        }

        public put(p : List<number>, v : T) : void {
            let notIn = true;
            for(let i = 0; i < this.entries.size(); i++){
                const tmp = this.entries.get(i).getPath();
                if(this.samePath(tmp, p)){
                    this.entries.get(i).setValue(v);
                    notIn = false;
                }
            }
            if(notIn){
                const me = new MapEntry(p, v, this.manager);
                this.entries.push(me);
            }
        }

        public remove(p : List<number>) : void {
            for(let i = 0; i < this.entries.size(); i++){
                const tmp = this.entries.get(i).getPath();
                if(this.samePath(tmp, p)){
                    this.entries.cutItem(i);
                    i -= 1 ;
                }
            }
            return;
        }

        public removeAllBelow(p : List<number>) : void {
            for(let i = 0; i < this.entries.size(); i++){
                const tmp = this.entries.get(i).getPath();
                if( this.isPrefix(p, tmp) ) {
                    this.entries.cutItem(i);
                    i -= 1 ;
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
        public abstract isEmpty() : boolean ;
        public abstract getNext() : VarStack ;
        public abstract hasField(name : string) : boolean ;
        public abstract setField(name : string, val : Value) : void ;
        public abstract getField(name : string) : FieldI ;
        public abstract getAllFrames() : Array<ObjectI> ;
    }
    export class EmptyVarStack extends VarStack {
        constructor() { super() ; }

        public static readonly theEmptyVarStack = new EmptyVarStack() ;

        public isEmpty() : boolean { return true ; }

        public getNext() : VarStack {
            return assert.failedPrecondition("getNext called on EmptyVarStack") ;
        }

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

        public isEmpty() : boolean { return false ; }

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

    /** An EvalStack is simply a stack of evaluations.
     * 
     */
    export class EvalStack { 

        private readonly stk : TArray<Evaluation>;

        constructor(manager : TransactionManager){
            this.stk = new TArray<Evaluation>(manager);
        }

//        public dump( indent : string ) : void { /*dbg*/
//            console.log( indent +"EvalStack ") ; /*dbg*/
//            for( let i=0 ; i<this.stk.size() ; ++i ) { /*dbg*/
//                console.log( indent + "    Evaluation["+i+"]" ) ; /*dbg*/
//                this.stk.get(i).dump( "    | " ) ; /*dbg*/
//            } /*dbg*/
//        } /*dbg*/

        public push(evaluation : Evaluation ) : void {
            this.stk.push( evaluation ) ;
        }

        public pop() : Evaluation {
            assert.checkPrecondition( this.stk.size() > 0 ) ;
            return this.stk.pop() as Evaluation;
        }

        public top() : Evaluation{
            assert.checkPrecondition( this.stk.size() > 0 ) ;
            return this.stk.get(this.stk.size() - 1) as Evaluation;
        }

        public notEmpty() : boolean{
            return this.stk.size() !== 0 ;
        }

        public get(idx : number) : Evaluation{
            return this.stk.get(idx);
        }

        public getSize() : number{
            return this.stk.size();
        }
    }

    /** A Value is a value of the PLAAY language.
     * Concrete value classes can be found elsewhere.
     */
    export interface Value {
        getKind : () => ValueKind ;
        isClosureV : () => boolean ;
        isBuiltInV : () => boolean ;
        isStringV : () => boolean ;
        isNullV : () => boolean ;
        isObjectV : () => boolean ;
        isLocationV : () => boolean ;
        isTupleV : () => boolean ;
        isNumberV : () => boolean ;
        isBoolV : () => boolean ;
    }

    export interface Location extends Value {
        getValue : () => Option<Value> ;
    }

    export enum ValueKind {
        STRING,
        NUMBER,
        BOOL,
        NULL,
        TUPLE,
        OBJECT,
        LOCATION,
        BUILTIN,
        CLOSURE }

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
        getValue : () => Option<Value> ;
        getType : () => Type ;
        setValue : ( value : Value ) => void ;
    }

}
export = vms;
