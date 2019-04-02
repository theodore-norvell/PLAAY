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
    import PLabel = pnode.PLabel ;
    import make = pnode.make ;
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;
    import none = collections.none;
    import some = collections.some;

    /** Abstract base class for all Labels. */
    abstract class AbstractLabel implements PLabel {

        /*private*/
        constructor() {
        }

        public getVal() : string {
            return "" ; // This is rather unsatisfactory. ...
            // Should there be a precondition on this method?
        }

        public isOpen() : boolean { return false ; }

        public open() : Option<PLabel>  { return none<PLabel>() ; }

        public getString() : Option<string> {
            return none<string>() ;
        }

        public changeString (newString : string) : Option<PLabel> {
            return none<PLabel>();
        }

        public getBoolean() : Option<boolean> {
            return none<boolean>() ;
        }

        public changeBoolean (newBoolean : boolean) : Option<PLabel> {
            return none<PLabel>();
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

        public getPrecedence() : number {
            return Infinity ; };

        public getChildPrecedence(child : number) : number {
            return Infinity ; }

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

        public getString() : Option<string> {
            return some<string>( this._val ) ;
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
    
        public getChildPrecedence(child : number) : number {
            return 0 ; }
        
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

        public open() : Option<PLabel> {
            return some( new VariableLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<PLabel> {
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
            if( ! ( children[1].isTypeNode()
                  || children[1].label() instanceof NoTypeLabel) ) return false ;
            if( ! ( children[2].isExprNode()
                  || children[2].label() instanceof NoExprLabel) ) return false ;
            return true;
        }

        public toString():string {
            return "vdecl["+ this._isConst + "]" ;
        }

        constructor( isConst : boolean ) {
            super() ;
            this._isConst = isConst ;
        }

        public declaresConstant() : boolean { return this._isConst ; }

        public getBoolean() : Option<boolean> {
            return some( this._isConst ) ;
        }

        public changeBoolean (newBoolean : boolean) : Option<PLabel> {
            return some( new VarDeclLabel( newBoolean ) ) ;
        }

        /** Is this label a label for a variable declaration node? */
        public isVarDeclNode() : boolean  { return true ; }

        public toJSON() : object {
            return { kind: VarDeclLabel.kindConst, isConst: this._isConst } ;
        }

        public static fromJSON( json : object ) : VarDeclLabel {
            return new VarDeclLabel( json["_isConst"] ) ;
        }

        public getPrecedence() : number {
            return 0 ; };

        public getChildPrecedence(child : number) : number {
            return 0 ; }
            
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

        public getPrecedence() : number {
            return 10 ; };

        public getChildPrecedence(child : number) : number {
            return 11 ; }
            
        public kind() : string { return AssignLabel.kindConst ; }
    }
    pnode.registry[ AssignLabel.kindConst ] = AssignLabel ;


    /** Calls to explicitly named functions. */
    export class CallVarLabel extends ExprLabelWithString  {

        public static readonly kindConst : string = "CallVarLabel" ;

        public isValid(children:Array<PNode>):boolean {
            return children.every((c : PNode) => c.isExprNode()  ) ;
        }

        public toString():string {
            return "callVar";
        }

        public open() : Option<PLabel> {
            return some( new CallVarLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<PLabel> {
            const newLabel = new CallVarLabel(newString, false);
            return new Some(newLabel);
        }


        constructor(name : string, open : boolean ) {
            super( name, open ) ;
        }

        public toJSON() : object {
            return { kind: CallVarLabel.kindConst, name: this._val, open: this._open } ;
        }

        public static fromJSON( json : object ) : CallVarLabel {
            return new CallVarLabel( json["name"], json["open"] ) ;
        }
    
        public hasDropZonesAt(start : number): boolean { return true; }

        public getPrecedence() : number {
            return 50 ; };

        public getChildPrecedence(child : number) : number {
            return 51 ; }
            
        public kind() : string { return CallVarLabel.kindConst ; }
    }
    pnode.registry[ CallVarLabel.kindConst ] = CallVarLabel ;
    pnode.registry[ "CallWorldLabel" ] = CallVarLabel ; // Legacy name.

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
             if( ! ( children[1].isTypeNode()
                   || children[1].label() instanceof NoTypeLabel) ) return false ;
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

        public getPrecedence() : number {
            return 0 ; };

        public getChildPrecedence(child : number) : number {
            return 0 ; }
            
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

        public getChildPrecedence(child : number) : number {
            return 0 ; }
            
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

        public getChildPrecedence(child : number) : number {
            return 0 ; }
            
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

    public getChildPrecedence(child : number) : number {
        return 0 ; }
        
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

        public getPrecedence() : number {
            return 100 ; };

        public getChildPrecedence(child : number) : number {
            return 100 ; }
            
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

        public open() : Option<PLabel> {
            return some( new DotLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<PLabel> {
             const newLabel = new DotLabel(newString, false);
             return new Some(newLabel);
         }

        public toJSON() : object {
            return { kind: DotLabel.kindConst, val : this._val, open: this._open } ;
        }

        public static fromJSON( json : object ) : DotLabel {
            return new DotLabel( json["val"], json["open"] ) ;
        }

        public getPrecedence() : number {
            return 100 ; };

        public getChildPrecedence(child : number) : number {
            return 100 ; }
            
        public kind() : string { return DotLabel.kindConst ; }
    }
    pnode.registry[ DotLabel.kindConst ] = DotLabel ;

    /** An indication that an optional type label is not there. */
    export class NoTypeLabel extends AbstractLabel {
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

        public open() : Option<PLabel> {
            return some( new StringLiteralLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<PLabel> {
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

        public open() : Option<PLabel> {
            return some( new NumberLiteralLabel( this._val, true ) ) ;
        }

        public changeString (newString : string) : Option<PLabel> {
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

        public open() : Option<PLabel> {
            return none() ;
        }

        public changeString (newString : string) : Option<PLabel> {
                return none() ;
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
    export class TupleLabel extends ExprLabel {
        
        public static readonly kindConst : string = "TupleLabel" ;

        private constructor(val: string, open : boolean) {
            super();
        } 

        public static readonly theTupleLabel : TupleLabel = new TupleLabel("",true);

        public isValid(children: Array<PNode>): boolean {
            return children.every( (c:PNode) => c.isExprNode()) ;
        }

        public toString():string {
            return "tuple" ;
        }

        public hasVerticalLayout() : boolean {return false;}
    
        public hasDropZonesAt(start : number): boolean { return true; }

        public toJSON(): object {
            return { kind: TupleLabel.kindConst };
        }

        public static fromJSON( json : object ) : TupleLabel {
            return TupleLabel.theTupleLabel ;
        }

        public getChildPrecedence(child : number) : number {
            return 0 ; }

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

    /** Apply a function to an argument list  */
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

        public getPrecedence() : number {
            return 50 ; };

        public getChildPrecedence(child : number) : number {
            return 51 ; }
            
        public kind() : string { return CallLabel.kindConst ; }
    }
    pnode.registry[ CallLabel.kindConst ] = CallLabel ;

    /** The "loc" operator -- eval in L-context  */
    export class LocLabel extends ExprLabel {
        
        public static readonly kindConst : string = "LocLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            return children.length === 1
                && children.every( (c:PNode) => c.isExprNode() );
        }

        public toString():string {
            return "loc";
        }

        /*private*/
        constructor() {
            super() ;
        }

        // Singleton
        public static theLocLabel : LocLabel = new LocLabel();

        public toJSON() : object {
            return { kind: LocLabel.kindConst, } ;
        }

        public static fromJSON( json : object ) : LocLabel {
            return LocLabel.theLocLabel ;
        }

        public hasDropZonesAt(start : number): boolean { return false; }

        public getPrecedence() : number {
            return 75 ; };

        public getChildPrecedence(child : number) : number {
            return 101 ; }
            
        public kind() : string { return LocLabel.kindConst ; }
    }
    pnode.registry[ LocLabel.kindConst ] = LocLabel ;

    export class PrimitiveTypesLabel extends TypeLabel {
        public static readonly kindConst : string = "PrimitiveTypesLabel" ;
        public readonly type : string;

        public isValid(children:Array<PNode>) : boolean {
           return children.length === 0
               && (["stringType","numberType","booleanType","nullType","integerType","natType","topType","bottomType"].indexOf(this.type) > -1);
        }

        constructor(typeName : string) {
            super();
            this.type = typeName;
        }

        public kind() : string { return PrimitiveTypesLabel.kindConst ; }

        public toJSON() : object {
            return { kind : PrimitiveTypesLabel.kindConst, type : this.type} ;
        }

        public static fromJSON( json : object ) : PrimitiveTypesLabel {
            return new PrimitiveTypesLabel( json["type"] ) ; }

    }
    pnode.registry[PrimitiveTypesLabel.kindConst] = PrimitiveTypesLabel;

    export class TupleTypeLabel extends TypeLabel {
        public static readonly kindConst : string = "TupleTypeLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            return children.every( (c:PNode) =>
                c.label() instanceof ExprPHLabel || c.isTypeNode() );
        }

        private constructor(val: string, open : boolean) {
            super();
        } 

        public static readonly theTupleTypeLabel : TupleTypeLabel = new TupleTypeLabel("",true);

        public kind() : string { return TupleTypeLabel.kindConst ; }

        public hasDropZonesAt( i : number ) : boolean { return true ; }

        public toJSON() : object {
            return { kind: TupleTypeLabel.kindConst } ;
        }

        public getChildPrecedence(child : number) : number {
            return 0 ; }

        public static fromJSON( json : object ) : TupleTypeLabel {
            return this.theTupleTypeLabel; }        
    }
    pnode.registry[TupleTypeLabel.kindConst] = TupleTypeLabel;

    export class LocationTypeLabel extends TypeLabel {
        public static readonly kindConst : string = "LocationTypeLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            return children.length === 1
                && ( children[0].isTypeNode() 
                     || children[0].label() instanceof ExprPHLabel ) ;
        }

        private constructor() {
            super();
        }  

        public static readonly theLocationTypeLabel : LocationTypeLabel = new LocationTypeLabel();

        public kind() : string { return LocationTypeLabel.kindConst ; }

        public toJSON() : object {
            return { kind: LocationTypeLabel.kindConst } ;
        }

        public getChildPrecedence(child : number) : number {
            return 0 ; }

        public static fromJSON( json : object ) : LocationTypeLabel {
            return this.theLocationTypeLabel ; } 
    }
    pnode.registry[LocationTypeLabel.kindConst] = LocationTypeLabel;

    export class FunctionTypeLabel extends TypeLabel {
        public static readonly kindConst : string = "FunctionTypeLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            return children.length === 2
                && ( children.every( (c:PNode) =>
                        c.label() instanceof ExprPHLabel || c.isTypeNode()) ) ;
        }

        private constructor() {
            super();
        }  

        public static readonly theFunctionTypeLabel : FunctionTypeLabel = new FunctionTypeLabel();

        public kind() : string { return FunctionTypeLabel.kindConst ; }

        public toJSON() : object {
            return { kind: FunctionTypeLabel.kindConst } ;
        }

        public static fromJSON( json : object ) : FunctionTypeLabel {
            return this.theFunctionTypeLabel ; } 

        public getPrecedence() : number {
            return 50 ; };

        public getChildPrecedence(child : number) : number {
            return 51 ; }
    }
    pnode.registry[FunctionTypeLabel.kindConst] = FunctionTypeLabel;

    export class FieldTypeLabel extends TypeLabel {
        public static readonly kindConst : string = "FieldTypeLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            if( children.length !== 2) return false ;
            if( ! ( children[0].label() instanceof ExprPHLabel
                    || children[0].label() instanceof VariableLabel )) return false ;
            if( ! ( children[1].label() instanceof ExprPHLabel
                    || children[1].isTypeNode() ) ) return false ;
            return true;
        }

        public constructor() {
            super();
        }  

        public kind() : string { return FieldTypeLabel.kindConst ; }

        public toJSON() : object {
            return { kind: FieldTypeLabel.kindConst } ;
        }

        public getPrecedence() : number {
            return 50 ; };

        public getChildPrecedence(child : number) : number {
            return 51 ; }

        public static fromJSON( json : object ) : FieldTypeLabel {
            return new FieldTypeLabel( ) ; } 
    }
    pnode.registry[FieldTypeLabel.kindConst] = FieldTypeLabel;

    export class MeetTypeLabel extends TypeLabel {
        public static readonly kindConst : string = "MeetTypeLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            return children.length >= 2
                && children.every( (c:PNode) =>
                        c.label() instanceof ExprPHLabel || c.isTypeNode() );
        }

        private constructor() {
            super();
        }  

        public static readonly theMeetTypeLabel : MeetTypeLabel = new MeetTypeLabel();

        public kind() : string { return MeetTypeLabel.kindConst ; }

        public hasDropZonesAt( i : number ) : boolean { return true ; }

        public toJSON() : object {
            return { kind: MeetTypeLabel.kindConst } ;
        }

        public static fromJSON( json : object ) : MeetTypeLabel {
            return this.theMeetTypeLabel ; } 

        public getPrecedence() : number {
            return 50 ; };

        public getChildPrecedence(child : number) : number {
            return 51 ; }
    }
    pnode.registry[MeetTypeLabel.kindConst] = MeetTypeLabel;

    export class JoinTypeLabel extends TypeLabel {
        public static readonly kindConst : string = "JoinTypeLabel" ;

        public isValid(children:Array<PNode>) : boolean {
            return children.length >= 2
                && children.every( (c:PNode) =>
                    c.label() instanceof ExprPHLabel || c.isTypeNode() );
        }

        private constructor() {
            super();
        }  

        public static readonly theJoinTypeLabel : JoinTypeLabel = new JoinTypeLabel();

        public kind() : string { return JoinTypeLabel.kindConst ; }

        public hasDropZonesAt( i : number ) : boolean { return true ; }

        public toJSON() : object {
            return { kind: JoinTypeLabel.kindConst } ;
        }

        public static fromJSON( json : object ) : JoinTypeLabel {
            return this.theJoinTypeLabel; } 

        public getPrecedence() : number {
            return 50 ; };

        public getChildPrecedence(child : number) : number {
            return 51 ; }
    }
    pnode.registry[JoinTypeLabel.kindConst] = JoinTypeLabel;

    export function mkExprPH():PNode {
        return  make(ExprPHLabel.theExprPHLabel, []); }

    export function mkNoExpNd():PNode {
        return  make(NoExprLabel.theNoExprLabel, []); }

    export function mkIf(guard:PNode, thn:PNode, els:PNode):PNode {
        return make(IfLabel.theIfLabel, [guard, thn, els]); }

    export function mkWhile(cond:PNode, seq:PNode):PNode {
        return make(WhileLabel.theWhileLabel, [cond, seq]); }

    export function mkAssign( lhs:PNode, rhs:PNode ) : PNode {
        return make( AssignLabel.theAssignLabel, [lhs, rhs] ) ;
    }

    export function mkExprSeq( exprs : Array<PNode> ) : PNode {
        return make( ExprSeqLabel.theExprSeqLabel, exprs ) ; }

    export function mkOpenCallVar( name : string, args : Array<PNode> ) : PNode {
        return make( new CallVarLabel( name, true), args ) ; }

    export function mkClosedCallVar( name : string, args : Array<PNode> ) : PNode {
        return make( new CallVarLabel( name, false), args ) ; }
    
    export function mkCall( func : PNode, ...args : Array<PNode> ) : PNode {
        return make( CallLabel.theCallLabel, [func].concat(args) ) ; }
    
    export function mkLoc( operand : PNode ) : PNode {
        return make( LocLabel.theLocLabel, [operand] ) ; }
    
    export function mkLocVarDecl( varNode : PNode, ttype : PNode, initExp : PNode ) : PNode {
        return mkVarOrLocDecl( false, varNode, ttype, initExp ) ; }
    
    export function mkConstDecl( varNode : PNode, ttype : PNode, initExp : PNode ) : PNode {
        return mkVarOrLocDecl( true, varNode, ttype, initExp ) ; }

    export function mkVarOrLocDecl( isConst : boolean, varNode : PNode, ttype : PNode, initExp : PNode ) : PNode {
        return make( new VarDeclLabel(isConst), [varNode, ttype, initExp ] ) ; }

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
        return make (LambdaLabel.theLambdaLabel, [param, type, func]) ; }

    export function mkObject( children : Array<PNode> ) : PNode {
        return make( ObjectLiteralLabel.theObjectLiteralLabel, children ) ; }

    export function mkDot( val : string, open : boolean, child : PNode ) : PNode {
        return make( new DotLabel( val, open), [child] ) ; }

    export function mkAccessor( obj : PNode, index : PNode ) : PNode {
        return make( AccessorLabel.theAccessorLabel, [obj, index]) ; }

    export function mkTuple( children : Array<PNode>) : PNode {
        return make(TupleLabel.theTupleLabel,children);
    }

    // type labels
    export function mkPrimitiveTypeLabel(type:string) : PNode {
        return make( new PrimitiveTypesLabel(type),[]);
    }

    export function mkTupleType( children: Array<PNode> ) : PNode {
        return make( TupleTypeLabel.theTupleTypeLabel,children) ;
    }

    export function mkFunctionType( param:PNode, type: PNode) : PNode {
        return make ( FunctionTypeLabel.theFunctionTypeLabel,[param,type]);
    }

    export function mkLocationType( child : PNode) :PNode {
        return make ( LocationTypeLabel.theLocationTypeLabel,[child] ) ;
    }

    export function mkFieldType( children: Array<PNode> ) : PNode {
        return make( new FieldTypeLabel(),children);
    }

    export function mkJoinType( children : Array<PNode> ) : PNode {
        return make( JoinTypeLabel.theJoinTypeLabel,children);
    }

    export function mkMeetType( children : Array<PNode> ) : PNode {
        return make( MeetTypeLabel.theMeetTypeLabel,children);
    }
        
}
export = labels ;
