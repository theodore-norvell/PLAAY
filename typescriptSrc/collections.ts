module collections {
    export interface Collection<A> {
    
        /** Invariant: isEmpty() == (size()==0). */
        isEmpty : () => boolean ;
        
        /** Postcondition: result is a natural number. */
        size : () => number ;
        
        /** Precondition: !isEmpty() */
        first : () => A ;
        
        map : <B> (f : (a:A) => B ) => Collection<B> ;
    }
    
    export interface Option<A> extends Collection<A> {
        choose : <B>( f: (a:A) => B, g : () => B ) => B ;
        map : <B> (f : (a:A) => B ) => Option<B> ;
        bind : <B> (f : (a:A) => Option<B> ) => Option<B> ;
    }

    export class Some<A> implements Option<A>{
        private _val : A ;

        constructor( val : A ) { this._val = val ; }
    
        isEmpty() : boolean { return false ; }
        
        size() : number { return 1 ; }
        
        first() : A { return this._val ; }
        
        choose<B>( f: (a:A) => B, g : () => B ) : B { 
            return f( this._val ) ; }
        
        map<B>(f : (a:A) => B ) : Option<B> {
            return new Some<B>( f( this._val ) ) ; }
    
        bind<B>(f : (a:A) => Option<B> ) : Option<B> {
            return f( this._val ) ; }

        toString() : string { return "Some(" + this._val.toString() + ")" ; }
    }

    export class None<A> implements Option<A> {
        constructor( ) { }
    
        isEmpty() : boolean { return true ; }
        
        size() : number { return 0 ; }
        
        first() : A { throw Error("first applied to an empty option") ; }
        
        choose<B>( f: (a:A) => B, g : () => B ) : B { 
            return g() ; }
        
        map<B>(f : (a:A) => B ) : Option<B> {
            return new None<B>() ; }

        bind<B>(f : (a:A) => Option<B> ) : Option<B> {
            return new None<B>() ; }
    
        toString() : string { return "None" ; }
    }

    export function some<A>( a : A ) : Option<A> {
        return new Some<A>( a ) ; }
            
    export function none<A>() : Option<A> {
        return new None<A>() ; }
    
    /** Lisp-like lists */
    export abstract class List<A> implements Collection<A> {
        abstract fold<B>( f: (a:A, b:B) => B, g : () => B ) : B ; 
        
        abstract map<B>(f : (a:A) => B ) : List<B> ;
        
        abstract isEmpty() : boolean ;
        
        abstract size() : number ;
        
        abstract first() : A ;
        
        abstract rest() : List<A> ;
                                
        bind<B>(f : (a:A) => List<B> ) : List<B> {
            return this.map(f).fold( (a:List<B>, b:List<B>) => a.cat(b),
                                     () => nil<B>() ); }
        
        cat( other : List<A> ) : List<A> {
            return this.fold( (a : A, b : List<A>) => cons(a,b),
                              () => other  ) ; }
        
    }
        
    class Cons<A> extends List<A> {
        private _head : A ;
        private _tail : List<A> ;
        
        constructor( head : A, tail : List<A> ) {
            super() ;
            this._head = head ; this._tail = tail ; }
        
        isEmpty() : boolean { return false ; }
        
        size() : number { return 1 + this._tail.size() ; }
        
        first() : A { return this._head ; }
        
        rest() : List<A> { return this._tail ; }
        
        map<B>(f : (a:A) => B ) : List<B> {
            return new Cons<B>( f( this._head ),
                                this._tail.map(f) ) ; }
        
        fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  {
            return f( this._head, this._tail.fold( f, g ) ) ; }
            
        toString() : string {
            return "( " +
                this.fold( 
                    ( h : A, x : string ) : string => h.toString() + " " + x,
                    () : string => ")" ) ; }
    }
    
    class Nil<A> extends List<A> {
        constructor( ) { super() ; }
    
        isEmpty() : boolean { return true ; }
        
        size() : number { return 0 ; }
        
        fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  {
            return  g() ; }
        
        map<B>( f : (a:A) => B ) : List<B> {
            return new Nil<B>( ) ; }
        
        first() : A { throw Error("first applied to an empty list") ; }
        
        rest() : List<A> { throw Error("rest applied to an empty list") ; }
    
        toString() : string { return "()" ; }
    }
    
    export function list<A>( ...args : Array<A> ) : List<A> {
        var acc = new Nil<A>() ;
        var i = args.length ;
        while( i > 0 ) {  i -= 1 ; acc = new Cons( args[i], acc ) ; }
        return acc ;
    }

    export function cons<A>( head : A, rest : List<A> ) : List<A> {
            return new Cons<A>( head, rest ) ; }
            
    export function nil<A>() : List<A> { return new Nil<A>() ; }
    
}

export = collections ;

