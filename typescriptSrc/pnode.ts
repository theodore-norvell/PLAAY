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
    import BuiltInV = value.BuiltInV;
    import varMap = stack.VarMap;
    import Field = value.Field;
    import ClosureV = value.ClosureV;
    import StringV = value.StringV;


    export interface nodeStrategy {
        select( vms : VMS, label:Label ) : void;
    }

    export interface Label {
        isValid : (children:Array<PNode>) => boolean ;
        /** Returns the class that uses this sort of label */
        getClass : () => PNodeClass ;

        getVal : () => string ;
        changeValue:(newString : string) => Option<Label> ;

        toJSON : () => any ;
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
        public get(path : Array<number>){

            if(path.length < 0){
            //error
            }

            if(path.length == 0){
                return this;
            }

            if(path.length == 1){
                var p = path.shift();
                return this.child(p);
            }

            else {
                var p = path.shift();
                var childNode = this.child(p);
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

        /** Convert a node to a simple object that can be stringified with JSON */
        toJSON () : any {
            var result : any = {} ;
            result.label = this._label.toJSON() ;
            result.children = [] ;
            var i ;
            for( i = 0 ; i < this._children.length ; ++i )
                result.children.push( this._children[i].toJSON() ) ;
            return result ;
        }

        /** Convert a simple object created by toJSON to a PNode */
        static fromJSON( json : any ) : PNode {
             var label = fromJSONToLabel( json.label ) ;
             var children = json.children.map( PNode.fromJSON ) ;
             return make( label, children ) ;
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

    export function lookUp( varName : string, stack : execStack ) : Field {
        if (stack == null){
            return null;
        }

        else {
            for (var i = 0; i < stack.top().fields.length; i++) {
                if (stack.top().fields[i].name.match(varName.toString())) {
                    return stack.top().fields[i];
                }
            }
        }
        return lookUp( varName, stack.next );
    }

    export class lrStrategy implements nodeStrategy {
        select( vms : VMS, label:Label ) : void {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();

            if(pending != null) {

                var pending2 = Object.create(pending); //Javascript passes by reference, this is the only way I could figure out how to keep the path
                var node = evalu.root.get(pending2);

                if(node.label() == label){
                    var flag = true;
                    for(var i = 0; i < node.count(); i++){
                        var p = pending.concat([i]);
                        if(!evalu.varmap.inMap(p)){
                            flag = false;
                        }
                    }
                    if (flag){
                        evalu.ready = true;// Select this node.
                    }
                    else{
                        var n;
                        for(var i = 0; i < node.count(); i++){
                            var p = pending.concat([i]);
                            if(!evalu.varmap.inMap(p)){
                                n = i;
                                break;
                            }
                        }
                        vms.stack.top().setPending(pending.concat([n]));
                        node.child(n).label().strategy.select(vms, node.child(n).label() );
                    }
                }
            }
        }
    }

    export class varStrategy implements nodeStrategy {
        select( vms:VMS, label:Label ){
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if(pending != null){
                var pending2 = Object.create(pending);
                var node = evalu.root.get(pending2);
                if(node.label() == label){
                  //TODO how to highlight  look up the variable in the stack and highlight it.
                    if (!evalu.getStack().inStack(label.getVal())){} //error} //there is no variable in the stack with this name
                    else{evalu.ready = true;}
                }
            }
        }
   }

    export class whileStrategy implements nodeStrategy {
        select(vms:VMS, label:Label) {
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var pending2 = Object.create(pending);
                var node = evalu.root.get(pending2);
                if (node.label() == label) {

                }
            }
        }
    }

    export class LiteralStrategy implements nodeStrategy {
        select( vms:VMS, label:Label ){
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if(pending != null){
                var pending2 = Object.create(pending);
                var node = evalu.root.get(pending2);
                if(node.label() == label){
                    vms.stack.top().ready = true;
                }
            }
        }


    }

     export class ifStrategy implements nodeStrategy {
        select( vms : VMS, label:Label){
            var evalu = vms.stack.top();
            var pending = evalu.getPending();
            if(pending != null){
                var node = evalu.root.get(pending);
                if(node.label() == label){
                    var guardPath = pending.concat([0]);
                    var thenPath = pending.concat([1]);
                    var elsePath = pending.concat([2]);
                    if (evalu.varmap.inMap(guardPath)){
                        var string = <StringV>evalu.varmap.get(guardPath);
                        if (string.contents.match("true")){
                            if(evalu.varmap.inMap(thenPath)){
                                evalu.ready = true;
                            }
                            else{
                                evalu.setPending(thenPath);
                                node.children(1).label.select( vms );
                            }
                        }

                        else if(string.contents.match("false")){
                            if (evalu.varmap.inMap(elsePath)){
                                evalu.ready = true;
                            }

                            else{
                                evalu.setPending(elsePath);
                                node.children(2).label().select( vms );
                            }
                        }

                        else{}//error
                    }

                    else{
                        evalu.setPending(guardPath);
                        node.children(0).label().select( vms );
                    }
                }
            }
        }
    }

   /* export class callStrategy implements nodeStrategy{
        select(){}

        step( vms : VMS, label : Label ){
            if( vms.stack.top().ready){
                var eval = vms.stack.top();
                if(eval.getPending() != null){
                    var node = eval.root.get(eval.getPending());
                    if( node.label() == label ){
                        var functionPath = eval.getPending() ^ [0];
                        var c = eval.varmap.get( functionPath );
                        if (!c.isClosureV()){}//  error!
                        var c1 = <ClosureV>c;
                        var f : LambdaNode = c1.function;

                        argList : Array<PNode>;

                        for(var i = 0; i <)
                        var argList = [eval.varmap.get( eval.getPending() ^ [1] ),
                            eval.varmap.get( eval.getPending() ^ [2],.. ]//for all arguments TODO

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
                        newEval.getPending() = [];
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

        abstract isValid(children:Array<PNode>) ;

        abstract nodeStep(node:PNode, evalu:Evaluation);

        strategy:nodeStrategy;

        getClass():PNodeClass {
            return ExprNode;
        }

        /*private*/
        constructor() {
        }

        changeValue (newString : string) : Option<Label> {
            return new None<Label>();
        }

        getVal() : string {
            return null ;
        }

        select(vms:VMS){
            this.strategy.select(vms, this);
        }

        //Template
        step(vms:VMS){
            if(vms.stack.top().ready == true){
                var evalu = vms.stack.top();
                if(evalu.getPending() != null) {
                    var pending2 = Object.create(evalu.getPending());
                    var node = evalu.root.get(pending2);
                    this.nodeStep(node, evalu);
                }
                else{}//error
            }
        }

        // Singleton
        //public static theExprLabel = new ExprLabel();

        abstract toJSON() : any ;
    }


    export class ExprSeqLabel implements Label {
        isValid(children:Array<PNode>) {
            return children.every(function (c:PNode) {
                return c.isExprNode()
            });
        }

        strategy : lrStrategy = new lrStrategy();

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

        select(vms:VMS){
            this.strategy.select(vms, this);
        }

        // Singleton
        public static theExprSeqLabel = new ExprSeqLabel();

        public toJSON() : any {
            return { kind:  "ExprSeqLabel" } ; }

        public static fromJSON( json : any ) : ExprSeqLabel {
            return ExprSeqLabel.theExprSeqLabel ; }
    }

    export abstract class TypeLabel implements Label {
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

        public abstract toJSON() : any ;
    }

    //Variable

    export class VariableLabel extends ExprLabel {
        _val : string;
        strategy:varStrategy = new varStrategy();

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
            var newLabel = new VariableLabel(newString);
            return new Some(newLabel);
        }

        nodeStep(node, evalu){
            var v = lookUp( name, evalu.stack).getValue(); //TODO not in pseudo code but would make sense to have this as a value
            //TODO how remove highlight from f
            evalu.finishStep( v )
        }

        /*private*/
        constructor(name : string) {
            super() ;
            this._val = name;
        }

        public static theVariableLabel = new VariableLabel("");

        public toJSON() : any {
            return { kind : "VariableLabel", name : this._val } ;
        }

        public static fromJSON( json : any ) : VariableLabel {
            return new VariableLabel( json.name ) ; }

    }

    export class VarDeclLabel extends ExprLabel {
        _val : string ;

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 3) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isTypeNode()) return false ;
            return true;
        }

        strategy:lrStrategy;

        getClass():PNodeClass {
            return ExprNode;
        }

        toString():string {
            return "vardecl";
        }

        /*private*/
        constructor(name : string) {
            super() ;
            this._val = name;
        }

        changeValue (newString : string ) : Option<Label> {
            var newLabel = new VarDeclLabel(newString);
            return new Some(newLabel);
        }

        nodeStep(node, evalu){

            //lValue = rValue;
            // evalu.finishStep(lValue);
        }

        // Singleton
        public static theVarDeclLabel = new VarDeclLabel("");

        public toJSON() : any {
            return { kind: "AssignLabel" } ;
        }

        public static fromJSON( json : any ) : AssignLabel {
            return AssignLabel.theAssignLabel ;
        }
    }

    export class AssignLabel extends ExprLabel {
        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true;
        }

        strategy:lrStrategy = new lrStrategy();

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
            return new None<Label>();
        }

        nodeStep(node, evalu){

            //lValue = rValue;
           // evalu.finishStep(lValue);
        }

        // Singleton
        public static theAssignLabel = new AssignLabel();

        public toJSON() : any {
            return { kind: "AssignLabel" } ;
        }

        public static fromJSON( json : any ) : AssignLabel {
            return AssignLabel.theAssignLabel ;
        }
    }


    //Arithmetic Labels
    export class CallWorldLabel extends ExprLabel {

        _val : string;//the operation

        strategy : lrStrategy = new lrStrategy();

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
            var newLabel = new CallWorldLabel(newString);
            return new Some(newLabel);
        }

        nodeStep(node, evalu){
            if (evalu.getStack().inStack(this._val.toString()) ) {
               var f = evalu.getStack().getField(this._val.toString());
                if (f.getValue().isBuiltInV()){
                   return (<BuiltInV> f.getValue()).step(node, evalu);
               }
            }
        }

        /*private*/
        constructor(name : string) {
            super() ;
            this._val = name;
        }

        public static theCallWorldLabel = new CallWorldLabel("");

        public toJSON() : any {
            return { kind: "CallWorldLabel" , name: this._val } ;
        }

        public static fromJSON( json : any ) : CallWorldLabel {
            return new CallWorldLabel( json.name ) ;
        }
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

        nodeStep(node, evalu){}//Placeholders don't need to to step

        // Singleton
        public static theExprPHLabel = new ExprPHLabel();

        public toJSON() : any {
            return { kind: "ExprPHLabel" } ;
        }

        public static fromJSON( json : any ) : ExprPHLabel {
            return ExprPHLabel.theExprPHLabel ;
        }
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

        toString():string {
            return "lambda";
        }

        /*private*/
        constructor() {
            super();
        }

        nodeStep(node, evalu){

        }

        // Singleton
        public static theLambdaLabel = new LambdaLabel();

        public toJSON() : any {
            return { kind: "LambdaLabel" } ;
        }

        public static fromJSON( json : any ) : LambdaLabel {
            return LambdaLabel.theLambdaLabel ;
        }
    }

    //While and If Labels

    export class IfLabel extends ExprLabel {

        strategy:ifStrategy = new ifStrategy();

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

        nodeStep(node, evalu){
            var guardPath = evalu.getPending().concat([0]);
            var thenPath = evalu.getPending().concat([1]);
            var elsePath = evalu.getPending().concat([2]);
            var v : Value;
            var string = <StringV>evalu.varmap.get(guardPath);
            if( string.contents.match("true")){
                v = evalu.varmap.get( thenPath );
            }

            else{
                v = evalu.varmap.get( elsePath );
            }
            evalu.finishStep( v );
        }

        // Singleton
        public static theIfLabel = new IfLabel();

        public toJSON() : any {
            return { kind: "IfLabel" } ;
        }

        public static fromJSON( json : any ) : IfLabel {
            return IfLabel.theIfLabel ;
        }
    }

    export class WhileLabel extends ExprLabel {

        strategy:whileStrategy = new whileStrategy();

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

        nodeStep(node, evalu){

        }

        // Singleton
        public static theWhileLabel = new WhileLabel();

        public toJSON() : any {
            return { kind: "WhileLabel" } ;
        }

        public static fromJSON( json : any ) : WhileLabel {
            return WhileLabel.theWhileLabel ;
        }
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

        public toJSON() : any {
            return { kind: "NoTypeLabel" } ;
        }

        public static fromJSON( json : any ) : NoTypeLabel {
            return NoTypeLabel.theNoTypeLabel ;
        }
    }

     //Literal Labels

     export class StringLiteralLabel extends ExprLabel {
        _val : string ;

        strategy : LiteralStrategy = new LiteralStrategy();

        constructor( val : string) { super() ; this._val = val ; }

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

        toString() : string { return "string[" + this._val + "]"  ; }

         public static theStringLiteralLabel = new StringLiteralLabel( "" );

         nodeStep(node, evalu){
             evalu.finishStep( new StringV(this._val) );
         }

        public toJSON() : any {
            return { kind: "StringLiteralLabel", val : this._val } ;
        }

        public static fromJSON( json : any ) : StringLiteralLabel {
            return new StringLiteralLabel( json.val )  ;
        }
     }

    export class NumberLiteralLabel extends ExprLabel {
        _val : string ;

        constructor( val : string) { super() ; this._val = val ; }

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
            return this._val ;
        }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "number[" + this._val + "]"  ; }

        nodeStep(node, evalu){

        }

        public static theNumberLiteralLabel = new NumberLiteralLabel( "" );

        public toJSON() : any {
            return { kind: "NumberLiteralLabel", val : this._val } ;
        }

        public static fromJSON( json : any ) : NumberLiteralLabel {
            return new NumberLiteralLabel( json.val )  ;
        }
    }

    export class BooleanLiteralLabel extends ExprLabel {
        _val : string ;

        constructor( val : string) { super() ; this._val = val ; }

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

        toString() : string { return "boolean[" + this._val + "]"  ; }

        nodeStep(node, evalu){

        }

        // The following line makes no sense.
        public static theBooleanLiteralLabel = new BooleanLiteralLabel( "" );

        public toJSON() : any {
            return { kind: "BooleanLiteralLabel", val : this._val } ;
        }

        public static fromJSON( json : any ) : BooleanLiteralLabel {
            return new BooleanLiteralLabel( json.val )  ;
        }
    }


    export class NullLiteralLabel extends ExprLabel {
        constructor() { super() ; }

        isValid( children : Array<PNode> ) {
            return children.length == 0;}

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "null"  ; }

        nodeStep(node, evalu){

        }

        public static theNullLiteralLabel = new NullLiteralLabel();

        public toJSON() : any {
            return { kind: "NullLiteralLabel" } ;
        }

        public static fromJSON( json : any ) : NullLiteralLabel {
            return  NullLiteralLabel.theNullLiteralLabel ;
        }
    }

    export class CallLabel extends ExprLabel {

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
            return null;
        }

        /*private*/
        constructor() {
            super() ;
        }

        nodeStep(node, evalu){

        }

        // Singleton
        public static theCallLabel = new CallLabel();

        public toJSON() : any {
            return { kind: "CallLabel" } ;
        }

        public static fromJSON( json : any ) : CallLabel {
            return CallLabel.theCallLabel ;
        }
    }


    //Placeholder Make
    export function mkExprPH():ExprNode {
        return <ExprNode> make(ExprPHLabel.theExprPHLabel, []);
    }

    //Loop and If Make
    export function mkIf(guard:ExprNode, thn:ExprSeqNode, els:ExprSeqNode):ExprNode {
        return <ExprNode> make(IfLabel.theIfLabel, [guard, thn, els]); }

    export function mkWorldCall(left:ExprNode, right:ExprNode):ExprNode {
        return <ExprNode> make(CallWorldLabel.theCallWorldLabel, [left, right]); }

    export function mkWhile(cond:ExprNode, seq:ExprSeqNode):ExprNode {
        return <ExprNode> make(WhileLabel.theWhileLabel, [cond, seq]); }

    export function mkExprSeq( exprs : Array<ExprNode> ) : ExprSeqNode {
        return <ExprSeqNode> make( ExprSeqLabel.theExprSeqLabel, exprs ) ; }

    //Const Make
    export function mkStringLiteral( val : string ) : ExprNode{
        return <ExprNode> make( new StringLiteralLabel(val),[] ) ; }

    export function mkNumberLiteral( val : string ) : ExprNode{
        return <ExprNode> make( new NumberLiteralLabel(val),[] ) ; }

    export function mkBooleanLiteral( val : string ) : ExprNode{
        return <ExprNode> make( new BooleanLiteralLabel(val),[] ) ; }

    export function mkVar( val :string) : ExprNode{
        return <ExprNode> make (new VariableLabel(val), []) ;}

    // JSON support

    export function fromPNodeToJSON( p : PNode ) : string {
        var json = p.toJSON() ;
        return JSON.stringify( json ) ; }

    export function fromJSONToPNode( s : string ) : PNode {
        var json = JSON.parse( s ) ;
        return PNode.fromJSON( json ) ; }

    function fromJSONToLabel( json : any ) : Label {
         // There is probably a reflective way to do this
         //   Perhaps
         //       var labelClass = pnode[json.kind] ;
         //       check that labelClass is not undefined
         //       var  fromJSON : any => Label = labelClass["fromJSON"] ;
         //       check that fromJSON is not undefined
         //       return fromJSON( json ) ;
         var labelClass = pnode[json.kind] ; // This line relies on
             //  (a) the json.kind field being the name of the concrete label class.
             //  (b) that all the concrete label classes are exported from the pnode module.
         assert.check( labelClass !== undefined ) ; //check that labelClass is not undefined
         var  fromJSON : (json : any) => Label = labelClass["fromJSON"] ; //
         assert.check( fromJSON !== undefined ) // check that fromJSON is not undefined
         return fromJSON( json ) ;
         // If the code above doesn't work, then make a big ugly switch like this:
         // switch( json.kind ) {
             // case "VariableLabel" : return VariableLabel.fromJSON( json ) ;
             // // and so on.
             // default : assert.check(false ) ;
         // }
    }
}

export = pnode ;