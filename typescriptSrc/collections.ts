module collections {
    export interface Collection<A> {
        isEmpty : () => boolean ;
        map : <B> (f : (a:A) => B ) => Collection<B> ;
    }
    
    export interface NonEmptyCollection<A> {
        first : () => A ;
    }
    
    export interface Option<A> extends Collection<A> {
        choose : <B>( f: (a:A) => B, g : () => B ) => B ;
        map : <B> (f : (a:A) => B ) => Option<B> ;
    }

    export class Some<A> implements Option<A>, NonEmptyCollection<A> {
        _val : A ;

        constructor( val : A ) { this._val = val ; }
    
        isEmpty() : boolean { return false ; }
        
        first() : A { return this._val ; }
        
        choose<B>( f: (a:A) => B, g : () => B ) : B { 
            return f( this._val ) ; }
        
        map<B>(f : (a:A) => B ) : Option<B> {
            return new Some<B>( f( this._val ) ) ; }
    
        toString() : string { return "Some(" + this._val.toString() + ")" ; }
    }

    export class None<A> implements Option<A> {
        constructor( ) { }
    
        isEmpty() : boolean { return true ; }
        
        choose<B>( f: (a:A) => B, g : () => B ) : B { 
            return g() ; }
        
        map<B>(f : (a:A) => B ) : Option<B> {
            return new None<B>() ; }
    
        toString() : string { return "None" ; }
    }
    
    /** Lisp-like lists */
    export interface List<A> extends Collection<A> {
        fold : <B> ( f: (a:A, b:B) => B, g : () => B ) => B 
        
        map : <B> (f : (a:A) => B ) => List<B> ;
        
        first() : A 
        
        rest() : List<A> 
    }
        
    export class Cons<A> implements List<A>, NonEmptyCollection<A> {
        _head : A ;
        _tail : List<A> ;
        
        constructor( head : A, tail : List<A> ) {
            this._head = head ; this._tail = tail ; }
        
        isEmpty() : boolean { return false ; }
        
        first() : A { return this._head ; }
        
        rest() : List<A> { return this._tail ; }
        
        fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  {
            return f( this._head, this._tail.fold( f, g ) ) ; }
        
        map<B>(f : (a:A) => B ) : List<B> {
            return new Cons<B>( f( this._head ),
                                this._tail.map(f) ) ; }
    
        toString() : string {
            return "( " +
                this.fold( 
                    ( h : A, x : string ) : string => h.toString() + " " + x,
                    () : string => ")" ) ; }
    }
    
    export class Nil<A> implements List<A> {
        constructor( ) { }
    
        isEmpty() : boolean { return true ; }
        
        fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  {
            return  g() ; }
        
        map<B>( f : (a:A) => B ) : List<B> {
            return new Nil<B>( ) ; }
        
        first() : A { throw Error("first(Nil)") ; }
        
        rest() : List<A> { throw Error("rest(Nil)") ; }
    
        toString() : string { return "NIL" ; }
    }
    
    export function list<A>( ...args : Array<A> ) : List<A> {
        var acc = new Nil<A>() ;
        var i = args.length ;
        while( i > 0 ) {  i -= 1 ; acc = new Cons( args[i], acc ) ; }
        return acc ;
    }
    
}

export = collections ;