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
                        ( p ) => { return p ; },
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
                        ( p ) => { return p ; },
                        () => {
                            assert.check(false, "Precondition violation on PNode.modifyLabel" ) ;
                            return null ; } )
        }
    
        abstract isExprNode() : boolean ;
    
        abstract isExprSeqNode() : boolean ;
    
        abstract isTypeNode() : boolean ;
    
        toString() : string {
            var strs = this._children.map( ( p : PNode ) => { return p.toString() ; } ) ;
            var args = strs.reduce( ( a : string, p : string ) => {
                return a + " " + p.toString() ; }, "" ) ;
                
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


    export class ExprSeqNode extends PNode {
        seqNodeTag : any // Unique field to defeat duck typing
                        // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr
        constructor( label : Label, children : Array<PNode> ) {
            super(label, children ) ; } 
        isExprNode() : boolean { return false ; }
        isExprSeqNode() : boolean { return true ; }
        isTypeNode() : boolean { return false ; }
    }

    export class ExprSeqLabel implements Label {
        isValid( children : Array<PNode> ) {
            return children.every( (c : PNode) => { return c.isExprNode() } ) ; }
        
        getClass() : PNodeClass { return ExprSeqNode ; }
        
        toString() : string { return "seq"  ; }
    
        /*private*/ constructor() {} 
    
        // Singleton
        public static theExprSeqLabel = new ExprSeqLabel() ;
    }

    export class ExprNode extends PNode {
        exprNodeTag : any // Unique field to defeat duck typing.
                          // See http://stackoverflow.com/questions/34803240/requiring-argument-to-be-an-instance-of-a-subclass-of-a-given-class-in-typescr
        constructor( label : Label, children : Array<PNode> ) {
            super(label, children ) ; } 
        isExprNode() : boolean { return true ; }
        isExprSeqNode() : boolean { return false ; }
        isTypeNode() : boolean { return false ; }
    }

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

    export class StringConstLabel implements Label {
        _val : String ;
    
        constructor( val : String) { this._val = val ; } 
    
        val() : String { return this._val ; }
    
        isValid( children : Array<PNode> ) {
            return children.length == 0 ; }
        
        getClass() : PNodeClass { return ExprNode ; }
        
        toString() : string { return "string[" + this._val + "]"  ; }
    }
    
    export function mkIf( guard : ExprNode, thn : ExprSeqNode, els : ExprSeqNode ) : ExprNode {
        return <ExprNode> make( IfLabel.theIfLabel, [guard, thn, els] ) ; }
        
    export function mkExprSeq( exprs : Array<ExprNode> ) : ExprSeqNode {
        return <ExprSeqNode> make( ExprSeqLabel.theExprSeqLabel, exprs ) ; }
    
    export function mkStringConst( val : String ) : ExprNode{
        return <ExprNode> make( new StringConstLabel(val),[] ) ; }
        
}

export = pnode ;