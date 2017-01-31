/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../valueTypes.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../world.ts" />

import collections = require( '../collections' ) ;
import assert = require( '../assert' ) ;
import pnode = require( '../pnode' ) ;
import valueTypes = require( '../valueTypes' ) ;
import vms = require( '../vms' ) ;
import world = require('../world') ;
import Evaluation = vms.Evaluation;
import VMS = vms.VMS;
import World = world.World;
import varStrategy = pnode.varStrategy;
import Field = valueTypes.Field;
import Type = vms.Type;
import VarStack = vms.VarStack;

var wld = new World();
var a : pnode.PNode = pnode.mkVar("a");
var str = new valueTypes.StringV("");
var f : Field = new Field(a.label().getVal(), str, Type.ANY , false);


describe( 'World', () => {
    it('Should be able to have fields added to it', () => {
        //fails maybe already has a field in it and throw the index off?
        wld.addField(f);
        assert.check(wld.getField(f.getName()) == f);
    } );

    it('Should be able to have fields removed from it', () => {
        //fails
        assert.check(wld.deleteField(f.getName())); //passes
        //  assert.check(wld.numFields() == 0);
        assert.check(wld.getField(f.getName()) == null);//fields don't get deleted
    } );

} ) ;