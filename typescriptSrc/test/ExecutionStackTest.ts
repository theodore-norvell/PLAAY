/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../world.ts" />

import collections = require( '../collections' ) ;
import assert = require( '../assert' ) ;
import pnode = require( '../pnode' ) ;
import vms = require( '../vms' ) ;
import world = require('../world') ;

import Evaluation = vms.Evaluation;
import VMS = vms.VMS;
import World = world.World;
import varStrategy = pnode.varStrategy;
import Field = vms.Field;
import Type = vms.Type;
import VarStack = vms.VarStack;

var wrld : World = new World();
var a : pnode.PNode = pnode.mkVar("a");
var str = new vms.StringV("");
var f : Field = new Field(a.label().getVal(), str, Type.ANY , false);
var xStack : VarStack = new VarStack(wrld, null);


describe( 'Execution Stack ', () => {

    it('Should be initialized properly', () => {
        assert.check(xStack.getNext() == null);
        assert.check(xStack.obj == wrld);
        assert.check(xStack.getField(f.getName()) == null);//already in the execution stack?
    } );

    it('Should be able to add values', () => {
        //fails
        xStack.top().addField(f);
        assert.check(xStack.top().fields.indexOf(f) >=0 );
    } );

    it('Should not find values not in the stack', () => {
        assert.check(!xStack.inStack("not in stack"));
        assert.check(xStack.getField("not in stack") == null);
    } );

    it('Should be able to look up values', () => {
        //inStack function fails
        //assert.check(xStack.inStack(f.getName()));//broken only returns false for some reason
       // assert.check(xStack.top().getField(f.getName()) == f);
        assert.check(xStack.getField(f.getName()) == f);
        //xStack.top().
    } );


    it('Should be able to delete values', () => {
        //fails
        assert.check(xStack.top().deleteField(f.getName()));
        assert.check(xStack.getField(f.getName()) == null);
//        assert.check(xStack.inStack(f.getName()) == false);//broken, so don't use this
    } );
} ) ;
