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

    // A Rule is a function that takes a goal (theta <: delta) and
    // produces a list of arrays of sequents.
    //  (  [theta00 <: delta00, theta01 <: delta01, ... ],
    //     [theta10 <: delta10, theta11 <: delta11, ... ],
    //     ...
    //     [theta_n0 <: delta_n0, theta_n1 <: delta_n1, ... ] )
    //
    // A Rule f is sound if the following is true for every goal (theta <: delta)
    // with f(theta <: delta) = (a_0, a_1, ... a_n):
    //    (there exists an item a_i of the list such that
    //     every goal in array a_i is true)
    //   implies that (theta <: delta) is true
    //
    // Less formally if a sound rule returns a list of length n, it is telling you that
    // it "knows of" n ways to prove the goal. Each of those ways consists of
    // proving each subgoal in one of the arrays.
    //
    // Two special cases:  (a) When a rule returns an empty list it has failed. It
    // knows of no way to prove the goal.  (b) When a rule returns a list of
    // length 1 or more consisting entirely of empty arrays, it is telling you
    // that it has proved the goal.
    //
    // In addition to being sound, a good rule should ensure that all the subgoals it
    // returns are simpler than the original goal.
    export type Rule = (goal : Sequent) => List<Array<Sequent>> ;

    const success : List<Array<Sequent>> = list( [] ) ;
    const failure : List<Array<Sequent>> = list() ;

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

    function makeOrderedLeftLeftRule( factory : (i0 : number, i1 : number) => Rule ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            const leftLen = theta.length ;
            const ruleList = lazyIntSeq(0, leftLen-1).lazyBind(
                (i0:number) => lazyIntSeq(i0+1, leftLen-i0-1).lazyMap( 
                    (i1:number) => factory(i0,i1) ) ) ;
            const rule = combineRules( ruleList ) ;
            return rule(goal) ;
        } ;
    }

    function omit<A>( i : number, a : Array<A>) : Array<A> {
        return a.slice(0,i).concat( a.slice(i+1) ) ;
    }

    // The rule factories

    function leftBottomRuleFactory( i : number ) : Rule {
        return (goal : Sequent) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                theta[i],
                caseBottom( () =>
                    some( success ) ),
                (_) => some( failure )
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
                (_) => some( failure )
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
                (_) => some( failure )
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
                (_) => some( failure )
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
                (_) => some( failure ) ) ;
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
                (_) => some( failure ) ) ;
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
                (_) => some( failure ) ) ;
        } ;
    }

    function rightTopRuleFactory( j : number ) : Rule {
        return ( goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                delta[j],
                caseTop( () => 
                    some( success ) ),
                (_) => some( failure ) ) ;
        } ;
    }

    function reflexiveRuleFactory( i : number, j : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            if( theta[i].equals( delta[j] ) ) {
                return success ; }
            else {
                return failure  ; }
        } ;
    }

    function primitiveRuleFactory( i : number, j : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            const t = theta[i] ;
            const u = delta[j] ;
            if( t.isIntT() && u.isNumberT()
            ||  t.isNatT() && (u.isIntT() || u.isNumberT() ) ) {
                return success ; }
            else {
                return failure  ; }
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
                (_) => some( failure ) ) ;
        } ;
    }

    function functionRuleFactory( i : number, j : number ) : Rule {
        return (goal : Sequent ) => {
            const {theta, delta} : Sequent = goal ;
            return match(
                theta[i],
                caseFunction( (t0, t1) => 
                    delta[j].exFunction( (u0, u1) => {
                        const subgoals = [ {theta: [u0], delta:[t0]},
                                           {theta: [t1], delta:[u1]} ] ;
                        return some(list(subgoals)) ; } ) ),
                (_) => some( failure ) ) ;
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
                (_) => some( failure ) ) ;
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
                                           {theta:[u], delta:[t]} ] ;
                        return some(list(subgoals)) ;
                     } ) ),
                (_) => some( failure ) ) ;
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
                        t0Length===t1Length ? none() : some( success ) ) ) ;
            return opt.choose( (lst) => lst, () => failure ) ;
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
                return success ; }
            else {
                return failure  ; }
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
                            return some( failure ) ; } } ) ),
                (_) => some( failure )
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
                        caseFunction( (t1s,t1t) => some( success ) ),
                        caseField( (t1id,t1ct) => some( success ) ),
                        caseLocation( (t1ct) => some(success ) ) )
                ),
                caseFunction( (t0s, t0t) => 
                    optMatch(
                        t1,
                        caseLocation( (t1ct) => some(success ) ) )
                ),
                (_) => some( failure )
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

    const simplificationRules = combineRules( list(
        leftBottomRule,
        rightTopRule,
        rightBottomRule,
        leftTopRule,
        leftMeetRule,
        rightJoinRule,
        rightMeetRule,
        leftJoinRule ) ) ;

    // Uninvertable rules
    const reflexiveRule = makeLeftRightRule( reflexiveRuleFactory ) ;
    const primitiveRule = makeLeftRightRule( primitiveRuleFactory ) ;
    const tupleRule = makeLeftRightRule( tupleRuleFactory ) ;
    const functionRule = makeLeftRightRule( functionRuleFactory ) ;
    const fieldRule = makeLeftRightRule( fieldRuleFactory ) ;
    const locationRule = makeLeftRightRule( locationRuleFactory ) ;

    // Uninvertable disjointness rules
    const lengthDisjointnessRule = makeOrderedLeftLeftRule( lengthDisjointnessRuleFactory ) ;
    const primitiveDisjointnessRule = makeLeftLeftRule( primitiveDisjointnessRuleFactory ) ;
    const tupleDisjointnessRule = makeOrderedLeftLeftRule( tupleDisjointnessRuleFactory ) ;
    const otherDisjointnessRules = makeLeftLeftRule( otherDisjointnessRulesFactory ) ;

    const otherRules = combineRules( list(
        reflexiveRule,
        primitiveRule,
        tupleRule,
        functionRule,
        fieldRule,
        locationRule,
        lengthDisjointnessRule,
        primitiveDisjointnessRule,
        tupleDisjointnessRule,
        otherDisjointnessRules,
    )) ;

    function arrayFlatten<A>( a : Array<Array<A>> ) : Array<A> {
        return ([] as Array<A>).concat( ...a ) ;
    }

    // Simplification
    // Given a goal, produce an equivalent array of goals
    function simplify( goal : Sequent ) : Array<Sequent> {
        const possibleSimplifications = simplificationRules( goal ) ;
        if( possibleSimplifications.isEmpty() ) {
            return [goal] ;
        } else {
            const subgoals = possibleSimplifications.first() ;
            const simplifiedSubgoals = subgoals.map( simplify ) ;
            return arrayFlatten( simplifiedSubgoals ) ;
        }
    }

    function proveSimplified( goal : Sequent ) : boolean {
        let possiblities = otherRules( goal ) ;
        while( ! possiblities.isEmpty() ) {
            const subgoals = possiblities.first() ;
            if( subgoals.every( isProvable ) ) return true ;
            possiblities = possiblities.rest() ;
        }
        return false ;
    }

    function isProvable( goal : Sequent ) : boolean {
        const subgoals = simplify( goal ) ;
        return subgoals.every( proveSimplified ) ;
    }

    export function isSubtype( t : Type, u : Type ) : boolean {
        return isProvable( {theta:[t], delta: [u]} ) ;
    }

    export function areDisjoint( t : Type, u : Type ) : boolean {
        return isProvable( {theta:[t,u], delta: []} ) ;
    }

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
        simplify: simplify,
        proveSimplified: proveSimplified,
        isProvable: isProvable,
    } ;
}
export = subtype ;
