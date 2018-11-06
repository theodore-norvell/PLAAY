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
    import optMatch = collections.optMatch ;
    import none = collections.none ;
    import Option = collections.Option ;
    import some = collections.some ;
    import lazyIntSeq = collections.lazyIntSeq ;

    import Type = types.Type ;
    import caseJoin = types.caseJoin ;
    import caseBottom = types.caseBottom ;
    import caseMeet = types.caseMeet ;
    import caseTop = types.caseTop ;
    import casePrimitive = types.casePrimitive ;
    import caseTuple = types.caseTuple ;
    import caseFunction = types.caseFunction ;
    import caseField = types.caseField ;
    import caseLocation = types.caseLocation ;

    export type Sequent = {theta:Array<Type>, delta: Array<Type>} ;

    export type Rule = (goal : Sequent) => List<Array<Sequent>> ;

    function omit<A>( i : number, a : Array<A>) : Array<A> {
        return a.slice(0,i).concat( a.slice(i+1) ) ;
    }

    function combineRules( rules : List<Rule> ) : Rule {
        return (goal : Sequent) => rules.lazyBind( (r:Rule) => r(goal)) ;
    }

    function makeLeftRule( factory : (i : number) => Rule ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            const len = theta.length ;
            const ruleList = lazyIntSeq(0, len).lazyMap( factory ) ;
            const rule = combineRules( ruleList ) ;
            return rule(goal) ;
        } ;
    }

    function makeRightRule( factory : (j : number) => Rule ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            const len = delta.length ;
            const ruleList = lazyIntSeq(0, len).lazyMap( factory ) ;
            const rule = combineRules( ruleList ) ;
            return rule(goal) ;
        } ;
    }

    function makeLeftRightRule( factory : (i : number, j : number) => Rule ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            const leftLen = theta.length ;
            const rightLen = delta.length ;
            const ruleList = lazyIntSeq(0, leftLen).lazyBind(
                (i:number) => lazyIntSeq(0, rightLen).lazyMap( 
                    (j:number) => factory(i,j) ) ) ;
            const rule = combineRules( ruleList ) ;
            return rule(goal) ;
        } ;
    }

    function makeLeftLeftRule( factory : (i0 : number, i1 : number) => Rule ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            const leftLen = theta.length ;
            const ruleList = lazyIntSeq(0, leftLen).lazyBind(
                (i0:number) => lazyIntSeq(0, leftLen).lazyMap( 
                    (i1:number) => factory(i0,i1) ) ) ;
            const rule = combineRules( ruleList ) ;
            return rule(goal) ;
        } ;
    }

    // The rule factories

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
                                        {theta: [t1].concat( thetaPrime ), delta: delta}] ) ) ; } ),
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
                    some( list( [{theta: theta,
                                  delta: [u0,u1].concat(omit(j,delta))}] ) ) ),
                (_) => some( list() )
            ) ;
        } ;
    }

    function leftMeetRuleFactory( i : number ) : Rule {
        return ( goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                theta[i],
                caseMeet( (t0, t1) =>
                    some( list( [{theta: [t0,t1].concat( omit(i, theta)),
                                  delta: delta }]))),
                (_) => some( list() ) ) ;
        } ;
    }

    function rightMeetRuleFactory( j : number ) : Rule {
        return ( goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseMeet( (u0, u1) => {
                    const deltaPrime = omit(j, delta ) ;
                    return some( list( [ { theta: theta,
                                           delta: [u0].concat( deltaPrime ) },
                                         { theta: theta,
                                           delta: [u1].concat( deltaPrime ) }
                                       ] ) ) ; } ),
                (_) => some( list() ) ) ;
        } ;
    }

    function leftTopRuleFactory( i : number ) : Rule {
        return ( goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                theta[i],
                caseTop( () => 
                    some( list( [ { theta: omit(i,theta),
                                    delta: delta } ] ) ) ),
                (_) => some( list() ) ) ;
        } ;
    }

    function rightTopRuleFactory( j : number ) : Rule {
        return ( goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseTop( () => 
                    some( list( [] ) ) ),
                (_) => some( list() ) ) ;
        } ;
    }

    function reflexiveRuleFactory( i : number, j : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            if( theta[i].equals( delta[j] ) ) {
                return list( [] ) ; }
            else {
                return list( )  ; }
        } ;
    }

    function primitiveRuleFactory( i : number, j : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            const t = theta[i] ;
            const u = delta[j] ;
            if( t.isIntT() && u.isNumberT()
            ||  t.isNatT() && (u.isIntT() || u.isNumberT() ) ) {
                return list( [] ) ; }
            else {
                return list( )  ; }
        } ;
    }

    function tupleRuleFactory( i : number, j : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                theta[i],
                caseTuple( (ts) => 
                    delta[j].exTuple( (us) => {
                        if( ts.length === us.length ) {
                            const subgoals = ts.map( (t,k) =>
                                ({theta: [t], delta: [us[k]]}) ) ;
                            return some(list(subgoals)) ;
                        } else {
                            return none() ;
                        } } ) ),
                (_) => some( list() ) ) ;
        } ;
    }

    function functionRuleFactory( i : number, j : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                theta[i],
                caseFunction( (t0, t1) => 
                    delta[j].exFunction( (u0, u1) => {
                        const subgoals = [ {theta: [u0], delta:[u1]},
                                           {theta: [t1], delta:[u1]} ] ;
                        return some(list(subgoals)) ; } ) ),
                (_) => some( list() ) ) ;
        } ;
    }

    function fieldRuleFactory( i : number, j : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                theta[i],
                caseField( (id0, t) => 
                    delta[j].exField( (id1, u) => {
                        if( id0 === id1 ) {
                            const subgoals = [ {theta:[t], delta:[u]} ] ;
                            return some(list(subgoals)) ;
                        } else {
                            return none() ;
                        } } ) ),
                (_) => some( list() ) ) ;
        } ;
    }

    function locationRuleFactory( i : number, j : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                theta[i],
                caseLocation( (t) => 
                    delta[j].exLocation( (u) => {
                        const subgoals = [ {theta:[t], delta:[u]},
                                           {theta:[u], delta:[u]} ] ;
                        return some(list(subgoals)) ;
                     } ) ),
                (_) => some( list() ) ) ;
        } ;
    }

    function lengthDisjointnessRuleFactory( i0 : number, i1 : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            const t0 = theta[i0] ;
            const t1 = theta[i1] ;
            const opt : Option<List<Array<Sequent>>> =
                t0.length().bind( (t0Length) =>
                    t1.length().bind( (t1Length) =>
                        t0Length===t1Length ? none() : some( list([]) ) ) ) ;
            return opt.choose( (lst) => lst, () => list() ) ;
        } ;
    }

    function primitiveDisjointnessRuleFactory( i0 : number, i1 : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            const t0 = theta[i0] ;
            const t1 = theta[i1] ;
            if( t0.isBoolT() && ( t1.isNumberT()
                                || t1.isIntT() 
                                || t1.isNatT()
                                || t1.isStringT()
                                || t1.isNullT() )
            || t0.isStringT() && ( t1.isNumberT() 
                               ||  t1.isIntT()
                               || t1.isNatT() 
                               || t1.isNullT() )
            || t0.isNullT() && ( t1.isNumberT() 
                               || t1.isIntT() 
                               || t1.isNatT() )

             ) {
                return list( [] ) ; }
            else {
                return list( )  ; }
        } ;
    }

    function tupleDisjointnessRuleFactory( i0 : number, i1 : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            const t0 = theta[i0] ;
            const t1 = theta[i1] ;
            return match(
                t0,
                caseTuple( (ts) => 
                    t1.exTuple( (us) => {
                        if( ts.length === us.length ) {
                            // Two tuples of the same length.
                            const sequents : Array<Sequent> = 
                                ts.map( (t, k) => ({theta: [t,us[k]],
                                                    delta: [] }) ) ;
                            const subgoals = sequents.map( (g) => [g]) ;
                            const listOfSubgoals : List<Array<Sequent>> = list( ...subgoals ) ;
                            return some( listOfSubgoals ) ;
                        } else {
                            return some( list() ) ; } } ) ),
                (_) => some( list() )
            ) ; } ;
    }

    function otherDisjointnessRulesFactory( i0 : number, i1 : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            const t0 = theta[i0] ;
            const t1 = theta[i1] ;
            return match( 
                t0,
                casePrimitive( (kind) =>
                    optMatch( 
                        t1,
                        caseFunction( (t1s,t1t) => some( list([]) ) ),
                        caseField( (t1id,t1ct) => some( list([]) ) ),
                        caseLocation( (t1ct) => some(list([]) ) ) )
                ),
                caseFunction( (t0s, t0t) => 
                    optMatch(
                        t1,
                        caseLocation( (t1ct) => some(list([]) ) ) )
                ),
                (_) => some( list() )
            ) ;
        } ;
    }


    // Invertable rules

    const leftBottomRule = makeLeftRule( leftBottomRuleFactory ) ;
    const rightBottomRule = makeRightRule( rightBottomRuleFactory ) ;
    const leftJoinRule = makeLeftRule( leftJoinRuleFactory ) ;
    const rightJoinRule = makeRightRule( rightJoinRuleFactory ) ;
    const leftMeetRule = makeLeftRule( leftMeetRuleFactory ) ;
    const rightMeetRule = makeRightRule( rightMeetRuleFactory ) ;
    const leftTopRule = makeLeftRule( leftTopRuleFactory ) ;
    const rightTopRule = makeRightRule( rightTopRuleFactory ) ;

    // Uninvertable rules
    const reflexiveRule = makeLeftRightRule( reflexiveRuleFactory ) ;
    const primitiveRule = makeLeftRightRule( primitiveRuleFactory ) ;
    const tupleRule = makeLeftRightRule( tupleRuleFactory ) ;
    const functionRule = makeLeftRightRule( functionRuleFactory ) ;
    const fieldRule = makeLeftRightRule( fieldRuleFactory ) ;
    const locationRule = makeLeftRightRule( locationRuleFactory ) ;

    // Uninvertable disjointness rules
    const lengthDisjointnessRule = makeLeftLeftRule( lengthDisjointnessRuleFactory ) ;
    const primitiveDisjointnessRule = makeLeftLeftRule( primitiveDisjointnessRuleFactory ) ;
    const tupleDisjointnessRule = makeLeftLeftRule( tupleDisjointnessRuleFactory ) ;
    const otherDisjointnessRules = makeLeftLeftRule( otherDisjointnessRulesFactory ) ;

    export const forTestingOnly = {
        // Invertable rules
        leftBottomRule: leftBottomRule,
        rightBottomRule: rightBottomRule,
        leftJoinRule: leftJoinRule,
        rightJoinRule: rightJoinRule,
        leftTopRule: leftTopRule,
        rightTopRule: rightTopRule,
        leftMeetRule: leftMeetRule,
        rightMeetRule: rightMeetRule,
        // Uninvertable
        reflexiveRule: reflexiveRule,
        primitiveRule: primitiveRule,
        tupleRule: tupleRule,
        functionRule: functionRule,
        fieldRule: fieldRule,
        locationRule: locationRule,
        // Uninvertable disjointness rules
        lengthDisjointnessRule: lengthDisjointnessRule,
        primitiveDisjointnessRule: primitiveDisjointnessRule,
        tupleDisjointnessRule: tupleDisjointnessRule,
        otherDisjointnessRules: otherDisjointnessRules,
    } ;
}
export = subtype ;
