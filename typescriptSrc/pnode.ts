/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="valueTypes.ts" />
/// <reference path="vms.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import valueTypes = require( './valueTypes' ) ;
import vms = require('./vms' ) ;

/** Module pnode contains the PNode class and the implementations of the labels. */
module pnode {
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;
    import none = collections.none;
    import some = collections.some;
    import VMS = vms.VMS;
    import Evaluation = vms.Evaluation;
    import VarStack = vms.VarStack;
    import EvalStack = vms.EvalStack;
    import Value = vms.Value;
    import BuiltInV = valueTypes.BuiltInV;
    import ValueMap = vms.ValueMap;
    import FieldI = vms.FieldI ;
    import Field = valueTypes.Field;
    import ClosureV = valueTypes.ClosureV;
    import StringV = valueTypes.StringV;
    import arrayToList = collections.arrayToList;
    import Type = vms.Type;
    import ObjectV = valueTypes.ObjectV;

    export interface nodeStrategy {
        select( vms : VMS, label:Label ) : void;
    }


    /** Labels are used to label PNodes. Like PNodes, Labels are immutable objects. */
    export interface Label {
        isValid : (children:Array<PNode>) => boolean ;
        strategy:nodeStrategy;
        step : (vms:VMS) => void;

        /** Get the string value associated with the node, if there is one.
         * For example for variables, this would be the name of the variable.
         * Labels that don't have a string associated with them must return null.
         * Labels that do must not return null .
         * TODO:  Better to return an option.
         * TODO: Change name to getString.
         */
        getVal : () => string ; 

        /** Labels with string values can be open or closed.
         * When open they display in a way that permits the string value to be edited.
         * Labels that don't have a string associated with them should return None.
         * Labels that do have a string associated with them should return Some.
         */
        isOpen : () => boolean ;

        /** Attempt to open the label.
         * Labels that don't have a string associated with them should return None. 
         * Labels that don't have a string associated with them should return Some with
         * an argument that is open. 
         */
        open : () => Option<Label> ; 

        /** Possibly change the string value associated with this label. 
         * The argument must not be null!
         * Labels that don't have a string associated with them should return None.
         * Labels that do have a string associated with them should return Some unless
         * there is a validity problem. E.g. the string associated with a number should be
         * properly formatted.  If it returns Some, the new label should be closed.
        */
        changeString : (newString : string) => Option<Label> ;

        /** Convert the label to an object that we can put out as JSON.
         * This object must of a "kind" field and the value of that field must be the name of the 
         * concrete class that implements Label.
         * 
         * Each concrete class implementing Label must also have a public
         * static method called fromJSON which takes an object such as the one returned from toJSON.*/
        toJSON : () => any ;

        /** Is this label a label for an expression node? */
        isExprNode : () => boolean ;

        /** Is this label a label for an expression sequence node? */
        isExprSeqNode : () => boolean ;

        /** Is this label a label for a type node node? */
        isTypeNode : () => boolean ;
    }

    /** PNodes are abstract syntax trees for the PLAAY language.
     * Each PNode consists of a Label and a sequence of 0 or more children.
     * 
     * PNodes are immutable objects.
     * 
     * Each PNode represents a valid tree in the sense that, if `l` is its label
     * and `chs` is an array of its children, then `l.isValid(chs)` must be true.
    */
    export class PNode {
        private _label:Label;
        private _children:Array<PNode>;

        /** Construct a PNode.
         *  recondition: label.isValid( children )
         * @param label A Label for the node.
         * @param children: A list (Array) of children
         */
        constructor(label:Label, children:Array<PNode>) {
            //Precondition  would not need to be checked if the constructor were private.
            assert.check(label.isValid(children),
                "Attempted to make an invalid program node");
            this._label = label;
            this._children = children.slice();  // Must make copy to ensure immutability.
        }

        /** How many children. */
        public count():number {
            return this._children.length;
        }

        /** Get some of the children as an array. */
        public children(start:number, end:number):Array<PNode> {
            if (start === undefined) start = 0;
            if (end === undefined) end = this._children.length;
            assert.checkPrecondition( 0 <= start && start <= this.count() ) ;
            assert.checkPrecondition( 0 <= end && end <= this.count() ) ;
            return this._children.slice(start, end);
        }

        /** Get one child. */
        public child(i:number):PNode {
            assert.checkPrecondition( 0 <= i && i < this.count() ) ;
            return this._children[i];
        }

        /** Get the label. */
        public label():Label {
            return this._label;
        }

        /* Return the node at the path */
        public get(path : collections.List<number> | Array<number> ) : PNode {
            // TODO. Do we really need to be able to pass in an array?
             if( path instanceof Array ) 
                 return this.listGet( collections.arrayToList( path ) ) ;
             else if( path instanceof collections.List ) {
                return this.listGet( path ) ; }
             else { assert.checkPrecondition( false, "Bad path argument.") ; return null ; }
        }

        private listGet(path : collections.List<number> ) : PNode {
             if(path.isEmpty() ) return this ;
             else return this.child( path.first() ).listGet( path.rest() ) ;
         }


        /** Possibly return a copy of the node in which the children are replaced.
         * The result will have children
         * ~~~
         *    [c[0], c[1], c[start-1]] ++ newChildren ++ [c[end], c[end+1], ...]
         * ~~~
         * where `c` is `this.children()`.
         * I.e. the segment `c[ start,.. end]` is replaced by `newChildren`.
         * The method succeeds iff the node required to be constructed would be valid.
         * Node that start and end can be any number value including negative.
         * Negative numbers `k` are treated as `length + k`, where `length`
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
            return ! this.tryModify(newChildren, start, end).isEmpty();
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

        /** Attempt to change the label at the root of this tree.
         * @Returns Either Some(t) where t is a tree with a new label or returns None, if such a tree is not valid.
         */
        public tryModifyLabel(newLabel:Label):Option<PNode> {
            return tryMake(newLabel, this._children);
        }

        /** Can the label be modified. See tryModifyLabel. */
        public canModifyLabel(newLabel:Label):boolean {
            return !this.tryModifyLabel(newLabel).isEmpty();
        }

        /** Return a tree with a different label and the same children.
         * 
         * Precondition: `canModifyLabel(newLabel)`
         */
        public modifyLabel(newLabel:Label):PNode {
            var opt = this.tryModifyLabel(newLabel);
            return opt.choose(
                p => p,
                () => {
                    assert.checkPrecondition(false, "Precondition violation on PNode.modifyLabel");
                    return null;
                })
        }

        public isExprNode():boolean { return this._label.isExprNode() ; }

        public isExprSeqNode():boolean  { return this._label.isExprSeqNode() ; }

        public isTypeNode():boolean  { return this._label.isTypeNode() ; }

        /** Convert to a string for debugging purposes. */
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


    /** Try to make a PNode.
     * @returns `Some( t )` if a valid tree can be made. `None()` otherwise.
     */
    export function tryMake(label:Label, children:Array<PNode>):Option<PNode> {
        if (label.isValid(children)) {
            //console.log("tryMake: label is " +label+ " children.length is " +children.length ) ; 
            return new Some(new PNode(label, children));
        }
        else {
            return new None<PNode>();
        }
    }

    /** Equivalent to `label.isValid(children)`. Also equivalent to `! tryMake(label, children).isEmpty()`.
     */
    export function canMake(label:Label, children:Array<PNode>):boolean {
        return label.isValid(children)
    }

    /** Construct a PNode.
     * Precondition: label.isValid( children )
     * @param label A Label for the node.
     * @param children: A list (Array) of children
     */
    export function make(label:Label, children:Array<PNode>):PNode {
        return new PNode(label, children);
    }

    export function lookUp( varName : string, stack : VarStack ) : FieldI {
        return stack.getField(varName);
    }

    export class lrStrategy implements nodeStrategy {
        select( vms : VMS, label:Label ) : void {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();

            if(pending != null) {
                var node = evalu.root.get(arrayToList(pending));

                if(node.label() == label){
                    var flag = true;
                    for(var i = 0; i < node.count(); i++){
                        var p = pending.concat([i]);
                        if(!evalu.map.inMap(p)){
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
                            if(!evalu.map.inMap(p)){
                                n = i;
                                break;
                            }
                        }
                        vms.evalStack.top().setPending(pending.concat([n]));
                        node.child(n).label().strategy.select(vms, node.child(n).label() );
                    }
                }
            }
        }
    }

    export class varStrategy implements nodeStrategy {
        select( vms:VMS, label:Label ){
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if(pending != null){
                var node = evalu.root.get(arrayToList(pending));
                if(node.label() == label){
                  //TODO how to highlight  look up the variable in the stack and highlight it.
                    if (!evalu.getStack().inStack(label.getVal())){} //error} //there is no variable in the stack with this name TODO THIS FUNCTION IS BROKEN
                    else{evalu.ready = true;}
                }
            }
        }
   }

    export class whileStrategy implements nodeStrategy {

        deletefromMap(vms:VMS, path : Array<number>){
            for (var i = 0; i < vms.getEval().getRoot().get(path).count(); i++) {
                var childPath = path.concat([i]);
                this.deletefromMap(vms, childPath);
            }
            vms.getEval().getValMap().remove(path);

        }

        select(vms:VMS, label:Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            assert.check( pending != null ) ;
            var node = evalu.root.get(pending);
            let guardPath = pending.concat([0]);
            let bodyPath = pending.concat([1]);
            let guardMapped = evalu.map.inMap(guardPath) ;
            let bodyMapped = evalu.map.inMap(bodyPath) ;
            if ( guardMapped && bodyMapped ){
                // Both children mapped; step
                // this node.
                evalu.ready = true;
            } else if( guardMapped ) {
                let value = evalu.map.get(guardPath);
                if( ! (value instanceof StringV) ) {
                    // TODO Fix error handling
                    throw new Error ("Type error.  Guard of while loop must be true or false.") ;
                } else {
                    let strVal = <StringV> value ;
                    let str = strVal.contents ;
                    if( str == "true" ) {
                        evalu.setPending(bodyPath);
                        node.child(1).label().strategy.select( vms, node.child(1).label() );
                    } else if( str == "false" ) {
                        evalu.ready = true ;
                    } else {
                        // TODO Fix error handling
                        throw new Error ("Type error.  Guard of while loop must be true or false.") ;
                    }
                }
            }
        }
    }

    export class lambdaStrategy implements nodeStrategy {

        select(vms:VMS, label:Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if(pending != null){
                var node = evalu.root.get(pending);
                if(node.label() == label){
                        evalu.ready = true;
                }
            }
        }
    }

    export class assignStrategy implements nodeStrategy {
        select(vms:VMS, label:Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(arrayToList(pending));
                if (node.label() == label) {
                    var p = pending.concat([1]);
                    if(!evalu.map.inMap(p)){
                        vms.evalStack.top().setPending(p);
                        node.child(1).label().strategy.select(vms, node.child(1).label());
                    }

                    else{
                        evalu.ready = true;// Select this node.
                    }
                }
            }
        }
    }

    export class LiteralStrategy implements nodeStrategy {
        select( vms:VMS, label:Label ){
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if(pending != null){
                var node = evalu.root.get(arrayToList(pending));
                if(node.label() == label){
                    vms.evalStack.top().ready = true;
                }
            }
        }
    }

     export class ifStrategy implements nodeStrategy {
        select( vms : VMS, label:Label){
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if(pending != null){
                var node = evalu.root.get(pending);
                if(node.label() == label){
                    var guardPath = pending.concat([0]);
                    var thenPath = pending.concat([1]);
                    var elsePath = pending.concat([2]);
                    if (evalu.map.inMap(guardPath)){
                        var string = <StringV>evalu.map.get(guardPath);
                        if (string.contents.match("true")){
                            if(evalu.map.inMap(thenPath)){
                                evalu.ready = true;
                            }
                            else{
                                evalu.setPending(thenPath);
                                node.child(1).label().strategy.select( vms, node.child(1).label() );
                            }
                        }

                        else if(string.contents.match("false")){
                            if (evalu.map.inMap(elsePath)){
                                evalu.ready = true;
                            }

                            else{
                                evalu.setPending(elsePath);
                                node.child(2).label().strategy.select( vms, node.child(2).label() );
                            }
                        }

                        else{
                            throw new Error ("Error evaluating " + string.contents + " as a conditional value.") ;
                        }
                    }

                    else{
                        evalu.setPending(guardPath);
                        node.child(0).label().strategy.select( vms, node.child(0).label() );
                    }
                }
            }
        }
    }

    export class varDeclStrategy implements nodeStrategy {
        select( vms : VMS, label:Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    var nameofVar = pending.concat([0]);
                    var valueofVar = pending.concat([2]);
                    if (evalu.map.inMap(nameofVar)) {
                        var name = <StringV> evalu.map.get(nameofVar);
                        if(! lookUp(name.getVal(), evalu.getStack())) {
                            if (evalu.map.inMap(valueofVar)) {
                                evalu.ready = true;
                            } else {
                                evalu.setPending(valueofVar);
                                node.child(2).label().strategy.select(vms, node.child(2).label());
                            }
                        }
                        else {
                            throw new Error("Variable name already exists!");
                        }
                    }
                    else {
                        evalu.setPending(nameofVar);
                        node.child(0).label().strategy.select(vms, node.child(0).label());
                    }
                }
            }
        }
    }

    export class TurtleStrategy implements nodeStrategy {
        select( vms : VMS, label:Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    var value = pending.concat([0]);
                    if (evalu.map.inMap(value)) {
                        evalu.ready = true;
                    }
                    else {
                        evalu.setPending(value);
                        node.child(0).label().strategy.select(vms, node.child(0).label());
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




    /** Abstract base class for all Labels. */
    abstract class AbstractLabel implements Label {

        /*private*/
        constructor() {
        }

        getVal() : string {
            return null ; }

        isOpen() : boolean { return false ; }

        open() : Option<Label>  { return none<Label>() ; }

        changeString (newString : string) : Option<Label> {
            return none<Label>();
        }

        abstract isValid(children:Array<PNode>) : boolean ;

        abstract toJSON() : any ;

        /** Is this label a label for an expression node? */
        abstract isExprNode() : boolean ;

        /** Is this label a label for an expression sequence node? */
        abstract isExprSeqNode() : boolean ;

        /** Is this label a label for a type node node? */
        abstract isTypeNode() : boolean ;

        // TODO Delete
        strategy:nodeStrategy;

        // TODO Delete
        abstract step(vms:VMS) : void;
    }


    /** Abstract base class for all expression labels.  */
    export abstract class ExprLabel extends AbstractLabel {


        abstract nodeStep(node:PNode, evalu:Evaluation, vms:VMS) : void ;

        strategy:nodeStrategy;

        /*private*/
        constructor() {
            super() ;
        }

        select(vms:VMS) : void {
            this.strategy.select(vms, this);
        }

        //Template
        step(vms:VMS) : void {
            // TODO fix this crap.
            if(vms.evalStack.top().ready == true){
                var evalu = vms.evalStack.top();
                var pending = evalu.getPending();
                if(pending != null) {
                    var node = evalu.root.get(arrayToList(pending));
                    this.nodeStep(node, evalu, vms);
                }
                else{}//error
            }
        }

        isExprNode() { return true ; }

        isExprSeqNode() { return false ; }

        isTypeNode() { return false ; }

        // Singleton
        //public static theExprLabel = new ExprLabel();

        abstract toJSON() : any ;
    }

    /** A sequence of expressions. */
    export class ExprSeqLabel  extends AbstractLabel {
        isValid(children:Array<PNode>) {
            return children.every(function (c:PNode) {
                return c.isExprNode()
            });
        }

        strategy : lrStrategy = new lrStrategy();

        step(vms:VMS) {

            var pending = vms.getEval().getPending();

            var thisNode = vms.getEval().getRoot().get(arrayToList(pending));
            var valpath = pending.concat([thisNode.count() - 1]);

            var v = vms.getEval().map.get( valpath );

            vms.getEval().finishStep( v );

        }

        toString():string {
            return "seq";
        }

        /*private*/
        constructor() {
            super() ;
        }

        select(vms:VMS){
            this.strategy.select(vms, this);
        }

        isExprNode() { return false ; }

        isExprSeqNode() { return true ; }

        isTypeNode() { return false ; }

        // Singleton
        public static theExprSeqLabel = new ExprSeqLabel();

        public toJSON() : any {
            return { kind:  "ExprSeqLabel" } ; }

        public static fromJSON( json : any ) : ExprSeqLabel {
            return ExprSeqLabel.theExprSeqLabel ; }
    }

    /** A parameter list.  */
    export class ParameterListLabel  extends AbstractLabel{
        isValid(children:Array<PNode>) {
            return children.every(function (c:PNode) {
                // TODO Shouldn't these all be VarDecls?
                return c.isExprNode()
            });
        }

        strategy : lrStrategy = new lrStrategy();

        step(vms:VMS) {
            //TODO should the parameter list do anything? I don't think it does - JH
        }

        toString():string {
            return "param";
        }

        /*private*/
        constructor() {
            super() ;
        }

        select(vms:VMS){
            this.strategy.select(vms, this);
        }

        // Singleton
        public static theParameterListLabel = new ParameterListLabel();

        isExprNode() { return false ; }

        isExprSeqNode() { return false ; }

        isTypeNode() { return false ; }

        public toJSON() : any {
            return { kind:  "ParamLabel" } ; }

        public static fromJSON( json : any ) : ParameterListLabel {
            return ParameterListLabel.theParameterListLabel ; }
    }

    /** Abstract base class for all type labels.  */
    export abstract class TypeLabel  extends AbstractLabel {

        abstract isValid(children:Array<PNode>) ;

        strategy : nodeStrategy;

        /*private*/
        constructor() {
            super() ;
        }

        step( vms : VMS) {
            //TODO not sure yet
        }

        isExprNode() { return false ; }

        isExprSeqNode() { return false ; }

        isTypeNode() { return true ; }

        public abstract toJSON() : any ;
    }

    abstract class ExprLabelWithString extends ExprLabel {

        protected _val : string; 
        
        protected _open : boolean ;

        protected
        constructor(name : string, open : boolean ) {
            super() ;
            this._val = name;
            this._open = open ;
        }

        getVal() : string {
            return this._val;
        }

        isOpen() : boolean {
            return this._open ;
        }
    }

    /** References to variables.  */
    export class VariableLabel extends ExprLabelWithString {
        strategy:varStrategy = new varStrategy();

        isValid(children:Array<PNode>):boolean {
            return children.length == 0;
        }

        toString():string {
            return " variable["+this._val+"]" ;
        }

        open() : Option<Label> {
            return some( new VariableLabel( this._val, true ) ) ;
        }

        changeString (newString : string) : Option<Label> {
            const newLabel = new VariableLabel(newString, false);
            return new Some(newLabel);
        }

        nodeStep(node, evalu){
            var v = lookUp( this._val, evalu.stack).getValue();

            evalu.finishStep( v )
        }

        private
        constructor(name : string, open : boolean ) {
            super(name, open) ;
        }

        public toJSON() : any {
            return { kind : "VariableLabel", name : this._val, open : this._open } ;
        }

        public static fromJSON( json : any ) : VariableLabel {
            return new VariableLabel( json.name, json.open ) ; }

    }

    /** Variable declaration nodes. */
    export class VarDeclLabel extends ExprLabel {

        protected _isConst : boolean ;

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 3) return false ;
            if( ! (children[0] instanceof VariableLabel) ) return false ;
            if( ! children[1].isTypeNode()) return false ;
            if( ! children[2].isExprNode()) return false ;
            return true;
        }

        strategy : varDeclStrategy = new varDeclStrategy();

        toString():string {
            return "vdecl";
        }

        private
        constructor( isConst : boolean ) {
            super() ;
            this._isConst = isConst ;
        }

        nodeStep(node, evalu){
            var varNamePath = evalu.getPending().concat([0]);
            var typePath = evalu.getPending().concat([1]);
            var varValuePath = evalu.getPending().concat([2]);

            var name = <StringV> evalu.varmap.get( varNamePath );
            var value = evalu.varmap.get( varValuePath );
            var typelabel = evalu.getRoot().get(arrayToList(typePath)).label();

            var type = Type.NULL;
            if (typelabel.toString() == "noType") {
                type = Type.ANY;
            }

            var isConst = this._isConst; //TODO false for now for testing purposes


            var v = new Field(name.getVal(), value, type, isConst);

            evalu.getStack().top().addField( v );

            evalu.finishStep( v.getValue() );
        }

        public toJSON() : any {
            return { kind: "VarDeclLabel", isConst: this._isConst } ;
        }

        public static fromJSON( json : any ) : VarDeclLabel {
            return new VarDeclLabel( json._isConst ) ;
        }
    }

    /** Assignments.  */
    export class AssignLabel extends ExprLabel {
        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true;
        }

        strategy:assignStrategy = new assignStrategy();

        toString():string {
            return "assign";
        }

        /*private*/
        constructor() {
            super();
        }

        nodeStep(node, evalu){
            var leftside = evalu.getPending().concat([0]);
            var rightside = evalu.getPending().concat([1]);
            var rs = <StringV>evalu.varmap.get(rightside);

            var lNode = evalu.getRoot().get(leftside);
            //make sure left side is var
            if(lNode.label() instanceof VariableLabel ){
                //if in stack
                if(evalu.getStack().inStack(lNode.label().getVal())) {
                    evalu.getStack().setField(lNode.label().getVal(), rs);
                }
                else{
                    throw new Error("Variable is not in map! Declare it first!");
                }
                evalu.finishStep(rs);

            }
            else{
                //invalid node
            }
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


    /** Calls to explicitly named functions.
     * TODO Change the name to something else. */
    export class CallWorldLabel extends ExprLabelWithString  {

        strategy : lrStrategy = new lrStrategy();

        isValid(children:Array<PNode>):boolean {
            return children.every(function(c : PNode) { return c.isExprNode() } ) ;
        }

        toString():string {
            return "callWorld";
        }

        open() : Option<Label> {
            return some( new CallWorldLabel( this._val, true ) ) ;
        }

        changeString (newString : string) : Option<Label> {
            const newLabel = new CallWorldLabel(newString, false);
            return new Some(newLabel);
        }

        nodeStep(node, evalu, vms){
            if (evalu.getStack().inStack(this._val.toString()) ) {
               var field = evalu.getStack().getField(this._val.toString());
                if (field.getValue().isBuiltInV()){
                     return  (<BuiltInV> field.getValue()).step(node, evalu);
                }
                else if( field.getValue().isClosureV() ) {
                        var v : Value = field.getValue() ;
                        var c : ClosureV = <ClosureV> v ;
                        var f : PNode = c.getLambdaNode() ;

                        //a bunch of pNodes(non parameter children)
                        var argList : Array<Value> = new Array();

                        var i = 0;
                        while(evalu.varmap.get(evalu.getPending().concat(i)) != null){
                            argList.push(evalu.varmap.get(evalu.getPending().concat(i)));
                            i++;
                        }

                        if(argList.length != f.child(0).count()){}//error
                        //		if (any argument has a value not compatible with the corresponding parameter type){}
                        // error!

                        //list of parameters (I think)
                        var param = f.child(0).children; //TODO

                        var arFields : Array<Field>;//fields to go in the stack
                        arFields = new Array();

                        for(var j = 0; j < f.child(0).count(); j++){
                            //name, val, type, isConst
                            var fields = new Field(param[j].name, argList[j], Type.ANY, false);//TODO, what should argList be giving? Values?
                            //Also, do we even know the values? Do we look them up?
                            arFields.push(fields);
                        }

                        var activationRecord = new ObjectV();
                        for(var k = 0; k < arFields.length; k++){
                            activationRecord.addField(arFields[k]);
                        }

                        var stack = new VarStack(activationRecord, c.getContext());

                        var newEval = new Evaluation(f, stack);
                        newEval.setPending([]);
                        vms.stack.push( newEval );
                    }
                else {
                    // TODO report error. Field exists but is not a function.
                }
            }
            else {
                // TODO report error. Field with the name does not exist.
            }
        }

        private
        constructor(name : string, open : boolean ) {
            super( name, open ) ;
        }

        public toJSON() : any {
            return { kind: "CallWorldLabel" , name: this._val, open: this._open } ;
        }

        public static fromJSON( json : any ) : CallWorldLabel {
            return new CallWorldLabel( json.name, json.open ) ;
        }
    }

    /** Place holder nodes for expression. */
    export class ExprPHLabel extends ExprLabel {

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 0) return false ;
            return true;
        }

        toString():string {
            return "expPH";
        }

        private
        constructor() {
            super();
        }

        // TODO: Stepping a place holder is a run time error.
        nodeStep(node, evalu){}

        // Singleton
        public static theExprPHLabel = new ExprPHLabel();

        public toJSON() : any {
            return { kind: "ExprPHLabel" } ;
        }

        public static fromJSON( json : any ) : ExprPHLabel {
            return ExprPHLabel.theExprPHLabel ;
        }
    }

    /** This class is for optional expressions where there is no expression.
     * Not to be confused with the expression place holder ExpPHLabel which is used when an expression is manditory.
     */
    export class NoExprLabel extends AbstractLabel {

        strategy : LiteralStrategy = new LiteralStrategy();

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 0) return false ;
            return true;
        }

        toString():string {
            return "noExpr";
        }

        /*private*/
        constructor() {
            super();
        }

        isExprNode() { return false ; }

        isExprSeqNode() { return false ; }

        isTypeNode() { return false ; }


        step(vms:VMS) : void {} // TODO Get rid of this.

        // Singleton
        public static theNoExprLabel = new NoExprLabel();

        public toJSON() : any {
            return { kind: "ExprOptLabel" } ;
        }

        public static fromJSON( json : any ) : NoExprLabel {
            return NoExprLabel.theNoExprLabel ;
        }
    }

    /** Function (or method) literals. */
    export class LambdaLabel extends ExprLabel {
        strategy : lambdaStrategy = new lambdaStrategy();

        isValid( children : Array<PNode> ) {
            // TODO: Lambdas should have 4 children. See AST docs.
             if( children.length != 3 ) return false ;
             if ( ! children[0].isExprSeqNode() ) return false ;
             if( ! children[1].isTypeNode() ) return false ;
             if( ! children[2].isExprSeqNode() ) return false ;
             return true;
         }

        toString():string {
            return "lambda";
        }

        private
        constructor() {
            super();
        }

        nodeStep(node, evalu) {
            var clo = new ClosureV( node, evalu.getStack()) ;//TODO this is the correct stack?

//            var name = <StringV> node.label().getVal();
            var v = new Field(node.label().getVal(), clo, Type.ANY, true);
            evalu.getStack().top().addField( v );

            evalu.finishStep(clo);
            //TODO should there be anything about creating a new stack in here, or is this for call?

           /* var paramPath = evalu.getPending().concat([0]);
            var functionPath = evalu.getPending().concat([2]);

            var paramNode = evalu.getRoot().get(arrayToList(paramPath));
            var argList = new Array();
            for (var i = 0; i < paramNode.count(); i++){
                argList.push(evalu.getVarMap().get(paramPath.concat([i])));
            }
*/
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

    /** If expressions */
    export class IfLabel extends ExprLabel {

        strategy:ifStrategy = new ifStrategy();

        isValid(  children : Array<PNode> ) : boolean {
         if( children.length != 3 ) return false ;
         if( ! children[0].isExprNode() ) return false ;
         if( ! children[1].isExprSeqNode() ) return false ;
         if( ! children[2].isExprSeqNode() ) return false ;
         return true ; }

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

    /** While loop expressions */
    export class WhileLabel extends ExprLabel {

        strategy:whileStrategy = new whileStrategy();

        isValid(  children : Array<PNode> ) : boolean {
         if( children.length != 2 ) return false ;
         if( ! children[0].isExprNode() ) return false ;
         if( ! children[1].isExprSeqNode() ) return false ;
         return true ; }

        toString():string {
            return "while";
        }

        /*private*/
        constructor() {
            super();
        }

        nodeStep(node, evalu){
            var loopPath = evalu.getPending().concat([1]);
            var v = evalu.varmap.get( loopPath );
            evalu.finishStep( v );
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

    /** An indication that an optional type lable is not there. */
    export class NoTypeLabel extends TypeLabel {
        // TODO: Should this really extend TypeLabel?

        // TODO:  Note that no selection strategy is needed for this label
        strategy : nodeStrategy;

        isValid(children:Array<PNode>):boolean {
            return children.length == 0;}

        toString():string {
            return "noType";
        }
    
        // TODO: No step is needed for this label
        step ( vms : VMS ) {

        }

        /*private*/
        constructor() { super() ; }

        // Singleton
        public static theNoTypeLabel = new NoTypeLabel();

        public toJSON() : any {
            return { kind: "NoTypeLabel" } ;
        }

        public static fromJSON( json : any ) : NoTypeLabel {
            return NoTypeLabel.theNoTypeLabel ;
        }
    }

    /** String literals. */
    export class StringLiteralLabel extends ExprLabelWithString {

        strategy : LiteralStrategy = new LiteralStrategy();

        constructor( val : string, open : boolean) { super(val, open) ; }

        isValid( children : Array<PNode> ) {
            return children.length == 0 ; }

        open() : Option<Label> {
            return some( new StringLiteralLabel( this._val, true ) ) ;
        }

        changeString (newString : string) : Option<Label> {
             const newLabel = new StringLiteralLabel(newString, false);
             return new Some(newLabel);
         }


        toString() : string { return "string[" + this._val + "]"  ; }

        nodeStep(node, evalu){
             evalu.finishStep( new StringV(this._val) );
         }

        public toJSON() : any {
            return { kind: "StringLiteralLabel", val : this._val, open: this._open } ;
        }

        public static fromJSON( json : any ) : StringLiteralLabel {
            return new StringLiteralLabel( json.val, json.open )  ;
        }
     }

    /** Number literals. */
    export class NumberLiteralLabel extends ExprLabelWithString {

        constructor( val : string, open : boolean ) { super( val, open ) ; }

        val() : string { return this._val ; }

        isValid( children : Array<PNode> ) {
            return children.length == 0 ;
        }

        open() : Option<Label> {
            return some( new NumberLiteralLabel( this._val, true ) ) ;
        }

        changeString (newString : string) : Option<Label> {
            const newLabel = new NumberLiteralLabel(newString, false);
            return new Some(newLabel);
        }

        toString() : string { return "number[" + this._val + "]"  ; }

        // TODO Stepper should be shared with string literal.
        nodeStep(node, evalu){

        }

        public toJSON() : any {
            return { kind: "NumberLiteralLabel", val : this._val, open : this._open } ;
        }

        public static fromJSON( json : any ) : NumberLiteralLabel {
            return new NumberLiteralLabel( json.val, json.open )  ;
        }
    }

    /** Boolean literals */
    export class BooleanLiteralLabel extends ExprLabelWithString {

        constructor( val : string, open : boolean) { super(val, open) ; }


        open() : Option<Label> {
            return some( new BooleanLiteralLabel( this._val, true ) ) ;
        }

        changeString (newString : string) : Option<Label> {
                var newLabel = new BooleanLiteralLabel(newString, false);
                return new Some(newLabel);
        }

        isValid( children : Array<PNode> ) {
            if(children.length != 0){return false}
            return this._val == "true" || this._val == "false" ;
        }

        toString() : string { return "boolean[" + this._val + "]"  ; }

        // TODO Stepper should be shared with string literal.
        nodeStep(node, evalu){

        }

        public toJSON() : any {
            return { kind: "BooleanLiteralLabel", val : this._val, open : this._open } ;
        }

        public static fromJSON( json : any ) : BooleanLiteralLabel {
            return new BooleanLiteralLabel( json.val, json.open )  ;
        }
    }

    /** Null literals. */
    export class NullLiteralLabel extends ExprLabel {
        constructor() { super() ; }

        isValid( children : Array<PNode> ) {
            return children.length == 0;}

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

    /** Call a function.  */
    export class CallLabel extends ExprLabel {

        strategy : lrStrategy = new lrStrategy();


        isValid(children:Array<PNode>) {
            return children.every(function (c:PNode) {
                return c.isExprNode()
            });
        }

        toString():string {
            return "call";
        }

        getVal() : string {
            return null;
        }

        /*private*/
        constructor() {
            super() ;
        }

        // TODO Complete this!
        nodeStep(node, evalu, vms){}

        // Singleton
        public static theCallLabel = new CallLabel();

        public toJSON() : any {
            return { kind: "CallLabel" } ;
        }

        public static fromJSON( json : any ) : CallLabel {
            return CallLabel.theCallLabel ;
        }
    }

    // TODO. Get rid of this and similar labels.
    export class PenLabel extends ExprLabel {
        _val:string; //either up or down
        strategy : TurtleStrategy = new TurtleStrategy();

        constructor(val:string) {
            super();
            this._val = val;
        }

        val():string {
            return this._val;
        }

        changeString(newString:string):Option<Label> {
            var newLabel = new PenLabel(newString);
            return new Some(newLabel);
        }

        isValid(children:Array<PNode>) {
            if (children.length != 1) {
                return false
            }
            return true;
        }

        getVal():string {
            return this._val;
        }

        toString():string {
            return "penup";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("penup") ) {
                var f = evalu.getStack().getField("penup");
                if (f.getValue().isBuiltInV()){
                    return  (<BuiltInV> f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static thePenLabel = new PenLabel("");

        public toJSON() : any {
            return { kind: "PenLabel" } ;
        }

        public static fromJSON( json : any ) : PenLabel {
            return PenLabel.thePenLabel ;
        }
    }

    export class ForwardLabel extends ExprLabel {
        _val:string; //
        strategy : TurtleStrategy = new TurtleStrategy();

        constructor(val:string) {
            super();
            this._val = val;
        }

        val():string {
            return this._val;
        }

        changeString(newString:string):Option<Label> {
            var newLabel = new ForwardLabel(newString);
            return new Some(newLabel);
        }

        isValid(children:Array<PNode>) {
            if (children.length != 1) {
                return false;
            }
            return true;
        }

        getVal():string {
            return this._val;
        }

        toString():string {
            return "forward";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("forward") ) {
                var f = evalu.getStack().getField("forward");
                if (f.getValue().isBuiltInV()){
                    return  (<BuiltInV> f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theForwardLabel = new ForwardLabel("");

        public toJSON() : any {
            return { kind: "forward" } ;
        }

        public static fromJSON( json : any ) : ForwardLabel {
            return ForwardLabel.theForwardLabel ;
        }
    }

    export class RightLabel extends ExprLabel {
        _val:string; //either left or right, depending on the sign of the value
        strategy : TurtleStrategy = new TurtleStrategy();

        constructor(val:string) {
            super();
            this._val = val;
        }

        val():string {
            return this._val;
        }

        changeString(newString:string):Option<Label> {
            var newLabel = new RightLabel(newString);
            return new Some(newLabel);
        }

        isValid(children:Array<PNode>) {
            if (children.length != 1) {
                return false;
            }
            return true;
        }

        getVal():string {
            return this._val;
        }

        toString():string {
            return "right";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("right") ) {
                var f = evalu.getStack().getField("right");
                if (f.getValue().isBuiltInV()){
                    return  (<BuiltInV> f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theRightLabel = new RightLabel("");

        public toJSON() : any {
            return { kind: "RightLabel" } ;
        }

        public static fromJSON( json : any ) : RightLabel {
            return RightLabel.theRightLabel ;
        }
    }

    export class ClearLabel extends ExprLabel {
        _val:string;
        strategy : LiteralStrategy = new LiteralStrategy();

        constructor() {
            super();
        }

        val():string {
            return this._val;
        }

        changeString(newString:string):Option<Label> {
            return new None<Label>();
        }

        isValid(children:Array<PNode>) {
            if (children.length != 0) {
                return false
            }
            return true;
        }

        getVal():string {
            return this._val;
        }

        toString():string {
            return "clear";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("clear") ) {
                var f = evalu.getStack().getField("clear");
                if (f.getValue().isBuiltInV()){
                    return  (<BuiltInV> f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theClearLabel = new ClearLabel();

        public toJSON() : any {
            return { kind: "ClearLabel" } ;
        }

        public static fromJSON( json : any ) : ClearLabel {
            return ClearLabel.theClearLabel ;
        }
    }

    export class HideLabel extends ExprLabel {
        _val:string;
        strategy : LiteralStrategy = new LiteralStrategy();

        constructor() {
            super();
        }

        val():string {
            return this._val;
        }

        changeString(newString:string):Option<Label> {
            return new None<Label>();
        }

        isValid(children:Array<PNode>) {
            if (children.length != 0) {
                return false
            }
            return true;
        }

        getVal():string {
            return this._val;
        }

        toString():string {
            return "hide";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("hide") ) {
                var f = evalu.getStack().getField("hide");
                if (f.getValue().isBuiltInV()){
                    return  (<BuiltInV> f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theHideLabel = new HideLabel();

        public toJSON() : any {
            return { kind: "HideLabel" } ;
        }

        public static fromJSON( json : any ) : HideLabel {
            return HideLabel.theHideLabel ;
        }
    }

    export class ShowLabel extends ExprLabel {
        _val:string;
        strategy : LiteralStrategy = new LiteralStrategy();

        constructor() {
            super();
        }

        val():string {
            return this._val;
        }

        changeString(newString:string):Option<Label> {
            return new None<Label>();
        }

        isValid(children:Array<PNode>) {
            if (children.length != 0) {
                return false
            }
            return true;
        }

        getVal():string {
            return this._val;
        }

        toString():string {
            return "show";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("show") ) {
                var f = evalu.getStack().getField("show");
                if (f.getValue().isBuiltInV()){
                    return  (<BuiltInV> f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theShowLabel = new ShowLabel();

        public toJSON() : any {
            return { kind: "ShowLabel" } ;
        }

        public static fromJSON( json : any ) : HideLabel {
            return ShowLabel.theShowLabel ;
        }
    }

    export class LeftLabel extends ExprLabel {
        _val:string; //either left or right, depending on the sign of the value
        strategy : TurtleStrategy = new TurtleStrategy();

        constructor(val:string) {
            super();
            this._val = val;
        }

        val():string {
            return this._val;
        }

        changeString(newString:string):Option<Label> {
            var newLabel = new LeftLabel(newString);
            return new Some(newLabel);
        }

        isValid(children:Array<PNode>) {
            if (children.length != 1) {
                return false
            }
            return true;
        }

        getVal():string {
            return this._val;
        }

        toString():string {
            return "left";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("left") ) {
                var f = evalu.getStack().getField("left");
                if (f.getValue().isBuiltInV()){
                    return  (<BuiltInV> f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theLeftLabel = new LeftLabel("");

        public toJSON() : any {
            return { kind: "LeftLabel" } ;
        }

        public static fromJSON( json : any ) : LeftLabel {
            return LeftLabel.theLeftLabel ;
        }
    }

    export function mkExprPH():PNode {
        return  make(ExprPHLabel.theExprPHLabel, []); }

    export function mkNoExpNd():PNode {
        return  make(NoExprLabel.theNoExprLabel, []); }


    export function mkIf(guard:PNode, thn:PNode, els:PNode):PNode {
        return make(IfLabel.theIfLabel, [guard, thn, els]); }

    export function mkWorldCall(left:PNode, right:PNode):PNode {
        return make(new CallWorldLabel("", true), [left, right]); }

    export function mkWhile(cond:PNode, seq:PNode):PNode {
        return make(WhileLabel.theWhileLabel, [cond, seq]); }

    export function mkExprSeq( exprs : Array<PNode> ) : PNode {
        return make( ExprSeqLabel.theExprSeqLabel, exprs ) ; }

    export function mkCallWorld( name : string, ...args : Array<PNode> ) {
        return make( new CallWorldLabel( name, true), args ) ; }
    
    export function mkCall( ...args : Array<PNode> ) {
        return make( CallLabel.theCallLabel, args ) ; }
    
    export function mkVarDecl( varNode : PNode, ttype : PNode, initExp : PNode ) {
        return make( new VarDeclLabel(false), [varNode, ttype, initExp ] ) ; }

    export function mkParameterList( exprs : Array<PNode> ) : PNode {
        return make( ParameterListLabel.theParameterListLabel, exprs ) ; }

    export function mkNoTypeNd() : PNode {
        return make( new NoTypeLabel(),[] ) ; }

    export function mkStringLiteral( val : string ) : PNode{
        return make( new StringLiteralLabel(val, true),[] ) ; }

    export function mkNumberLiteral( val : string ) : PNode{
        return make( new NumberLiteralLabel(val, true),[] ) ; }

    export function mkTrueBooleanLiteral() : PNode{
        return make( new BooleanLiteralLabel("true", false),[] ) ; }

    export function mkFalseBooleanLiteral() : PNode{
        return make( new BooleanLiteralLabel("false", false),[] ) ; }

    export function mkVar( val :string) : PNode {
        return make (new VariableLabel(val, true), []) ;}

    export function mkLambda( val :string, param:PNode, type:PNode, func : PNode) : PNode{
        return make (LambdaLabel.theLambdaLabel, [param, type, func]) ;}


    // JSON support

    export function fromPNodeToJSON( p : PNode ) : string {
        var json = p.toJSON() ;
        return JSON.stringify( json ) ; }

    export function fromJSONToPNode( s : string ) : PNode {
        var json = JSON.parse( s ) ;
        return PNode.fromJSON( json ) ; }

    function fromJSONToLabel( json : any ) : Label {
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
