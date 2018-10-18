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
import rightBottomRule = subtype.rightBottomRule ;

const top = types.TopType.theTopType ;
const bottom = types.BottomType.theBottomType  ;

describe( "leftBottomRule", function() : void {
    it( "should succeed for Bottom", function() : void {
        const goal = { theta: [top, bottom], delta: [top] } ;
        const rule = rightBottomRule( 1 ) ;
        const result = rule( goal ) ;
        assert.checkEqual( 1, result.size() ) ;
    } ) ;
} ) ;
