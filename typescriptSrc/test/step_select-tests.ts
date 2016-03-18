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


var wrd : World = new World();
var a : pnode.ExprNode = pnode.mkVar("a");
var b : pnode.ExprNode = pnode.mkVar("interesting");
var ms : VMS = new VMS(b, wrd);
var str = new value.StringV("");
var f : Field = new Field(a.label().getVal(), str, Type.ANY , false);
var xStack : execStack = new execStack(wrd);
var eva : Evaluation = new Evaluation(a, wrd);

describe( 'varNode', () => {
    it('should be initialized properly', () => {
        var l1 = a.label();
        var l2 = b.label();
        var val1 = a.label().getVal();
        var val2 = b.label().getVal();

        assert.check(l1 instanceof pnode.VariableLabel);
        assert.check(val1 == "a");
        assert.check(l2 instanceof pnode.VariableLabel);
        assert.check(val2 == "interesting");
    } );
} ) ;


describe( 'Fields', () => {
        it('Should be initialized properly', () => {
            assert.check(f.getName() == "a");
            assert.check(f.getType() == Type.ANY);
            assert.check(f.getValue() == str);
            assert.check(f.getIsConstant() == false);
        } );
    } ) ;



describe( 'World', () => {
    it('Should be able to have fields added to it', () => {
        wrd.addField(f);
        assert.check(wrd.fields[0] == f);
        assert.check(wrd.numFields() == 1);
    } );

    it('Should be able to search for fields', () => {
        assert.check(wrd.getField(f.getName()) == f);
    } );

    it('Should be able to have fields removed from it', () => {
        wrd.deleteField(f.getName());
        assert.check(wrd.numFields() == 0);
    } );

} ) ;


describe( 'VMS', () => {
    it('Should be initialized properly', () => {
       wrd.addField(f);
        assert.check(ms.canAdvance());
        assert.check(ms.getWorld() == wrd);
        assert.check(ms.getEval().getRoot() == b);
        assert.check(ms.getEval().pending.length == 0);
    } );

    it('Should be able to select properly', () => {
        ms.getWorld().addField(f);
        ms.advance();
        assert.check(ms.getEval().ready == true);
    } );


} ) ;


describe( 'Execution Stack ', () => {

    it('Should be able to add values', () => {
        xStack.top().addField(f);
        assert.check(xStack.top().numFields() != 0);
    } );

    it('Should not find values not in the stack', () => {
        assert.check(xStack.inStack("not in stack"));
    } );

    it('Should be able to look up values', () => {
        assert.check(xStack.inStack(f.getName()));
    } );


    it('Should be able to delete values', () => {

        assert.check(xStack.top().deleteField(f.getName()));
        assert.check(xStack.inStack(f.getName()) == false);
    } );



} ) ;


 describe( 'Evaluation', () => {
     it('Should be initialized properly', () => {
        assert.check(eva.getRoot() == a);
         assert.check(eva.getStack().obj == wrd);
         assert.check(eva.pending.length == 0);
         assert.check(eva.ready == false);
        assert.check(eva.varmap.entries.length == 0);
     } );

     it('', () => {

     } );

     it('', () => {

     } );


 } ) ;

/*
 describe( '', () => {
 it('', () => {

 } );
 } ) ;
*/
