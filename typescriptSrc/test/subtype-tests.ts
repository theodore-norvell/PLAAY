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

import JoinType = types.JoinType ;
import MeetType = types.MeetType ;
import PrimitiveType = types.PrimitiveType ;
import TupleType = types.TupleType ;
import FunctionType = types.FunctionType ;
import FieldType = types.FieldType ;
import LocationType = types.LocationType ;

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