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

    export type Sequent = {theta:Array<Type>, delta: Array<Type>} ;

    export type Rule = (goal : Sequent) => List<Array<Sequent>> ;

    export const forTestingOnly = { leftBottomRuleFactory: leftBottomRuleFactory,
                                    rightBottomRuleFactory: rightBottomRuleFactory,
                                    leftJoinRuleFactory: leftJoinRuleFactory,
                                    rightJoinRuleFactory: rightJoinRuleFactory
    } ;

    function leftBottomRuleFactory( i : number ) : Rule {
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

    function rightBottomRuleFactory( j : number ) : Rule {
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

    function leftJoinRuleFactory( i : number ) : Rule {
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

    function rightJoinRuleFactory( j : number ) : Rule {
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

    export function leftMeetRuleFactory( j : number ) : Rule {
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

    export function rightMeetRuleFactory( j : number ) : Rule {
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

    export function leftTopRuleFactory( j : number ) : Rule {
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

    export function rightTopRuleFactory( j : number ) : Rule {
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


    function omit<A>( i : number, a : Array<A>) : Array<A> {
        return a.slice(0,i).concat( a.slice(i+1) ) ;
    }

    
    function combineRules( rules : List<Rule> ) : Rule {
        return (goal : Sequent) => rules.lazyBind( (r:Rule) => r(goal)) ;
    }

}
export = subtype ;
