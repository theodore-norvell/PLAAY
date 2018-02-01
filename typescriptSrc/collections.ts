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
    
        public isEmpty() : boolean { return false ; }
        
        public size() : number { return 1 ; }
        
        public first() : A { return this._val ; }
        
        public choose<B>( f: (a:A) => B, g : () => B ) : B { 
            return f( this._val ) ; }
        
        public map<B>(f : (a:A) => B ) : Option<B> {
            return new Some<B>( f( this._val ) ) ; }
    
        public bind<B>(f : (a:A) => Option<B> ) : Option<B> {
            return f( this._val ) ; }
    
        public orElse( that : Option<A> ) : Option<A> {
            return this ; }

        public toString() : string { return "Some(" + this._val.toString() + ")" ; }

        public recoverBy( backup : () => Option<A> ) : Option<A> { return this ; }
    }

    /** A collection of 0 things as an Option */
    export class None<A> implements Option<A> {
        constructor( ) { }
    
        public isEmpty() : boolean { return true ; }
        
        public size() : number { return 0 ; }
        
        public first() : A { throw Error("first applied to an empty option") ; }
        
        public choose<B>( f: (a:A) => B, g : () => B ) : B { 
            return g() ; }
        
        public map<B>(f : (a:A) => B ) : Option<B> {
            return new None<B>() ; }

        public bind<B>(f : (a:A) => Option<B> ) : Option<B> {
            return new None<B>() ; }
    
        public orElse( that : Option<A> ) : Option<A> {
            return that ; }

        public recoverBy( backup : () => Option<A> ) : Option<A> { return backup() ; }
    
        public toString() : string { return "None" ; }
    }

    export function some<A>( a : A ) : Option<A> {
        return new Some<A>( a ) ; }
            
    export function none<A>() : Option<A> {
        return new None<A>() ; }
    
    /** Lisp-like lists. Immutable lists of 0 or more things.*/
    export abstract class List<A> implements Collection<A> {
        public abstract fold<B>( f: (a:A, b:B) => B, g : () => B ) : B ; 
        
        public abstract choose<B>( f: (h:A, r:List<A>) => B, g : () => B ) : B ;

        public abstract map<B>(f : (a:A) => B ) : List<B> ;
        
        public abstract isEmpty() : boolean ;
        
        public abstract size() : number ;
        
        public abstract first() : A ;
        
        public abstract rest() : List<A> ;
                                
        public bind<B>(f : (a:A) => List<B> ) : List<B> {
            return this.map(f).fold( (a:List<B>, b:List<B>) => a.cat(b),
                                     () => nil<B>() ); }
        
        public cat( other : List<A> ) : List<A> {
            return this.fold( (a : A, b : List<A>) => cons(a,b),
                              () => other  ) ; }
        
        /** Compare for equality using === */
        public equals( other : List<A> ) : boolean {
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
        
        public isEmpty() : boolean { return false ; }
        
        public size() : number { return 1 + this._tail.size() ; }
        
        public first() : A { return this._head ; }
        
        public rest() : List<A> { return this._tail ; }

        public choose<B>( f: (h:A, r:List<A>) => B, g : () => B ) : B {
            return f( this._head, this._tail ) ; }
        
        public map<B>(f : (a:A) => B ) : List<B> {
            return new Cons<B>( f( this._head ),
                                this._tail.map(f) ) ; }
        
        public fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  {
            return f( this._head, this._tail.fold( f, g ) ) ; }
            
        public toString() : string {
            return "( " +
                this.fold( 
                    ( h : A, x : string ) : string => h.toString() + " " + x,
                    () : string => ")" ) ; }
    }
    
    /** A list of 0 things. */
    class Nil<A> extends List<A> {
        constructor( ) { super() ; }
    
        public isEmpty() : boolean { return true ; }
        
        public size() : number { return 0 ; }
        
        public fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  {
            return  g() ; }
        
        public choose<B>( f: (h:A, r:List<A>) => B, g : () => B ) : B {
            return g() ; }

        public map<B>( f : (a:A) => B ) : List<B> {
            return new Nil<B>( ) ; }
        
        public first() : A { throw Error("first applied to an empty list") ; }
        
        public rest() : List<A> { throw Error("rest applied to an empty list") ; }
    
        public toString() : string { return "()" ; }
        
    }
    
    export function list<A>( ...args : Array<A> ) : List<A> {
        let acc = new Nil<A>() ;
        let i = args.length ;
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

