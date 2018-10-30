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

const leftBottomRule = subtype.forTestingOnly.leftBottomRule ;
const rightBottomRule = subtype.forTestingOnly.rightBottomRule ;
const leftJoinRule = subtype.forTestingOnly.leftJoinRule ;
const rightJoinRule = subtype.forTestingOnly.rightJoinRule ;

import JoinType = types.JoinType ;

const top = types.TopType.theTopType ;
const bottom = types.BottomType.theBottomType  ;

describe( "leftBottomRule", function() : void {
    it( "should succeed for Bottom -- 0", function() : void {
        const goal = { theta: [top, bottom], delta: [] } ;
        const result = leftBottomRule( goal ) ;
        // Expect one array of subgoals.
        assert.checkEqual( 1, result.size() ) ;
        const subgoals = result.first() ;
        // Expect zero subgoals in the array
        assert.checkEqual( 0, subgoals.length ) ;
    } ) ;

    it( "should succeed for Bottom -- 1", function() : void {
        const goal = { theta: [top, bottom], delta: [] } ;
        const result = leftBottomRule( goal ) ;
        // Expect one array of subgoals.
        assert.checkEqual( 1, result.size() ) ;
        const subgoals = result.first() ;
        // Expect zero subgoals in the array
        assert.checkEqual( 0, subgoals.length ) ;
    } ) ;

    it( "should succeed twice for two Bottoms", function() : void {
        const goal = { theta: [bottom, top, bottom], delta: [] } ;
        const result = leftBottomRule( goal ) ;
        // Expect one array of subgoals.
        assert.checkEqual( 2, result.size() ) ;
        const subgoals0 = result.first() ;
        // Expect zero subgoals in the array
        assert.checkEqual( 0, subgoals0.length ) ;
        const subgoals1 = result.rest().first() ;
        // Expect zero subgoals in the array
        assert.checkEqual( 0, subgoals1.length ) ;
    } ) ;

    it( "should fail for Top", function() : void {
        const goal = { theta: [top, top, top], delta: [] } ;
        const result = leftBottomRule( goal ) ;
        // Expect failure.
        assert.checkEqual( 0, result.size() ) ;
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
        // Expect an empty list.
        assert.checkEqual( 0, result.size() ) ;
    } ) ;
} ) ;

describe( "leftJoinRule", function() : void {
    it( "should succeed for Join", function() : void {
        // Try Top, Join(Top, Bottom) <: empty
        const goal = { theta: [top, JoinType.createJoinType(top, bottom)], delta: [] } ;
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
        // Expect failure
        assert.checkEqual( 0, result.size() ) ;
    } ) ;
} ) ;

describe( "rightJoinRule", function() : void {
    it( "should succeed for Join", function() : void {
        // Try  empty <: Top, Join(Top, Bottom)
        const goal = {  theta: [], delta: [top, JoinType.createJoinType(top, bottom)] } ;
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
        // Expect failure
        assert.checkEqual( 0, result.size() ) ;
    } ) ;
} ) ;