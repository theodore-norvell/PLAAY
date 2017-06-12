/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../interpreter.ts" />
/// <reference path="../labels.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../valueTypes.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../world.ts" />

import assert = require( '../assert' ) ;
import collections = require( '../collections' ) ;
import interpreter = require( '../interpreter' ) ;
import labels = require( '../labels' ) ;
import pnode = require( '../pnode' ) ;
import valueTypes = require( '../valueTypes' ) ;
import vms = require( '../vms' ) ;
import world = require('../world') ;

import Evaluation = vms.Evaluation;
import VMS = vms.VMS;
import World = world.World;
import Field = valueTypes.Field;
import Type = vms.Type;
import VarStack = vms.VarStack;
import ObjectV = valueTypes.ObjectV;
import ClosureV = valueTypes.ClosureV;
import StringV = valueTypes.StringV;
import PNode = pnode.PNode ;

const wld = new World();
const wlds : Array<ObjectV> = new Array();
wlds.push(wld);
const interp = interpreter.getInterpreter() ;
const a : pnode.PNode = labels.mkVar("a");
const b : pnode.PNode = labels.mkVar("b");

const str0 = labels.mkStringLiteral( "hello" ) ;
const str1 = labels.mkStringLiteral( "world" ) ;

// Make a Lambda node: lambda( paramList( decl(var[a], noType, noExpNode ),
//                                        decl(var[b], noType, noExpNode ) ),
//                             noType,
//                             exprSeq( var[a] ) ) 
const noExp = labels.mkNoExpNd() ;
const t : pnode.PNode = labels.mkNoTypeNd();
const decl_a : PNode = labels.mkVarDecl(a, t, noExp ) ;
const decl_b : PNode = labels.mkVarDecl(b, t, noExp ) ;
const param : PNode = labels.mkParameterList( [decl_a, decl_b] ) ;
const body0 : pnode.PNode = labels.mkExprSeq([a]);
const lambda0 : pnode.PNode = labels.mkLambda( param, t, body0);

// Make a Lambda node: lambda( paramList( decl(var[a], noType, noExpNode ),
//                                        decl(var[b], noType, noExpNode ) ),
//                             noType,
//                             exprSeq(var[b]) )  <--- This time it's b

const body1 : pnode.PNode = labels.mkExprSeq([b]) ;
const lambda1 : pnode.PNode = labels.mkLambda( param, t, body0) ;

describe( 'Lambda', function() : void {
    // Here we evaluate a Lamdba expression to get a closure value
    const vm = new VMS( lambda0, wlds, interp ) ;

    it('Should be selected', function() : void {
        vm.advance() ;
        assert.check(vm.isReady() );
    } );

    it('Should step', function() : void {
        vm.advance() ;
    } );

    it('Should have a closure value in stack when stepped', function() : void {
        assert.check( vm.isMapped( collections.nil<number>())) ;
        const val : vms.Value = vm.getValMap().get( collections.nil<number>() ) ;
        assert.check( val.isClosureV() ) ;
        const close : ClosureV = val as ClosureV ;
        assert.check(close.isClosureV());
        assert.check(close.getContext() === vm.getEval().getStack());
        assert.check(close.getLambdaNode() === lambda0);
    } );
} ) ;

describe( 'Call', function() : void {
    // Here we evaluate a Lamdba expression to get a closure value.
    // Then we call it with couple of strings.
    
    function doTest( lambda : PNode, expectedResult : string ) : void {
        const call = labels.mkCall( lambda, str0, str1 ) ;
        const vm = new VMS( call, wlds, interp ) ;
        let timeOut = 1000 ;
        for( ; timeOut > 0 && ! vm.isDone() ; timeOut -= 1 ) {
            vm.advance() ; }
        assert.check( timeOut > 0 ) ;
        const val : vms.Value  = vm.getValMap().get( collections.nil<number>() ) ;
        assert.check( val instanceof valueTypes.StringV ) ;
        const stringVal =  val as valueTypes.StringV ;
        assert.check( stringVal.getVal() === expectedResult ) ;
    }

    it('Should return its first argument', function(this: Mocha.ITestDefinition) : void {
        doTest( lambda0, str0.label().getVal() ) ;
    } );

    it('Should return its second argument', function() : void {
        doTest( lambda1, str1.label().getVal() ) ;
    } );

} ) ;