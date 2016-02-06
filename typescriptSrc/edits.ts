/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />

import collections = require( './collections' ) ;
import assert = require( './assert' ) ;

module edits {
    import Option = collections.Option;
    import Some = collections.Some;


    /** An Edit represents a function that may succeed or fail.
    * If z is an edit then z.applyEdit(a) either succeeds or fails.
    * If it succeeds, z.applyEdit(a) is Some(b) where b is the result of the function.
    * If it fails, z.applyEdit(a) is None().
    * If z is an edit, then z.canApply(a) indicates whether the edit will succeed or fail.
    */
    export interface Edit<A> {
        applyEdit : (a) => Option<A> ;
        
        // Invariant: If canApply(a) then applyEdit(a) succeeds.
        // Invariant: If !canApply(a) then applyEdit(a) fails
        canApply : (a) => boolean ;
    }
    
    export abstract class AbstractEdit<A> implements Edit<A> {
        constructor() { }
    
        abstract applyEdit(a : A) : Option<A> ;
        
        // A correct but possibly expensive way to tell whether
        // applyEdit will be successful.
        canApply(a : A) : boolean {
            return this.applyEdit( a ).choose(
                a => true,
                () => false ) ; }
    }
    
    class CompositeEdit<A> extends AbstractEdit<A> {
        private _first : Edit<A> ;
        private _second : Edit<A> ;
        
        constructor( first : Edit<A>, second : Edit<A> ) {
            super() ;
            this._first = first ; this._second = second ; }
        
        applyEdit( a : A ) : Option<A> {
            var result = this._first.applyEdit( a ) ;
            return result.choose(
                        this._second.applyEdit,
                        () => result ) ; }
        
        canApply( a : A ) : boolean {
            var result = this._first.applyEdit( a ) ;
            return result.choose(
                        this._second.canApply,
                        () => false ) ; }
    }
    
    /** The composition of two edits does one edit and then the other.
    * Given <code>var z = compose(x,y) ;</code> then
         z.applyEdit(a)  applies x to a and then applies y to the result of that; but
         z.applyEdit(a)  fails if either either application fails.
    */
    export function compose<A>( first : Edit<A>, second : Edit<A> ) {
        return new CompositeEdit<A>( first, second )  ; }
    
    class AlternateEdit<A> extends AbstractEdit<A> {
        private _first : Edit<A> ;
        private _second : Edit<A> ;
        
        constructor( first : Edit<A>, second : Edit<A> ) {
            super() ;
            this._first = first ; this._second = second ; }
        
        applyEdit( a : A ) : Option<A> {
            var result = this._first.applyEdit( a ) ;
            return result.choose(
                        (a : A) => result,
                        () => this._second.applyEdit( a ) ) ; }
        
        canApply( a : A ) : boolean {
            return this._first.canApply(a) || this._second.canApply(a) ; }
    }
    
    /** A biased choice between two edits.
    *  Given  <code>var z = alt(x,y) ;</code>
    *      z.applyEdit(a)  is the same as x.applyEdit(a) if that is successful.
    *      z.applyEdit(a)  is the same as y.applyEdit(a) if 
    *                           x.applyEdit(a) is not successful.
    */
    export function alt<A>( first : Edit<A>, second : Edit<A> ) {
        return new AlternateEdit<A>( first, second )  ; }
        
    
    class IdentityEdit<A> extends AbstractEdit<A> {
        
        constructor( ) { 
            super() ; }
        
        applyEdit( a : A ) : Option<A> { return new Some(a) ; }
        
        canApply( a : A ) : boolean { return true ; }
    }
    
    /** An edit that does nothing.
    * This is useful in combination with alt. For example given
    *  val z = alt( x, id() ) 
    *  z.applyEdit( a )  is the same as x.applyEdit(a) if that succeeds and is
    *  x.applyEdit(a)  is  Some( a ) if x.applyEdit(a) fails.
    */
    export function id<A>() {
        return new IdentityEdit<A>()  ; }
}

export = edits ;
