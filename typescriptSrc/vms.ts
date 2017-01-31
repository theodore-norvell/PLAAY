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
import world = require('./world');

module vms{

    import World = world.World;
    import PNode = pnode.PNode;

    export class VMS {

        evalStack : EvalStack ;
        //val : String ; // TODO What is this?
        private world : World; // TODO Why do we need this?

        constructor(root : PNode, worlds: Array<World>) {
            // TODO: If worlds is an array we should use all
            // its values.
            var varStack = new VarStack(worlds[0], null) ;
            var evalu = new Evaluation(root, worlds, varStack);
            this.evalStack = new EvalStack();
            this.evalStack.push(evalu);
            this.world = worlds[0];
        }

        canAdvance() : boolean {
            return this.evalStack.notEmpty();//TODO add notEmpty to evalStack why can't this file see members?
        }

        getEval() : Evaluation {
            return this.evalStack.top() ;
        }

        // TODO: Is this really needed.
        getWorld() : World {
            return this.world;
        }

        // TODO.  Since advance will need to 
        // call the interpreter, we should use 
        // dependence inversion to avoid 
        // circular dependence.  Instead the
        // VMS can depend on an interface that
        // the interpreter implements.
        advance(){
            if(this.canAdvance()){
                let ev = this.evalStack.top();
                assert.check( ev.getStack() != null ) ;
                
                if( ev.isDone() ) {
                    var value = ev.getValMap().get([]); //TODO get value from evaluation?
                    this.evalStack.pop() ;
                    if(this.evalStack.notEmpty()){
                        this.evalStack.top().setResult( value );
                    }
                }
                else{
                    assert.check( ev.getStack() != null ) ;
                    ev.advance(this);
                    assert.check( ev.getStack() != null ) ;
               }
            }
        }
    }

    export class Evaluation {
        // TODO root should be private
        root : PNode;
        private varStack : VarStack;
        private pending : Array<number>;
        // TODO ready should be private
        ready : Boolean;
        // TODO map should be private
        map : ValueMap;

        next : Evaluation; // TODO eliminate this field.

        constructor (root : PNode, obj: Array<ObjectV>, varStack : VarStack) {
            this.root = root;
            this.pending = new Array();
            this.ready = false;
            this.varStack = varStack ;

            this.map = new ValueMap();
        }

        getRoot()
        {
            return this.root;
        }

        getNext(){
            return this.next;
        }

        getPending(){
            return this.pending;
        }

        setPending(pending : Array<number>){
            this.pending = pending;
        }

        getValMap(){
            return this.map;
        }

        getStack(){
            return this.varStack;
        }

        //setNext(next : Evaluation){
            //this.next = next;
        //}

        finishStep( v : Value ){
            if(this.pending != null && this.ready){

                var pending2 = new Array<number>();
                for (var i = 0; i < this.pending.length ; i ++){
                    pending2.push(this.pending[i]);
                }

                this.map.put( pending2 , v);
                if( this.pending.length == 0){
                    this.pending = null;
                }
                else{
                    this.pending.pop();
                }
                this.ready = false;
            }
        }

        setResult(value : Value ){
            var node = this.root.get( this.pending );
            var closurePath = this.pending.concat([0]);
            var closure = <ClosureV>this.map.get( closurePath );
            var lambda = closure.getLambdaNode() ;
            //TODO check if lambda has return type and make sure it is the same as value's type
            this.finishStep( value );
        }

        // setVarMap(map : ValueMap){
        //     this.map = map;
        // }


        isDone(){
            return this.pending == null; //check if pending is null
        }

        advance( vms : VMS ){
            assert.checkPrecondition( !this.isDone() ) ;

            var pending2 = Object.create(this.pending);
            var topNode = this.root.get( pending2 );
            if( this.ready ){
                assert.check( this.getStack() != null ) ;
                topNode.label().step(vms);
                assert.check( this.getStack() != null ) ;
            }
            else{
                assert.check( this.getStack() != null ) ;
                topNode.label().strategy.select( vms,  topNode.label()  ); //strategy.select
                assert.check( this.getStack() != null ) ;
            }
        }
    }


    export class ValueMap {
        size : number ;
        entries : Array<mapEntry>;

        constructor(){
            this.entries = new Array<mapEntry>();
            this.size = 0;
        }

        samePath(a : Array<number>, b : Array<number>){
            var flag = true;
            for(var p = 0; p < Math.max(a.length, b.length); p++){
                if(a[p] != b[p]){
                    flag = false;
                }
            }
            return flag;
        }

        get(p : Array<number>) : Value {
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    return this.entries[i].getValue();
                }
            }
            return null;
        }

        put(p : Array<number>, v : Value){
            var notIn = true;
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    this.entries[i].setValue(v);
                    notIn = false;
                }
            }
            if(notIn){

                var me = new mapEntry(p, v);
                this.entries.push(me);
                this.size++;
            }
        }

        remove(p : Array<number>){
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

        inMap(p : Array<number>){
            for(var i = 0; i < this.size; i++){
                var tmp = this.entries[i].getPath();
                if(this.samePath(tmp, p)){
                    return true;
                }
            }
            return false;
        }
    }

        export class VarStack {

        obj : ObjectV;
        next : VarStack;

        constructor(object : ObjectV, next : VarStack ){
            this.obj = object;
            this.next = next;
        }

        top() : ObjectV{
            return this.obj;
        }

        getNext() : VarStack {
            return this.next;
        }

        //Return true if value was correctly set
        setField(name : string, val : Value) : boolean{
            for(var i = 0; i < this.obj.numFields(); i++){
                if(name == this.obj.fields[i].getName()){
                    this.obj.fields[i].setValue(val);
                    return true;
                }
            }
            if(this.next == null){
                return false;
            }
            else{
                var here = this.next.setField(name, val);
                return here;
            }

        }

        getField(name : string) : Field {
            for(var i = 0; i < this.obj.numFields(); i++){
//                if(name.match(this.obj.fields[i].getName().toString())){
                if(name == this.obj.fields[i].getName()){
                    return this.obj.fields[i];
                }
            }
            if(this.next == null){
                return null;
            }
            else{
                return this.next.getField(name);
            }
        }

        inStack(name : string) : boolean {
            for (var i = 0; i < this.obj.numFields(); i++) {
//                if(name.match(this.obj.fields[i].getName().toString())){
                if (name == this.obj.fields[i].getName()) {
                    return true;
                }
            }
            if (this.next == null) {
                return false;
            }
            else {
                return this.next.inStack(name);
            }
        }
    }

    export class EvalStack { 

        head : Evaluation;

        constructor(){
            this.head = null;
        }

        push(val : Evaluation ) {
            if (this.notEmpty()) {
                val.next = this.head;
                this.head = val;
            }
            else {
                this.head = val;
            }
        }

        pop() : Evaluation{
            var it = this.head;
            this.head = this.head.getNext();
            return it;
        }

        top() : Evaluation{
            return this.head;
        }

        public notEmpty() : boolean{
            if(this.head == null){return false;}
            else{return true;}
        }
    }

    export class mapEntry{
        path : Array<number>;
        val : Value;

        constructor (key : Array<number>, value : Value ){
            this.path = key;
            this.val = value;
        }

        getPath(){return this.path;}
        getValue(){return this.val;}
        setValue(v : Value ){this.val = v;}

    }

    export interface Value {
        isClosureV : () => boolean ;
        isBuiltInV : () => boolean ;
        isStringV : () => boolean ;
    }

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
