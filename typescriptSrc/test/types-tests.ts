/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../types.ts" />

import assert = require( '../assert' ) ;
import collections = require( '../collections' ) ;
import interpreter = require( '../interpreter' ) ;
import types = require('../types') ;

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