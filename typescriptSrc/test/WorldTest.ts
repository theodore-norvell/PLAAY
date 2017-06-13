/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../valueTypes.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../world.ts" />

import collections = require( '../collections' ) ;
import assert = require( '../assert' ) ;
import valueTypes = require( '../valueTypes' ) ;
import vms = require( '../vms' ) ;
import world = require('../world') ;
import Evaluation = vms.Evaluation;
import VMS = vms.VMS;
import World = world.World;
import Field = valueTypes.Field;
import Type = vms.Type;
import VarStack = vms.VarStack;

const wld = new World();
const str = new valueTypes.StringV("hello");
const f : Field = new Field("abcd", str, Type.ANY , false);


describe( 'World', function () : void {
    it('Should be able to have fields added to it', function () : void {
        const n = wld.numFields() ;
        wld.addField(f);
        assert.check(wld.getField(f.getName()) === f);
        assert.check( n+1 === wld.numFields() ) ;
    } );

    it('Should be able to have fields removed from it', function () : void {
        const n = wld.numFields() ;
        assert.check(wld.deleteField(f.getName()));
        assert.check( ! wld.hasField(f.getName()) );
        assert.check( n-1 === wld.numFields() ) ;
    } );

} ) ;