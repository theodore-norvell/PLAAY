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
import backtracking = require( '../backtracking' ) ;
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
import TransactionManager = backtracking.TransactionManager ;
import {AssignLabel, ExprSeqLabel, IfLabel, NumberLiteralLabel, VarDeclLabel, VariableLabel} from "../labels";
import {Value} from "../vms";

const emptyList = collections.nil<number>() ;
const interp = interpreter.getInterpreter() ;

function makeStdVMS( root : PNode ) : VMS {
  const manager = new TransactionManager() ;
  const wld = new World(manager);
  const wlds : Array<ObjectV> = new Array();
  wlds.push(wld);
  return new VMS( root, wlds, interp, manager ) ;
}

describe( 'StringLiteralLabel', function() : void {
    const label = new labels.StringLiteralLabel( "hello", false ) ;
    const root = new PNode( label, [] ) ;
    const vm = makeStdVMS( root )  ;

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
    const vm = makeStdVMS( root )  ;

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
    const vm = makeStdVMS( root )  ;

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
    const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const manager = new TransactionManager() ;
  const wld = new World(manager);
  const wlds : Array<ObjectV> = new Array();
  wlds.push(wld);
  const vm = new VMS( root, wlds, interp, manager ) ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const rootlabel = new labels.CallWorldLabel("=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("10");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

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
  const rootlabel = new labels.CallWorldLabel("=", false);
  const op1 = labels.mkNumberLiteral("This is a string");
  const op2 = labels.mkNumberLiteral("This is not the same string");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
  const vm = makeStdVMS( root )  ;

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
    const vm = makeStdVMS( root )  ;
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
        const vm = makeStdVMS( root )  ;

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
        vm.advance();
        assert.check( vm.hasError() ) ;
        assert.checkEqual( vm.getError(), "Condition is neither true nor false." ) ;
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
        const vm = makeStdVMS( root )  ;

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
        const vm = makeStdVMS( root )  ;

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

//test this here since it is needed for while
describe('scrub', function () : void {
    it ('should unmap a single element', function () {
       //setup
       const numberNode : PNode = labels.mkNumberLiteral("5");
       const root : PNode = new PNode(new ExprSeqLabel(), [numberNode]);
       const vm = makeStdVMS( root )  ;

       //run test
       //select number literal node
       assert.check(!vm.isReady(), "VMS is ready when it should not be.");
       vm.advance();

       //step number literal node
       assert.check(vm.isReady(), "VMS is not ready when it should be.");
       vm.advance();

       //ensure that the node is mapped
       assert.check(vm.isChildMapped(0), "The number literal is not mapped.");

       //scrub the node
       vm.scrub(vm.getPending());

       //ensure that it is no longer mapped
       assert.check(!vm.isChildMapped(0), "The number literal is still mapped.");
    });

    it ('should unmap two elements', function () {
        //setup
        const numberNode : PNode = labels.mkNumberLiteral("5");
        const stringNode : PNode = labels.mkStringLiteral("hello");
        const root : PNode = new PNode(new ExprSeqLabel(), [numberNode, stringNode]);
        const vm = makeStdVMS( root )  ;

        //run test
        //select number literal node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step number literal node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select string literal node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step string literal node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //ensure that the node is mapped
        assert.check(vm.isChildMapped(0), "The number literal is not mapped.");
        assert.check(vm.isChildMapped(1), "The string literal is not mapped.");

        //scrub the node
        vm.scrub(vm.getPending());

        //ensure that it is no longer mapped
        assert.check(!vm.isChildMapped(0), "The number literal is still mapped.");
        assert.check(!vm.isChildMapped(1), "The string literal is still mapped.");
    });
    it ('should unmap four elements', function () {
        //setup
        const numberNode : PNode = labels.mkNumberLiteral("5");
        const stringNode : PNode = labels.mkStringLiteral("hello");
        const numberNode2 : PNode = labels.mkNumberLiteral("6");
        const stringNode2 : PNode = labels.mkStringLiteral("goodbye");
        const root : PNode = new PNode(new ExprSeqLabel(), [numberNode, stringNode, numberNode2, stringNode2]);
        const vm = makeStdVMS( root )  ;

        //run test
        //select number literal node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step number literal node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select string literal node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step string literal node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();
        //select number literal node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step number literal node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select string literal node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step string literal node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //ensure that the node is mapped
        assert.check(vm.isChildMapped(0), "The first number literal is not mapped.");
        assert.check(vm.isChildMapped(1), "The first string literal is not mapped.");
        assert.check(vm.isChildMapped(2), "The second number literal is not mapped.");
        assert.check(vm.isChildMapped(3), "The second string literal is not mapped.");

        //scrub the node
        vm.scrub(vm.getPending());

        //ensure that it is no longer mapped
        assert.check(!vm.isChildMapped(0), "The first number literal is still mapped.");
        assert.check(!vm.isChildMapped(1), "The first string literal is still mapped.");
        assert.check(!vm.isChildMapped(2), "The second number literal is still mapped.");
        assert.check(!vm.isChildMapped(3), "The second string literal is still mapped.");
    });
});

describe('VarDeclLabel', function () : void {
    it('should be able to declare variables', function () : void {
        //setup
        const varDeclLabel : VarDeclLabel = new labels.VarDeclLabel(false);
        const variableNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode : PNode = labels.mkNumberLiteral("5");
        const root : PNode = new PNode(varDeclLabel, [variableNode, typeNode, valueNode]);
        const vm = makeStdVMS( root )  ;

        //run the test
        //select the valueNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step the valueNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select the declaration node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step the declaration node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        assert.check(vm.isDone(), "VMS is not done");
        assert.check(vm.isMapped(emptyList), "Empty list is not mapped.");
    });

    it('should fail when not using a variable node as the first node', function () : void {
        //setup
        const varDeclLabel : VarDeclLabel = new labels.VarDeclLabel(false);
        const variableNode : PNode = labels.mkStringLiteral("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode : PNode = labels.mkNumberLiteral("5");
        try {
            const root: PNode = new PNode(varDeclLabel, [variableNode, typeNode, valueNode]);
            assert.failedPrecondition("It made a node when it should not have.");
        }
        catch (e) {
            if (e.message !== "Assertion failed: Attempted to make an invalid program node") {
                throw new Error(e.message);
            }
        }
    });

    it('should not be able to declare the same variable twice', function () : void {
        //setup
        const variableNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode1 : PNode = labels.mkNumberLiteral("1");
        const valueNode2 : PNode = labels.mkNumberLiteral("2");
        const varDeclNode1 : PNode = labels.mkVarDecl(variableNode, typeNode, valueNode1);
        const varDeclNode2 : PNode = labels.mkVarDecl(variableNode, typeNode, valueNode2);
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [varDeclNode1, varDeclNode2]);
        const vm = makeStdVMS( root )  ;

        //run the test
        //select valueNode1
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step valueNode1
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select varDeclNode1
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step varDeclNode1
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select valueNode2
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step valueNode2
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select varDeclNode2
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step varDeclNode2
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();
        assert.check( vm.hasError() ) ;
        assert.check( vm.getError() === "Cannot declare an already existing variable.")
    });
});

describe('VariableLabel', function () : void {
    it('should return the proper value after being assigned', function () : void {
        //setup
        const varNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode : PNode = labels.mkNumberLiteral("1729");
        const varDeclNode : PNode = labels.mkVarDecl(varNode, typeNode, valueNode);
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [varDeclNode, varNode]);
        const vm = makeStdVMS( root )  ;

        //run the test
        //select valueNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step valueNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select varDeclNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step varDeclNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select varNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step varNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select root
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step root
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        assert.check(vm.isDone(), "VMS is not done.");
        assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
        const val : Value = vm.getVal(emptyList);
        assert.check(val instanceof StringV, "The value is not a StringV.");
        const result : string = (<StringV> val).getVal();
        assert.check(result === "1729", "It did not return 1729 as expected. It returned " + result);
    });

    it('should fail when trying to reference an undeclared node', function () : void {
        //setup
        const root : PNode = labels.mkVar("a");
        const vm = makeStdVMS( root )  ;

        //run test
        //select root
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step root (this should fail)
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();
        assert.check( vm.hasError() ) ;
        assert.check( vm.getError() === "The variable a is not assigned a value." ) ;
    });
});

describe('AssignLabel', function () : void {
    it('should fail when assigning a non-declared variable', function () : void {
        //setup
        const assignLabel : AssignLabel = labels.AssignLabel.theAssignLabel;
        const variableNode : PNode = labels.mkVar("a");
        const valueNode : PNode = labels.mkNumberLiteral("5");
        const root : PNode = new PNode(assignLabel, [variableNode, valueNode]);
        const vm = makeStdVMS( root )  ;

        //run test
        //select valueNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step valueNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select root
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step root(this should fail)
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();
        assert.check( vm.hasError() ) ;
        assert.check( vm.getError() === "No variable with name a exists.") ;

    });

    it('should assign a new value to a previously declared variable', function () {
        //setup
        const assignLabel : AssignLabel = labels.AssignLabel.theAssignLabel;
        const variableNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode1 : PNode = labels.mkNumberLiteral("1");
        const valueNode2 : PNode = labels.mkNumberLiteral("2");
        const varDeclNode : PNode = labels.mkVarDecl(variableNode, typeNode, valueNode1);
        const assignNode : PNode = new PNode(assignLabel, [variableNode, valueNode2]);
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [varDeclNode, assignNode]);
        const vm = makeStdVMS( root )  ;

        //run the test
        //select valueNode1
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step valueNode1
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select varDeclNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step varDeclNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select valueNode2
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step valueNode2
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select assignNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step assignNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select root
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step root
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        assert.check(vm.isDone(), "VMS is not done.");
        assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
        const val : Value = vm.getVal(emptyList);
        assert.check(val instanceof StringV, "The value is not a StringV.");
        const result : string = (<StringV> val).getVal();
        assert.check(result === "2", "It did not return 2 as expected. It returned " + result);
    });
});

describe('WhileLabel', function () : void {
    it('should not work when the guard does not evaluate to true or false', function () : void {
        //setup
        const guardNode : PNode = labels.mkStringLiteral("not_a_boolean");
        const numberNode : PNode = labels.mkNumberLiteral("5");
        const bodyNode : PNode = new PNode(new labels.ExprSeqLabel(), [numberNode]);
        const whileNode : PNode = labels.mkWhile(guardNode, bodyNode);
        const vm = makeStdVMS( whileNode )  ;

        //run the test
        //select guardNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step guardNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //attempt to select the another node, but it should fail
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();
        assert.check( vm.hasError() ) ;
        assert.check( vm.getError() === "Guard is neither true nor false!" ) ;
    });

    it('should unmap the body after one iteration of the loop has happened', function () : void {
        //setup
        const guardNode : PNode = labels.mkTrueBooleanLiteral();
        const numberNode : PNode = labels.mkNumberLiteral("5");
        const bodyNode : PNode = new PNode(new labels.ExprSeqLabel(), [numberNode]);
        const whileNode : PNode = labels.mkWhile(guardNode, bodyNode);
        const vm = makeStdVMS( whileNode )  ;

        //run the test
        //select guardNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step guardNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select numberNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step numberNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select bodyNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step bodyNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //unmap and select guard node again
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        assert.check(!vm.isChildMapped(1), 'The body node is mapped when it should have been unmapped.');

    });

    it('should run one time when flipping the value of the guard in the body', function () : void {
        //setup
        const guardNode : PNode = labels.mkVar("guard");
        const trueNode : PNode = labels.mkTrueBooleanLiteral();
        const varDeclNode : PNode = labels.mkVarDecl(guardNode, labels.mkNoTypeNd(), trueNode);
        const falseNode : PNode = labels.mkFalseBooleanLiteral();
        const assignNode : PNode = new PNode(labels.AssignLabel.theAssignLabel, [guardNode, falseNode]);
        const bodyNode : PNode = new PNode(new labels.ExprSeqLabel(), [assignNode]);
        const whileNode : PNode = labels.mkWhile(guardNode, bodyNode);
        const root : PNode = new PNode(new ExprSeqLabel(), [varDeclNode, whileNode, guardNode]);
        const vm = makeStdVMS( root )  ;

        //run the test
        //select trueNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step trueNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select varDeclNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step varDeclNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select guardNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step guardNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select falseNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step falseNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select assignNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step assignNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select bodyNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step bodyNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select guardNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step guardNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select whileNode
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step whileNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select guardNode (outside of while loop)
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step guardNode
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select root
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step root
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        assert.check(vm.isDone(), "VMS is not done.");
        assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
        const val : Value = vm.getVal(emptyList);
        assert.check(val instanceof StringV, "The value is not a StringV.");
        const result : string = (<StringV> val).getVal();
        assert.check(result === "false", "It did not return false as expected. It returned " + result);

    })

});
