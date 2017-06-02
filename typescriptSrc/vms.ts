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
            var varStack = null ;
            for( let i = 0 ; i < worlds.length ; ++i ) {
                varStack = new VarStack( worlds[i], varStack ) ; }
            var evalu = new Evaluation(root, varStack);
            this.evalStack = new EvalStack();
            this.evalStack.push(evalu);

        }

        canAdvance() : boolean {
            return this.evalStack.notEmpty();
        }

        getInterpreter() : Interpreter {
            return this.interpreter ;
        }

        getRoot() : PNode {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getRoot() ;
        }

        isReady() : boolean {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().isReady() ;
        }

        setReady( newReady : boolean ) : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            this.evalStack.top().setReady( newReady ) ;
        }

        getPending() : List<number> {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getPending() ;
        }

        getPendingNode() : PNode {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getPendingNode() ;
        }

        pushPending( childNum : number ) : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            this.evalStack.top().pushPending( childNum ) ;
        }
        
        popPending( ) : void {
            assert.checkPrecondition( this.canAdvance() ) ;
            this.evalStack.top().popPending( ) ;
        }

        getValMap() : ValueMap {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getValMap() ;
        }
        
        getVal( path : List<number> ) : Value {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getVal( path ) ;
        }

        getChildVal( childNum : number ) : Value {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getChildVal( childNum ) ;
        }

        getStack() : VarStack {
            assert.checkPrecondition( this.canAdvance() ) ;
            return this.evalStack.top().getStack() ;
        }

        getEval() : Evaluation {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top() ;
        }

        finishStep( value : Value ) : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().finishStep( value ) ;
        }

        setResult(value : Value ) : void {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            this.evalStack.top().setResult( value ) ;
        }

        isDone() : boolean {
            assert.checkPrecondition( this.evalStack.notEmpty() ) ;
            return this.evalStack.top().isDone( ) ;
        }

        advance(){
            assert.checkPrecondition( this.canAdvance() ) ;
            let ev = this.evalStack.top();
            assert.check( ev.getStack() != null ) ;
            
            if( ev.isDone() ) {
                var value = ev.getVal(nil<number>());
                this.evalStack.pop() ;
                if(this.evalStack.notEmpty()){
                    this.evalStack.top().setResult( value );
                }
            }
            else{
                assert.check( ev.getStack() != null ) ;
                ev.advance( this.interpreter, this);
                assert.check( ev.getStack() != null ) ;
            }
        }

        reportError( message : String ) {
            // TODO
        }
    }

    /** An evaluation is the state of evaluation of one PLAAY expression.
     * Typically it will  be the evaluatio of one method body.
     * See the run-time model documentation for details.
     * */
    export class Evaluation {
        private root : PNode;
        private varStack : VarStack;
        private pending : List<number>;
        private ready : boolean;
        private map : ValueMap;

        constructor (root : PNode, varStack : VarStack) {
            this.root = root;
            this.pending = nil<number>() ;
            this.ready = false;
            this.varStack = varStack ;

            this.map = new ValueMap();
        }

        getRoot() : PNode {
            return this.root ;
        }

        isReady() : boolean {
            return this.ready ;
        }

        setReady( newReady : boolean ) : void {
            this.ready = newReady ;
        }

        getStack(){
            return this.varStack;
        }

        getPending() : List<number> {
            assert.checkPrecondition( !this.isDone() ) ;
            return this.pending;
        }

        getPendingNode() : PNode {
            assert.checkPrecondition( !this.isDone() ) ;
            return this.root.get( this.pending ) ;
        }

        pushPending( childNum : number ) : void {
            assert.checkPrecondition( !this.isDone() ) ;
            this.pending = this.pending.cat( list( childNum ) ) ;
        }
        
        popPending( ) : void {
            assert.checkPrecondition( !this.isDone() ) ;
            if( this.pending.size() === 0 ) {
                this.pending = null ;
            } else {
                this.pending = collections.butLast( this.pending ) ; }
        }

        getValMap( ) : ValueMap {
            return this.map ; 
        }

        getVal( path : List<number> ) : Value {
            return this.map.get( path ) ; 
        }

        getChildVal( childNum : number ) : Value {
            assert.checkPrecondition( !this.isDone() ) ;
            return this.map.get( collections.snoc(this.pending, childNum ) ) ; 
        }

        finishStep( value : Value ) : void {
            assert.checkPrecondition( !this.isDone() ) ;
            assert.checkPrecondition( this.ready ) ;
            this.map.put( this.pending, value ) ;
            this.popPending() ;
            this.setReady( false ) ;
        }

        setResult(value : Value ) : void {
            // This is used for function calls.
            assert.checkPrecondition( !this.isDone() ) ;
            assert.checkPrecondition( this.ready ) ;
            this.map.put( this.pending, value ) ;
            // At this point, the evaluation is
            // ready and the call node is pending.
            // Thus the call is stepped a second time.
            // On the second step, the type of the
            // result should be checked.
        }

        isDone() : boolean {
            return this.pending == null; //check if pending is null
        }

        advance( interpreter : Interpreter, vms : VMS ) {
            assert.checkPrecondition( !this.isDone() ) ;

            if( this.ready ){
                assert.check( this.getStack() != null ) ;
                interpreter.step( vms ) ;
                assert.check( this.getStack() != null ) ;
            }
            else{
                assert.check( this.getStack() != null ) ;
                interpreter.select( vms ) ;
                assert.check( this.getStack() != null ) ;
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

        getPath() : List<number> {return this.path;}
        
        getValue() : Value {return this.val;}
        
        setValue( v : Value ) : void { this.val = v ; }

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

        getEntries() : Array<MapEntry> {
            return this.entries.concat() ;
        }

        get(p : List<number>) : Value {
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    return this.entries[i].getValue();
                }
            }
            return null;
        }

        put(p : List<number>, v : Value){
            var notIn = true;
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    this.entries[i].setValue(v);
                    notIn = false;
                }
            }
            if(notIn){
                var me = new MapEntry(p, v);
                this.entries.push(me);
                this.size++;
            }
        }

        remove(p : List<number>){
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    this.size--;
                    const firstPart = this.entries.slice(0, i);
                    const lastPart = this.entries.slice(i+1, this.entries.length);
                    this.entries = firstPart.concat(lastPart);
                }
            }
            return;
        }

        inMap(p : List<number>){
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    return true;
                }
            }
            return false;
        }
    }

    /* A VarStack is the context for expression evaluation. I.e. it is where
    * variables are looked up.  See the run-time model for more detail.
    */
    export class VarStack {

        private _top : ObjectI;
        private _next : VarStack; // Could be null.

        constructor(object : ObjectI, next : VarStack ){
            this._top = object;
            this._next = next;
        }

        // TODO Is this ever used?
        getTop() : ObjectI {
            return this._top;
        }

        getNext() : VarStack {
            return this._next;
        }

        //Return true if value was correctly set
        setField(name : string, val : Value) : boolean {
            if( this._top.hasField( name ) ) {
                this._top.getField(name).setValue( val ) ;
                return true ;
            } else if(this._next == null){
                return false;
            } else{
                return this._next.setField(name, val);
            }

        }

        getField(name : string) : FieldI {
            if( this._top.hasField( name ) ) {
                return this._top.getField( name ) ;
            } else if(this._next == null){
                return null;
            } else{
                return this._next.getField(name);
            }
        }

        inStack(name : string) : boolean {
            return this._top.hasField( name ) 
                   ||  (this._next != null)
                       && this._next.inStack(name);
        }

        getAllFrames() : Array<ObjectI> {
            if( this._next === null ) return [this._top] ;
            else [this._top].concat( this._next.getAllFrames() ) ;
        }
    }

    /** An EvalStack is simply a stack of evaluations.
     * 
     */
    export class EvalStack { 

        private readonly stk : Array<Evaluation> = [] ;

        constructor(){
        }

        push(evaluation : Evaluation ) : void {
            this.stk.push( evaluation ) ;
        }

        pop() : Evaluation {
            assert.checkPrecondition( this.stk.length > 0 ) ;
            return this.stk.pop() ; ;
        }

        top() : Evaluation{
            assert.checkPrecondition( this.stk.length > 0 ) ;
            return this.stk[ this.stk.length - 1 ] ;
        }

        public notEmpty() : boolean{
            return this.stk.length != 0 ;
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
        hasField : (string) => boolean ;
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
        setValue : ( Value ) => void ;
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
