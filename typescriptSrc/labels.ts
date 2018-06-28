/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import pnode = require( './pnode' ) ;

/** The labels module contains the various label classes that define the different
 * kinds of PNode.
 * 
 * There is only one PNode class, so the difference in behaviour
 * between one PNode and another is determined by its label.
 */
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

        public getVal() : string {
            return "" ; // This is rather unsatisfactory. ...
            // Should there be a precondition on this method?
        }

        public isOpen() : boolean { return false ; }

        public open() : Option<Label>  { return none<Label>() ; }

        public changeString (newString : string) : Option<Label> {
            return none<Label>();
        }

        public abstract isValid(children:Array<PNode>) : boolean ;

        public abstract toJSON() : object ;

        /** Is this label a label for an expression node? */
        public isExprNode() : boolean { return false  ;}

        /** Is this label a label for a variable declaration node? */
        public isVarDeclNode() : boolean  { return false ; }

        /** Is this label a label for an expression sequence node? */
        public isExprSeqNode() : boolean  { return false ; }

        /** Is this label a label for a type node node? */
        public isTypeNode() : boolean  { return false ; }

        /** Return true if the node is a placeholder. Override this method in subclasses that are placeholders. */
        public isPlaceHolder() : boolean { return false ; }

        /** Return true if node has a dropzone at number. */
        public hasDropZonesAt(start : number): boolean { return false; }
        
        /** Return true if a label has a vertical layout. */
        public hasVerticalLayout() : boolean {return false; }

        public abstract kind() : string ;

    }


    /** Abstract base class for all expression labels.  */
    abstract class ExprLabel extends AbstractLabel {

        /*private*/
        constructor() {
            super() ;
        }

        public isExprNode() : boolean { return true ; }
    }

    /** Abstract base class for all type labels.  */
    export abstract class TypeLabel  extends AbstractLabel {

        public  abstract isValid(children:Array<PNode>)  : boolean ;

        /*private*/
        constructor() {
            super() ;
        }

        public isTypeNode() : boolean  { return true ; }
    }

    abstract class ExprLabelWithString extends ExprLabel {

        protected _val : string; 
        
        protected _open : boolean ;

        protected constructor(name : string, open : boolean ) {
            super() ;
            this._val = name;
            this._open = open ;
        }

        public getVal() : string {
            return this._val;
        }

        public isOpen() : boolean {
            return this._open ;
        }
    }

    /** A sequence of expressions. */
    export class ExprSeqLabel  extends AbstractLabel {

        public static readonly kindConst : string = "ExprSeqLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            return children.every( (c:PNode) => 
                        c.isExprNode() || c.isVarDeclNode() ) ;
        }

        public toString():string {
            return "seq";
        }

        /*private*/
        constructor() {
            super() ;
        }

        public isExprSeqNode() : boolean { return true ; }

        public hasDropZonesAt(start : number): boolean { return true; }

        public hasVerticalLayout() : boolean {return true;}

        // Singleton
        public static readonly theExprSeqLabel : ExprSeqLabel = new ExprSeqLabel();

        public toJSON() : object {
            return { kind:  ExprSeqLabel.kindConst } ; }

        public static fromJSON( json : object ) : ExprSeqLabel {
            return ExprSeqLabel.theExprSeqLabel ; }
        
        public kind() : string { return ExprSeqLabel.kindConst ; }
    }
    pnode.registry[ ExprSeqLabel.kindConst ] = ExprSeqLabel ;

    /** References to variables.  */
    export class VariableLabel extends ExprLabelWithString {
        public static readonly kindConst : string = "VariableLabel" ;

        public isValid(children:Array<PNode>):boolean {
            return children.length === 0;
        }

        public toString():string {
            return "variable["+this._val+"]" ;
        }

        public open() : Option<Label> {
            return some( new VariableLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<Label> {
            const newLabel = new VariableLabel(newString, false);
            return new Some(newLabel);
        }

        constructor(name : string, open : boolean ) {
            super(name, open) ;
        }

        public toJSON() : object {
            return { kind : VariableLabel.kindConst, name : this._val, open : this._open } ;
        }

        public static fromJSON( json : object ) : VariableLabel {
            return new VariableLabel( json["name"], json["open"] ) ; }

        public kind() : string { return VariableLabel.kindConst ; }
    }
    pnode.registry[VariableLabel.kindConst] = VariableLabel ;

    /** Variable declaration nodes. */
    export class VarDeclLabel extends AbstractLabel {
        public static readonly kindConst : string = "VarDeclLabel" ;

        protected _isConst : boolean ;

        public isValid( children : Array<PNode> ) : boolean {
            if( children.length !== 3) return false ;
            if( ! (children[0].label() instanceof VariableLabel) ) return false ;
            if( ! children[1].isTypeNode()) return false ;
            if( ! ( children[2].isExprNode()
                  || children[2].label() instanceof NoExprLabel) ) return false ;
            return true;
        }

        public toString():string {
            return "vdecl";
        }

        constructor( isConst : boolean ) {
            super() ;
            this._isConst = isConst ;
        }

        public declaresConstant() : boolean { return this._isConst ; }

        /** Is this label a label for a variable declaration node? */
        public isVarDeclNode() : boolean  { return true ; }

        public toJSON() : object {
            return { kind: VarDeclLabel.kindConst, isConst: this._isConst } ;
        }

        public static fromJSON( json : object ) : VarDeclLabel {
            return new VarDeclLabel( json["_isConst"] ) ;
        }
            
        public kind() : string { return VarDeclLabel.kindConst ; }
    }
    pnode.registry[VarDeclLabel.kindConst] = VarDeclLabel ;

    /** Assignments.  */
    export class AssignLabel extends ExprLabel {

        public static readonly kindConst : string = "AssignLabel" ;
        
        public isValid( children : Array<PNode> ) : boolean {
            if( children.length !== 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true;
        }

        public toString():string {
            return "assign";
        }

        private constructor() {
            super();
        }


        // Singleton
        public static theAssignLabel = new AssignLabel();

        public toJSON() : object {
            return { kind: AssignLabel.kindConst, } ;
        }

        public static fromJSON( json : object ) : AssignLabel {
            return AssignLabel.theAssignLabel ;
        }
            
        public kind() : string { return AssignLabel.kindConst ; }
    }
    pnode.registry[ AssignLabel.kindConst ] = AssignLabel ;


    /** Calls to explicitly named functions.
     * TODO Change the name to something else. */
    export class CallWorldLabel extends ExprLabelWithString  {

        public static readonly kindConst : string = "CallWorldLabel" ;

        public isValid(children:Array<PNode>):boolean {
            return children.every((c : PNode) => c.isExprNode()  ) ;
        }

        public toString():string {
            return "callWorld";
        }

        public open() : Option<Label> {
            return some( new CallWorldLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<Label> {
            const newLabel = new CallWorldLabel(newString, false);
            return new Some(newLabel);
        }


        constructor(name : string, open : boolean ) {
            super( name, open ) ;
        }

        public toJSON() : object {
            return { kind: CallWorldLabel.kindConst, name: this._val, open: this._open } ;
        }

        public static fromJSON( json : object ) : CallWorldLabel {
            return new CallWorldLabel( json["name"], json["open"] ) ;
        }
    
        public hasDropZonesAt(start : number): boolean { return true; }
            
        public kind() : string { return CallWorldLabel.kindConst ; }
    }
    pnode.registry[ CallWorldLabel.kindConst ] = CallWorldLabel ;

    /** Place holder nodes for expression. */
    export class ExprPHLabel extends ExprLabel {

        public static readonly kindConst : string = "ExprPHLabel" ;

        public isValid( children : Array<PNode> ) : boolean {
            if( children.length !== 0) return false ;
            return true;
        }

        public toString():string {
            return "expPH";
        }

        private constructor() {
            super();
        }

        // Singleton
        public static theExprPHLabel : ExprPHLabel = new ExprPHLabel();

        public toJSON() : object {
            return { kind: ExprPHLabel.kindConst, } ;
        }

        public static fromJSON( json : object ) : ExprPHLabel {
            return ExprPHLabel.theExprPHLabel ;
        }

        public isPlaceHolder() : boolean { return true; }
            
        public kind() : string { return ExprPHLabel.kindConst ; }

    }
    pnode.registry[ ExprPHLabel.kindConst ] = ExprPHLabel ;

    /** This class is for optional expressions where there is no expression.
     * Not to be confused with the expression place holder ExpPHLabel which is used when an expression is manditory.
     */
    export class NoExprLabel extends AbstractLabel {
        
        public static readonly kindConst : string = "NoExprLabel" ;

        public isValid( children : Array<PNode> ) : boolean {
            if( children.length !== 0) return false ;
            return true;
        }

        public toString():string {
            return "noExpr";
        }

        /*private*/
        constructor() {
            super();
        }

        // Singleton
        public static theNoExprLabel = new NoExprLabel();

        // Behaves like a place holder as far as editing is concerned.
        public isPlaceHolder() : boolean { return true; }

        public toJSON() : object {
            return { kind: NoExprLabel.kindConst } ;
        }

        public static fromJSON( json : object ) : NoExprLabel {
            return NoExprLabel.theNoExprLabel ;
        }
            
        public kind() : string { return NoExprLabel.kindConst ; }
    }
    pnode.registry[ NoExprLabel.kindConst ] = NoExprLabel ;

    /** Function (or method) literals. */
    export class LambdaLabel extends ExprLabel {
        
        public static readonly kindConst : string = "LambdaLabel" ;

        public isValid( children : Array<PNode> ) : boolean {
             if( children.length !== 3 ) return false ;
             if ( ! (children[0].label() instanceof ParameterListLabel) ) return false ;
             if( ! children[1].isTypeNode() ) return false ;
             if( ! children[2].isExprSeqNode() ) return false ;
             return true;
         }

        public toString():string {
            return "lambda";
        }

        private constructor() {
            super();
        }


        // Singleton
        public static theLambdaLabel = new LambdaLabel();

        public toJSON() : object {
            return { kind: LambdaLabel.kindConst, } ;
        }

        public static fromJSON( json : object ) : LambdaLabel {
            return LambdaLabel.theLambdaLabel ;
        }
            
        public kind() : string { return LambdaLabel.kindConst ; }
    }
    pnode.registry[ LambdaLabel.kindConst ] = LambdaLabel ;

    /** A parameter list.  */
    export class ParameterListLabel  extends AbstractLabel {
        
        public static readonly kindConst : string = "ParameterListLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            return children.every( (c:PNode) : boolean => c.isVarDeclNode() );
        }

        public toString():string {
            return "param";
        }

        /*private*/
        constructor() {
            super() ;
        }

        // Singleton
        public static theParameterListLabel = new ParameterListLabel();

        public hasDropZonesAt(start : number): boolean { return true; }

        public hasVerticalLayout() : boolean {return true;}

        public toJSON() : object {
            return { kind:  ParameterListLabel.kindConst } ; }

        public static fromJSON( json : object ) : ParameterListLabel {
            return ParameterListLabel.theParameterListLabel ; }
        
        public kind() : string { return ParameterListLabel.kindConst ; }
    }
    pnode.registry[ ParameterListLabel.kindConst ] = ParameterListLabel ;

    /** If expressions */
    export class IfLabel extends ExprLabel {
        
        public static readonly kindConst : string = "IfLabel" ;

        public isValid(  children : Array<PNode> ) : boolean {
            if( children.length !== 3 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprSeqNode() ) return false ;
            if( ! children[2].isExprSeqNode() ) return false ;
            return true ;
        }

        public toString():string {
            return "if";
        }

        /*private*/
        constructor() {
            super();
        }

        // Singleton
        public static theIfLabel = new IfLabel();

        public toJSON() : object {
            return { kind: IfLabel.kindConst, } ;
        }

        public static fromJSON( json : object ) : IfLabel {
            return IfLabel.theIfLabel ;
        }
            
        public kind() : string { return IfLabel.kindConst ; }
    }
    pnode.registry[ IfLabel.kindConst ] = IfLabel ;

    /** While loop expressions */
    export class WhileLabel extends ExprLabel {
        
        public static readonly kindConst : string = "WhileLabel" ;

        public isValid(  children : Array<PNode> ) : boolean {
            if( children.length !== 2 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprSeqNode() ) return false ;
            return true ;
        }

        public toString():string {
            return "while";
        }

        /*private*/
        constructor() {
            super();
        }

        // Singleton
        public static theWhileLabel = new WhileLabel();

        public toJSON() : object {
            return { kind: WhileLabel.kindConst, } ;
        }

        public static fromJSON( json : object ) : WhileLabel {
            return WhileLabel.theWhileLabel ;
        }
            
        public kind() : string { return WhileLabel.kindConst ; }
    }
    pnode.registry[ WhileLabel.kindConst ] = WhileLabel ;

    /** Object Literal expressions */
    export class ObjectLiteralLabel extends ExprLabel {
        
        public static readonly kindConst : string = "ObjectLiteralLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            return children.every( (c:PNode) => 
                    c.isExprNode() || c.isVarDeclNode() ) ;
        }

        public toString():string {
            return "object";
        }

        /*private*/
        constructor() {
            super();
        }

        // Singleton
        public static readonly theObjectLiteralLabel = new ObjectLiteralLabel();
        
        public hasVerticalLayout() : boolean {return true;}
        
        public hasDropZonesAt(start : number): boolean { return true; }

        public toJSON() : object {
            return { kind: ObjectLiteralLabel.kindConst, } ;
        }

        public static fromJSON( json : object ) : ObjectLiteralLabel {
            return ObjectLiteralLabel.theObjectLiteralLabel ;
        }
            
        public kind() : string { return ObjectLiteralLabel.kindConst ; }
    }
    pnode.registry[ ObjectLiteralLabel.kindConst ] = ObjectLiteralLabel ;

      /** Array Literal expressions */
    export class ArrayLiteralLabel extends ExprLabel {
    
    public static readonly kindConst : string = "ArrayLiteralLabel" ;

    public isValid(children:Array<PNode>) : boolean {
        return children.every( (c:PNode) => 
                c.isExprNode() ) ;
    }

    public toString():string {
        return "array";
    }

    /*private*/
    constructor() {
        super();
    }

    // Singleton
    public static readonly theArrayLiteralLabel = new ArrayLiteralLabel();
    
    public hasVerticalLayout() : boolean {return true;}
    
    public hasDropZonesAt(start : number): boolean { return true; }

    public toJSON() : object {
        return { kind: ArrayLiteralLabel.kindConst, } ;
    }

    public static fromJSON( json : object ) : ArrayLiteralLabel {
        return ArrayLiteralLabel.theArrayLiteralLabel ;
    }
        
    public kind() : string { return ArrayLiteralLabel.kindConst ; }
    }
    pnode.registry[ ArrayLiteralLabel.kindConst ] = ArrayLiteralLabel ;

    /** Accessor or subscript or indexing.  */
    export class AccessorLabel extends ExprLabel {

        public static readonly kindConst : string = "AccessorLabel" ;
        
        public isValid( children : Array<PNode> ) : boolean {
            if( children.length !== 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true;
        }

        public toString():string {
            return "accessor";
        }

        private constructor() {
            super();
        }

        public toJSON() : object {
            return { kind: AccessorLabel.kindConst, } ;
        }

        public static theAccessorLabel :  AccessorLabel = new AccessorLabel() ;

        public static fromJSON( json : object ) : AccessorLabel {
            return AccessorLabel.theAccessorLabel ;
        }
            
        public kind() : string { return AccessorLabel.kindConst ; }
    }
    pnode.registry[ AccessorLabel.kindConst ] = AccessorLabel ;

    /** Dot.  Access a field by name  */
    export class DotLabel extends ExprLabelWithString {

        public static readonly kindConst : string = "DotLabel" ;
        
        public isValid( children : Array<PNode> ) : boolean {
            return children.length === 1 && children[0].isExprNode() ;
        }

        public toString():string {
            return "dot["+ this._val + "]" ;
        }

        public constructor( val : string, open : boolean ) {
            super( val, open );
        }

        public open() : Option<Label> {
            return some( new DotLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<Label> {
             const newLabel = new DotLabel(newString, false);
             return new Some(newLabel);
         }

        public toJSON() : object {
            return { kind: DotLabel.kindConst, val : this._val, open: this._open } ;
        }

        public static fromJSON( json : object ) : DotLabel {
            return new DotLabel( json["val"], json["open"] ) ;
        }
            
        public kind() : string { return DotLabel.kindConst ; }
    }
    pnode.registry[ DotLabel.kindConst ] = DotLabel ;

    /** An indication that an optional type label is not there. */
    export class NoTypeLabel extends TypeLabel {
        // TODO: Should this really extend TypeLabel?
        
        public static readonly kindConst : string = "NoTypeLabel" ;

        public isValid(children:Array<PNode>):boolean {
            return children.length === 0;}

        public toString():string {
            return "noType";
        }
    
        /*private*/
        constructor() { super() ; }

        // Singleton
        public static theNoTypeLabel = new NoTypeLabel();

        public toJSON() : object {
            return { kind: NoTypeLabel.kindConst, } ;
        }

        public static fromJSON( json : object ) : NoTypeLabel {
            return NoTypeLabel.theNoTypeLabel ;
        }

        public isPlaceHolder() : boolean { return true; }
            
        public kind() : string { return NoTypeLabel.kindConst ; }
    }
    pnode.registry[ NoTypeLabel.kindConst ] = NoTypeLabel ;

    /** String literals. */
    export class StringLiteralLabel extends ExprLabelWithString {
        
        public static readonly kindConst : string = "StringLiteralLabel" ;

        constructor( val : string, open : boolean) { super(val, open) ; }

        public isValid( children : Array<PNode> )  : boolean {
            return children.length === 0 ; }

        public open() : Option<Label> {
            return some( new StringLiteralLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<Label> {
             const newLabel = new StringLiteralLabel(newString, false);
             return new Some(newLabel);
         }


        public toString() : string { return "string[" + this._val + "]"  ; }

        public toJSON() : object {
            return { kind: StringLiteralLabel.kindConst, val : this._val, open: this._open } ;
        }

        public static fromJSON( json : object ) : StringLiteralLabel {
            return new StringLiteralLabel( json["val"], json["open"] )  ;
        }
            
        public kind() : string { return StringLiteralLabel.kindConst ; }
     }
    pnode.registry[ StringLiteralLabel.kindConst ] = StringLiteralLabel ;

    /** Number literals. */
    export class NumberLiteralLabel extends ExprLabelWithString {
        
        public static readonly kindConst : string = "NumberLiteralLabel" ;

        constructor( val : string, open : boolean ) { super( val, open ) ; }

        public val() : string { return this._val ; }

        public isValid( children : Array<PNode> ) : boolean {
            return children.length === 0 ;
        }

        public open() : Option<Label> {
            return some( new NumberLiteralLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<Label> {
            const newLabel = new NumberLiteralLabel(newString, false);
            return new Some(newLabel);
        }

        public toString() : string { return "number[" + this._val + "]"  ; }

        public toJSON() : object {
            return { kind: NumberLiteralLabel.kindConst, val : this._val, open : this._open } ;
        }

        public static fromJSON( json : object ) : NumberLiteralLabel {
            return new NumberLiteralLabel( json["val"], json["open"] )  ;
        }
            
        public kind() : string { return NumberLiteralLabel.kindConst ; }
    }
    pnode.registry[ NumberLiteralLabel.kindConst ] = NumberLiteralLabel ;

    /** Boolean literals */
    export class BooleanLiteralLabel extends ExprLabelWithString {
        
        public static readonly kindConst : string = "BooleanLiteralLabel" ;

        constructor( val : string, open : boolean) { super(val, open) ; }

        public open() : Option<Label> {
            return some( new BooleanLiteralLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<Label> {
                const newLabel = new BooleanLiteralLabel(newString, false);
                return new Some(newLabel);
        }

        public isValid( children : Array<PNode> )  : boolean {
            if(children.length !== 0){ return false ; }
            return this._val === "true" || this._val === "false" ;
        }

        public toString() : string { return "boolean[" + this._val + "]"  ; }

        public toJSON() : object {
            return { kind: BooleanLiteralLabel.kindConst, val : this._val, open : this._open } ;
        }

        public static fromJSON( json : object ) : BooleanLiteralLabel {
            return new BooleanLiteralLabel( json["val"], json["open"] )  ;
        }
            
        public kind() : string { return BooleanLiteralLabel.kindConst ; }
    }
    pnode.registry[ BooleanLiteralLabel.kindConst ] = BooleanLiteralLabel ;

    /** Tuple label. */
    export class TupleLabel extends ExprLabelWithString {
        
        public static readonly kindConst : string = "TupleLabel" ;

        private constructor(val: string, open : boolean) {
            super(val,open);
        } 

        public static readonly theTupleLabel : TupleLabel = new TupleLabel("",true);

        public isValid(children: Array<PNode>): boolean {
            return children.every( (c:PNode) => c.isExprNode()) ;
        }

        public toString():string {
            return "tuple["+ this._val + "]" ;
        }

        public open() : Option<Label> {
            return some( new TupleLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<Label> {
             const newLabel = new TupleLabel(newString, false);
             return new Some(newLabel);
         }

        public hasVerticalLayout() : boolean {return false;}
    
        public hasDropZonesAt(start : number): boolean { return true; }

        public toJSON(): object {
            return { kind: TupleLabel.kindConst, val : this._val, open: this._open};
        }

        public static fromJSON( json : object ) : TupleLabel {
            return new TupleLabel(json["val"], json["open"]);
        }

        public kind(): string {
            return TupleLabel.kindConst;
        }
        
    }
    pnode.registry[ TupleLabel.kindConst ] = TupleLabel ;

    /** Null literals. */
    export class NullLiteralLabel extends ExprLabel {
        
        public static readonly kindConst : string = "NullLiteralLabel" ;

        constructor() { super() ; }

        public isValid( children : Array<PNode> )  : boolean {
            return children.length === 0;}

        public toString() : string { return "null"  ; }

        public static theNullLiteralLabel = new NullLiteralLabel();

        public toJSON() : object {
            return { kind: NullLiteralLabel.kindConst, } ;
        }

        public static fromJSON( json : object ) : NullLiteralLabel {
            return  NullLiteralLabel.theNullLiteralLabel ;
        }
            
        public kind() : string { return NullLiteralLabel.kindConst ; }
    }
    pnode.registry[ NullLiteralLabel.kindConst ] = NullLiteralLabel ;

    /** Call a function.  */
    export class CallLabel extends ExprLabel {
        
        public static readonly kindConst : string = "CallLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            return children.length > 0
                && children.every( (c:PNode) => c.isExprNode() );
        }

        public toString():string {
            return "call";
        }

        /*private*/
        constructor() {
            super() ;
        }

        // Singleton
        public static theCallLabel = new CallLabel();

        public toJSON() : object {
            return { kind: CallLabel.kindConst, } ;
        }

        public static fromJSON( json : object ) : CallLabel {
            return CallLabel.theCallLabel ;
        }

        public hasDropZonesAt(start : number): boolean { return true; }
            
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

    export function mkCallWorld( name : string, args : Array<PNode> ) : PNode {
        return make( new CallWorldLabel( name, true), args ) ; }

    export function mkClosedCallWorld( name : string, args : Array<PNode> ) : PNode {
        return make( new CallWorldLabel( name, false), args ) ; }
    
    export function mkCall( func : PNode, ...args : Array<PNode> ) : PNode {
        return make( CallLabel.theCallLabel, [func].concat(args) ) ; }
    
    export function mkVarDecl( varNode : PNode, ttype : PNode, initExp : PNode ) : PNode {
        return make( new VarDeclLabel(false), [varNode, ttype, initExp ] ) ; }
    
    export function mkConstDecl( varNode : PNode, ttype : PNode, initExp : PNode ) : PNode {
        return make( new VarDeclLabel(true), [varNode, ttype, initExp ] ) ; }

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

    export function mkDot( val : string, open : boolean, child : PNode ) : PNode {
        assert.check( child.isExprNode() ) ;
        return make( new DotLabel( val, open), [child] ) ;
    }

    export function mkTuple( val:string, open:boolean, children : Array<PNode>) : PNode {
        let i = 0 ;
        children.forEach( (c : PNode) : void => { 
            assert.check(c.isExprNode(),"The "+i+"th child is not a expression node");
            i++;
        }); 
        return make(TupleLabel.theTupleLabel,[]);
    }
        
}

export = labels ;
