/// <reference path="assert.ts" />
/// <reference path="collections.ts" />

import collections = require( './collections' ) ;
import assert = require( './assert' ) ;

module pnode {
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;

    export interface Label {
        isValid : ( children : Array<PNode> ) => boolean ;
        /** Returns the class that uses this sort of label */
        getClass : () => PNodeClass ; 
    } ;

    /**  Interface is to describe objects that are classes that are subclasses of PNode
    * and can have constructors that can take the parameters below.*/
    export interface PNodeClass {
        new( label : Label, children : Array<PNode> ) : PNode ;
    }

    export abstract class PNode {
        private _label : Label ;
        private _children : Array<PNode> ;
    
        /** Construct a PNode.
        *  Precondition: label.isValid( children )
        * @param label A Label for the node.
        * @param children: A list (Array) of children 
        */
        /*protected*/ constructor( label : Label, children : Array<PNode> ) {
            //Precondition  would not need to be checked if the constructor were private.
            assert.check( label.isValid( children ),
                          "Attempted to make an invalid program node" ) ;
            this._label = label ;
            this._children = children.slice() ; }    
    
        public count() : number {
            return this._children.length ; }
        
        public children(start : number, end : number ) : Array<PNode> {
            if( start===undefined ) start = 0 ;
            if( end===undefined ) end = this._children.length ;
            return this._children.slice(start, end ) ; }
        
        public child( i : number ) : PNode {
            return this._children[i] }
        
        public label() : Label {
            return this._label ; }
    
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
        public tryModify( newChildren : Array<PNode>, start : number, end : number )
        : Option<PNode> {  
            if( start===undefined ) start = 0 ;
            if( end===undefined ) end = this._children.length ;
            const firstPart = this._children.slice(0,start) ;
            const lastPart = this._children.slice(end, this._children.length ) ;
            const allChildren = firstPart.concat( newChildren, lastPart ) ;
            //console.log("tryModify: start is " +start+ " end is " +end ) ; 
            //console.log("          firstPart is " +firstPart+ " lastPart is " +lastPart );
            //console.log("          newChildren is " +newChildren+ " allChildren is " +allChildren );
            return tryMake( this._label, allChildren ) ;
        }
    
        /** Would tryModify succeed?
        */
        public canModify( newChildren : Array<PNode>, start : number, end : number )
        : boolean {  
            return ! this.tryModify( newChildren, start, end ).isEmpty() ;
        }
    
        /** Return a copy of the node in which the children are replaced.
        * Precondition: canModify( newChildren, start, end )
        */
        public modify( newChildren : Array<PNode>, start : number, end : number )
        : PNode {  
            var opt = this.tryModify( newChildren, start, end ) ;
            return opt.choose(
                        p => p,
                        () => {
                            assert.check(false, "Precondition violation on PNode.modify" ) ;
                            return null ; } )
        }
    
        public tryModifyLabel( newLabel : Label )
        : Option<PNode> {  
            return tryMake( newLabel, this._children ) ;
        }
    
        public canModifyLabel( newLabel : Label )
        : boolean {  
            return ! this.tryModifyLabel( newLabel ).isEmpty() ;
        }
    
        public modifyLabel( newLabel : Label ) : PNode {  
            var opt = this.tryModifyLabel( newLabel ) ;
            return opt.choose(
                        p => p,
                        () => {
                            assert.check(false, "Precondition violation on PNode.modifyLabel" ) ;
                            return null ; } )
        }
    
        abstract isExprNode() : boolean ;
    
        abstract isExprSeqNode() : boolean ;
    
        abstract isTypeNode() : boolean ;
    
        toString() : string {
            var strs = this._children.map( ( p : PNode ) => p.toString() ) ;
            var args = strs.reduce( ( a : string, p : string ) => a + " " + p.toString(),
                                    "" ) ;
                
            return this._label.toString() + "(" + args + ")" ;
        }
    }

    
    export function tryMake( label : Label, children : Array<PNode> ) : Option<PNode> {
        if( label.isValid( children ) ) {
            //console.log("tryMake: label is " +label+ " children.length is " +children.length ) ; 
            const cls = label.getClass() ;
            return new Some( new cls( label, children ) ) ; }
        else {
            return new None<PNode>() ; } }

    export function canMake( label : Label, children : Array<PNode> ) : boolean {
        return label.isValid( children ) }

    export function make( label : Label, children : Array<PNode> ) : PNode {
        const cls = label.getClass() ;
        return new cls( label, children ) ;
    }
    //Node Declarations

    export class ExprNode extends PNode {
        exprNodeTag : any // Unique field to defeat duck typing
        // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr
        constructor( label : Label, children : Array<PNode> ) {
            super(label, children ) ; }
        isExprNode() : boolean { return true ; }
        isExprSeqNode() : boolean { return false ; }
        isTypeNode() : boolean { return false ; }
    }

    export class ExprSeqNode extends PNode {
        seqNodeTag : any // Unique field to defeat duck typing
        // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr
        constructor( label : Label, children : Array<PNode> ) {
            super(label, children ) ; }
        isExprNode() : boolean { return false ; }
        isExprSeqNode() : boolean { return true ; }
        isTypeNode() : boolean { return false ; }
    }

    export class TypeNode extends PNode {
        typeNodeTag : any // Unique field to defeat duck typing
        // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr
        constructor( label : Label, children : Array<PNode> ) {
            super(label, children ) ; }
        isExprNode() : boolean { return false ; }
        isExprSeqNode() : boolean { return false ; }
        isTypeNode() : boolean { return true ; }
    }


    //Node Labels
    export class ExprLabel implements Label {
        isValid( children : Array<PNode> ) {
            return children.every(function(c : PNode) {
                if(c.isExprNode() || c.isExprSeqNode() || c.isTypeNode())
                {
                    return true;
                }
                else return false;
            }
            ) ; }//TODO Is this correct?

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "exp"  ; }

        /*private*/ constructor() {}

        // Singleton
        public static theExprLabel = new ExprLabel() ;
    }


    export class ExprSeqLabel implements Label {
        isValid( children : Array<PNode> ) {
            return children.every(function(c : PNode) { return c.isExprNode() } ) ; }

        getClass() : PNodeClass { return ExprSeqNode ; }

        toString() : string { return "seq"  ; }

        /*private*/ constructor() {}

        // Singleton
        public static theExprSeqLabel = new ExprSeqLabel() ;
    }

    export class TypeLabel implements Label {
        isValid( children : Array<PNode> ) {
            return children.every(function(c : PNode) { return c.isTypeNode() } ) ; }

        getClass() : PNodeClass { return TypeNode ; }

        toString() : string { return "type"  ; }

        /*private*/ constructor() {}

        // Singleton
        public static theTypeLabel = new TypeLabel() ;
    }

    //Arithmetic Labels
    export class AssignLabel implements Label {

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "assign" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theAssignLabel = new AssignLabel() ;
    }

    export class AddLabel implements Label {

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "add" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theAddLabel = new AddLabel() ;
    }

    export class SubtractLabel implements Label {

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "sub" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theSubtractLabel = new SubtractLabel() ;
    }

    export class MultiplyLabel implements Label {

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "mul" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theMultiplyLabel = new MultiplyLabel() ;
    }

    export class DivideLabel implements Label {

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 2) return false ;
            if( ! children[0].isExprNode()) return false ;
            if( ! children[1].isExprNode()) return false ;
            return true }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "div" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theDivideLabel = new DivideLabel() ;
    }

    //Placeholder Labels

    export class ExprPHLabel implements Label {

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 0) return false ;
            //if( ! children[0].isExprNode()) return false ;
            //if( ! children[1].isExprNode()) return false ;
            return true }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "expPH" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theExprPHLabel = new ExprPHLabel() ;
    }

    export class ExprSeqPHLabel implements Label {

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 0) return false ;
            //if( ! children[0].isExprNode()) return false ;
            //if( ! children[1].isExprNode()) return false ;
            return true }

        getClass() : PNodeClass { return ExprSeqNode ; }

        toString() : string { return "seqPH" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theExprSeqPHLabel = new ExprSeqPHLabel() ;
    }

    export class TypePHLabel implements Label {

        isValid( children : Array<PNode> ) : boolean {
            if( children.length != 0) return false ;
            //if( ! children[0].isExprNode()) return false ;
            //if( ! children[1].isExprNode()) return false ;
            return true }

        getClass() : PNodeClass { return TypeNode ; }

        toString() : string { return "typePH" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theTypePHLabel = new TypePHLabel() ;
    }

    //Conditional Logic Labels

    export class LessLabel implements Label {
        isValid(  children : Array<PNode> ) : boolean {
            if( children.length != 2 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprNode() ) return false ;
            return true ; }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "less than" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theLessLabel = new LessLabel() ;
    }

    export class GreaterLabel implements Label {
        isValid(  children : Array<PNode> ) : boolean {
            if( children.length != 2 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprNode() ) return false ;
            return true ; }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "greater than" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theGreaterLabel = new GreaterLabel() ;
    }

    export class LessEqLabel implements Label {
        isValid(  children : Array<PNode> ) : boolean {
            if( children.length != 2 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprNode() ) return false ;
            return true ; }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "less than or equal to" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theLessEqLabel = new LessEqLabel() ;
    }

    export class GreaterEqLabel implements Label {
        isValid(  children : Array<PNode> ) : boolean {
            if( children.length != 2 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprNode() ) return false ;
            return true ; }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "greater than or equal to" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theGreaterEqLabel = new GreaterEqLabel() ;
    }

    export class EqualLabel implements Label {
        isValid(  children : Array<PNode> ) : boolean {
            if( children.length != 2 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprNode() ) return false ;
            return true ; }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "equal" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theEqualLabel = new EqualLabel() ;
    }


    //Loops and If Labels

    export class IfLabel implements Label {

        isValid(  children : Array<PNode> ) : boolean {
            if( children.length != 3 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprSeqNode() ) return false ;
            if( ! children[2].isExprSeqNode() ) return false ;
            return true ; }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "if" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theIfLabel = new IfLabel() ;
    }

    export class ForLabel implements Label {

        isValid(  children : Array<PNode> ) : boolean {
            if( children.length != 3 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprNode() ) return false ;
            if( ! children[2].isExprSeqNode() ) return false ;
            return true ; }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "for" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theForLabel = new ForLabel() ;
    }

    export class WhileLabel implements Label {

        isValid(  children : Array<PNode> ) : boolean {
            if( children.length != 2 ) return false ;
            if( ! children[0].isExprNode() ) return false ;
            if( ! children[1].isExprSeqNode() ) return false ;
            return true ; }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "while" ; }

        /*private*/ constructor() {}

        // Singleton
        public static theWhileLabel = new WhileLabel() ;
    }

    //Type Labels

    export class StringConstLabel implements Label {
        _val : String ;

        constructor( val : String) { this._val = val ; }

        val() : String { return this._val ; }

        isValid( children : Array<PNode> ) {
            return children.length == 0 ; }

        getClass() : PNodeClass { return ExprNode ; }

        toString() : string { return "string[" + this._val + "]"  ; }
    }

    export class NumberConstLabel implements Label {
        _val : number ;

        constructor( val : number) { this._val = val ; }


        val() : number { return this._val ; }

        isValid( children : Array<PNode> ) {
            return children.length == 0 ; }

        getClass() : PNodeClass { return TypeNode ; }

        toString() : string { return "string[" + this._val + "]"  ; }//will this work in TS?
    }

    export class BooleanConstLabel implements Label {
        _val : boolean ;

        constructor( val : boolean) { this._val = val ; }

        val() : boolean { return this._val ; }

        isValid( children : Array<PNode> ) {
            return children.length == 0 ; }

        getClass() : PNodeClass { return TypeNode ; }

        toString() : string { return "string[" + this._val + "]"  ; }//will this work in TS?
    }


    //Conditional Logic Make
    export function mkLess( left : ExprNode, right : ExprNode) : ExprNode {
        return <ExprNode> make (LessLabel.theLessLabel , [left, right]) ; }

    export function mkLessEq( left : ExprNode, right : ExprNode) : ExprNode {
        return <ExprNode> make (LessEqLabel.theLessEqLabel , [left, right]) ; }

    export function mkGreater( left : ExprNode, right : ExprNode) : ExprNode {
        return <ExprNode> make (GreaterLabel.theGreaterLabel , [left, right]) ; }

    export function mkGreaterEq( left : ExprNode, right : ExprNode) : ExprNode {
        return <ExprNode> make (GreaterEqLabel.theGreaterEqLabel , [left, right]) ; }

    export function mkEqual( left : ExprNode, right : ExprNode) : ExprNode {
        return <ExprNode> make (EqualLabel.theEqualLabel , [left, right]) ; }



    //Placeholder Make
    export function mkExprPH() : ExprNode{
        return <ExprNode> make ( ExprPHLabel.theExprPHLabel, [] );}

    export function mkExprSeqPH() : ExprSeqNode{
        return <ExprSeqNode> make ( ExprSeqPHLabel.theExprSeqPHLabel, [] );}

    export function mkTypePH() : TypeNode{
        return <TypeNode> make ( TypePHLabel.theTypePHLabel, [] );}


    //Loop and If Make
    export function mkIf( guard : ExprNode, thn : ExprSeqNode, els : ExprSeqNode ) : ExprNode {
        return <ExprNode> make( IfLabel.theIfLabel, [guard, thn, els] ) ; }

    export function mkFor( init : ExprNode, cond : ExprSeqNode, seq : ExprSeqNode ) : ExprNode {
        return <ExprNode> make( ForLabel.theForLabel, [init, cond, seq] ) ; }

    export function mkWhile( cond : ExprNode, seq : ExprSeqNode ) : ExprNode {
        return <ExprNode> make( WhileLabel.theWhileLabel, [cond, seq] ) ; }


    //Arithmetic Make
    export function mkAssign( left : ExprNode, right : ExprNode) : ExprNode {
        return <ExprNode> make (AssignLabel.theAssignLabel , [left, right]) ; }

    export function mkAdd( left : ExprNode, right : ExprNode) : ExprNode {
        return <ExprNode> make (AddLabel.theAddLabel , [left, right]) ; }

    export function mkSub( left : ExprNode, right : ExprNode) : ExprNode {
        return <ExprNode> make (SubtractLabel.theSubtractLabel , [left, right]) ; }

    export function mkMul( left : ExprNode, right : ExprNode) : ExprNode {
        return <ExprNode> make (MultiplyLabel.theMultiplyLabel , [left, right]) ; }

    export function mkDiv( left : ExprNode, right : ExprNode) : ExprNode {
        return <ExprNode> make (DivideLabel.theDivideLabel , [left, right]) ; }


    //Node Make

     export function mkExpr( exprs : Array<PNode> ) : ExprNode {
     return <ExprNode> make( ExprLabel.theExprLabel, exprs ) ; }


    export function mkExprSeq( exprs : Array<ExprNode> ) : ExprSeqNode {
        return <ExprSeqNode> make( ExprSeqLabel.theExprSeqLabel, exprs ) ; }


     export function mkType( exprs : Array<TypeNode> ) : TypeNode {//TODO will the children ever not be TypeNodes?
     return <TypeNode> make( TypeLabel.theTypeLabel, exprs ) ; }


    //Type? Make
    export function mkStringConst( val : String ) : ExprNode{//TODO should this be a Type node?
        return <ExprNode> make( new StringConstLabel(val),[] ) ; }

    export function mkNumberConst( val : number ) : TypeNode{
        return <TypeNode> make( new NumberConstLabel(val),[] ) ; }  //

    export function mkBooleanConst( val : boolean ) : TypeNode{
        return <TypeNode> make( new BooleanConstLabel(val),[] ) ; }
}

export = pnode ;