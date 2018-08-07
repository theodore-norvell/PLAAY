/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />

import collections = require( './collections' ) ;
import assert = require( './assert' ) ;

/** Edits are essentially operations on objects that might succeed or fail.  */
module edits {
    import Option = collections.Option;
    import some = collections.some;
    import none = collections.none;


    /** An Edit represents a function that may succeed or fail.
    * 
    * If z is an edit then z.applyEdit(a) either succeeds or fails.
    * 
    * * If it succeeds, z.applyEdit(a) is Some(b) where b is the result of the function.
    * * If it fails, z.applyEdit(a) is None().
    *
    * If z is an edit, then z.canApply(a) indicates whether the edit will succeed or fail.
    */
    export interface Edit<A> {
        /** Attempt to apply the edit
         * 
         */
        applyEdit : (a:A) => Option<A> ;
        
        /** Will this edit suceed if applied to parameter.
         * 
         * * Invariant: If canApply(a) then applyEdit(a) succeeds.
         * * Invariant: If !canApply(a) then applyEdit(a) fails
         */
        canApply : (a:A) => boolean ;
    }
    
    export abstract class AbstractEdit<A> implements Edit<A> {
        constructor() { }
    
        public abstract applyEdit(a : A) : Option<A> ;
        
        // A correct but possibly expensive way to tell whether
        // applyEdit will be successful.
        public canApply(a : A) : boolean {
            return this.applyEdit( a ).choose(
                (a0:A) => true,
                () => false ) ; }
    }
    
    class CompositeEdit<A> extends AbstractEdit<A> {
        private _first : Edit<A> ;
        private _second : Edit<A> ;
        
        constructor( first : Edit<A>, second : Edit<A> ) {
            super() ;
            this._first = first ; this._second = second ; }
        
        public applyEdit( a : A ) : Option<A> {
            const opt = this._first.applyEdit( a ) ;
            return opt.bind( (b:A) => this._second.applyEdit(b) ) ; }
        
        public canApply( a : A ) : boolean {
            const opt = this._first.applyEdit( a ) ;
            return opt.choose(
                        (b:A) => this._second.canApply(b),
                        () => false ) ; }
    }
    
    /** The composition of two edits. Does one edit and then the other.
    * Given `var z = compose(x,y) ;`, `z.applyEdit(a)`  applies `x` to `a` and then
    * applies `y` to the result of that; but `z.applyEdit(a)` fails if
    * either either application fails.
    */
    export function compose<A>( ...editList : Array<Edit<A>> )  : Edit<A> {
        if( editList.length === 0 ) return id() ;
        else return editList.reduce( compose2 ) ;
    }
    
    function compose2<A>( first : Edit<A>, second : Edit<A> )  : Edit<A> {
        return new CompositeEdit<A>( first, second )  ; }
    
    class AlternateEdit<A> extends AbstractEdit<A> {
        private _first : Edit<A> ;
        private _second : Edit<A> ;
        
        constructor( first : Edit<A>, second : Edit<A> ) {
            super() ;
            this._first = first ; this._second = second ; }
        
        public applyEdit( a : A ) : Option<A> {
            const opt = this._first.applyEdit( a ) ;
            return opt.choose(
                        (b : A) => opt,
                        () => this._second.applyEdit( a ) ) ; }
        
        public canApply( a : A ) : boolean {
            return this._first.canApply(a) || this._second.canApply(a) ; }
    }
    
    /** A biased choice between or one, two, or more edits.
    *  Given  `var z = alt(x,y) ;`
    *
    *  *    `z.applyEdit(a)`  is the same as `x.applyEdit(a)` if that is successful.
    *  *    `z.applyEdit(a)`  is the same as `y.applyEdit(a)` if `x.applyEdit(a)` is not successful.
    *  Given `var z = alt( v, w, x, y)` z tries each edit in order until one is successfull
    *  or all have failed.
    */
    export function alt<A>( edits : Edit<A>[] ) : Edit<A> {
        if( edits.length == 0 ) return testEdit( (a:A) => false ) ;
        const combine = (acc : Edit<A>, current : Edit<A> ) =>
                        new AlternateEdit<A>( acc, current) ;
        return edits.reduce( combine ) ; }
        
    class IdentityEdit<A> extends AbstractEdit<A> {
        
        constructor( ) { 
            super() ; }
        
        public applyEdit( a : A ) : Option<A> { return some(a) ; }
        
        public canApply( a : A ) : boolean { return true ; }
    }
    
    /** An edit that does nothing.
    * This is useful in combination with `alt`. For example given
    *  `var z = alt( x, id() );`, `z.applyEdit( a )` is the same as `x.applyEdit(a)` if that succeeds.
    *  It is `Some( a )` if `x.applyEdit(a)` fails.
    */
    export function id<A>() : Edit<A> {
        return new IdentityEdit<A>() ; }

    /** An edit that optionally applies another edit. */
    export function optionally<A>( edit : Edit<A> ) : Edit<A> {
        return alt( [edit, id<A>()] ) ;
    }

    class TestEdit<A> extends AbstractEdit<A> {
        
        private pred : (a:A) => boolean ;

        constructor( pred : (a:A) => boolean ) { 
            super() ;
            this.pred = pred ;
        }
        
        public applyEdit( a : A ) : Option<A> {
            return this.pred(a) ? some(a) : none<A>() ; }
        
        public canApply( a : A ) : boolean { return this.pred(a) ; }
    }

    export function testEdit<A>( pred : (a:A) => boolean ) : Edit<A> {
        return new TestEdit( pred ) ;
    }
}

export = edits ;
