/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../evaluation.ts" />
/// <reference path="../world.ts" />

import collections = require( '../collections' ) ;
import assert = require( '../assert' ) ;
import pnode = require( '../pnode' ) ;
import vms = require( '../vms' ) ;
import evaluation = require( '../evaluation' ) ;
import world = require('../world') ;
import value = require('../value') ;
import stack = require('../stackManager') ;
import Evaluation = evaluation.Evaluation;
import VMS = vms.VMS;
import World = world.World;
import varStrategy = pnode.varStrategy;
import Field = value.Field;
import Type = value.Type;
import execStack = stack.execStack;

var wld = new World();
var a : pnode.PNode = pnode.mkVar("a");
var str = new value.StringV("");
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