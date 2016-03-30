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
import ExprSeqNode = pnode.ExprSeqNode;
import ObjectV = value.ObjectV;
import LambdaNode = pnode.LambdaNode;
import ClosureV = value.ClosureV;
import StringV = value.StringV;
import ExprNode = pnode.ExprNode;

var wld = new World();
var wlds : Array<ObjectV> = new Array();
wlds.push(wld);
var a : pnode.ExprNode = pnode.mkVar("a");
var b : pnode.ExprNode = pnode.mkVar("b");
var c : pnode.ExprNode = pnode.mkVar("c");


var str = new value.StringV("3");
var str2 = new value.StringV("2");
var f : Field = new Field(a.label().getVal(), str, Type.ANY , false);//a=3
var f2 : Field = new Field(b.label().getVal(), str2, Type.ANY , false);//b=2
var cw : ExprNode = pnode.mkWorldCall(a, b);
cw.label().changeValue("F");

var t : pnode.TypeNode = pnode.mkType();
var func : ExprSeqNode = pnode.mkExprSeq([c]);



var param : ExprSeqNode = pnode.mkExprSeq([a,b]);
var lamb : LambdaNode = pnode.mkLambda("F", param, t, func);

var s : ExprSeqNode = pnode.mkExprSeq([a,b,lamb, cw]);
var vm : VMS = new VMS(s, wlds);//eval created and pushed on VMS stack
vm.getEval().setPending([2]);



describe( 'Lambda', () => {
    it('Should be selected', () => {
        lamb.label().strategy.select(vm, lamb.label());
        assert.check(vm.evalu.ready);
    } );

    it('Should be put into stack when stepped', () => {
        lamb.label().step(vm);
        assert.check(vm.evalu.getStack().inStack("F"));
    } );

    it('Should have a closure value in stack when stepped', () => {
        var xField = vm.evalu.getStack().getField("F");
        var close = <ClosureV> xField.getValue();
        assert.check(close.isClosureV());
        assert.check(close.context == vm.evalu.getStack());
        assert.check(close.function == lamb);
    } );


} ) ;

describe( 'Call', () => {
    it('Should be selected', () => {
        vm.getEval().getVarMap().put([3,0], new StringV("3"));//throw children in varmap
        vm.getEval().getVarMap().put([3,1], new StringV("2"));

        vm.evalu.setPending([3]);//set pending to cw node
        cw.label().strategy.select(vm, cw.label());
        assert.check(vm.evalu.ready);
    } );

    it('Should step', () => {
        var tmp = vm.stack.top();
        cw.label().step(vm);

      //  assert.check();
    } );

    it('', () => {
        /*     var xField = vm.evalu.getStack().getField("F");
         var close = xField.value.
         assert.check(close);*/
    } );


} ) ;