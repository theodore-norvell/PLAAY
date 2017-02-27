/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../valueTypes.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../world.ts" />

import assert = require( '../assert' ) ;
import collections = require( '../collections' ) ;
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
import ObjectV = valueTypes.ObjectV;
import ClosureV = valueTypes.ClosureV;
import StringV = valueTypes.StringV;

var wld = new World();
var wlds : Array<ObjectV> = new Array();
wlds.push(wld);
var a : pnode.PNode = pnode.mkVar("a");
var b : pnode.PNode = pnode.mkVar("b");
var c : pnode.PNode = pnode.mkVar("c");


var str = new valueTypes.StringV("3");
var str2 = new valueTypes.StringV("2");
var f : Field = new Field(a.label().getVal(), str, Type.ANY , false);//a=3
var f2 : Field = new Field(b.label().getVal(), str2, Type.ANY , false);//b=2
var cw : pnode.PNode = pnode.mkWorldCall(a, b);
cw.label().changeValue("F");

var t : pnode.PNode = pnode.mkType();
var body : pnode.PNode = pnode.mkExprSeq([c]);



var param : pnode.PNode = pnode.mkExprSeq([a,b]); // TODO: The type here is wrong.
var lamb : pnode.PNode = pnode.mkLambda("F", param, t, body);

var s : pnode.PNode = pnode.mkExprSeq([a,b,lamb, cw]);
var vm : VMS = new VMS(s, wlds);//eval created and pushed on VMS stack
vm.getEval().setPending([2]);



describe( 'Lambda', () => {
    it('Should be selected', () => {
        lamb.label().strategy.select(vm, lamb.label());
        assert.check(vm.getEval().ready);
    } );

    it('Should step', () => {
        // TODO The next line fails because of mutual requiring between modules pnode and value.
        lamb.label().step(vm);
    } );

    it('Should have a closure value in stack when stepped', () => {
        let val : vms.Value = vm.getEval().getValMap().get([2]) ;
        assert.check( val.isClosureV() ) ;
        let close : ClosureV = <ClosureV> val ;
        assert.check(close.isClosureV());
        assert.check(close.getContext() == vm.getEval().getStack());
        assert.check(close.getLambdaNode() == lamb);
    } );


} ) ;

describe( 'Call', () => {
    it('Should be selected', () => {
        vm.getEval().getValMap().put([3,0], new StringV("3"));//throw children in varmap
        vm.getEval().getValMap().put([3,1], new StringV("2"));

        vm.getEval().setPending([3]);//set pending to cw node
        cw.label().strategy.select(vm, cw.label());
        assert.check(vm.getEval().ready);
    } );

    it('Should step', () => {
        cw.label().step(vm);

      //  assert.check();
    } );

    it('', () => {
        /*     var xField = vm.evalu.getStack().getField("F");
         var close = xField.value.
         assert.check(close);*/
    } );


} ) ;