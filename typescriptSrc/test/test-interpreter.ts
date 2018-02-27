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
import NullV = valueTypes.NullV;
import PNode = pnode.PNode ;
import {IfLabel} from "../labels";
import {Value} from "../vms";

const emptyList = collections.nil<number>() ;
const wld = new World();
const wlds : Array<ObjectV> = new Array();
wlds.push(wld);
const interp = interpreter.getInterpreter() ;

describe( 'StringLiteralLabel', function() : void {
    const label = new labels.StringLiteralLabel( "hello", false ) ;
    const root = new PNode( label, [] ) ;
    const vm = new VMS( root, wlds, interp ) ;

    it('should evaluate to a StringV', function() : void {
        assert.check( ! vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof StringV ) ;
        assert.check( (val as StringV).getVal() === label.getVal() ) ;
    } );
} ) ;

describe( 'NumberLiteralLabel', function() : void {
    const label = new labels.NumberLiteralLabel( "123", false ) ;
    const root = new PNode( label, [] ) ;
    const vm = new VMS( root, wlds, interp ) ;

    it('should evaluate to a StringV', function() : void {
        assert.check( ! vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof StringV ) ;
        assert.check( (val as StringV).getVal() === label.getVal() ) ;
    } );
} ) ;

describe( 'BooleanLiteralLabel', function() : void {
    const label = new labels.BooleanLiteralLabel( "true", false ) ;
    const root = new PNode( label, [] ) ;
    const vm = new VMS( root, wlds, interp ) ;

    it('should evaluate to a StringV', function() : void {
        assert.check( ! vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof StringV ) ;
        assert.check( (val as StringV).getVal() === label.getVal() ) ;
    } );
} ) ;

describe( 'NullLiteralLabel', function() : void {
    const label = new labels.NullLiteralLabel() ;
    const root = new PNode( label, [] ) ;
    const vm = new VMS( root, wlds, interp ) ;

    it('should evaluate to a NullV', function() : void {
        assert.check( ! vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof NullV ) ;
    } );
} ) ;

describe( 'CallWorldLabel - addition', function() : void {
  const rootlabel = new labels.CallWorldLabel("+", false);
  const op1 = labels.mkNumberLiteral("2");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling 5', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "5");
  } );
} ) ;

describe( 'CallWorldLabel - subtraction', function() : void {
  const rootlabel = new labels.CallWorldLabel("-", false);
  const op1 = labels.mkNumberLiteral("5");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling 2', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "2");
  } );
} ) ;

describe( 'CallWorldLabel - multiplication', function() : void {
  const rootlabel = new labels.CallWorldLabel("*", false);
  const op1 = labels.mkNumberLiteral("5");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling 15', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "15");
  } );
} ) ;

describe( 'CallWorldLabel - division', function() : void {
  const rootlabel = new labels.CallWorldLabel("/", false);
  const op1 = labels.mkNumberLiteral("9");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling 3', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "3");
  } );
} ) ;

describe( 'CallWorldLabel - division', function() : void {
  const rootlabel = new labels.CallWorldLabel("/", false);
  const op1 = labels.mkNumberLiteral("5");
  const op2 = labels.mkNumberLiteral("2");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling 2.5', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "2.5");
  } );
} ) ;

describe( 'CallWorldLabel - greater than', function() : void {
  const rootlabel = new labels.CallWorldLabel(">", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling true', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "true");
  } );
} ) ;

describe( 'CallWorldLabel - greater than', function() : void {
  const rootlabel = new labels.CallWorldLabel(">", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("300");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling false', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "false");
  } );
} ) ;

describe( 'CallWorldLabel - greater than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel(">=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling true', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "true");
  } );
} ) ;

describe( 'CallWorldLabel - greater than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel(">=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("300");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling false', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "false");
  } );
} ) ;

describe( 'CallWorldLabel - greater than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel(">=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("10");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling true', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "true");
  } );
} ) ;

describe( 'CallWorldLabel - less than', function() : void {
  const rootlabel = new labels.CallWorldLabel("<", false);
  const op1 = labels.mkNumberLiteral("1");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling true', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "true");
  } );
} ) ;

describe( 'CallWorldLabel - less than', function() : void {
  const rootlabel = new labels.CallWorldLabel("<", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling false', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "false");
  } );
} ) ;

describe( 'CallWorldLabel - less than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel("<=", false);
  const op1 = labels.mkNumberLiteral("1");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling true', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "true");
  } );
} ) ;

describe( 'CallWorldLabel - less than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel("<=", false);
  const op1 = labels.mkNumberLiteral("1000");
  const op2 = labels.mkNumberLiteral("300");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling false', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "false");
  } );
} ) ;

describe( 'CallWorldLabel - less than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel("<=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("10");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling true', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "true");
  } );
} ) ;

describe( 'CallWorldLabel - equal', function() : void {
  const rootlabel = new labels.CallWorldLabel("==", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("10");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling true', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "true");
  } );
} ) ;

describe( 'CallWorldLabel - equal', function() : void {
  const rootlabel = new labels.CallWorldLabel("==", false);
  const op1 = labels.mkNumberLiteral("This is a string");
  const op2 = labels.mkNumberLiteral("This is not the same string");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling false', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "false");
  } );
} ) ;

describe( 'CallWorldLabel - logical and', function() : void {
  const rootlabel = new labels.CallWorldLabel("and", false);
  const op1 = labels.mkNumberLiteral("true");
  const op2 = labels.mkNumberLiteral("true");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling true', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "true");
  } );
} ) ;

describe( 'CallWorldLabel - logical and', function() : void {
  const rootlabel = new labels.CallWorldLabel("and", false);
  const op1 = labels.mkNumberLiteral("true");
  const op2 = labels.mkNumberLiteral("false");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling false', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "false");
  } );
} ) ;

describe( 'CallWorldLabel - logical or', function() : void {
  const rootlabel = new labels.CallWorldLabel("or", false);
  const op1 = labels.mkNumberLiteral("true");
  const op2 = labels.mkNumberLiteral("true");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling true', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "true");
  } );
} ) ;

describe( 'CallWorldLabel - logical or', function() : void {
  const rootlabel = new labels.CallWorldLabel("or", false);
  const op1 = labels.mkNumberLiteral("true");
  const op2 = labels.mkNumberLiteral("false");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling true', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "true");
  } );
} ) ;

describe( 'CallWorldLabel - logical or', function() : void {
  const rootlabel = new labels.CallWorldLabel("or", false);
  const op1 = labels.mkNumberLiteral("false");
  const op2 = labels.mkNumberLiteral("false");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = new VMS(root, wlds, interp);

  it('should evaluate to a StringV equaling false', function() : void {
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( ! vm.isReady() ) ;
      vm.advance() ;
      assert.check(  vm.isReady() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof StringV ) ;
      assert.check( (val as StringV).getVal() === "false");
  } );
} ) ;

describe( 'ExprSeqLabel', function () : void {
    const rootLabel = new labels.ExprSeqLabel();
    const op1 = labels.mkNumberLiteral("1");
    const op2 = labels.mkNumberLiteral("2");
    const root = new PNode(rootLabel, [op1, op2]);
    const vm = new VMS(root, wlds, interp);
    it( 'should evaluate to a StringV equaling 3', function () : void {
        assert.check( ! vm.isReady() ) ;
        vm.advance() ;
        assert.check(  vm.isReady() ) ;
        vm.advance() ;
        assert.check( ! vm.isReady() ) ;
        vm.advance() ;
        assert.check(  vm.isReady() ) ;
        vm.advance() ;
        assert.check( ! vm.isReady() ) ;
        vm.advance() ;
        assert.check(  vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof StringV ) ;
        assert.check( ( val as StringV ).getVal() === "2" ) ;
    } );
});


describe('IfLabel', function () : void{

    it('should fail to evaluate when something other than true or false is used', function () : void {
        //setup
        const ifLabel: IfLabel = new labels.IfLabel();
        const condition: PNode = labels.mkStringLiteral("not_a_boolean_value");
        const ifTrue: PNode = labels.mkNumberLiteral("5");
        const ifFalse: PNode = labels.mkNumberLiteral("7");
        const trueExprSeqNode: PNode = new PNode(new labels.ExprSeqLabel(), [ifTrue]);
        const falseExprSeqNode: PNode = new PNode(new labels.ExprSeqLabel(), [ifFalse]);
        const ifArray: Array<PNode> = [condition, trueExprSeqNode, falseExprSeqNode];
        const root: PNode = new PNode(ifLabel, ifArray);
        const vm: VMS = new VMS(root, wlds, interp);

        //run test
        //select condition node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step condition node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //parse condition node to select either true or false
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        //it should fail here
        try {
            vm.advance();
        }
        catch (e) {
            //make sure the correct error message is thrown. this should be its own error type. but assert.ts doesn't allow for that
            if (e.message !== "Assertion failed: Condition is neither true nor false.")
                throw new Error(e.message);
        }
    });

    it('should evaluate to a StringV equaling 5 when true', function() : void {
        //setup
        const ifLabel : IfLabel = new labels.IfLabel();
        const condition : PNode = labels.mkTrueBooleanLiteral();
        const ifTrue : PNode = labels.mkNumberLiteral("5");
        const ifFalse : PNode = labels.mkNumberLiteral("7");
        const trueExprSeqNode : PNode = new PNode(new labels.ExprSeqLabel(), [ifTrue]);
        const falseExprSeqNode : PNode = new PNode(new labels.ExprSeqLabel(), [ifFalse]);
        const ifArray : Array<PNode> = [condition, trueExprSeqNode, falseExprSeqNode];
        const root : PNode = new PNode(ifLabel, ifArray);
        const vm : VMS = new VMS(root, wlds, interp);

        //run test
        //select condition node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step condition node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //parse condition node to select the first node in the either true or false expr sequence(true in this case)
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step number literal 5
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select expr seq node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step expr seq node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select if node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step if node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        assert.check(vm.isDone(), "VMS is not done.");
        assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
        const val : Value = vm.getVal(emptyList);
        assert.check(val instanceof StringV, "The value is not a StringV.");
        const result : string = (<StringV> val).getVal();
        assert.check(result === "5", "It did not return 5 as expected. It returned " + result);

    });

    it('should evaluate to a StringV equaling 7 when false', function() : void {
        //setup
        const ifLabel : IfLabel = new labels.IfLabel();
        const condition : PNode = labels.mkFalseBooleanLiteral();
        const ifTrue : PNode = labels.mkNumberLiteral("5");
        const ifFalse : PNode = labels.mkNumberLiteral("7");
        const trueExprSeqNode : PNode = new PNode(new labels.ExprSeqLabel(), [ifTrue]);
        const falseExprSeqNode : PNode = new PNode(new labels.ExprSeqLabel(), [ifFalse]);
        const ifArray : Array<PNode> = [condition, trueExprSeqNode, falseExprSeqNode];
        const root : PNode = new PNode(ifLabel, ifArray);
        const vm : VMS = new VMS(root, wlds, interp);

        //run test
        //select condition node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step condition node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //parse condition node to select the first node in the either true or false expr sequence(false in this case)
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step number literal 7
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select expr seq node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step expr seq node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select if node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step if node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        assert.check(vm.isDone(), "VMS is not done.");
        assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
        const val : Value = vm.getVal(emptyList);
        assert.check(val instanceof StringV, "The value is not a StringV.");
        const result : string = (<StringV> val).getVal();
        assert.check(result === "7", "It did not return 7 as expected. It returned " + result);
    });
});


