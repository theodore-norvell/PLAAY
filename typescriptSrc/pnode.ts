/// <reference path="assert.ts" />
/// <reference path="collections.ts" />

import collections = require( './collections' ) ;
import assert = require( './assert' ) ;
import vms = require('./vms' ) ;
import evaluation = require('./evaluation') ;
import stack = require( './stackManager' ) ;
import value = require('./value') ;


module pnode {
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;
    import VMS = vms.VMS;
    import Evaluation = evaluation.Evaluation;
    import Stack = stack.Stack;
    import execStack = stack.execStack;
    import Value = value.Value;
    import varMap = stack.VarMap;
    import Field = value.Field;


    export interface nodeStrategy {
        select( vms : VMS ) : void;
        step( vms : VMS ) : void;
    }

    export interface Label {
        isValid : (children:Array<PNode>) => boolean ;
        /** Returns the class that uses this sort of label */
        getClass : () => PNodeClass ;

        getVal : () => string ;
        changeValue:(newString : string) => Option<Label> ;
    }

    /**  Interface is to describe objects that are classes that are subclasses of PNode
     * and can have constructors that can take the parameters below.*/
    export interface PNodeClass {
        new(label:Label, children:Array<PNode>) : PNode ;
    }

    export abstract class PNode {
        private _label:Label;
        private _children:Array<PNode>;
        strategy:nodeStrategy;

        select(vms:VMS){
            this.strategy.select(vms);
        }

        step(vms:VMS){
            this.strategy.step(vms);
        }

        /** Construct a PNode.
         *  Precondition: label.isValid( children )
         * @param label A Label for the node.
         * @param children: A list (Array) of children
         */
        /*protected*/
        constructor(label:Label, children:Array<PNode>) {
            //Precondition  would not need to be checked if the constructor were private.
            assert.check(label.isValid(children),
                "Attempted to make an invalid program node");
            this._label = label;
            this._children = children.slice();
        }

        public count():number {
            return this._children.length;
        }

        public children(start:number, end:number):Array<PNode> {
            if (start === undefined) start = 0;
            if (end === undefined) end = this._children.length;
            return this._children.slice(start, end);
        }

        public child(i:number):PNode {
            return this._children[i];
        }

        public label():Label {
            return this._label;
        }

        //return the node at the path
        public get(path : Array<Number>){

            if(path.length <= 0){
            //error
            }

            if(path.length == 1){
                var p = path.shift();
                return this.child[p]
            }
            else {
                var p = path.shift();
                var childNode = this.child[p];
                var node = childNode.get(path);
                return node;
            }
        }



        /** Possibly return a copy of the node in which the children are replaced.
         * The result will have children
         *    [c[0], c[1], c[start-1]] ++ newChildren ++ [c[end], c[end+1], ...]
         * where c is this.children().
         * I.e. the segment c[ start,.. end] is replaced by newChildren.
         * The method succeeds iff the node required to be constructed would be valid.
         * Node that start and end can be number value including negative.
         * Negative numbers k are treated as length + k, where length
         * is the number of children.
         * @param newChildren An array of children to be added
         * @param start The first child to omit. Default 0.
         * @param end The first child after start to not omit. Default this.children().length.
         */
        public tryModify(newChildren:Array<PNode>, start:number, end:number):Option<PNode> {
            if (start === undefined) start = 0;
            if (end === undefined) end = this._children.length;
            const firstPart = this._children.slice(0, start);
            const lastPart = this._children.slice(end, this._children.length);
            const allChildren = firstPart.concat(newChildren, lastPart);
            //console.log("tryModify: start is " +start+ " end is " +end ) ; 
            //console.log("          firstPart is " +firstPart+ " lastPart is " +lastPart );
            //console.log("          newChildren is " +newChildren+ " allChildren is " +allChildren );
            return tryMake(this._label, allChildren);
        }

        /** Would tryModify succeed?
         */
        public canModify(newChildren:Array<PNode>, start:number, end:number):boolean {
            return !this.tryModify(newChildren, start, end).isEmpty();
        }

        /** Return a copy of the node in which the children are replaced.
         * Precondition: canModify( newChildren, start, end )
         */
        public modify(newChildren:Array<PNode>, start:number, end:number):PNode {
            var opt = this.tryModify(newChildren, start, end);
            return opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modify");
                    return null;
                })
        }

        public tryModifyLabel(newLabel:Label):Option<PNode> {
            return tryMake(newLabel, this._children);
        }

        public canModifyLabel(newLabel:Label):boolean {
            return !this.tryModifyLabel(newLabel).isEmpty();
        }

        public modifyLabel(newLabel:Label):PNode {
            var opt = this.tryModifyLabel(newLabel);
            return opt.choose(
                p => p,
                () => {
                    assert.check(false, "Precondition violation on PNode.modifyLabel");
                    return null;
                })
        }

        abstract isExprNode():boolean ;

        abstract isExprSeqNode():boolean ;

        abstract isTypeNode():boolean ;

        toString ():string {
            var strs = this._children.map((p:PNode) => p.toString());
            var args = strs.reduce((a:string, p:string) => a + " " + p.toString(), "");

            return this._label.toString() + "(" + args + ")";
        }
    }


    export function tryMake(label:Label, children:Array<PNode>):Option<PNode> {
        if (label.isValid(children)) {
            //console.log("tryMake: label is " +label+ " children.length is " +children.length ) ; 
            const cls = label.getClass();
            return new Some(new cls(label, children));
        }
        else {
            return new None<PNode>();
        }
    }

    export function canMake(label:Label, children:Array<PNode>):boolean {
        return label.isValid(children)
    }

    export function make(label:Label, children:Array<PNode>):PNode {
        const cls = label.getClass();
        return new cls(label, children);
    }

    export function lookUp( varName : String, stack : execStack ) : Field {
        if (stack == null){
            return null;
        }

        else {
            for (var i = 0; i < stack.top().fields.length; i++) {
                if (stack.top().fields[i].name == varName) {
                    return stack.top().fields[i];
                }
            }
        }
        return lookUp( varName, stack.next );
    }

    export class lrStrategy implements nodeStrategy {

        select( vms : VMS ) : void{
            var eval = vms.stack.top();
            var pending = eval.pending;

            if(pending != null) {
                var node = eval.root.get(pending);

                if(node.getLabel() == this){


                    var flag = true;

                    for(var i = 0; i < node.count(); i++){
                        var p = pending ^ [i];
                        if(!eval.varmap.inMap(p)){
                            flag = false;
                        }
                    }

                    if (flag){
                        eval.ready = true;// Select this node.
                    }

                    else{

                        var n;
                        for(var i = 0; i < node.count(); i++){
                            var p = pending ^ [i];
                            if(!eval.varmap.inMap(p)){
                                n = i;
                                break;
                            }
                        }

                        eval.pending = pending ^ [n];
                        node.child[n].strategy.select(vms);
                    }
                }
            }
        }

        step( vms : VMS ){
            if(vms.stack.top().ready == true){
                var eval = vms.stack.top();
                if(eval.pending != null) {
                    var node = eval.root.get(eval.pending);
                    if(node.getLabel() == this){
                        /*     get the values mapped by the two children //TODO node specific stuff
                         if(both represent numbers){//math functions
                         var v = make a new number representing the sum//+ function
                         eval.finishStep(v);*/
                    }
                    else{} //error!

                }
            }
        }
    }


    export class varStrategy implements nodeStrategy {
        select( vms:VMS ){
            var eval = vms.stack.top();
            var pending = eval.pending
            if(pending != null){
                var node = eval.root.get(pending);
                if(node.getLabel() == this){
                  //TODO how to highlight  look up the variable in the stack and highlight it.
//                    there is no variable in the stack with this name
                   /* if (eval.stack.inStack()){} //error} //what name? Where is it stored
                    else{eval.ready = true;}*/
                }
            }
        }

        step( vms:VMS  ){
            if(vms.stack.top().ready){
                var eval = vms.stack.top();
                if(eval.pending != null){
                    var node = eval.root.get(eval.pending);
                    if(node.getLabel() == this){
                        var v = lookUp( name, eval.stack).getValue(); //TODO not in pseudo code but would make sense to have this as a value
      //TODO how                  remove highlight from f
                        eval.finishStep( v )
                    }
                }
            }
        }
    }

    export class ifStrategy implements nodeStrategy {
        select( vms : VMS){
            var eval = vms.stack.top();
            var pending = eval.pending;
            if(pending != null){
                var node = eval.root.get(pending);
                if(node.getLabel() == this){
                    var guardPath = pending ^ [0];
                    var thenPath = pending ^ [1];
                    var elsePath = pending ^ [2];
                    if (eval.varmap.inMap(guardPath)){
                        if (eval.varmap.get(guardPath) == true){
                            if(eval.varmap.inMap(thenPath)){
                                eval.ready = true;
                            }
                            else{
                                eval.pending = thenPath;
                                node.children(1).getLabel.select( vms );
                            }
                        }

                        else if(eval.varmap.get(guardPath) == false){
                            if (eval.varmap.inMap(elsePath)){
                                eval.ready = true;
                            }

                            else{
                                eval.pending = elsePath;
                                node.children(2).getLabel().select( vms );
                            }
                        }

                        else{}//error
                    }

                    else{
                        eval.pending = guardPath;
                        node.children(0).getLabel().select( vms );
                    }
                }
            }
        }

        step(vms:VMS){
            if(vms.stack.top().ready){
                var eval = vms.stack.top();
                if(eval.pending != null){
                    var node = eval.root.get(eval.pending);
                    if(node.getLabel() == this){
                        var guardPath = eval.pending ^ [0];
                        var thenPath = eval.pending ^ [1];
                        var elsePath = eval.pending ^ [2];
                        var v : Value;

                        if( eval.varmap.get(guardPath) == true){
                            v = eval.varmap.get( thenPath );
                        }

                        else{
                            v = eval.varmap.get( elsePath );
                            eval.finishStep( v );
                        }
                    }
                }
            }
        }
    }

   /* export class callStrategy implements nodeStrategy{
        select(){}

        step( vms : VMS ){
            if( vms.stack.ready){
                var eval = vms.stack.top();
                if(eval.pending != null){
                    var node = eval.root.get(eval.pending);
                    if( node.getLabel() == this ){
                        var functionPath = eval.pending ^ [0];
                        var c = eval.varmap.get( functionPath );
                        if (!c.isClosureV()){}//  error!
                        var c1 = c;
                        var f : LambdaNode = c1.function;

                        var argList = [eval.varmap.get( eval.pending ^ [1] ),
                            eval.varmap.get( eval.pending ^ [2],.. ]//for all arguments TODO

                        if( the length of arglist not= the length of f.params.children){} //error!
                        if (any argument has a value not compatible with the corresponding parameter type){}
                        // error!
                        var params = f.params.children; //TODO make params
                        var arFields := [ new Field( params[0].name, argList[0] ),
                            new Field( params[1].name, argList[1] ),
                            .. ] //for all f.params.children
                        var activationRecord = new ObjectV( arFields );
                        var stack = new Stack( activationRecord, cl.context );

                        var newEval = new Evaluation();
                        newEval.root = f.body; //TODO what is the body
                        newEval.stack = stack;
                        newEval.varmap = new varMap();
                        newEval.pending = [];
                        newEval.ready = false;

                        vms.stack.push( newEval );
                    }
                }
            }
        }
    }
*/







    //Node Declarations

    export class ExprNode extends PNode {
        exprNodeTag:any // Unique field to defeat duck typing
        // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr

        constructor(label:Label, children:Array<PNode>) {
            super(label, children);
        }

        isExprNode():boolean {
            return true;
        }

        isExprSeqNode():boolean {
            return false;
        }

        isTypeNode():boolean {
            return false;
        }
    }

    export class ExprSeqNode extends PNode {
        seqNodeTag:any // Unique field to defeat duck typing
        // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr
        constructor(label:Label, children:Array<PNode>) {
            super(label, children);
        }

        isExprNode():boolean {
            return false;
        }

        isExprSeqNode():boolean {
            return true;
        }

        isTypeNode():boolean {
            return false;
        }

    }

    export class TypeNode extends PNode {
        typeNodeTag:any; // Unique field to defeat duck typing
        // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr
        constructor(label:Label, children:Array<PNode>) {
            super(label, children);
        }

        isExprNode():boolean {
            return false;
        }

        isExprSeqNode():boolean {
            return false;
        }

        isTypeNode():boolean {
            return true;
        }
    }

    export class LambdaNode extends ExprNode {
        constructor(label:Label, children:Array<PNode>) {
            super(label, children);
        }

    }


    //Node Labels
    export abstract class ExprLabel implements Label {

        isValid(children:Array<PNode>) {
            return true;
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        /*private*/
        constructor() {
        }

        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }
        getVal : () => string ;

        // Singleton
        //public static theExprLabel = new ExprLabel();
    }


    export class ExprSeqLabel implements Label {
        isValid(children:Array<PNode>) {
            return children.every(function (c:PNode) {
                return c.isExprNode()
            });
        }

        getClass():PNodeClass {
            return ExprSeqNode;
        }

        toString():string {
            return "seq";
        }

        /*private*/
        constructor() {
        }

        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        getVal() : string {
            return null;
        }

        // Singleton
        public static theExprSeqLabel = new ExprSeqLabel();
    }

    export class TypeLabel implements Label {
        isValid:(children:Array<PNode>) => boolean;

        getClass():PNodeClass {
            return TypeNode;
        }

        /*private*/
        constructor() {
        }

        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        getVal() : string {
            return null;
        }

        // Singleton
        public static theTypeLabel = new TypeLabel();
    }

    //Variable

    export class VariableLabel implements ExprLabel {
        _val : string;

        isValid(children:Array<PNode>):boolean {
            return children.length == 0;
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        toString():string {
            return "variable";
        }

        getVal() : string {
            return this._val;
        }

        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        /*private*/
        constructor(name : string) {
            this._val = name;
        }

        public static theVariableLabel = new VariableLabel("");
    }

    export class AssignLabel extends ExprLabel {
        _val : string;
        con : boolean;

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true;
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        toString():string {
            return "assign";
        }

        /*private*/
        constructor() {
            super();
        }

        changeValue (newString : string ) : Option<Label> {
            if (this.con = false) {
                var newLabel = new NumberLiteralLabel(newString);
                return new Some(newLabel);
            }

            return new None<Label>();
        }

        // Singleton
        public static theAssignLabel = new AssignLabel();
    }


    //Arithmetic Labels
    export class callWorldLabel implements ExprLabel {

        _val : string;//the operation

        isValid(children:Array<PNode>):boolean {
            return children.every(function(c : PNode) { return c.isExprNode() } ) ;
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        toString():string {
            return "callWorld";
        }

        getVal() : string {
            return this._val;
        }

        changeValue (newString : string) : Option<Label> {
            var newLabel = new callWorldLabel(newString);
            return new Some(newLabel);
        }

        /*private*/
        constructor(name : string) {
            this._val = name;
        }

        public static theCallWorldLabel = new callWorldLabel("");
    }

    //Placeholder Labels

    export class ExprPHLabel extends ExprLabel {

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 0) return false ;
            return true;
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        toString():string {
            return "expPH";
        }

        /*private*/
        constructor() {
            super();
        }

        // Singleton
        public static theExprPHLabel = new ExprPHLabel();
    }

    export class LambdaLabel extends ExprLabel {

         isValid( children : Array<PNode> ) {
             if( children.length != 3 ) return false ;
             if ( ! children[0].isExprSeqNode() ) return false ;
             if( ! children[1].isTypeNode() ) return false ;
             if( ! children[2].isExprSeqNode() ) return false ;
             return true;
         }

        getClass():PNodeClass {
            return ExprNode;
        }

        //constant can't be changed
        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        toString():string {
            return "lambda";
        }

        /*private*/
        constructor() {
            super();
        }

        // Singleton
        public static theLambdaLabel = new LambdaLabel();
    }

    //While and If Labels

    export class IfLabel extends ExprLabel {

        strategy:ifStrategy;

        isValid(  children : Array<PNode> ) : boolean {
         if( children.length != 3 ) return false ;
         if( ! children[0].isExprNode() ) return false ;
         if( ! children[1].isExprSeqNode() ) return false ;
         if( ! children[2].isExprSeqNode() ) return false ;
         return true ; }

        getClass():PNodeClass {
            return ExprNode;
        }

        toString():string {
            return "if";
        }

        /*private*/
        constructor() {
            super();
        }

        // Singleton
        public static theIfLabel = new IfLabel();
    }

    export class WhileLabel extends ExprLabel {

        isValid(  children : Array<PNode> ) : boolean {
         if( children.length != 2 ) return false ;
         if( ! children[0].isExprNode() ) return false ;
         if( ! children[1].isExprSeqNode() ) return false ;
         return true ; }

        getClass():PNodeClass {
            return ExprNode;
        }

        toString():string {
            return "while";
        }

        /*private*/
        constructor() {
            super();
        }

        // Singleton
        public static theWhileLabel = new WhileLabel();
    }

    //Const Labels

    export class StringConstLabel implements ExprLabel {
        _val:string;

        constructor(val:string) {
            this._val = val;
        }

        getVal():string {
            return this._val;
        }

        isValid(children:Array<PNode>) {
            return children.length == 0;
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        //constant can't be changed
        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        toString():string {
            return "string[" + this._val + "]";
        }
    }

    export class NumberConstLabel implements ExprLabel {
        _val:string;

        constructor(val:string) {
            this._val = val;
        }


        isValid(children:Array<PNode>) {
            return children.length == 0;
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        getVal() : string {
            return this._val;
        }

        //constant can't be changed
        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        toString():string {
            return "string[" + this._val + "]";
        }//will this work in TS?
    }

    export class BooleanConstLabel implements ExprLabel {
        _val:string;

        constructor(val:string) {
            this._val = val;
        }

        getVal():string {
            return this._val;
        }

        isValid(children:Array<PNode>) {
            return children.length == 0;
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        //constant can't be changed
        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        toString():string {
            return "string[" + this._val + "]";
        }//will this work in TS?
    }

    export class AnyConstLabel implements ExprLabel {
        _val:any;

        constructor(val:any) {
            this._val = val;
        }

        val():any {
            return this._val;
        }

        isValid(children:Array<PNode>) {
            return children.length == 0;
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        //constant can't be changed
        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        getVal() : string {
            return this._val;
        }

        toString():string {
            return "string[" + this._val + "]";
        }//will this work in TS?
    }

    //Type Labels

    export class NoTypeLabel implements TypeLabel {
        isValid(children:Array<PNode>):boolean {
            return children.length == 0;}

        getClass():PNodeClass {
            return TypeNode;
        }

        toString():string {
            return "noType";
        }

        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        getVal() : string {
            return null;
        }

        /*private*/
        constructor() {
        }

        // Singleton
        public static theNoTypeLabel = new NoTypeLabel();
    }

     //Literal Labels

     export class StringLiteralLabel implements ExprLabel {
        _val : string ;

        constructor( val : string) { this._val = val ; }

        val() : string { return this._val ; }

        isValid( children : Array<PNode> ) {
        return children.length == 0 ; }

        getClass() : PNodeClass { return ExprNode ; }


         changeValue (newString : string) : Option<Label> {
             var newLabel = new StringLiteralLabel(newString);
             return new Some(newLabel);
         }

         getVal() : string {
             return this._val;
         }

        toString() : string { return "string"  ; }

         public static theStringLiteralLabel = new StringLiteralLabel( "" );
     }

    export class NumberLiteralLabel implements StringLiteralLabel {
        _val : string ;

        constructor( val : string) { this._val = val ; }

        val() : string { return this._val ; }

        isValid( children : Array<PNode> ) {
            return children.length == 0 ;
        //TODO logic to make sure this is a number
        }

        changeValue (newString : string) : Option<Label> {
            var newLabel = new NumberLiteralLabel(newString);
            return new Some(newLabel);
        }

        getVal() : string {
            return null;
        }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "string[" + this._val + "]"  ; }
        public static theNumberLiteralLabel = new NumberLiteralLabel( "" );
    }

    export class BooleanLiteralLabel implements StringLiteralLabel {
        _val : string ;

        constructor( val : string) { this._val = val ; }

        val() : string { return this._val ; }

        changeValue (newString : string) : Option<Label> {
                var newLabel = new BooleanLiteralLabel(newString);
                return new Some(newLabel);
        }

        isValid( children : Array<PNode> ) {
            if(children.length != 0){return false}
            if(this.val() != "true" && this.val() != "false"){return false;}
            return true;
        }

        getVal() : string {
            return this._val;
        }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "string[" + this._val + "]"  ; }
        public static theBooleanLiteralLabel = new BooleanLiteralLabel( "" );
    }


    export class NullLiteralLabel implements ExprLabel {
        _val : string;
        constructor() { this._val = "null" ; }

        val() : string { return null }

        isValid( children : Array<PNode> ) {
            return children.length == 0;}

        getClass() : PNodeClass { return ExprNode ; }

        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        getVal() : string {
            return "null";
        }

        toString() : string { return "string[" + this._val + "]"  ; }
        public static theNullLiteralLabel = new NullLiteralLabel();
    }

    export class MethodLabel implements ExprLabel { //TODO should this be type?
        isValid(children:Array<PNode>) {
            return children.every(function (c:PNode) {
                return c.isTypeNode()
            });
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        toString():string {
            return "method";
        }

        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        getVal() : string {
            return null;
        }

        /*private*/
        constructor() {
        }

        // Singleton
        public static theMethodLabel = new MethodLabel();
    }

    export class CallLabel implements ExprLabel {
        _id : string ;

        isValid(children:Array<PNode>) {
            //TODO check if child 0 is a method
            return children.every(function (c:PNode) {
                return c.isExprNode()
            });
        }

        getClass():PNodeClass {
            return ExprNode;
        }

        toString():string {
            return "call";
        }

        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        getVal() : string {
            return this._id;
        }

        /*private*/
        constructor() {
        }

        // Singleton
        public static theCallLabel = new CallLabel();
    }


    //Placeholder Make
    export function mkExprPH():ExprNode {
        return <ExprNode> make(ExprPHLabel.theExprPHLabel, []);
    }

    //Loop and If Make
    export function mkIf(guard:ExprNode, thn:ExprSeqNode, els:ExprSeqNode):ExprNode {
        return <ExprNode> make(IfLabel.theIfLabel, [guard, thn, els]); }

    export function mkWhile(cond:ExprNode, seq:ExprSeqNode):ExprNode {
        return <ExprNode> make(WhileLabel.theWhileLabel, [cond, seq]); }

    export function mkExprSeq( exprs : Array<ExprNode> ) : ExprSeqNode {
        return <ExprSeqNode> make( ExprSeqLabel.theExprSeqLabel, exprs ) ; }

    //Const Make
    export function mkStringConst( val : string ) : ExprNode{
        return <ExprNode> make( new StringConstLabel(val),[] ) ; }

    export function mkNumberConst( val : string ) : ExprNode{
        return <ExprNode> make( new NumberConstLabel(val),[] ) ; }  //

    export function mkBooleanConst( val : string ) : ExprNode{
        return <ExprNode> make( new BooleanConstLabel(val),[] ) ; }

    export function mkAnyConst( val : any ) : ExprNode{
        return <ExprNode> make( new AnyConstLabel(val),[] ) ; }

}

export = pnode ;