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
import Sequent = subtype.Sequent ;
import leftBottomRule = subtype.leftBottomRule ;
import rightBottomRule = subtype.rightBottomRule ;
import leftJoinRule = subtype.leftJoinRule ;
import rightJoinRule = subtype.rightJoinRule ;

import JoinType = types.JoinType ;

const top = types.TopType.theTopType ;
const bottom = types.BottomType.theBottomType  ;

describe( "leftBottomRule", function() : void {
    it( "should succeed for Bottom", function() : void {
        const goal = { theta: [top, bottom], delta: [] } ;
        const rule = leftBottomRule( 1 ) ;
        const result = rule( goal ) ;
        // Expect one array of subgoals.
        assert.checkEqual( 1, result.size() ) ;
        const subgoals = result.first() ;
        // Expect zero subgoals in the array
        assert.checkEqual( 0, subgoals.length ) ;
    } ) ;

    it( "should fail for top", function() : void {
        const goal = { theta: [top, bottom], delta: [] } ;
        const rule = leftBottomRule( 0 ) ;
        const result = rule( goal ) ;
        // Expect an empty list.
        assert.checkEqual( 0, result.size() ) ;
    } ) ;
} ) ;

describe( "rightBottomRule", function() : void {
    it( "should succeed for Bottom", function() : void {
        const goal = { theta: [], delta: [top, bottom] } ;
        const rule = rightBottomRule( 1 ) ;
        const result = rule( goal ) ;
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

    it( "should fail for top", function() : void {
        const goal = { theta: [top, bottom], delta: [] } ;
        const rule = leftBottomRule( 0 ) ;
        const result = rule( goal ) ;
        // Expect an empty list.
        assert.checkEqual( 0, result.size() ) ;
    } ) ;
} ) ;

describe( "leftJoinRule", function() : void {
    it( "should succeed for Join", function() : void {
        // Try Top, Join(Top, Bottom) <: empty
        const goal = { theta: [top, JoinType.createJoinType(top, bottom)], delta: [] } ;
        const rule = leftJoinRule( 1 ) ;
        const result = rule( goal ) ;
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
        const goal = { theta: [top, JoinType.createJoinType(top, bottom)], delta: [] } ;
        const rule = leftJoinRule( 0 ) ;
        const result = rule( goal ) ;
        // Expect failure
        assert.checkEqual( 0, result.size() ) ;
    } ) ;
} ) ;

describe( "rightJoinRule", function() : void {
    it( "should succeed for Join", function() : void {
        // Try  empty <: Top, Join(Top, Bottom)
        const goal = {  theta: [], delta: [top, JoinType.createJoinType(top, bottom)] } ;
        const rule = rightJoinRule( 1 ) ;
        const result = rule( goal ) ;
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

    it( "should fail for top", function() : void {
        // Try  empty <: Top, Join(Top, Bottom)
        const goal = {  theta: [], delta: [top, JoinType.createJoinType(top, bottom)] } ;
        const rule = rightJoinRule( 0 ) ;
        const result = rule( goal ) ;
        // Expect failure
        assert.checkEqual( 0, result.size() ) ;
    } ) ;
} ) ;