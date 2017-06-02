/** Collection types such as lists and options.
 * 
 */

module collections {
    export interface Collection<A> {
    
        /** Invariant: isEmpty() == (size()==0). */
        isEmpty : () => boolean ;
        
        /** Postcondition: result is a natural number. */
        size : () => number ;
        
        /** Precondition: !isEmpty() */
        first : () => A ;
        
        /** Create a collection of the same kind by applying a function to all members of this collection. */
        map : <B> (f : (a:A) => B ) => Collection<B> ;
    }
    
    /** A collection of 0 or 1 thing. */
    export interface Option<A> extends Collection<A> {

        /** Choose an action based on whether this Option<A> is empty or not.
         *
         * <pre>
         *        some(a) -------> f -----------> f(a)
         *                                       
         *                                       
         *        none ----------> g ------------> g()
         * </pre> 
         * 
        */
        choose : <B>( f: (a:A) => B, g : () => B ) => B ;

        /** Apply f to every item.
         * <pre>
         *        some(a) -------> some(f(b))
         * 
         *        none ----------> none
         * </pre> 
        */
        map : <B> (f : (a:A) => B ) => Option<B> ;

        

        /** Feed this option into a function than makes another option.
         * <pre>
         *     some(a) ----> f ---+----> some(b)
         *                   |
         *                   \    
         *     none ---------------------> none
         * </pre> 
        */
        bind : <B> (f : (a:A) => Option<B> ) => Option<B> ;

        /** Recover from failure using another option.
         * 
         * <pre>
         *      some(a) ----------------> some(a)
         *
         *      none--------------------> that
         * 
        */
        orElse : ( that : Option<A> ) => Option<A> ;

        /** Recover from failure using a function.
         * <pre>
         *      some(a) ----------------> some(a)
         *                   /
         *                   |
         *      none-------backup-------> none
         */
        recoverBy : ( backup : () => Option<A> ) => Option<A> ;
    }

    /** A collection of 1 thing. */
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
    
        orElse( that : Option<A> ) : Option<A> {
            return this }

        toString() : string { return "Some(" + this._val.toString() + ")" ; }

        recoverBy( backup : () => Option<A> ) : Option<A> { return this ; }
    }

    /** A collection of 0 things as an Option */
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
    
        orElse( that : Option<A> ) : Option<A> {
            return that }

        recoverBy( backup : () => Option<A> ) : Option<A> { return backup() ; }
    
        toString() : string { return "None" ; }
    }

    export function some<A>( a : A ) : Option<A> {
        return new Some<A>( a ) ; }
            
    export function none<A>() : Option<A> {
        return new None<A>() ; }
    
    /** Lisp-like lists. Immutable lists of 0 or more things.*/
    export abstract class List<A> implements Collection<A> {
        abstract fold<B>( f: (a:A, b:B) => B, g : () => B ) : B ; 
        
        abstract choose<B,C>( f: (h:A, r:List<B>) => C, g : () => C ) : C ;

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
        
        /** Compare for equality using === */
        equals( other : List<A> ) : boolean {
            return this.choose(
                (h0, r0) => other.choose( (h1, r1) => (h0===h1 && r0.equals(r1)),
                                          () => false ),
                () => other.choose( (h1, r1) => false,
                                    () => true ) ) ;
        }
    }
        
    /** A list of more than one thing. */
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

        choose<B>( f: (h:A, r:List<A>) => B, g : () => B ) : B {
            return f( this._head, this._tail ) ; }
        
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
    
    /** A list of 0 things. */
    class Nil<A> extends List<A> {
        constructor( ) { super() ; }
    
        isEmpty() : boolean { return true ; }
        
        size() : number { return 0 ; }
        
        fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  {
            return  g() ; }
        
        choose<B,C>( f: (h:A, r:List<B>) => C, g : () => C ) : C {
            return g() ; }

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

    export function arrayToList<A>( a : Array<A> ) : List<A> {
        return list( ...a ) ; }

    export function cons<A>( head : A, rest : List<A> ) : List<A> {
            return new Cons<A>( head, rest ) ; }
            
    export function nil<A>() : List<A> { return new Nil<A>() ; }

    export function snoc<A>( xs : List<A>, x : A ) : List<A> {
        return xs.fold( (y, ys) => cons(y,ys), () => cons(x, nil<A>() ) ) ; } 

    export function butLast<A>( xs : List<A> ) : List<A>{
        if( xs.rest().isEmpty() ) return nil<A>() ;
        else return cons( xs.first(), butLast( xs.rest() ) ) ; }

    export function last<A>( xs : List<A> ) : A {
        if( xs.rest().isEmpty() ) return xs.first() ;
        else return last( xs.rest() ) ;  }
    
}

export = collections ;

