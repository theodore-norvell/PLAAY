/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../subtype.ts" />
/// <reference path="../types.ts" />

import assert = require( '../assert' ) ;
import collections = require( '../collections' ) ;
import subtype = require('../subtype') ;
import types = require('../types') ;

import some = collections.some ;
import none = collections.none ;
import List = collections.List ;
import Sequent = subtype.Sequent ;

const leftBottomRule = subtype.forTestingOnly.leftBottomRule ;
const rightBottomRule = subtype.forTestingOnly.rightBottomRule ;
const leftJoinRule = subtype.forTestingOnly.leftJoinRule ;
const rightJoinRule = subtype.forTestingOnly.rightJoinRule ;
const leftTopRule = subtype.forTestingOnly.leftTopRule ;
const rightTopRule = subtype.forTestingOnly.rightTopRule ;
const leftMeetRule = subtype.forTestingOnly.leftMeetRule ;
const rightMeetRule = subtype.forTestingOnly.rightMeetRule ;

const reflexiveRule = subtype.forTestingOnly.reflexiveRule ;
const primitiveRule = subtype.forTestingOnly.primitiveRule ;
const tupleRule = subtype.forTestingOnly.tupleRule ;
const functionRule = subtype.forTestingOnly.functionRule ;
const fieldRule = subtype.forTestingOnly.fieldRule ;
const locationRule = subtype.forTestingOnly.locationRule ;

const lengthDisjointnessRule = subtype.forTestingOnly.lengthDisjointnessRule ;
const primitiveDisjointnessRule = subtype.forTestingOnly.primitiveDisjointnessRule ;
const tupleDisjointnessRule = subtype.forTestingOnly.tupleDisjointnessRule ;
const otherDisjointnessRules = subtype.forTestingOnly.otherDisjointnessRules ;

const simplify = subtype.forTestingOnly.simplify ;
const proveSimplified = subtype.forTestingOnly.proveSimplified ;
const isProvable = subtype.forTestingOnly.isProvable ;

import JoinType = types.JoinType ;
import MeetType = types.MeetType ;
import PrimitiveType = types.PrimitiveType ;
import TupleType = types.TupleType ;
import FunctionType = types.FunctionType ;
import FieldType = types.FieldType ;
import LocationType = types.LocationType ;

const createMeetType = MeetType.createMeetType ;
const createJoinType = JoinType.createJoinType ;
const createFieldType = FieldType.createFieldType ;
const createTupleType = TupleType.createTupleType ;
const createFunctionType = FunctionType.createFunctionType ;
const createLocationType = LocationType.createLocationType ;

const top = types.TopType.theTopType ;
const bottom = types.BottomType.theBottomType  ;
const meet_tb = MeetType.createMeetType(top, bottom) ;
const meet_tb1 = MeetType.createMeetType(top, bottom) ;
const join_tb = JoinType.createJoinType(top, bottom) ;
const join_tb1 = JoinType.createJoinType(top, bottom) ;
const meet_bt = MeetType.createMeetType(bottom, top) ;
const join_bt = JoinType.createJoinType(bottom, top) ;
const natT = PrimitiveType.natType ;
const intT = PrimitiveType.intType ;
const numberT = PrimitiveType.numberType ;
const nullT = PrimitiveType.nullType ;
const stringT = PrimitiveType.stringType ;
const boolT = PrimitiveType.boolType ;
const tuple0 = TupleType.createTupleType( [] ) ;
const tuple2 = TupleType.createTupleType( [natT, meet_bt] ) ;
const tuple2a = TupleType.createTupleType( [natT, meet_bt] ) ;
const tuple2b = TupleType.createTupleType( [natT, intT] ) ;
const tuple2c = TupleType.createTupleType( [stringT, nullT] ) ;
const tuple3 = TupleType.createTupleType( [natT, intT, top] ) ;
const tuple3a = TupleType.createTupleType( [natT, intT, top] ) ;
const tuple3b = TupleType.createTupleType( [stringT, boolT, nullT] ) ;
const funcT = FunctionType.createFunctionType( numberT, boolT ) ;
const funcTa = FunctionType.createFunctionType( numberT, boolT ) ;
const funcTb = FunctionType.createFunctionType( nullT, stringT ) ;
const fieldT = FieldType.createFieldType( "x", boolT ) ;
const fieldTa = FieldType.createFieldType( "x", boolT ) ;
const fieldTb = FieldType.createFieldType( "x", stringT ) ;
const fieldTc = FieldType.createFieldType( "y", stringT ) ;
const locT = LocationType.createLocationType( natT ) ;
const locTa =  LocationType.createLocationType( natT ) ;
const locTb =  LocationType.createLocationType( intT ) ;




function expectFailure( result : List<Array<Sequent>> ) : void {
    assert.checkEqual( 0, result.size() );
}

function expectSuccess( result : List<Array<Sequent>>, count : number = 1 ) : void {
    assert.checkEqual( count, result.size() );
    result.map( (subgoals) => assert.checkEqual( 0, subgoals.length ) ) ;
}

function sequent2String( sequent : Sequent ) : string {
    return sequent.theta.toString() + " <: " + sequent.delta.toString() ;
}

describe( "leftBottomRule", function() : void {
    it( "should succeed for Bottom -- 0", function() : void {
        const goal = { theta: [top, bottom], delta: [] } ;
        const result = leftBottomRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed for Bottom -- 1", function() : void {
        const goal = { theta: [top, bottom], delta: [] } ;
        const result = leftBottomRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed twice for two Bottoms", function() : void {
        const goal = { theta: [bottom, top, bottom], delta: [] } ;
        const result = leftBottomRule( goal ) ;
        expectSuccess( result, 2 ) ;
    } ) ;

    it( "should fail for Top", function() : void {
        const goal = { theta: [top, top, top], delta: [] } ;
        const result = leftBottomRule( goal ) ;
        expectFailure( result ) ;
    } ) ;
} ) ;

describe( "rightBottomRule", function() : void {
    it( "should succeed for Bottom", function() : void {
        const goal = { theta: [], delta: [top, bottom] } ;
        const result = rightBottomRule( goal ) ;
        // Expect one array of subgoals.
        assert.checkEqual( 1, result.size() ) ;
        const subgoals = result.first() ;
        // Expect one subgoal in the array
        assert.checkEqual( 1, subgoals.length ) ;
        const subgoal = subgoals[0] ;
        const theta0 = subgoal.theta ;
        const delta0 = subgoal.delta ;
        // expect the left side to consist of 1 type
        assert.checkEqual( "", theta0.toString() ) ;
        assert.checkEqual( "Top", delta0.toString() ) ;
    } ) ;

    it( "should succeed twice for 2 bottoms", function() : void {
        const goal = { theta: [], delta: [bottom, top, bottom] } ;
        const result = rightBottomRule( goal ) ;
        // Expect a list of two arrays of subgoals.
        assert.checkEqual( 2, result.size() ) ;

        // Check the first
        const subgoals0 = result.first() ;
        // Expect one subgoal in the array
        assert.checkEqual( 1, subgoals0.length ) ;
        const subgoal0 = subgoals0[0] ;
        const theta0 = subgoal0.theta ;
        const delta0 = subgoal0.delta ;
        // expect the left side to consist of 1 type
        assert.checkEqual( "", theta0.toString() ) ;
        assert.checkEqual( "Top,Bottom", delta0.toString() ) ;

        // Check the second
        const subgoals1 = result.rest().first() ;
        // Expect one subgoal in the array
        assert.checkEqual( 1, subgoals1.length ) ;
        const subgoal1 = subgoals1[0] ;
        const theta1 = subgoal1.theta ;
        const delta1 = subgoal1.delta ;
        // expect the left side to consist of 1 type
        assert.checkEqual( "", theta1.toString() ) ;
        assert.checkEqual( "Bottom,Top", delta1.toString() ) ;
    } ) ;

    it( "should fail for top", function() : void {
        const goal = { theta: [top, bottom], delta: [top, top, top] } ;
        const result = rightBottomRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail for empty", function() : void {
        const goal = { theta: [bottom, bottom, bottom], delta: [] } ;
        const result = rightBottomRule( goal ) ;
        expectFailure( result ) ;
    } ) ;
} ) ;

describe( "leftJoinRule", function() : void {
    it( "should succeed for Join", function() : void {
        // Try Top, Join(Top, Bottom) <: empty
        const goal = { theta: [top, join_tb], delta: [] } ;
        const result = leftJoinRule( goal ) ;
        // Expect one array of subgoals.
        assert.checkEqual( 1, result.size() ) ;
        const subgoals = result.first() ;
        // Expect 2 subgoals in the array
        assert.checkEqual( 2, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;

        assert.checkEqual( "Top,Top", theta0.toString() ) ;
        assert.checkEqual( "", delta0.toString()  ) ;

        const theta1 = subgoals[1].theta ;
        const delta1 = subgoals[1].delta ;

        assert.checkEqual( "Bottom,Top", theta1.toString() ) ;
        assert.checkEqual( "", delta1.toString()  ) ;
    } ) ;

    it( "should fail for top", function() : void {
        // Try Top, Join(Top, Bottom) <: empty
        const goal = { theta: [top, top], delta: [] } ;
        const result = leftJoinRule( goal ) ;
        expectFailure( result ) ;
    } ) ;
} ) ;

describe( "rightJoinRule", function() : void {
    it( "should succeed for Join", function() : void {
        // Try  empty <: Top, Join(Top, Bottom)
        const goal = {  theta: [], delta: [top, join_tb] } ;
        const result = rightJoinRule( goal ) ;
        // Expect one array of subgoals.
        assert.checkEqual( 1, result.size() ) ;
        const subgoals = result.first() ;
        // Expect 2 subgoals in the array
        assert.checkEqual( 1, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;

        assert.checkEqual( "", theta0.toString()  ) ;
        assert.checkEqual( "Top,Bottom,Top", delta0.toString() ) ;
    } ) ;

    it( "should fail when no join on right", function() : void {
        // Try  empty <: Top, Join(Top, Bottom)
        const goal = {  theta: [], delta: [bottom, bottom, top] } ;
        const result = rightJoinRule( goal ) ;
        expectFailure( result ) ;
    } ) ;
} ) ;

describe( "rightTopRule", function() : void {
    it( "should succeed for Top -- 0", function() : void {
        const goal = { theta: [], delta: [bottom, top] } ;
        const result = rightTopRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed for Top -- 1", function() : void {
        const goal = { theta: [], delta: [top] } ;
        const result = rightTopRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed twice for two Tops", function() : void {
        const goal = { theta: [], delta: [top, bottom, top] } ;
        const result = rightTopRule( goal ) ;
        expectSuccess( result, 2 ) ;
    } ) ;

    it( "should fail for Bottom", function() : void {
        const goal = { theta: [], delta: [bottom, bottom, bottom] } ;
        const result = rightTopRule( goal ) ;
        expectFailure( result ) ;
    } ) ;
} ) ;

describe( "leftTopRule", function() : void {
    it( "should succeed for Top", function() : void {
        const goal = { theta: [top, bottom], delta: [] } ;
        const result = leftTopRule( goal ) ;
        // Expect one array of subgoals.
        assert.checkEqual( 1, result.size() ) ;
        const subgoals = result.first() ;
        // Expect one subgoal in the array
        assert.checkEqual( 1, subgoals.length ) ;
        const subgoal = subgoals[0] ;
        const theta0 = subgoal.theta ;
        const delta0 = subgoal.delta ;
        // expect the left side to consist of 1 type
        assert.checkEqual( "Bottom", theta0.toString() ) ;
        assert.checkEqual( "", delta0.toString() ) ;
    } ) ;

    it( "should succeed twice for 2 tops", function() : void {
        const goal = { theta: [top, bottom, top], delta: [] } ;
        const result = leftTopRule( goal ) ;
        // Expect a list of two arrays of subgoals.
        assert.checkEqual( 2, result.size() ) ;

        // Check the first
        const subgoals0 = result.first() ;
        // Expect one subgoal in the array
        assert.checkEqual( 1, subgoals0.length ) ;
        const subgoal0 = subgoals0[0] ;
        const theta0 = subgoal0.theta ;
        const delta0 = subgoal0.delta ;
        // expect the left side to consist of 1 type
        assert.checkEqual( "Bottom,Top", theta0.toString() ) ;
        assert.checkEqual( "", delta0.toString() ) ;

        // Check the second
        const subgoals1 = result.rest().first() ;
        // Expect one subgoal in the array
        assert.checkEqual( 1, subgoals1.length ) ;
        const subgoal1 = subgoals1[0] ;
        const theta1 = subgoal1.theta ;
        const delta1 = subgoal1.delta ;
        // expect the left side to consist of 1 type
        assert.checkEqual( "Top,Bottom", theta1.toString() ) ;
        assert.checkEqual( "", delta1.toString() ) ;
    } ) ;

    it( "should fail for bottom", function() : void {
        const goal = { theta: [bottom, bottom], delta: [top, top, top] } ;
        const result = leftTopRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail for empty", function() : void {
        const goal = { theta: [], delta: [top, top, top] } ;
        const result = leftTopRule( goal ) ;
        expectFailure( result ) ;
    } ) ;
} ) ;

describe( "rightMeetRule", function() : void {
    it( "should succeed for Meet", function() : void {
        // Try empty <: Top, Meet(Top, Bottom)
        const goal = { theta: [], delta: [top, meet_tb] } ;
        const result = rightMeetRule( goal ) ;
        // Expect one array of subgoals.
        assert.checkEqual( 1, result.size() ) ;
        const subgoals = result.first() ;
        // Expect 2 subgoals in the array
        assert.checkEqual( 2, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;

        assert.checkEqual( "", theta0.toString() ) ;
        assert.checkEqual( "Top,Top", delta0.toString()  ) ;

        const theta1 = subgoals[1].theta ;
        const delta1 = subgoals[1].delta ;

        assert.checkEqual( "", theta1.toString() ) ;
        assert.checkEqual( "Bottom,Top", delta1.toString()  ) ;
    } ) ;

    it( "should fail for top", function() : void {
        // Try Top, Join(Top, Bottom) <: empty
        const goal = { theta: [], delta: [top, top] } ;
        const result = rightMeetRule( goal ) ;
        expectFailure( result ) ;
    } ) ;
} ) ;

describe( "leftMeetRule", function() : void {
    it( "should succeed for Meet", function() : void {
        // Try  empty <: Top, Join(Top, Bottom)
        const goal = {  theta: [top, meet_tb], delta: [] } ;
        const result = leftMeetRule( goal ) ;
        // Expect one array of subgoals.
        assert.checkEqual( 1, result.size() ) ;
        const subgoals = result.first() ;
        // Expect 2 subgoals in the array
        assert.checkEqual( 1, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;

        assert.checkEqual( "Top,Bottom,Top", theta0.toString()  ) ;
        assert.checkEqual( "", delta0.toString() ) ;
    } ) ;

    it( "should fail when no meet on left -- 0", function() : void {
        // Try  empty <: Top, Join(Top, Bottom)
        const goal = { theta: [join_tb, bottom, top], delta: [] } ;
        const result = leftMeetRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when no meet on left -- 1", function() : void {
        // Try  empty <: Top, Join(Top, Bottom)
        const goal = { theta: [], delta: [meet_tb] } ;
        const result = leftMeetRule( goal ) ;
        expectFailure( result ) ;
    } ) ;
} ) ;

describe( "reflexiveRule", function() : void {
    it( "should fail on empty", function() : void {
        // Try  empty <: empty
        const goal = {  theta: [], delta: [] } ;
        const result = reflexiveRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when no match", function() : void {
        const goal = {  theta: [top, meet_tb, join_bt],
                        delta: [bottom, meet_bt, join_tb] } ;
        const result = reflexiveRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should succeed -- for top", function() : void {
        const goal = {  theta: [top, meet_tb, join_bt],
                        delta: [bottom, meet_bt, top] } ;
        const result = reflexiveRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed -- for bottom", function() : void {
        const goal = {  theta: [top, meet_tb, bottom],
                        delta: [bottom, meet_bt, join_tb] } ;
        const result = reflexiveRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed -- for meet", function() : void {
        const goal = {  theta: [top, meet_tb, join_bt],
                        delta: [bottom, meet_tb, join_tb] } ;
        const result = reflexiveRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed -- for join", function() : void {
        const goal = {  theta: [top, meet_tb, join_bt],
                        delta: [bottom, meet_bt, join_bt] } ;
        const result = reflexiveRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed -- in many ways", function() : void {
        const goal = {  theta: [top, bottom, meet_tb, meet_tb1, join_tb,
                                join_tb1, meet_bt, join_bt, natT, intT, numberT,
                                nullT, stringT, boolT, tuple0, tuple2, tuple2a,
                                tuple2b, tuple3, tuple3a, funcT, funcTa, funcTb, fieldT,
                                fieldTa, fieldTb, fieldTc, locT, locTa, locTb],
                        delta: [top, bottom, meet_tb, meet_tb1, join_tb,
                                join_tb1, meet_bt, join_bt, natT, intT, numberT,
                                nullT, stringT, boolT, tuple0, tuple2, tuple2a,
                                tuple2b, tuple3, tuple3a, funcT, funcTa, funcTb, fieldT,
                                fieldTa, fieldTb, fieldTc, locT, locTa, locTb] } ;
        const result = reflexiveRule( goal ) ;
        expectSuccess( result, 44 ) ;
    } ) ;
} ) ;

describe( "primitiveRule", function() : void {
    it( "should fail on empty", function() : void {
        // Try  empty <: empty
        const goal = {  theta: [], delta: [] } ;
        const result = primitiveRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when no match", function() : void {
        const goal = {  theta: [top, meet_tb, join_bt, boolT, stringT, nullT, numberT, intT],
                        delta: [bottom, meet_bt, join_tb, boolT, stringT, nullT, intT, natT] } ;
        const result = primitiveRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should succeed -- for nat and int", function() : void {
        const goal = {  theta: [top, meet_tb, natT],
                        delta: [bottom, intT, top] } ;
        const result = primitiveRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed -- for nat and number", function() : void {
        const goal = {  theta: [top, meet_tb, natT],
                        delta: [bottom, meet_bt, numberT] } ;
        const result = primitiveRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed -- for int and number", function() : void {
        const goal = {  theta: [intT, meet_tb, join_bt],
                        delta: [bottom, meet_bt, numberT] } ;
        const result = primitiveRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed in many ways", function() : void {
        const goal = {  theta: [intT, natT, numberT],
                        delta: [intT, natT, numberT] } ;
        const result = primitiveRule( goal ) ;
        expectSuccess( result, 3 ) ;
    } ) ;
} ) ;

describe( "tupleRule", function() : void {
    it( "should fail on empty", function() : void {
        // Try  empty <: empty
        const goal = {  theta: [], delta: [] } ;
        const result = tupleRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when tuple is only on one side -- 0", function() : void {
        const goal = {  theta: [tuple2],
                        delta: [top] } ;
        const result = tupleRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when tuple is only on one side -- 1", function() : void {
        const goal = {  theta: [top],
                        delta: [tuple2] } ;
        const result = tupleRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when no length match", function() : void {
        const goal = {  theta: [tuple0, tuple2],
                        delta: [tuple3] } ;
        const result = tupleRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should succeed tuple0s involved", function() : void {
        const goal = {  theta: [tuple0, tuple2],
                        delta: [tuple0] } ;
        const result = tupleRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed when there is a length match -- 0", function() : void {
        const goal = {  theta: [tuple0, tuple2],
                        delta: [tuple3, tuple2b] } ;
        const result = tupleRule( goal ) ;
        assert.checkEqual(1, result.size() ) ;
        const subgoals = result.first() ;
        assert.checkEqual( 2, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;
        assert.checkEqual( 1, theta0.length ) ;
        assert.checkEqual( natT, theta0[0] ) ;
        assert.checkEqual( 1, delta0.length ) ;
        assert.checkEqual( natT, delta0[0] ) ;
        
        const theta1 = subgoals[1].theta ;
        const delta1 = subgoals[1].delta ;
        assert.checkEqual( 1, theta1.length ) ;
        assert.checkEqual( meet_bt, theta1[0] ) ;
        assert.checkEqual( 1, delta1.length ) ;
        assert.checkEqual( intT, delta1[0] ) ;
    } ) ;

    it( "should succeed when there is a length match -- 1", function() : void {
        const goal = {  theta: [tuple3, tuple2],
                        delta: [top, tuple3b] } ;
        const result = tupleRule( goal ) ;
        assert.checkEqual(1, result.size() ) ;
        const subgoals = result.first() ;
        assert.checkEqual( 3, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;
        assert.checkEqual( 1, theta0.length ) ;
        assert.checkEqual( natT, theta0[0] ) ;
        assert.checkEqual( 1, delta0.length ) ;
        assert.checkEqual( stringT, delta0[0] ) ;
        
        const theta1 = subgoals[1].theta ;
        const delta1 = subgoals[1].delta ;
        assert.checkEqual( 1, theta1.length ) ;
        assert.checkEqual( intT, theta1[0] ) ;
        assert.checkEqual( 1, delta1.length ) ;
        assert.checkEqual( boolT, delta1[0] ) ;
        
        const theta2 = subgoals[2].theta ;
        const delta2 = subgoals[2].delta ;
        assert.checkEqual( 1, theta2.length ) ;
        assert.checkEqual( top, theta2[0] ) ;
        assert.checkEqual( 1, delta2.length ) ;
        assert.checkEqual( nullT, delta2[0] ) ;
    } ) ;
} ) ;

describe( "functionRule", function() : void {
    it( "should fail on empty", function() : void {
        const goal = {  theta: [], delta: [] } ;
        const result = functionRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when function type is only on one side -- 0", function() : void {
        const goal = {  theta: [top, bottom], delta: [funcT, funcTa] } ;
        const result = functionRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when function type is only on one side -- 1", function() : void {
        const goal = {  theta: [funcT, funcTa], delta: [top, bottom] } ;
        const result = functionRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should succeed when function types are present", function() : void {
        const goal = {  theta: [funcT],
                        delta: [funcTb] } ;
        const result = functionRule( goal ) ;

        assert.checkEqual(1, result.size() ) ;
        const subgoals = result.first() ;
        assert.checkEqual( 2, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;
        assert.checkEqual( 1, theta0.length ) ;
        assert.checkEqual( nullT, theta0[0] ) ;
        assert.checkEqual( 1, delta0.length ) ;
        assert.checkEqual( numberT, delta0[0] ) ;
        
        const theta1 = subgoals[1].theta ;
        const delta1 = subgoals[1].delta ;
        assert.checkEqual( 1, theta1.length ) ;
        assert.checkEqual( boolT, theta1[0] ) ;
        assert.checkEqual( 1, delta1.length ) ;
        assert.checkEqual( stringT, delta1[0] ) ;
    } ) ;
} ) ;

describe( "fieldRule", function() : void {
    it( "should fail on empty", function() : void {
        const goal = {  theta: [], delta: [] } ;
        const result = fieldRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when field type is only on one side -- 0", function() : void {
        const goal = {  theta: [top, fieldT], delta: [funcT, funcTa] } ;
        const result = fieldRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when field type is only on one side -- 1", function() : void {
        const goal = {  theta: [funcT, funcTa], delta: [fieldTb, bottom] } ;
        const result = fieldRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when identifiers differ", function() : void {
        const goal = {  theta: [fieldTb, funcTa], delta: [fieldTc, bottom] } ;
        const result = fieldRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should succeed when identifiers are the same", function() : void {
        const goal = {  theta: [fieldT],
                        delta: [fieldTb] } ;
        const result = fieldRule( goal ) ;

        assert.checkEqual(1, result.size() ) ;
        const subgoals = result.first() ;
        assert.checkEqual( 1, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;
        assert.checkEqual( 1, theta0.length ) ;
        assert.checkEqual( boolT, theta0[0] ) ;
        assert.checkEqual( 1, delta0.length ) ;
        assert.checkEqual( stringT, delta0[0] ) ;
    } ) ;
} ) ;

describe( "locationRule", function() : void {
    it( "should fail on empty", function() : void {
        const goal = {  theta: [], delta: [] } ;
        const result = locationRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when location type is only on one side -- 0", function() : void {
        const goal = {  theta: [locT, fieldT], delta: [funcT, funcTa] } ;
        const result = locationRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when field type is only on one side -- 1", function() : void {
        const goal = {  theta: [funcT, funcTa], delta: [fieldTb, locT] } ;
        const result = locationRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should succeed locations on both sides", function() : void {
        const goal = {  theta: [locT],
                        delta: [locTb] } ;
        const result = locationRule( goal ) ;

        assert.checkEqual(1, result.size() ) ;
        const subgoals = result.first() ;
        assert.checkEqual( 2, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;
        assert.checkEqual( 1, theta0.length ) ;
        assert.checkEqual( natT, theta0[0] ) ;
        assert.checkEqual( 1, delta0.length ) ;
        assert.checkEqual( intT, delta0[0] ) ;
        
        const theta1 = subgoals[1].theta ;
        const delta1 = subgoals[1].delta ;
        assert.checkEqual( 1, theta1.length ) ;
        assert.checkEqual( intT, theta1[0] ) ;
        assert.checkEqual( 1, delta1.length ) ;
        assert.checkEqual( natT, delta1[0] ) ;
    } ) ;
} ) ;

describe( "lengthDisjointnessRule", function() : void {
    it( "should fail on empty", function() : void {
        const goal = {  theta: [], delta: [] } ;
        const result = lengthDisjointnessRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when all types on left have same length or no length--0 ", function() : void {
        const goal = {  theta: [boolT, stringT, nullT, intT, fieldT, locT, top, bottom, join_bt, meet_bt ],
                        delta: [] } ;
        const result = lengthDisjointnessRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when all types on left have same length or no length--1 ", function() : void {
        const goal = {  theta: [ tuple2, tuple2a, tuple2b, top, bottom, join_bt, meet_bt ],
                        delta: [] } ;
        const result = lengthDisjointnessRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should succeed when two types have different length -- 0", function() : void {
        const goal = {  theta: [ tuple2, tuple3 ], delta: [funcT, funcTa] } ;
        const result = lengthDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed when two types have different length -- 1", function() : void {
        const goal = {  theta: [ tuple2, tuple0 ], delta: [funcT, funcTa] } ;
        const result = lengthDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed when two types have different length -- 2", function() : void {
        const goal = {  theta: [ tuple2, nullT ], delta: [funcT, funcTa] } ;
        const result = lengthDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "should succeed when two types have different length -- 3", function() : void {
        const goal = {  theta: [ tuple0, nullT ], delta: [funcT, funcTa] } ;
        const result = lengthDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;
} ) ;

describe( "primitiveDisjointnessRule", function() : void {
    it( "should fail on empty", function() : void {
        const goal = {  theta: [], delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when all types on are nonprimitive of not disjoint", function() : void {
        const goal = {  theta: [intT, natT, numberT, natT, numberT, fieldT, locT, top, bottom, join_bt, meet_bt ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "succeed for Bool and Number", function() : void {
        const goal = {  theta: [ boolT, numberT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Number and Bool", function() : void {
        const goal = {  theta: [ numberT, boolT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Bool and Int", function() : void {
        const goal = {  theta: [ boolT, intT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Int and Bool", function() : void {
        const goal = {  theta: [ intT, boolT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Bool and Nat", function() : void {
        const goal = {  theta: [ boolT, natT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Nat and Bool", function() : void {
        const goal = {  theta: [ natT, boolT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Bool and String", function() : void {
        const goal = {  theta: [ boolT, stringT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for String and Bool", function() : void {
        const goal = {  theta: [ stringT, boolT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Bool and Null", function() : void {
        const goal = {  theta: [ boolT, nullT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Null and Bool", function() : void {
        const goal = {  theta: [ nullT, boolT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Number and String", function() : void {
        const goal = {  theta: [ numberT, stringT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for String and Number", function() : void {
        const goal = {  theta: [ stringT, numberT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Int and String", function() : void {
        const goal = {  theta: [ intT, stringT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for String and Int", function() : void {
        const goal = {  theta: [ stringT, intT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Nat and String", function() : void {
        const goal = {  theta: [ natT, stringT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for String and Nat", function() : void {
        const goal = {  theta: [ stringT, natT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Number and Null", function() : void {
        const goal = {  theta: [ numberT, nullT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Null and Number", function() : void {
        const goal = {  theta: [ nullT, numberT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Int and Null", function() : void {
        const goal = {  theta: [ intT, nullT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Null and Int", function() : void {
        const goal = {  theta: [ nullT, intT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Nat and Null", function() : void {
        const goal = {  theta: [ natT, nullT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Null and Nat", function() : void {
        const goal = {  theta: [ nullT, natT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for String and Null", function() : void {
        const goal = {  theta: [ stringT, nullT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for Null and String", function() : void {
        const goal = {  theta: [ nullT, stringT ],
                        delta: [] } ;
        const result = primitiveDisjointnessRule( goal ) ;
        expectSuccess( result ) ;
    } ) ;
} ) ;

describe( "tupleDisjointnessRule", function() : void {
    it( "should fail on empty", function() : void {
        // Try  empty <: empty
        const goal = {  theta: [], delta: [] } ;
        const result = tupleDisjointnessRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when no length match", function() : void {
        const goal = {  theta: [tuple0, tuple2, tuple3],
                        delta: [] } ;
        const result = tupleDisjointnessRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when tuple0s involved", function() : void {
        const goal = {  theta: [tuple0, tuple0],
                        delta: [] } ;
        const result = tupleDisjointnessRule( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should succeed when there is a length match -- 0", function() : void {
        const goal = {  theta: [tuple2b, tuple2c],
                        delta: [] } ;
        const result = tupleDisjointnessRule( goal ) ;
        assert.checkEqual(2, result.size() ) ;
        let subgoals = result.first() ;
        assert.checkEqual( 1, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;
        assert.checkEqual( 2, theta0.length ) ;
        assert.checkEqual( natT, theta0[0] ) ;
        assert.checkEqual( stringT, theta0[1] ) ;
        assert.checkEqual( 0, delta0.length ) ;

        subgoals = result.rest().first() ;
        assert.checkEqual( 1, subgoals.length ) ;

        const theta1 = subgoals[0].theta ;
        const delta1 = subgoals[0].delta ;
        assert.checkEqual( 2, theta1.length ) ;
        assert.checkEqual( intT, theta1[0] ) ;
        assert.checkEqual( nullT, theta1[1] ) ;
        assert.checkEqual( 0, delta1.length ) ;
    } ) ;

    it( "should succeed when there is a length match -- 1", function() : void {
        const goal = {  theta: [tuple3, tuple3b],
                        delta: [top, tuple3b] } ;
        const result = tupleDisjointnessRule( goal ) ;
        assert.checkEqual(3, result.size() ) ;
        let subgoals = result.first() ;
        assert.checkEqual( 1, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;
        assert.checkEqual( 2, theta0.length ) ;
        assert.checkEqual( natT, theta0[0] ) ;
        assert.checkEqual( stringT, theta0[1] ) ;
        assert.checkEqual( 0, delta0.length ) ;
        
        subgoals = result.rest().first() ;
        assert.checkEqual( 1, subgoals.length ) ;
        const theta1 = subgoals[0].theta ;
        const delta1 = subgoals[0].delta ;
        assert.checkEqual( 2, theta1.length ) ;
        assert.checkEqual( intT, theta1[0] ) ;
        assert.checkEqual( boolT, theta1[1] ) ;
        assert.checkEqual( 0, delta1.length ) ;
        
        subgoals = result.rest().rest().first() ;
        assert.checkEqual( 1, subgoals.length ) ;
        const theta2 = subgoals[0].theta ;
        const delta2 = subgoals[0].delta ;
        assert.checkEqual( 2, theta2.length ) ;
        assert.checkEqual( top, theta2[0] ) ;
        assert.checkEqual( nullT, theta2[1] ) ;
        assert.checkEqual( 0, delta2.length ) ;
    } ) ;

    it( "should succeed when there is a length match -- 2", function() : void {
        const goal = {  theta: [tuple3b, tuple3],
                        delta: [top, tuple3b] } ;
        const result = tupleDisjointnessRule( goal ) ;
        assert.checkEqual(3, result.size() ) ;
        let subgoals = result.first() ;
        assert.checkEqual( 1, subgoals.length ) ;

        const theta0 = subgoals[0].theta ;
        const delta0 = subgoals[0].delta ;
        assert.checkEqual( 2, theta0.length ) ;
        assert.checkEqual( stringT, theta0[0] ) ;
        assert.checkEqual( natT, theta0[1] ) ;
        assert.checkEqual( 0, delta0.length ) ;
        
        subgoals = result.rest().first() ;
        assert.checkEqual( 1, subgoals.length ) ;
        const theta1 = subgoals[0].theta ;
        const delta1 = subgoals[0].delta ;
        assert.checkEqual( 2, theta1.length ) ;
        assert.checkEqual( boolT, theta1[0] ) ;
        assert.checkEqual( intT, theta1[1] ) ;
        assert.checkEqual( 0, delta1.length ) ;
        
        subgoals = result.rest().rest().first() ;
        assert.checkEqual( 1, subgoals.length ) ;
        const theta2 = subgoals[0].theta ;
        const delta2 = subgoals[0].delta ;
        assert.checkEqual( 2, theta2.length ) ;
        assert.checkEqual( nullT, theta2[0] ) ;
        assert.checkEqual( top, theta2[1] ) ;
        assert.checkEqual( 0, delta2.length ) ;
    } ) ;
} ) ;


describe( "otherDisjointnessRule", function() : void {
    it( "should fail on empty", function() : void {
        const goal = {  theta: [], delta: [] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when all types are primitive", function() : void {
        const goal = {  theta: [intT, natT, numberT, natT, numberT, stringT, nullT, boolT ],
                        delta: [intT, natT] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when all types are functions", function() : void {
        const goal = {  theta: [funcT, funcTb],
                        delta: [intT, natT] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "should fail when all types are locations", function() : void {
        const goal = {  theta: [locT, locTb],
                        delta: [intT, natT] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectFailure( result ) ;
    } ) ;

    it( "succeed for primitive and function", function() : void {
        const goal = {  theta: [ boolT, funcT, ],
                        delta: [] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for function and primitive", function() : void {
        const goal = {  theta: [ funcT, boolT,  ],
                        delta: [intT, natT] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for primitive and field", function() : void {
        const goal = {  theta: [ intT, fieldT, ],
                        delta: [intT, natT] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for fieldT and primitive", function() : void {
        const goal = {  theta: [ fieldT, intT,  ],
                        delta: [] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for primitive and location", function() : void {
        const goal = {  theta: [ stringT, locT, ],
                        delta: [intT, natT] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for location and primitive", function() : void {
        const goal = {  theta: [ locT, stringT,  ],
                        delta: [intT, natT] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for function and location", function() : void {
        const goal = {  theta: [ funcT, locT, ],
                        delta: [] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectSuccess( result ) ;
    } ) ;

    it( "succeed for location and function", function() : void {
        const goal = {  theta: [ locT, funcT,  ],
                        delta: [] } ;
        const result = otherDisjointnessRules( goal ) ;
        expectSuccess( result ) ;
    } ) ;
} ) ;


describe( "simplify", function() : void {
    it( "empty input ", function() : void {
        const goal = {  theta: [], delta: [] } ;
        const result = simplify( goal ) ;
        assert.checkEqual( 1, result.length ) ;
        assert.checkEqual( goal, result[0] ) ;
    } ) ;

    it( "simple input", function() : void {
        const goal = {  theta: [natT,funcT,fieldT,locT, stringT],
                        delta: [natT,funcT,fieldT,locT, stringT] } ;
        const result = simplify( goal ) ;
        assert.checkEqual( 1, result.length ) ;
        assert.checkEqual( goal, result[0] ) ;
    } ) ;

    it( "joins", function() : void {
        const join_1 = JoinType.createJoinType(stringT, boolT) ;
        const join_2 = JoinType.createJoinType(natT, nullT) ;
        const goal = {  theta: [join_1],
                        delta: [join_2] } ;
        const result = simplify( goal ) ;
        assert.checkEqual( 2, result.length ) ;
        assert.checkEqual( "String <: Nat,Null", sequent2String(result[0]) ) ;
        assert.checkEqual( "Bool <: Nat,Null", sequent2String(result[1]) ) ;
    } ) ;

    it( "meets", function() : void {
        const meet_1 = MeetType.createMeetType(stringT, boolT) ;
        const meet_2 = MeetType.createMeetType(natT, nullT) ;
        const goal = {  theta: [meet_1,intT],
                        delta: [meet_2,numberT] } ;
        const result = simplify( goal ) ;
        assert.checkEqual( 2, result.length ) ;
        assert.checkEqual( "String,Bool,Int <: Nat,Number", sequent2String(result[0]) ) ;
        assert.checkEqual( "String,Bool,Int <: Null,Number", sequent2String(result[1]) ) ;
    } ) ;

    it( "bottom left", function() : void {
        const goal = {  theta: [bottom,intT],
                        delta: [natT] } ;
        const result = simplify( goal ) ;
        assert.checkEqual( 0, result.length ) ;
    } ) ;

    it( "bottom right", function() : void {
        const goal = {  theta: [intT],
                        delta: [bottom,natT,bottom] } ;
        const result = simplify( goal ) ;
        assert.checkEqual( 1, result.length ) ;
        assert.checkEqual( "Int <: Nat", sequent2String(result[0]) ) ;
    } ) ;

    it( "top left", function() : void {
        const goal = {  theta: [nullT,top],
                        delta: [natT] } ;
        const result = simplify( goal ) ;
        assert.checkEqual( 1, result.length ) ;
        assert.checkEqual( "Null <: Nat", sequent2String(result[0]) ) ;
    } ) ;

    it( "top right", function() : void {
        const goal = {  theta: [intT],
                        delta: [natT,top] } ;
        const result = simplify( goal ) ;
        assert.checkEqual( 0, result.length ) ;
    } ) ;
} ) ;
describe( "proveSimplified", function() : void {
    it( "empty input ", function() : void {
        const goal = {  theta: [], delta: [] } ;
        const result = proveSimplified( goal ) ;
        assert.checkEqual( false, result ) ;
    } ) ;

    it( "nat,int <: number is provable", function() : void {
        const goal = {  theta: [natT,intT],
                        delta: [numberT] } ;
        const result = proveSimplified( goal ) ;
        assert.checkEqual( true, result ) ;
    } ) ;

    it( "nat,int <: number,string is provable", function() : void {
        const goal = {  theta: [natT,intT],
                        delta: [numberT,stringT] } ;
        const result = proveSimplified( goal ) ;
        assert.checkEqual( true, result ) ;
    } ) ;

    it( "nat,int <: string is not provable", function() : void {
        const goal = {  theta: [natT,intT],
                        delta: [stringT] } ;
        const result = proveSimplified( goal ) ;
        assert.checkEqual( false, result ) ;
    } ) ;

    it( "(Int,Nat) <: (Nat,Number) is not provable", function() : void {
        const goal = {  theta: [ TupleType.createTupleType([intT, natT])],
                        delta: [TupleType.createTupleType([natT, numberT])] } ;
        const result = proveSimplified( goal ) ;
        assert.checkEqual( false, result ) ;
    } ) ;

    it( "(Int,Nat) <: (Number,Nat) is provable", function() : void {
        const goal = {  theta: [ TupleType.createTupleType([intT, natT])],
                        delta: [TupleType.createTupleType([numberT, natT])] } ;
        const result = proveSimplified( goal ) ;
        assert.checkEqual( true, result ) ;
    } ) ;

    it( "(Int,Nat) <: (Number,Join(Number,Null)) is provable", function() : void {
        const goal = {  theta: [ TupleType.createTupleType([intT, natT])],
                        delta: [TupleType.createTupleType([
                            numberT,
                            JoinType.createJoinType(numberT,nullT)])] } ;
        const result = proveSimplified( goal ) ;
        assert.checkEqual( true, result ) ;
    } ) ;

    it( "(Int,Number) <: (Nat,Nat) is not provable", function() : void {
        const goal = {  theta: [ TupleType.createTupleType([intT, numberT])],
                        delta: [TupleType.createTupleType([natT, natT])] } ;
        const result = proveSimplified( goal ) ;
        assert.checkEqual( false, result ) ;
    } ) ;

    it( "(Number,Nat) <: (Int,Nat) is not provable", function() : void {
        const goal = {  theta: [ TupleType.createTupleType([numberT, natT])],
                        delta: [TupleType.createTupleType([intT, natT])] } ;
        const result = proveSimplified( goal ) ;
        assert.checkEqual( false, result ) ;
    } ) ;

    it( "(Int,Join(Number,Null)) <: (Number,Nat) is not provable", function() : void {
        const goal = {  theta: [ TupleType.createTupleType([
                            intT,
                            JoinType.createJoinType(numberT,nullT)])],
                        delta: [TupleType.createTupleType([
                            numberT,
                            natT])] } ;
        const result = proveSimplified( goal ) ;
        assert.checkEqual( false, result ) ;
    } ) ;
} ) ;


describe( "isSubtype", function() : void {
    it( "Meet(Int,Null) <: StringT is provable", function() : void {
        const t = MeetType.createMeetType( intT, nullT ) ;
        const u = stringT ;
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( true, result ) ;
    } ) ;
    it( "StringT <: Meet(Int,Null) is not provable", function() : void {
        const t = stringT ;
        const u = MeetType.createMeetType( intT, nullT ) ;
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( false, result ) ;
    } ) ;
    it( "Meet(Int,Null) <: Meet(String,Loc[]) is provable", function() : void {
        const t = MeetType.createMeetType( intT, nullT ) ;
        const u = MeetType.createMeetType( stringT, locT ) ;
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( true, result ) ;
    } ) ;
    it( "Meet( x:Nat,y:Int, z:Int ) <: Meet(x:Int, y:Int ) is provable", function() : void {
        const t = createMeetType( createFieldType( "x", natT ),
                                  createMeetType(
                                    createFieldType( "y", intT ),
                                    createFieldType( "z", intT )  ) ) ;
        const u = createMeetType( createFieldType( "x", intT ),
                                  createFieldType( "y", intT ) ) ;
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( true, result ) ;
    } ) ;
    it( "Meet( x:Nat,y:Int ) <: Meet(x:Int, y:Int, z:Int ) is not provable", function() : void {
        const t = createMeetType( createFieldType( "x", natT ),
                                  createFieldType( "y", intT ) ) ;
        const u = createMeetType( createFieldType( "x", intT ),
                                  createMeetType(createFieldType( "y", intT ),
                                                 createFieldType( "z", intT ))
                                   ) ;
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( false, result ) ;
    } ) ;
    it( "Null <: Join(Int, Null ) is provable", function() : void {
        const t = nullT ;
        const u = createJoinType( intT, nullT) ;
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( true, result ) ;
    } ) ;
    it( "Nat <: Join(Int, Null ) is provable", function() : void {
        const t = natT ;
        const u = createJoinType( intT, nullT) ;
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( true, result ) ;
    } ) ;
    it( "Join(Int, Null ) <: Null is not provable", function() : void {
        const t = createJoinType( intT, nullT) ;
        const u = nullT ;
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( false, result ) ;
    } ) ;
    it( "Join(Int, Null ) <: Int is not provable", function() : void {
        const t = createJoinType( intT, nullT) ;
        const u = intT ;
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( false, result ) ;
    } ) ;
    it( "Loc( Meet( x:Nat,y:Int ) ) <: Loc( Meet( y:Int, x:Nat ) ) is provable ", function() : void {
        const t = createLocationType(
                        createMeetType( createFieldType( "x", natT ),
                                        createFieldType( "y", intT ) )  );
        const u = createLocationType(
                        createMeetType( createFieldType( "y", intT ),
                                        createFieldType( "x", natT ) )  );
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( true, result ) ;
    } ) ;
    it( "Loc( Meet( x:Nat, y:Int ) ) <: Loc( Meet( y:Int, x:Int ) ) is not provable ", function() : void {
        const t = createLocationType(
                        createMeetType( createFieldType( "x", natT ),
                                        createFieldType( "y", intT ) )  );
        const u = createLocationType(
                        createMeetType( createFieldType( "y", intT ),
                                        createFieldType( "x", intT ) )  );
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( false, result ) ;
    } ) ;
    it( "(Int -> Int) Meet (length:Nat) <: (Nat -> Number) Meet (length:Int) is provable ", function() : void {
        const t = createMeetType(
                        createFunctionType( intT, intT),
                        createFieldType( "length", natT ) );
        const u = createMeetType(
                        createFunctionType( natT, numberT),
                        createFieldType( "length", intT ) );
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( true, result ) ;
    } ) ;
    it( "(Int -> Int) Meet (length:Int) <: (Nat -> Number) Meet (length:Nat) is not provable ", function() : void {
        const t = createMeetType(
                        createFunctionType( intT, intT),
                        createFieldType( "length", intT ) );
        const u = createMeetType(
                        createFunctionType( natT, numberT),
                        createFieldType( "length", natT ) );
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( false, result ) ;
    } ) ;
    it( "(Int -> Int) Meet (length:Nat) <: (Nat -> Nat) Meet (length:Int) is not provable ", function() : void {
        const t = createMeetType(
                        createFunctionType( intT, intT),
                        createFieldType( "length", natT ) );
        const u = createMeetType(
                        createFunctionType( natT, natT),
                        createFieldType( "length", intT ) );
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( false, result ) ;
    } ) ;
    it( "(Int -> Int) Meet (length:Nat) <: (Number -> Number) Meet (length:Int) is not provable ", function() : void {
        const t = createMeetType(
                        createFunctionType( intT, intT),
                        createFieldType( "length", natT ) );
        const u = createMeetType(
                        createFunctionType( numberT, numberT),
                        createFieldType( "length", intT ) );
        const result = subtype.isSubtype( t, u ) ;
        assert.checkEqual( false, result ) ;
    } ) ;
    it( "a:Nat MEET (b:nat JOIN c:nat) <:  (a:Nat MEET b:nat) JOIN (a:Nat MEET c:nat) is provable and conversely", function() : void {
        const a = createFieldType( "a", natT ) ;
        const b = createFieldType( "b", natT ) ;
        const c = createFieldType( "c", natT ) ;
        const t = createMeetType(
                        a,
                        createJoinType( b, c ) );
        const u = createJoinType(
                        createMeetType( a, b),
                        createMeetType( a, c ) );
        assert.checkEqual( true, subtype.isSubtype( t, u ) ) ;
        assert.checkEqual( true, subtype.isSubtype( u, t ) ) ;
    } ) ;
    it( "a:Nat JOIN (b:nat MEET c:nat) <:  (a:Nat JOIN b:nat) MEET (a:Nat JOIN c:nat) is provable and conversely", function() : void {
        const a = createFieldType( "a", natT ) ;
        const b = createFieldType( "b", natT ) ;
        const c = createFieldType( "c", natT ) ;
        const t = createJoinType(
                        a,
                        createMeetType( b, c ) );
        const u = createMeetType(
                        createJoinType( a, b),
                        createJoinType( a, c ) );
        assert.checkEqual( true, subtype.isSubtype( t, u ) ) ;
        assert.checkEqual( true, subtype.isSubtype( u, t ) ) ;
    } ) ;

    it( "(Int,String) MEET (Int, String, Nat) is equivalent to bottom", function() : void {
        const u = createTupleType( [intT, stringT] );
        const v = createTupleType( [intT, stringT, natT] );
        const t = createMeetType( u, v ) ;
        assert.check( subtype.isSubtype( t, bottom ), "t <: bottom" ) ;
        assert.check( subtype.isSubtype( bottom, t ), "bottom <: t" ) ;
    } ) ;

    it( "(Int -> Nat) MEET (Bool -> Bool) is subtype of many things", function() : void {
        const t = createMeetType( createFunctionType( intT, natT), createFunctionType( boolT, boolT) ) ;
        const u0 = createFunctionType( intT, natT ) ;
        const u1 = createFunctionType( boolT, boolT ) ;
        const u2 = createFunctionType( createMeetType( intT, boolT), 
                                       createJoinType( natT, boolT) ) ;
        const u3 = createFunctionType( createMeetType( intT, boolT),
                                       createMeetType( natT, boolT) ) ;
        const u4 = createFunctionType( createJoinType( intT, boolT), 
                                       createJoinType( natT, boolT) ) ;
        assert.check( subtype.isSubtype( t, u0 ), "t <: u0" ) ;
        assert.check( subtype.isSubtype( t, u1 ), "t <: u1" ) ;
        assert.check( subtype.isSubtype( t, u2 ), "t <: u2" ) ;
        assert.check( ! subtype.isSubtype( t, u3 ), "NOT t <: u3" ) ;
        assert.check( ! subtype.isSubtype( t, u3 ), "NOT t <: u4" ) ;
    } ) ;

    it( "(Int -> Nat) <: (Int -> (String JOIN Nat)) MEET (Int -> (Nat JOIN Null))", function() : void {
        const t = createFunctionType( intT, natT)  ;
        const u = createMeetType( createFunctionType( intT, createJoinType(stringT, natT)), 
                                  createFunctionType( intT, createJoinType(natT, nullT)) ) ;
        assert.check( subtype.isSubtype( t, u ), "t <: u" ) ;
        assert.check( ! subtype.isSubtype( u, t ), "NOT u <: t" ) ;
    } ) ;

    it( "(Int -> Nat) MEET (Bool -> Int) <: (Bottom -> Nat) is provable", function() : void {
        const t = createMeetType( createFunctionType( intT, natT), 
                                  createFunctionType( boolT, intT) ) ;
        const u = createFunctionType( bottom, natT)  ;
        assert.check( subtype.isSubtype( t, u ), "t <: u" ) ;
    } ) ;

    it( "(Int -> Nat) MEET (Bool -> Int) <: (Bottom -> Bottom) is NOT provable", function() : void {
        const t = createMeetType( createFunctionType( intT, natT), 
                                  createFunctionType( boolT, intT) ) ;
        const u = createFunctionType( bottom, bottom)  ;
        assert.check( ! subtype.isSubtype( t, u ), " not t <: u" ) ;
    } ) ;

    it( "(t0 JOIN t1 -> u ) <: (t0 -> u) MEET (t1 -> u) is provable, but not the converse", function() : void {
        const t0 = createFieldType( "t0", natT) ;
        const t1 = createFieldType( "t1", natT) ;
        const u = createFieldType( "u", natT) ;
        const theta = createFunctionType( createJoinType( t0, t1), u) ;
        const delta = createMeetType( createFunctionType(t0, u),
                                      createFunctionType( t1, u ) )  ;
        assert.check( subtype.isSubtype( theta, delta), " theta <: delta" ) ;
        assert.check( ! subtype.isSubtype( delta, theta), "NOT  delta <: theta" ) ;
    } ) ;


} ) ;