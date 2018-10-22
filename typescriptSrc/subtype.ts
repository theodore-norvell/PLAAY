/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="types.ts" />



import assert = require( './assert' ) ;
import collections = require('./collections') ;
import pnode = require( './pnode' ) ;
import types = require( './types' ) ;

module subtype {
    import List = collections.List ;
    import list = collections.list ;
    import match = collections.match ;
    import none = collections.none ;
    import Option = collections.Option ;
    import some = collections.some ;

    import Type = types.Type ;
    import caseJoin = types.caseJoin ;
    import caseBottom = types.caseBottom ;

    type Sequent = {theta:Array<Type>, delta: Array<Type>} ;

    type Rule = (goal : Sequent) => List<Array<Sequent>> ;

    export function leftBottomRule( i : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                theta[i],
                caseBottom( () =>
                    some( list( [] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function rightBottomRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseBottom( () =>
                    some( list( [ {theta: theta, delta: omit(j, delta)} ] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function leftJoinRule( i : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                theta[i],
                caseJoin( (t0 : Type, t1 : Type) => {
                    const thetaPrime = omit(i, theta) ;
                    return some( list( [{theta: [t0].concat( thetaPrime ), delta: delta},
                                        {theta: [t1].concat( thetaPrime ), delta: delta}] ) ) } ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function rightJoinRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }
    export function leftMeetRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function rightMeetRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function leftTopRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function rightTopRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function reflexiveRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function primitiveRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function tupleRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function functionRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function fieldRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function locationRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function lengthDisjointnessRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function primitiveDisjointnessRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    export function tupleDisjointnessRule( j : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseJoin( (u0 : Type, u1 : Type) =>
                    some( list( [{theta: theta, delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }


    function omit<A>( i : number, a : Array<A>) : Array<A>{
        return a.slice(0,i).concat( a.slice(i+1) ) ;
    }

}
export = subtype ;
e