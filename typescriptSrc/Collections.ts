/// <reference path="Assert.ts" />

module Collections {
    export interface Collection<A> {
        isNonempty : () => boolean ;
        first : () => A ;
    }
    
    export interface Option<A> extends Collection<A> {
        choose : <B>( f: (a:A) => B, g : () => B ) => B ;
    }

    export class Some<A> implements Option<A> {
        _val : A ;

        constructor( val : A ) { this._val = val ; }
    
        isNonempty() : boolean { return true ; }
        
        first() : A { return this._val ; }
        
        choose<B>( f: (a:A) => B, g : () => B ) : B { 
            return f( this._val ) ; }
    }

    export class None<A> implements Option<A> {
        constructor( ) { }
    
        isNonempty() : boolean { return false ; }
        
        first() : A {
            Assert.check( false, "Tried to get the first item of None object" ) ;
            return null ; }
        
        choose<B>( f: (a:A) => B, g : () => B ) : B { 
            return g() ; }
    }

}