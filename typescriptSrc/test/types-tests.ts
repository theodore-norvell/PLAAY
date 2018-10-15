/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../types.ts" />

import assert = require( '../assert' ) ;
import collections = require( '../collections' ) ;
import types = require('../types') ;

import some = collections.some ;
import none = collections.none ;

describe( "Type.toString()", function() : void {
    it( "should work for Bottom", function() : void {
        const ty = types.BottomType.theBottomType ;
        const result = ty.toString() ;
        assert.checkEqual( "Bottom", result ) ;
    } ) ;


    it( "should work for Top", function() : void {
        const ty = types.TopType.theTopType ;
        const result = ty.toString() ;
        assert.checkEqual( "Top", result ) ;
    } ) ;
} ) ;



describe( "Type.exBottom() and types.caseBottom", function() : void {
    function f() { return some( 4 ) ; }

    it( "deconstructor should return none if sent to the wrong type", function() : void {
        const ty = types.TopType.theTopType  ;
        const result = ty.exBottom( f ) ;
        assert.check(  result.isEmpty() ) ;
    } ) ;


    it( "deconstructor should return some for the right type", function() : void {
        const ty = types.BottomType.theBottomType  ;
        const result = ty.exBottom( f ) ;
        assert.checkEqual( 4, result.first() ) ;
    } ) ;

    it( "case function should return none if sent to the wrong type", function() : void {
        const ty = types.TopType.theTopType  ;
        const result = types.caseBottom( f )( ty )  ;
        assert.check(  result.isEmpty() ) ;
    } ) ;


    it( "case function should return some for the right type", function() : void {
        const ty = types.BottomType.theBottomType  ;
        const result = types.caseBottom( f )( ty ) ;
        assert.checkEqual( 4, result.first() ) ;
    } ) ;
} ) ;