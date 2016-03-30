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
var a : pnode.ExprNode = pnode.mkVar("a");
var str = new value.StringV("");
var f : Field = new Field(a.label().getVal(), str, Type.ANY , false);



describe( 'Lambda', () => {
    it('', () => {

    } );

    it('', () => {

    } );

} ) ;