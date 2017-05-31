/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import pnode = require( './pnode' ) ;

/** Module pnode contains the PNode class and the implementations of the labels. */
module labels {
    import PNode = pnode.PNode ;
    import Label = pnode.Label ;
    import make = pnode.make ;
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;
    import none = collections.none;
    import some = collections.some;

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

        /** Return true if the node is a placeholder. Override this method in subclasses that are placeholders. */
        isPlaceHolder() : boolean { return false; }

        /** Return true if node has a dropzone at number. */
        hasDropZonesAt(start : number): boolean { return false; }

        abstract kind() : string ;

    }


    /** Abstract base class for all expression labels.  */
    abstract class ExprLabel extends AbstractLabel {

        /*private*/
        constructor() {
            super() ;
        }

        isExprNode() { return true ; }

        isExprSeqNode() { return false ; }

        isTypeNode() { return false ; }

        abstract toJSON() : any ;
    }

    /** Abstract base class for all type labels.  */
    export abstract class TypeLabel  extends AbstractLabel {

        abstract isValid(children:Array<PNode>) ;

        /*private*/
        constructor() {
            super() ;
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

    /** A sequence of expressions. */
    export class ExprSeqLabel  extends AbstractLabel {

        static readonly kindConst : string = "ExprSeqLabel" ;

        isValid(children:Array<PNode>) {
            return children.every(function (c:PNode) {
                return c.isExprNode()
            });
        }

        toString():string {
            return "seq";
        }

        /*private*/
        constructor() {
            super() ;
        }

        isExprNode() { return false ; }

        isExprSeqNode() { return true ; }

        isTypeNode() { return false ; }

        hasDropZonesAt(start : number): boolean { return true; }

        // Singleton
        public static theExprSeqLabel = new ExprSeqLabel();

        public toJSON() : any {
            return { kind:  ExprSeqLabel.kindConst } ; }

        public static fromJSON( json : any ) : ExprSeqLabel {
            return ExprSeqLabel.theExprSeqLabel ; }
        
        public kind() : string { return ExprSeqLabel.kindConst ; }
    }
    pnode.registry[ ExprSeqLabel.kindConst ] = ExprSeqLabel ;

    /** References to variables.  */
    export class VariableLabel extends ExprLabelWithString {
        static readonly kindConst : string = "VariableLabel" ;

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

        private
        constructor(name : string, open : boolean ) {
            super(name, open) ;
        }

        public toJSON() : any {
            return { kind : VariableLabel.kindConst, name : this._val, open : this._open } ;
        }

        public static fromJSON( json : any ) : VariableLabel {
            return new VariableLabel( json.name, json.open ) ; }

        public kind() : string { return VariableLabel.kindConst ; }
    }
    pnode.registry[VariableLabel.kindConst] = VariableLabel ;

    /** Variable declaration nodes. */
    export class VarDeclLabel extends ExprLabel {
        static readonly kindConst : string = "VarDeclLabel" ;

        protected _isConst : boolean ;

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 3) return false ;
            if( ! (children[0].label() instanceof VariableLabel) ) return false ;
            if( ! children[1].isTypeNode()) return false ;
            if( ! ( children[2].isExprNode()
                  || children[2].label() instanceof NoExprLabel) ) return false ;
            return true;
        }

        toString():string {
            return "vdecl";
        }

        private
        constructor( isConst : boolean ) {
            super() ;
            this._isConst = isConst ;
        }

        public toJSON() : any {
            return { kind: VarDeclLabel.kindConst, isConst: this._isConst } ;
        }

        public static fromJSON( json : any ) : VarDeclLabel {
            return new VarDeclLabel( json._isConst ) ;
        }
            
        public kind() : string { return VarDeclLabel.kindConst ; }
    }
    pnode.registry[VarDeclLabel.kindConst] = VarDeclLabel ;

    /** Assignments.  */
    export class AssignLabel extends ExprLabel {

        static readonly kindConst : string = "AssignLabel" ;
        
        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true;
        }

        toString():string {
            return "assign";
        }

        /*private*/
        constructor() {
            super();
        }


        // Singleton
        public static theAssignLabel = new AssignLabel();

        public toJSON() : any {
            return { kind: AssignLabel.kindConst, } ;
        }

        public static fromJSON( json : any ) : AssignLabel {
            return AssignLabel.theAssignLabel ;
        }
            
        public kind() : string { return AssignLabel.kindConst ; }
    }
    pnode.registry[ AssignLabel.kindConst ] = AssignLabel ;


    /** Calls to explicitly named functions.
     * TODO Change the name to something else. */
    export class CallWorldLabel extends ExprLabelWithString  {

        static readonly kindConst : string = "CallWorldLabel" ;

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


        private
        constructor(name : string, open : boolean ) {
            super( name, open ) ;
        }

        public toJSON() : any {
            return { kind: CallWorldLabel.kindConst, name: this._val, open: this._open } ;
        }

        public static fromJSON( json : any ) : CallWorldLabel {
            return new CallWorldLabel( json.name, json.open ) ;
        }
    
        hasDropZonesAt(start : number): boolean { return true; }
            
        public kind() : string { return CallWorldLabel.kindConst ; }
    }
    pnode.registry[ CallWorldLabel.kindConst ] = CallWorldLabel ;

    /** Place holder nodes for expression. */
    export class ExprPHLabel extends ExprLabel {

        static readonly kindConst : string = "ExprPHLabel" ;

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

        // Singleton
        public static theExprPHLabel = new ExprPHLabel();

        public toJSON() : any {
            return { kind: ExprPHLabel.kindConst, } ;
        }

        public static fromJSON( json : any ) : ExprPHLabel {
            return ExprPHLabel.theExprPHLabel ;
        }

        isPlaceHolder() : boolean { return true; }
            
        public kind() : string { return ExprPHLabel.kindConst ; }

    }
    pnode.registry[ ExprPHLabel.kindConst ] = ExprPHLabel ;

    /** This class is for optional expressions where there is no expression.
     * Not to be confused with the expression place holder ExpPHLabel which is used when an expression is manditory.
     */
    export class NoExprLabel extends AbstractLabel {
        
        static readonly kindConst : string = "NoExprLabel" ;

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

        isPlaceHolder() : boolean { return true; }

        // Singleton
        public static theNoExprLabel = new NoExprLabel();

        public toJSON() : any {
            return { kind: NoExprLabel.kindConst } ;
        }

        public static fromJSON( json : any ) : NoExprLabel {
            return NoExprLabel.theNoExprLabel ;
        }
            
        public kind() : string { return NoExprLabel.kindConst ; }
    }
    pnode.registry[ NoExprLabel.kindConst ] = NoExprLabel ;

    /** Function (or method) literals. */
    export class LambdaLabel extends ExprLabel {
        
        static readonly kindConst : string = "LambdaLabel" ;

        isValid( children : Array<PNode> ) {
             if( children.length != 3 ) return false ;
             if ( ! (children[0].label() instanceof ParameterListLabel) ) return false ;
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


        // Singleton
        public static theLambdaLabel = new LambdaLabel();

        public toJSON() : any {
            return { kind: LambdaLabel.kindConst, } ;
        }

        public static fromJSON( json : any ) : LambdaLabel {
            return LambdaLabel.theLambdaLabel ;
        }
            
        public kind() : string { return LambdaLabel.kindConst ; }
    }
    pnode.registry[ LambdaLabel.kindConst ] = LambdaLabel ;

    /** A parameter list.  */
    export class ParameterListLabel  extends AbstractLabel {
        
        static readonly kindConst : string = "ParameterListLabel" ;

        isValid(children:Array<PNode>) {
            return children.every( (c:PNode) : boolean => c.label() instanceof VarDeclLabel );
        }

        toString():string {
            return "param";
        }

        /*private*/
        constructor() {
            super() ;
        }

        // Singleton
        public static theParameterListLabel = new ParameterListLabel();

        isExprNode() { return false ; }

        isExprSeqNode() { return false ; }

        isTypeNode() { return false ; }

        hasDropZonesAt(start : number): boolean { return true; }

        public toJSON() : any {
            return { kind:  ParameterListLabel.kindConst } ; }

        public static fromJSON( json : any ) : ParameterListLabel {
            return ParameterListLabel.theParameterListLabel ; }
        
        public kind() : string { return ParameterListLabel.kindConst ; }
    }
    pnode.registry[ ParameterListLabel.kindConst ] = ParameterListLabel ;

    /** If expressions */
    export class IfLabel extends ExprLabel {
        
        static readonly kindConst : string = "IfLabel" ;

        isValid(  children : Array<PNode> ) : boolean {
            if( children.length != 3 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprSeqNode() ) return false ;
            if( ! children[2].isExprSeqNode() ) return false ;
            return true ;
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

        public toJSON() : any {
            return { kind: IfLabel.kindConst, } ;
        }

        public static fromJSON( json : any ) : IfLabel {
            return IfLabel.theIfLabel ;
        }
            
        public kind() : string { return IfLabel.kindConst ; }
    }
    pnode.registry[ IfLabel.kindConst ] = IfLabel ;

    /** While loop expressions */
    export class WhileLabel extends ExprLabel {
        
        static readonly kindConst : string = "WhileLabel" ;

        isValid(  children : Array<PNode> ) : boolean {
            if( children.length != 2 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprSeqNode() ) return false ;
            return true ;
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

        public toJSON() : any {
            return { kind: WhileLabel.kindConst, } ;
        }

        public static fromJSON( json : any ) : WhileLabel {
            return WhileLabel.theWhileLabel ;
        }
            
        public kind() : string { return WhileLabel.kindConst ; }
    }
    pnode.registry[ WhileLabel.kindConst ] = WhileLabel ;

    /** An indication that an optional type label is not there. */
    export class NoTypeLabel extends TypeLabel {
        // TODO: Should this really extend TypeLabel?
        
        static readonly kindConst : string = "NoTypeLabel" ;

        isValid(children:Array<PNode>):boolean {
            return children.length == 0;}

        toString():string {
            return "noType";
        }
    
        /*private*/
        constructor() { super() ; }

        // Singleton
        public static theNoTypeLabel = new NoTypeLabel();

        public toJSON() : any {
            return { kind: NoTypeLabel.kindConst, } ;
        }

        public static fromJSON( json : any ) : NoTypeLabel {
            return NoTypeLabel.theNoTypeLabel ;
        }

        isPlaceHolder() : boolean { return true; }
            
        public kind() : string { return NoTypeLabel.kindConst ; }
    }
    pnode.registry[ NoTypeLabel.kindConst ] = NoTypeLabel ;

    /** String literals. */
    export class StringLiteralLabel extends ExprLabelWithString {
        
        static readonly kindConst : string = "StringLiteralLabel" ;

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

        public toJSON() : any {
            return { kind: StringLiteralLabel.kindConst, val : this._val, open: this._open } ;
        }

        public static fromJSON( json : any ) : StringLiteralLabel {
            return new StringLiteralLabel( json.val, json.open )  ;
        }
            
        public kind() : string { return StringLiteralLabel.kindConst ; }
     }
    pnode.registry[ StringLiteralLabel.kindConst ] = StringLiteralLabel ;

    /** Number literals. */
    export class NumberLiteralLabel extends ExprLabelWithString {
        
        static readonly kindConst : string = "NumberLiteralLabel" ;

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

        public toJSON() : any {
            return { kind: NumberLiteralLabel.kindConst, val : this._val, open : this._open } ;
        }

        public static fromJSON( json : any ) : NumberLiteralLabel {
            return new NumberLiteralLabel( json.val, json.open )  ;
        }
            
        public kind() : string { return NumberLiteralLabel.kindConst ; }
    }
    pnode.registry[ NumberLiteralLabel.kindConst ] = NumberLiteralLabel ;

    /** Boolean literals */
    export class BooleanLiteralLabel extends ExprLabelWithString {
        
        static readonly kindConst : string = "BooleanLiteralLabel" ;

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

        public toJSON() : any {
            return { kind: BooleanLiteralLabel.kindConst, val : this._val, open : this._open } ;
        }

        public static fromJSON( json : any ) : BooleanLiteralLabel {
            return new BooleanLiteralLabel( json.val, json.open )  ;
        }
            
        public kind() : string { return BooleanLiteralLabel.kindConst ; }
    }
    pnode.registry[ BooleanLiteralLabel.kindConst ] = BooleanLiteralLabel ;

    /** Null literals. */
    export class NullLiteralLabel extends ExprLabel {
        
        static readonly kindConst : string = "NullLiteralLabel" ;

        constructor() { super() ; }

        isValid( children : Array<PNode> ) {
            return children.length == 0;}

        toString() : string { return "null"  ; }

        public static theNullLiteralLabel = new NullLiteralLabel();

        public toJSON() : any {
            return { kind: NullLiteralLabel.kindConst, } ;
        }

        public static fromJSON( json : any ) : NullLiteralLabel {
            return  NullLiteralLabel.theNullLiteralLabel ;
        }
            
        public kind() : string { return NullLiteralLabel.kindConst ; }
    }
    pnode.registry[ NullLiteralLabel.kindConst ] = NullLiteralLabel ;

    /** Call a function.  */
    export class CallLabel extends ExprLabel {
        
        static readonly kindConst : string = "CallLabel" ;

        isValid(children:Array<PNode>) {
            return children.every( (c:PNode) =>
                c.isExprNode() );
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

        // Singleton
        public static theCallLabel = new CallLabel();

        public toJSON() : any {
            return { kind: CallLabel.kindConst, } ;
        }

        public static fromJSON( json : any ) : CallLabel {
            return CallLabel.theCallLabel ;
        }

        hasDropZonesAt(start : number): boolean { return true; }
            
        public kind() : string { return CallLabel.kindConst ; }
    }
    pnode.registry[ CallLabel.kindConst ] = CallLabel ;

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

    export function mkLambda( param:PNode, type:PNode, func : PNode) : PNode{
        return make (LambdaLabel.theLambdaLabel, [param, type, func]) ;}
        
}

export = labels ;
