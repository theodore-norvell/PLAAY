/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />


module edits {
    import Option = collections.Option;
    import Some = collections.Some;


    /** An Edit is essentially just a partial function from A to A. */
    export interface Edit<A> {
        // Invariant: If canApply(a) then applyEdit(a) succeeds.
        // Invariant: If !canApply(a) then applyEdit(a) fails
        canApply : (a) => boolean ;
        applyEdit : (a) => Option<A> ;
    }
    
    export abstract class AbstractEdit<A> implements Edit<A> {
        constructor() { }
    
        abstract applyEdit(a : A) : Option<A> ;
        
        // A correct but possibly expensive way to tell whether
        // applyEdit will be successful.
        canApply(a : A) : boolean {
            return this.applyEdit( a ).choose(
                function( a : A ) { return true ; },
                function() { return false ; } ) ; }
    }
}