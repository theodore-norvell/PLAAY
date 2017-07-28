/**
 * Created by Ryne on 24/02/2016.
 */

/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="world.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import pnode = require('./pnode');

/** The vms module provides the types that represent the state of the
 * virtual machine.
 */
module vms{

    import PNode = pnode.PNode;

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

        private evalStack : EvalStack ;

        private interpreter : Interpreter ;

        constructor(root : PNode, worlds: Array<ObjectI>, interpreter : Interpreter) {
            assert.checkPrecondition( worlds.length > 0 ) ;
            this.interpreter = interpreter ;
            let varStack : VarStack = EmptyVarStack.theEmptyVarStack ;
            for( let i = 0 ; i < worlds.length ; ++i ) {
                varStack = new NonEmptyVarStack( worlds[i], varStack ) ; }
            const evalu = new Evaluation(root, varStack);
            this.evalStack = new EvalStack();
            this.evalStack.push(evalu);

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
                const value = ev.getVal(nil<number>()) as Value;
                this.evalStack.pop() ;
                if(this.evalStack.notEmpty()){
                    this.evalStack.top().setResult( value );
                }
            }
            else{
                ev.advance( this.interpreter, this);
            }
        }

        public reportError( message : String ) : void {
            // TODO
        }
    }

    /** An evaluation is the state of evaluation of one PLAAY expression.
     * Typically it will  be the evaluatio of one method body.
     * See the run-time model documentation for details.
     * */
    export class Evaluation {
        private root : PNode;
        private varStack : VarStack ;
        private pending : List<number> | null ;
        private ready : boolean;
        private map : ValueMap;

        constructor (root : PNode, varStack : VarStack) {
            this.root = root;
            this.pending = nil<number>() ;
            this.ready = false;
            this.varStack = varStack ;

            this.map = new ValueMap();
        }

        public getRoot() : PNode {
            return this.root ;
        }

        public isReady() : boolean {
            return this.ready ;
        }

        public setReady( newReady : boolean ) : void {
            this.ready = newReady ;
        }

        public getStack() : VarStack {
            return this.varStack;
        }

        public getPending() : List<number> {
            assert.checkPrecondition( !this.isDone() ) ;
            const p = this.pending as List<number> ;
            return p ;
        }

        public getPendingNode() : PNode {
            assert.checkPrecondition( !this.isDone() ) ;
            const p = this.pending as List<number> ;
            return this.root.get( p ) ;
        }

        public pushPending( childNum : number ) : void {
            assert.checkPrecondition( !this.isDone() ) ;
            const p = this.pending as List<number> ;
            this.pending = p.cat( list( childNum ) ) ;
        }
        
        public popPending( ) : void {
            assert.checkPrecondition( !this.isDone() ) ;
            const p = this.pending as List<number> ;
            if( p.size() === 0 ) {
                this.pending = null ;
            } else {
                this.pending = collections.butLast( p ) ; }
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
            const p = this.pending as List<number> ;
            return this.map.isMapped( collections.snoc(p, childNum ) ) ; 
        }

        /**
         * Precondition: isChildMapped( childNum )
         *   
         * @param childNum 
         */
        public getChildVal( childNum : number ) : Value {
            assert.checkPrecondition( !this.isDone() ) ;
            const p = this.pending as List<number> ;
            return this.map.get( collections.snoc(p, childNum ) ) ; 
        }

        public finishStep( value : Value ) : void {
            assert.checkPrecondition( !this.isDone() ) ;
            assert.checkPrecondition( this.ready ) ;
            const p = this.pending as List<number> ;
            this.map.put( p, value ) ;
            this.popPending() ;
            this.setReady( false ) ;
        }

        public setResult(value : Value ) : void {
            // This is used for function calls.
            assert.checkPrecondition( !this.isDone() ) ;
            assert.checkPrecondition( this.ready ) ;
            const p = this.pending as List<number> ;
            this.map.put( p, value ) ;
            // At this point, the evaluation is
            // ready and the call node is pending.
            // Thus the call is stepped a second time.
            // On the second step, the type of the
            // result should be checked.
        }

        public isDone() : boolean {
            return this.pending === null;
        }

        public advance( interpreter : Interpreter, vms : VMS ) : void {
            assert.checkPrecondition( !this.isDone() ) ;

            if( this.ready ){
                interpreter.step( vms ) ;
            }
            else{
                interpreter.select( vms ) ;
            }
        }
    }

    export class MapEntry {
        private readonly path : List<number>;
        private val : Value;

        constructor (key : List<number>, value : Value ){
            this.path = key;
            this.val = value;
        }

        public getPath() : List<number> {return this.path;}
        
        public getValue() : Value {return this.val;}
        
        public setValue( v : Value ) : void { this.val = v ; }

    }

    /** A map from paths to values.
     * Each evaluation has such a map to record the values of already evaluated nodes.
     */
    export class ValueMap {
        private size : number ;
        private entries : Array<MapEntry>;

        constructor(){
            this.entries = new Array<MapEntry>();
            this.size = 0;
        }

        private samePath(a : List<number>, b : List<number>) : boolean {
            return a.equals(b) ;
        }

        public getEntries() : Array<MapEntry> {
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

        public get(p : List<number>) : Value {
            for(let i = 0; i < this.size; i++){
                const tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    return this.entries[i].getValue();
                }
            }
            return assert.failedPrecondition(
                "ValueMap.get: Tried to get a value for an unmapped tree location.") ;
        }

        public put(p : List<number>, v : Value) : void {
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
    }

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

        private _top : ObjectI;
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
