/// <reference path="Assert.ts" />

module Collections {
    export interface Collection<A> {
        isEmpty : () => boolean ;
    }
    
    export interface NonEmptyCollection<A> {
        first : () => A ;
    }
    
    export interface Option<A> extends Collection<A> {
        choose : <B>( f: (a:A) => B, g : () => B ) => B ;
    }

    export class Some<A> implements Option<A>, NonEmptyCollection<A> {
        _val : A ;

        constructor( val : A ) { this._val = val ; }
    
        isEmpty() : boolean { return false ; }
        
        first() : A { return this._val ; }
        
        choose<B>( f: (a:A) => B, g : () => B ) : B { 
            return f( this._val ) ; }
    
        toString() : string { return "Some(" + this._val.toString() + ")" ; }
    }

    export class None<A> implements Option<A> {
        constructor( ) { }
    
        isEmpty() : boolean { return true ; }
        
        choose<B>( f: (a:A) => B, g : () => B ) : B { 
            return g() ; }
    
        toString() : string { return "None" ; }
    }
    
    /** Lisp-like lists */
    export interface List<A> extends Collection<A> {
        fold : <B> ( f: (a:A, b:B) => B, g : () => B ) => B  }
        
    export class Cons<A> implements List<A>, NonEmptyCollection<A> {
        _head : A ;
        _tail : List<A> ;
        
        constructor( head : A, tail : List<A> ) {
            this._head = head ; this._tail = tail ; }
        
        isEmpty() : boolean { return false ; }
        
        first() : A { return this._head ; }
        
        rest() : List<A> { return this._tail ; }
        
        fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  { return 
            f( this._head, this._tail.fold( f, g ) ) ; }
    
        toString() : string { return
            "(" +
            this.fold( 
                function( h : A, x : string ) : string { return
                    h.toString() + " " + x ; },
                function() : string { return ")" ; } ) ; }
    }
    
    export class Nil<A> implements List<A> {
        constructor( ) { }
    
        isEmpty() : boolean { return true ; }
        
        fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  { return 
            g() ; }
    
        toString() : string { return "Nil" ; }
    }
    

}