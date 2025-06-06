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
    
    export function collapseArray<A>( a : Array<Option<A>>) : Option<Array<A>> {
        const result : Array<A> = [] ;
        for( let i = 0 ; i < a.length ; ++i ) {
            if( a[i].isEmpty() ) return none() ;
            result.push( a[i].first( ) ) ; }
        return some(result) ;
    }
    /** Lisp-like lists. Immutable lists of 0 or more things.*/
    export abstract class List<A> implements Collection<A> {
        /** Fold right.
         * 
         * `list(a,b,c,d).fold( f, g)` is the same
         * as `f( a, f( b, f( c, g() ) ) )`.*/
        public fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  {
            if( this.isEmpty() ) { return g() ; }
            else { return f( this.first(), this.rest().fold( f, g ) ) ; } }
        
        /** Choose an action based on whether the list is empty.
         * 
         * `l.choose(f, g)` is the same as `g()`
         *  if the list is empty.  Otherwise, it is the same as `f(h, r)`
         * where `h` is the first item and `r` is the rest of
         * the list.
         */
        public choose<B>( f: (h:A, r:List<A>) => B, g : () => B ) : B {
            if( this.isEmpty() ) { return g() ; }
            else { return f( this.first(), this.rest() ) ; } }

        /** Map across the list.
         * `list(a,b,c).map(f)` means `list( f(a), f(b, f(c) )`.
         */
        public abstract map<B>(f : (a:A) => B ) : List<B> ;

        /** Map across the list.
         * 
         * `l.lazyMap(f)` constructs a list equivalent to
         * `l.map(f)`, but does so in a lazy fashion.
         */
        public abstract lazyMap<B>(f : (a:A) => B ) : List<B> ;
        
        /** Is the list empty> */
        public abstract isEmpty() : boolean ;
        
        /** What is the size (length) of the list? */
        public abstract size() : number ;
        
        /** What is the first item of the list.
         * 
         * Precondition: ` ! isEmpty() `
         */
        public abstract first() : A ;
        
        /** What is rest of the list.
         * 
         * Precondition: ` ! isEmpty() `
         */
        public abstract rest() : List<A> ;
                                
        /** The monadic bind or flat map.
         * 
         * This function applies maps the given function, which must map
         * each element to a list and then flattens the result.
         * 
         * For example if `list(a,b,c).map(f)` gives
         * `list([a0,a1],[], [c0,c1,c3])`, then
         * `list(a,b,c).bind(f)` gives `list(a0,a1,c0,c1,c3)`.
         */
        public bind<B>(f : (a:A) => List<B> ) : List<B> {
            return this.map(f).fold( (a:List<B>, b:List<B>) => a.cat(b),
                                     () => nil<B>() ); }

        /** Concatenate one list with another. */
        public cat( other : List<A> ) : List<A> {
            return this.fold( (a : A, b : List<A>) => cons(a,b),
                              () => other  ) ; }

        public lazyBind<B>(f : (a:A) => List<B> ) : List<B> {
            return this.lazyMap(f).fold( (a:List<B>, b:List<B>) => a.lazyCat(b),
                                     () => nil<B>() ); }

        /** Concatenate one list with another. */
        public lazyCat( other : List<A> ) : List<A> {
            return new LazyCat( this, other ) ; }
        
        /** Compare for equality using === on the items*/
        public equals( other : List<A> ) : boolean {
            if( this.isEmpty() ) {
                return other.isEmpty() ; }
            else {
                if( other.isEmpty() ) {
                    return false ; }
                else {
                    return this.first() === other.first() 
                        && this.rest().equals( other.rest() ) ; } } }

        public exCons<B>( f : (x:A, xs:List<A>)=>Option<B> ) : Option<B>  {
            if( this.isEmpty() ) { return none() ;}
            else {return f(this.first() , this.rest()) ; } }

        public exNil<B>( f : ()=>Option<B> ) : Option<B> {
            if( this.isEmpty() ) { return f() ;}
            else {return none() ; } }   
            
        public toString() : string {
            if( this.isEmpty() ) {
                return "()" ; }
            else {
                return "( " +
                    this.fold( 
                        ( h : A, x : string ) : string => h.toString() + " " + x,
                        () : string => ")" ) ; } }
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

        public lazyMap<B>(f : (a:A) => B ) : List<B> {
            return new LazyCons<B>( () => f( this.first() ),
                                    () => this.rest().map(f) ) ; }
        
        public fold<B>( f: (a:A, b:B) => B, g : () => B ) : B  {
            return f( this._head, this._tail.fold( f, g ) ) ; }
            
        public toString() : string {
            return "( " +
                this.fold( 
                    ( h : A, x : string ) : string => h.toString() + " " + x,
                    () : string => ")" ) ; }

        /** Compare for equality using === on the items*/
        public equals( other : List<A> ) : boolean {
            return other.choose( (h1, t1) => (this._head===h1 && this._tail.equals(t1)),
                                 () => false ) ;
        }

        public exCons<B>( f : (x:A, xs:List<A>)=>Option<B> ) : Option<B> {
            return f(this._head, this._tail) ; }

        public exNil<B>( f : ()=>Option<B> ) : Option<B> {
            return none() ; }
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

        public lazyMap<B>( f : (a:A) => B ) : List<B> {
            return new Nil<B>( ) ; }
        
        public first() : A { throw Error("first applied to an empty list") ; }
        
        public rest() : List<A> { throw Error("rest applied to an empty list") ; }
        
        /** Compare for equality using === on the items*/
        public equals( other : List<A> ) : boolean {
            return other.choose( (h1, t1) => false,
                                 () => true ) ;
        }

        public exCons<B>( f : (x:A, xs:List<A>)=>Option<B> ) : Option<B> {
            return none() ;
        }

        public exNil<B>( f : ()=>Option<B> ) : Option<B> {
            return f() ;
        }
    }

    class LazyCat<A> extends List<A> {
        private _front : List<A> ;
        private _back : List<A> ;

        constructor( front : List<A>, back : List<A>  ) {
            super() ;
            this._front = front ;
            this._back = back ;
        }
        
        public isEmpty() : boolean {
            return this._front.isEmpty() && this._back.isEmpty() ; }
        
        public size() : number {
            return this._front.size() + this._back.size() ; }

        public first() : A {
            if( ! this._front.isEmpty() ) { 
                return this._front.first()  ; }
            else {
                return this._back.first() ; } }
        
        public rest() : List<A> { 
            if( ! this._front.isEmpty() ) {
                if( this._back.isEmpty() ) {
                    // Front not empty. Back is empty.
                    return this._front.rest() ; }
                else {
                    // Front is not empty. Back is not empty
                    const frontRest = this._front.rest() ;
                    if( frontRest.isEmpty() ) {
                        return this._back ; }
                    else {
                        return new LazyCat( frontRest, this._back ) ; } } }
            else {
                // Front is empty
                return this._back.rest() ; } }
        
        public map<B>(f : (a:A) => B ) : List<B> {
            if( this.isEmpty() ) return nil<B>() ;
            else return cons( f( this.first() ), this.rest().map(f) ) ; }

        public lazyMap<B>(f : (a:A) => B ) : List<B> {
            return new LazyCat<B>( this._front.lazyMap(f),
                                   this._back.lazyMap(f) ) ; }
    }

    class LazyCons<A> extends List<A> {
        private _head : A | undefined ;
        private _tail : List<A> | undefined ;
        private _headFunc : (()=>A) | undefined;
        private _tailFunc : (()=>List<A>) | undefined;

        constructor( headFunc : () => A, tailFunc : ()=>List<A> ) {
            super() ;
            this._head = undefined ;
            this._tail = undefined ;
            this._headFunc = headFunc ;
            this._tailFunc = tailFunc ;
        }
        
        public isEmpty() : boolean { return false ; }
        
        public size() : number { return 1 + this.rest().size() ; }

        public first() : A {
            if( this._head === undefined ) {
                this._head = (this._headFunc as () => A)() ;
                this._headFunc = undefined ;
            }
            return this._head ; }
        
        public rest() : List<A> {
            if( this._tail === undefined ) {
                this._tail = (this._tailFunc as ()=>List<A>)() ;
                this._tailFunc = undefined ; }
            return this._tail ; }
        
        public map<B>(f : (a:A) => B ) : List<B> {
            return cons<B>( f( this.first() ), this.rest().map(f) ) ; }

        public lazyMap<B>(f : (a:A) => B ) : List<B> {
            return lazyCons<B>( () => f( this.first() ), () => this.rest().lazyMap(f) ) ; }

        public exCons<B>( f : (x:A, xs:List<A>)=>Option<B> ) : Option<B> {
            return f(this.first(), this.rest()) ; }

        public exNil<B>( f : ()=>Option<B> ) : Option<B> {
            return none() ; }
    }

    /** Make a list out of any number of arguments. */
    export function list<A>( ...args : Array<A> ) : List<A> {
        let acc : List<A> = new Nil<A>() ;
        let i = args.length ;
        while( i > 0 ) {  i -= 1 ; acc = new Cons( args[i], acc ) ; }
        return acc ;
    }

    /** Make a lazy list of integers */
    export function lazyIntSeq( start : number, len : number ) : List<number> {
        if( len <= 0 ) return nil() ;
        else return lazyCons( () => start, ()=>lazyIntSeq( start+1, len-1 )) ;
    }

    /** Make a list from  an array. */
    export function arrayToList<A>( a : Array<A> ) : List<A> {
        return list( ...a ) ; }

    /* Construct a nonempty list from a head and a rest. */
    export function cons<A>( head : A, tail : List<A> ) : List<A> {
            return new Cons<A>( head, tail ) ; }

    /* Construct a nonempty list from a head and a rest. */
    export function lazyCons<A>( head : () => A, tail : ()=>List<A> ) : List<A> {
            return new LazyCons<A>( head, tail ) ; }

    export function cat<A>( front : List<A>, back : List<A>) : List<A> {
        return front.cat( back ) ;
    }

    export function lazyCat<A>( front : List<A>, back : List<A>) : List<A> {
        return front.lazyCat( back ) ;
    }

    /** Make an empty list. */
    export function nil<A>() : List<A> { return new Nil<A>() ; }

    /** Make a nonempty list by tacking an item on the end. */
    export function snoc<A>( xs : List<A>, x : A ) : List<A> {
        return xs.fold( (y, ys) => cons(y,ys), () => cons(x, nil<A>() ) ) ; } 

    /** A list of all but the first item of a list
     * 
     * Precondition. `! xs.isEmpty()`
     */
    export function rest<A>( xs : List<A> ) : List<A> {
        return xs.rest() ; }
    
    /** The first item of a nonempty collection. 
     * 
     * Precondition. `! xs.isEmpty()`
     */
    export function first<A>( xs : Collection<A> ) : A {
        return xs.first() ;  }
        
    /** A list of all but the last item
     * 
     * Precondition. `! xs.isEmpty()`
     */
    export function butLast<A>( xs : List<A> ) : List<A>{
        if( xs.rest().isEmpty() ) return nil<A>() ;
        else return cons( xs.first(), butLast( xs.rest() ) ) ; }
    
    /** The last item of a nonempty list. 
     * 
     * Precondition. `! xs.isEmpty()`
     */
    export function last<A>( xs : List<A> ) : A {
        if( xs.rest().isEmpty() ) return xs.first() ;
        else return last( xs.rest() ) ; }

    /** `match( a, case0, case1, case2, ... )` matches a against each case
     * function until one succeeds. This function should be used
     * when it is known that at least one case will succeed.
     * 
     * Each of case0, case1,  case2, ... should be a function that will
     * map `a` to an option.
     * 
     * These case functions are applied to `a` one at a time from left to right.
     *
     * If a case function returns Some(x), then x is returned.
     * 
     * If none of the case functions is successful, an exception is thrown.
     * 
     * Example: In this example, foo is a `List<E>` object (for some `E`) and bar
     * and baz should be functions that return objects of type `Option<B>` for some `B`.
     * 
     *
     *         match( foo, caseCons( (h,t) => bar(h,t) ), caseNil( () => baz() ) ;
     *
     * The result is an object of type `B` determined as follows.
     * 
     * * If foo is a nonempty list, bar is applied to its head and tail.
     *    * If, for some x, the result of `bar(h,t)` is some(x), then x will be the result.
     *    * Otherwise, the result of bar must be none(). In this case, the second
     *      caseNil( ... ) function will be applied. It will result in none() and so
     *      the match call will throw an exception.
     * * If foo is an empty list, then the application of caseCons( ... )
     *   will result in none() and so caseNil(...) will be applied to foo.
     *    * If, for some x, the result is some(x), then x will be the result.
     *    * Otherwise, having run out of cases, the match call will throw an exception.
     * 
     * @typeParam A  The type of the thing to match against.
     * @typeParam B  The type of the result.
     * @param a A thing of type `A` to match against
     * @param cases An array of "case functions" that can each map `a` to results of type `Option<B>`
     */
    export function match<A,B>( a : A, ...cases : Array<(a:A)=>Option<B>> ) : B {
        const opt = optMatch( a, ...cases ) ;
        if( opt.isEmpty() ) throw new Error( "No case succeeded in match." ) ;
        return opt.first() ; }

    /** `optMatch( a, case0, case1, case2, ... )` matches a against each case
     *  function until one succeeds. This function should be used when it
     *  is not known whether any of the cases will succeed.
     * 
     *  Each of case0, case1,  case2, ... should be a function that will
     *  map a to an option.
     * 
     *  These case functions are applied to `a` one at a time from left to right.
     * 
     *  If a case function is successful, its result is returned.
     *  
     *  If none of the case functions is successful. none() is returned.
     *  
     *  Example: In this example, foo is a `List<E>` object (for some `E`) and bar
     *  and baz should be functions that return objects of type `Option<B>` for some `B`.
     * 
     *      optMatch( foo, caseCons( (h,t) => bar(h,t) ), caseNil( () => baz() ) ;
     * 
     *  The result is an object of type `Option<B>` determined as follows.
     * 
     *  * If foo is a nonempty list, bar is applied to its head and tail.
     *    * If, for some x, the result is some(x), then some(x) will be the result.
     *    * Otherwise, the result of bar must be none(). In this case, the second
     *      caseNil( ... ) function will be applied. It will result in none() and so
     *      the result of the optMatch call will be none.
     *  * If foo is an empty list, then the application of caseCons( ... )
     *    will result in none() and so caseNil(...) will be applied to foo.
     *    The result of that will be the result of baz() and will then be the
     *    result of the call to optMatch( ... ).
     * 
     * @typeParam A  The type of the thing to match against.
     * @typeParam B  The type of the contents of the result.
     * @param a A thing of type `A` to match against
     * @param cases An array of "case functions" that can each map `a` to results of type `Option<B>`
     */
    export function optMatch<A,B>( a : A, ...cases : Array<(a:A)=>Option<B>> ) : Option<B> {
        for( let i = 0 ; i<cases.length ; ++i ) {
            const f = cases[i] ;
            const b = f(a) ;
            if( !b.isEmpty() ) return b;
        }
        return none<B>() ;
    }

    export function guard<B>( b : boolean, f : () => B ) : Option<B> {
        if( b ) return some( f() ) ;
        else return none() ;
    }

    export function caseAlways<A,B>( f : () => Option<B> ) : (a:A)=>Option<B> {
        return (a:A) => f() ; }

    export function caseCons<A,B>( f : (h:A,r:List<A>) => Option<B> ) : (l:List<A>) => Option<B> {
        return (l:List<A>) => l.exCons( f ) ;
    }

    export function caseNil<A,B>( f : () => Option<B> ) : (l:List<A>) => Option<B> {
        return (l:List<A>) => l.exNil( f ) ;
    }
}
export = collections ;

