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
import NumberV = valueTypes.NumberV;
import BoolV = valueTypes.BoolV;
import NullV = valueTypes.NullV;
import PNode = pnode.PNode ;
import { mkVarDecl, mkVar, mkNoTypeNd, mkNoExpNd, mkParameterList, mkLambda, mkExprSeq, mkNumberLiteral, mkCallWorld, mkCall } from '../labels';
import TransactionManager = backtracking.TransactionManager ;
import {AssignLabel, ExprSeqLabel, IfLabel, NumberLiteralLabel, VarDeclLabel, VariableLabel} from "../labels";
import {Value} from "../vms";

const emptyList = collections.nil<number>() ;
const list = collections.list ;
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

    it('should evaluate to a NumberV', function() : void {
        assert.check( ! vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === Number(label.getVal()) ) ;
    } );
} ) ;

describe( 'BooleanLiteralLabel', function() : void {
    const label = new labels.BooleanLiteralLabel( "true", false ) ;
    const root = new PNode( label, [] ) ;
    const vm = makeStdVMS( root )  ;

    it('should evaluate to a BoolV', function() : void {
        assert.check( ! vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isReady() ) ;
        vm.advance() ;
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof BoolV ) ;
        assert.check( (val as BoolV).getVal() === true ) ;
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

describe ('LambdaLabel', function() : void {
    const paramlist = mkParameterList([mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNoExpNd())]);
    const root = mkLambda(paramlist, mkNoTypeNd(), mkExprSeq([mkNumberLiteral("1")]));
    const vm = makeStdVMS(root);

    it('should evaluate to a ClosureV', function(): void {
        assert.check(!vm.isReady());
        vm.advance();
        assert.check(vm.isReady());
        vm.advance();
        assert.check(vm.isDone());
        assert.check(vm.isMapped(emptyList));
        const val = vm.getVal(emptyList);
        assert.check(val instanceof ClosureV);
        assert.check((val as ClosureV).getLambdaNode().label() instanceof labels.LambdaLabel);
    });
});

describe ('LambdaLabel w/ duplicate parameter names', function() : void {
  const paramlist = mkParameterList([mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNoExpNd()), mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNoExpNd())]);
  const root = mkLambda(paramlist, mkNoTypeNd(), mkExprSeq([mkNumberLiteral("1")]));
  const vm = makeStdVMS(root);

  it('should fail with duplicate parameter names', function(): void {
      assert.check(!vm.isReady());
      vm.advance();
      assert.check(vm.isReady());
      try {
        vm.advance();
      }
      catch (e) {
          if (e.message !== "Lambda contains duplicate parameter names.") {
              throw new Error(e.message);
          }
      }
  });
});

describe ('CallWorldLabel - closure (no arguments)', function(): void {
    const lambda = mkLambda(mkParameterList([]), mkNoTypeNd(), mkExprSeq([mkNumberLiteral("42")]));
    const lambdaDecl = mkVarDecl(mkVar("f"), mkNoTypeNd(), lambda);
    const callWorld = new PNode(new labels.CallWorldLabel("f", false), []);
    const root = mkExprSeq([lambdaDecl, callWorld]);
    const vm = makeStdVMS(root);
    
    it('should evaluate to a NumberV equaling 42', function() : void {
      let firstEvalDone: boolean = false;
      let evalDone: boolean = false;
      while (!evalDone) {
        vm.advance();
        if (vm.isDone()) {
          if (firstEvalDone) {
            evalDone = true;
          }
          else {
            firstEvalDone = true;
          }
        }
      }
      assert.check(vm.isMapped(emptyList));
      const val = vm.getVal(emptyList);
      assert.check(val instanceof NumberV);
      assert.check((val as NumberV).getVal() === 42);
    });
});

describe ('CallWorldLabel - closure (w/ arguments)', function(): void {
    const paramlist = mkParameterList([mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNoExpNd()), mkVarDecl(mkVar("y"), mkNoTypeNd(), mkNoExpNd())]);
    const lambdaBody = mkExprSeq([mkCallWorld("*", [mkVar("x"), mkVar("y")])]);
    const lambda = mkLambda(paramlist, mkNoTypeNd(), lambdaBody);
    const lambdaDecl = mkVarDecl(mkVar("f"), mkNoTypeNd(), lambda);
    const callWorld = new PNode(new labels.CallWorldLabel("f", false), [mkNumberLiteral("3"), mkNumberLiteral("5")]);
    const root = mkExprSeq([lambdaDecl, callWorld]);
    const vm = makeStdVMS(root);

    it('should evaluate to a NumberV equaling 15', function() : void {
      let firstEvalDone: boolean = false;
      let evalDone: boolean = false;
      while (!evalDone) {
        vm.advance();
        if (vm.isDone()) {
          if (firstEvalDone) {
            evalDone = true;
          }
          else {
            firstEvalDone = true;
          }
        }
      }
      assert.check(vm.isMapped(emptyList));
      const val = vm.getVal(emptyList);
      assert.check(val instanceof NumberV);
      assert.check((val as NumberV).getVal() === 15);
    });
});

describe ('CallWorldLabel - closure (w/ context)', function(): void {
  const varDecl = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("3"));
  const lambdaBody = mkExprSeq([mkCallWorld("+", [mkVar("x"), mkNumberLiteral("5")])]);
  const lambda = mkLambda(mkParameterList([]), mkNoTypeNd(), lambdaBody);
  const lambdaDecl = mkVarDecl(mkVar("f"), mkNoTypeNd(), lambda);
  const callWorld = new PNode(new labels.CallWorldLabel("f", false), []);
  const root = mkExprSeq([varDecl, lambdaDecl, callWorld]);
  const vm = makeStdVMS(root);

  it('should evaluate to a NumberV equaling 8', function() : void {
      let firstEvalDone: boolean = false;
      let evalDone: boolean = false;
      while (!evalDone) {
        vm.advance();
        if (vm.isDone()) {
            if (firstEvalDone) {
                evalDone = true; }
        else {
            firstEvalDone = true; } }
      }
      assert.check(vm.isMapped(emptyList));
      const val = vm.getVal(emptyList);
      assert.check(val instanceof NumberV);
      assert.check((val as NumberV).getVal() === 8 );
  });
});

describe ('CallWorldLabel - closure (w/ arguments + context)', function(): void {
  const varDecl = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("3"));
  const paramlist = mkParameterList([mkVarDecl(mkVar("y"), mkNoTypeNd(), mkNoExpNd())]);
  const lambdaBody = mkExprSeq([mkCallWorld("-", [mkVar("x"), mkVar("y")])]);
  const lambda = mkLambda(paramlist, mkNoTypeNd(), lambdaBody);
  const lambdaDecl = mkVarDecl(mkVar("f"), mkNoTypeNd(), lambda);
  const callWorld = new PNode(new labels.CallWorldLabel("f", false), [mkNumberLiteral("2")]);
  const root = mkExprSeq([varDecl, lambdaDecl, callWorld]);
  const vm = makeStdVMS(root);

  it('should evaluate to a NumberV equaling 1', function() : void {
      let firstEvalDone: boolean = false;
      let evalDone: boolean = false;
      while (!evalDone) {
        vm.advance();
        if (vm.isDone()) {
          if (firstEvalDone) {
            evalDone = true; }
          else {
            firstEvalDone = true; }
        }
      }
      assert.check(vm.isMapped(emptyList));
      const val = vm.getVal(emptyList);
      assert.check(val instanceof NumberV);
      assert.check((val as NumberV).getVal() === 1);
  });
});

describe( 'CallWorldLabel - addition', function() : void {
  const rootlabel = new labels.CallWorldLabel("+", false);
  const op1 = labels.mkNumberLiteral("2");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a NumberV equaling 5', function() : void {
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
      assert.check( val instanceof NumberV ) ;
      assert.check( (val as NumberV).getVal() === 5);
  } );
} ) ;

describe( 'CallWorldLabel - subtraction', function() : void {
  const rootlabel = new labels.CallWorldLabel("-", false);
  const op1 = labels.mkNumberLiteral("5");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a NumberV equaling 2', function() : void {
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
      assert.check( val instanceof NumberV ) ;
      assert.check( (val as NumberV).getVal() === 2 );
  } );
} ) ;

describe( 'CallWorldLabel - multiplication', function() : void {
  const rootlabel = new labels.CallWorldLabel("*", false);
  const op1 = labels.mkNumberLiteral("5");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a NumberV equaling 15', function() : void {
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
      assert.check( val instanceof NumberV ) ;
      assert.check( (val as NumberV).getVal() === 15);
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

  it('should evaluate to a NumberV equaling 3', function() : void {
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
      assert.check( val instanceof NumberV ) ;
      assert.check( (val as NumberV).getVal() === 3);
  } );
} ) ;

describe( 'CallWorldLabel - division', function() : void {
  const rootlabel = new labels.CallWorldLabel("/", false);
  const op1 = labels.mkNumberLiteral("5");
  const op2 = labels.mkNumberLiteral("2");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a NumberV equaling 2.5', function() : void {
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
      assert.check( val instanceof NumberV ) ;
      assert.check( (val as NumberV).getVal() === 2.5);
  } );
} ) ;

describe( 'CallWorldLabel - greater than', function() : void {
  const rootlabel = new labels.CallWorldLabel(">", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - greater than', function() : void {
  const rootlabel = new labels.CallWorldLabel(">", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("300");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - greater than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel(">=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - greater than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel(">=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("300");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - greater than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel(">=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("10");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - less than', function() : void {
  const rootlabel = new labels.CallWorldLabel("<", false);
  const op1 = labels.mkNumberLiteral("1");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - less than', function() : void {
  const rootlabel = new labels.CallWorldLabel("<", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - less than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel("<=", false);
  const op1 = labels.mkNumberLiteral("1");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - less than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel("<=", false);
  const op1 = labels.mkNumberLiteral("1000");
  const op2 = labels.mkNumberLiteral("300");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - less than or equal', function() : void {
  const rootlabel = new labels.CallWorldLabel("<=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("10");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

/* Test for (true = true) = (false = false) = true */
describe( 'CallWorldLabel - equal', function() : void {
    const rootLabel = new labels.CallWorldLabel("=",false);
    const op1 = labels.mkTrueBooleanLiteral();
    const op2 = labels.mkFalseBooleanLiteral();
    const op3 = labels.mkTrueBooleanLiteral();
    const op4 = labels.mkFalseBooleanLiteral();
    const root1 = new PNode(rootLabel, [op1,op3]);
    const root2 = new PNode(rootLabel, [op2,op4]);
    const vm1 = makeStdVMS( root1 );
    const vm2 = makeStdVMS( root2 );

    it( 'should evaluate to a BoolV equalling true', function() : void {
      assert.check( ! vm1.isReady() ) ;
      vm1.advance() ;
      assert.check(  vm1.isReady() ) ;
      vm1.advance() ;
      assert.check( ! vm1.isReady() ) ;
      vm1.advance() ;
      assert.check(  vm1.isReady() ) ;
      vm1.advance() ;
      assert.check( ! vm1.isReady() ) ;
      vm1.advance() ;
      assert.check(  vm1.isReady() ) ;
      vm1.advance() ;
      
      assert.check( ! vm2.isReady() ) ;
      vm2.advance() ;
      assert.check(  vm2.isReady() ) ;
      vm2.advance() ;
      assert.check( ! vm2.isReady() ) ;
      vm2.advance() ;
      assert.check(  vm2.isReady() ) ;
      vm2.advance() ;
      assert.check( ! vm2.isReady() ) ;
      vm2.advance() ;
      assert.check(  vm2.isReady() ) ;
      vm2.advance() ;
      
      assert.check( vm1.isDone() ) ;
      assert.check( vm1.isMapped( emptyList ) ) ;
      assert.check( vm2.isDone() ) ;
      assert.check( vm2.isMapped( emptyList ) ) ;
      const val1 = vm1.getVal( emptyList ) ;
      const val2 = vm2.getVal( emptyList ) ;
      assert.check( val1 instanceof BoolV ) ;
      assert.check( val2 instanceof BoolV ) ;
      assert.check( (val1 as BoolV).getVal()  === (val2 as BoolV).getVal() === true);
    })
});

/* Test for (true = x) = (x = true) = false for any x not true */
describe( 'CallWorldLabel - equal', function() : void {
    const rootLabel = new labels.CallWorldLabel("=",false);
    const op1 = labels.mkTrueBooleanLiteral();
    const op2 = labels.mkNumberLiteral("123");
    const root = new PNode(rootLabel, [op1,op2,op2,op1]);
    const vm = makeStdVMS( root );
    
    it( 'should evaluate to a BoolV equalling true', function() : void {
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
      const val1 = vm.getVal( emptyList ) ;
      assert.check( val1 instanceof BoolV ) ;
      assert.check( (val1 as BoolV).getVal()  === false);
    })
});

describe( 'CallWorldLabel - equal', function() : void {
  const rootlabel = new labels.CallWorldLabel("=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("10");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - equal', function() : void {
  const rootlabel = new labels.CallWorldLabel("=", false);
  const op1 = labels.mkStringLiteral("This is a string");
  const op2 = labels.mkStringLiteral("This is not the same string");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - logical and', function() : void {
  const rootlabel = new labels.CallWorldLabel("and", false);
  const op1 = labels.mkStringLiteral("true");
  const op2 = labels.mkStringLiteral("true");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - logical and', function() : void {
  const rootlabel = new labels.CallWorldLabel("and", false);
  const op1 = labels.mkStringLiteral("true");
  const op2 = labels.mkStringLiteral("false");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - logical or', function() : void {
  const rootlabel = new labels.CallWorldLabel("or", false);
  const op1 = labels.mkStringLiteral("true");
  const op2 = labels.mkStringLiteral("true");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - logical or', function() : void {
  const rootlabel = new labels.CallWorldLabel("or", false);
  const op1 = labels.mkStringLiteral("true");
  const op2 = labels.mkStringLiteral("false");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - logical or', function() : void {
  const rootlabel = new labels.CallWorldLabel("or", false);
  const op1 = labels.mkStringLiteral("false");
  const op2 = labels.mkStringLiteral("false");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
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
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;


describe ('Call Label with closure', function(): void {
    const varDecl = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("100"));
    const paramlist = mkParameterList([mkVarDecl(mkVar("y"), mkNoTypeNd(), mkNoExpNd())]);
    const lambdaBody = mkExprSeq([mkCallWorld("+", [mkVar("x"), mkVar("y")])]);
    const lambda = mkLambda(paramlist, mkNoTypeNd(), lambdaBody);
    const root = mkExprSeq([varDecl, mkCall(lambda, mkNumberLiteral("36"))]);
    const vm = makeStdVMS(root);

    it('should evaluate to a NumberV equaling 136', function() : void {
      let firstEvalDone: boolean = false;
      let evalDone: boolean = false;
      while (!evalDone) {
        vm.advance();
        if (vm.isDone()) {
          if (firstEvalDone) {
            evalDone = true;
          }
          else {
            firstEvalDone = true;
          }
        }
      }
      assert.check(vm.isMapped(emptyList));
      const val = vm.getVal(emptyList);
      assert.check(val instanceof NumberV);
      assert.check((val as NumberV).getVal() === 136);
    });
});

describe ('Call of built-in', function(): void {
    const root = mkCall(mkVar("+"), mkNumberLiteral("234"), mkNumberLiteral("432")) ;
    const vm = makeStdVMS(root);

    it('should call the add function if looked up as a variable', function() : void {
        while( vm.canAdvance() ) {
            vm.advance(); }
        assert.check( !vm.hasError() );
        const val = vm.getFinalValue() ;
        assert.check(val instanceof NumberV);
        assert.check((val as NumberV).getVal() === 666);
    });
});

describe ('Call node', function(): void {

    it('should report an error if the first argument is a string', function() : void {

        const root = mkCall(labels.mkStringLiteral("f"), mkNumberLiteral("234"), mkNumberLiteral("432")) ;
        const vm = makeStdVMS(root);
        while( vm.canAdvance() ) {
            vm.advance(); }
        assert.check( vm.hasError() );
        const message = vm.getError() ;
        assert.checkEqual( 
            "Attempt to call a value that is neither a closure nor a built-in function.",
            message );
    });

    it('should report an error if the number of arguments does not match the number of parameters', function() : void {
        const varDecl = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("100"));
        const paramlist = mkParameterList([mkVarDecl(mkVar("y"), mkNoTypeNd(), mkNoExpNd())]);
        const lambdaBody = mkExprSeq([mkCallWorld("+", [mkVar("x"), mkVar("y")])]);
        const lambda = mkLambda(paramlist, mkNoTypeNd(), lambdaBody);
        const root = mkCall(lambda, mkNumberLiteral("234"), mkNumberLiteral("432")) ;
        const vm = makeStdVMS(root);
        while( vm.canAdvance() ) {
            vm.advance(); }
        assert.check( vm.hasError() );
        const message = vm.getError() ;
        assert.checkEqual(
            "Number of arguments for lambda does not match parameter list.",
            message );
    });
});

describe('ObjectLiteralLabel', function(): void {
    it('should evaluate to an ObjectV with 2 fields', function () : void {
      const rootLabel = new labels.ObjectLiteralLabel();
      const field1 = labels.mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("3"));
      const field2 = labels.mkVarDecl(mkVar("y"), mkNoTypeNd(), mkNumberLiteral("5"));
      const root = new PNode(rootLabel, [field1, field2]);
      const vm = makeStdVMS( root )  ;
      while (vm.canAdvance()) {
        vm.advance();
      }
      assert.check(!vm.hasError());
      const val = vm.getFinalValue();
      assert.check(val instanceof ObjectV);
      assert.check((val as ObjectV).numFields() === 2);
      assert.check(((val as ObjectV).getField("x").getValue() as NumberV).getVal() === 3) ;
      assert.check(((val as ObjectV).getField("y").getValue() as NumberV).getVal() === 5) ;
  });
});

describe('AccessorLabel', function(): void {
    it ('should evaluate to a StringV equaling 5', function(): void {
        const field = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
        const object = new PNode(new labels.ObjectLiteralLabel(), [field]);
        const root = new PNode(labels.AccessorLabel.theAccessorLabel, [object, labels.mkStringLiteral("x")]);
        const vm = makeStdVMS(root);
        while (vm.canAdvance()) {
          vm.advance();
        }
        assert.check(!vm.hasError());
        const val = vm.getFinalValue();
        assert.check(val instanceof NumberV);
        assert.check((val as NumberV).getVal() === 5);
    });

    it('should report an error that the object does not have a field named y', function(): void {
      const field = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const object = new PNode(new labels.ObjectLiteralLabel, [field]);
      const root = new PNode(labels.AccessorLabel.theAccessorLabel, [object, labels.mkStringLiteral("y")]);
      const vm = makeStdVMS(root);
      while( vm.canAdvance() ) {
        vm.advance(); }
      assert.check( vm.hasError() );
      const message = vm.getError() ;
      assert.checkEqual( "No field named 'y'.", message );
    });

    it('should report an error when applied to non-object', function(): void {
      const field = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const stringLiteral = mkNumberLiteral("5");
      const root = new PNode(labels.AccessorLabel.theAccessorLabel, [stringLiteral, labels.mkStringLiteral("y")]);
      const vm = makeStdVMS(root);
      while( vm.canAdvance() ) {
        vm.advance(); }
      assert.check( vm.hasError() );
      const message = vm.getError() ;
      assert.checkEqual( "The index operator may only be applied to objects.", message );
    });

    it('should report an error when the index is not a string', function(): void {
        const field = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
        const object = new PNode(new labels.ObjectLiteralLabel, [field]);
        const index = mkLambda( mkParameterList( [] ), mkNoTypeNd(), mkExprSeq( [] ) ) ;
        const root = new PNode(labels.AccessorLabel.theAccessorLabel, [object, index]);
        const vm = makeStdVMS(root);
        while( vm.canAdvance() ) {
            vm.advance(); }
        assert.check( vm.hasError() );
        const message = vm.getError() ;
        assert.checkEqual( "The operand of the index operator must be a string.", message );
    });
});

describe('DotLabel', function(): void {
    it ('should work when the field is there', function(): void {
        const field = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
        const object = new PNode(new labels.ObjectLiteralLabel(), [field]);
        const root = labels.mkDot( "x", false, object ) ;
        const vm = makeStdVMS(root);
        while (vm.canAdvance()) {
          vm.advance();
        }
        assert.check(!vm.hasError());
        const val = vm.getFinalValue();
        assert.check(val instanceof NumberV);
        assert.check((val as NumberV).getVal() === 5);
    });

    it('should report an error that the object does not have a field named y', function(): void {
      const field = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const object = new PNode(new labels.ObjectLiteralLabel, [field]);
      const root = labels.mkDot( "y", false, object ) ;
      const vm = makeStdVMS(root);
      while( vm.canAdvance() ) {
        vm.advance(); }
      assert.check( vm.hasError() );
      const message = vm.getError() ;
      assert.checkEqual( "No field named 'y'.", message );
    });

    it('should report an error when applied to a non-object', function(): void {
      const stringLiteral = mkNumberLiteral("5") ;
      const root = labels.mkDot( "y", false, stringLiteral ) ;
      const vm = makeStdVMS(root);
      while( vm.canAdvance() ) {
        vm.advance(); }
      assert.check( vm.hasError() );
      const message = vm.getError() ;
      assert.checkEqual( "The dot operator may only be applied to objects.", message );
    });
});

describe('ArrayLiteralLabel', function(): void {
  it('should evaluate to an ObjectV with 2 fields', function(): void {
      const el1 = mkNumberLiteral("12345");
      const el2 = mkNumberLiteral("67890");
      const root = new PNode(new labels.ArrayLiteralLabel(), [el1, el2]);
      const vm = makeStdVMS(root);
      while (vm.canAdvance()) {
        vm.advance();
      }
      assert.check(!vm.hasError());
      const val = vm.getFinalValue();
      assert.check(val instanceof ObjectV);
      assert.check((val as ObjectV).numFields() === 2);
      assert.check(((val as ObjectV).getField("0").getValue() as NumberV).getVal() === 12345);
      assert.check(((val as ObjectV).getField("1").getValue() as NumberV).getVal() === 67890);
  });
});

describe('len built in', function(): void {
  it('should return a len of 2', function(): void {
    const array = new PNode(new labels.ArrayLiteralLabel(), [mkNumberLiteral("23"), mkNumberLiteral("123127645")]);
    const lenCall = new PNode(new labels.CallWorldLabel("len", false), [array]);
    const root = mkExprSeq([array, lenCall]);
    const vm = makeStdVMS(root);
    while (vm.canAdvance()) {
      vm.advance();
    }
    assert.check(!vm.hasError());
    const val = vm.getFinalValue();
    assert.check(val instanceof StringV);
    assert.check((val as StringV).getVal() === "2");
  });
});

describe('push built in', function(): void {
  it('should return a NumberV equaling 1000', function(): void {
    const array = new PNode(new labels.ArrayLiteralLabel(), [mkNumberLiteral("23")]);
    const arrayDecl = mkVarDecl(mkVar("a"), mkNoTypeNd(), array);
    const pushCall = new PNode(new labels.CallWorldLabel("push", false), [mkVar("a"), mkNumberLiteral("1000")]);
    const accessor = new PNode(labels.AccessorLabel.theAccessorLabel, [mkVar("a"), labels.mkStringLiteral("1")]);
    const root = mkExprSeq([arrayDecl, pushCall, accessor]);
    const vm = makeStdVMS(root);
    while (vm.canAdvance()) {
      vm.advance();
    }
    assert.check(!vm.hasError());
    const val = vm.getFinalValue();
    assert.check(val instanceof NumberV);
    assert.check((val as NumberV).getVal() === 1000);
  });
});

describe('pop built in', function(): void {
  it('should return a len of 2', function(): void {
    const array = new PNode(new labels.ArrayLiteralLabel(), [mkNumberLiteral("1"), mkNumberLiteral("2"), mkNumberLiteral("3")]);
    const arrayDecl = mkVarDecl(mkVar("a"), mkNoTypeNd(), array);
    const popCall = new PNode(new labels.CallWorldLabel("pop", false), [mkVar("a")]);
    const lenCall = new PNode(new labels.CallWorldLabel("len", false), [mkVar("a")]);
    const root = mkExprSeq([arrayDecl, popCall, lenCall]);
    const vm = makeStdVMS(root);
    while (vm.canAdvance()) {
      vm.advance();
    }
    assert.check(!vm.hasError());
    const val = vm.getFinalValue();
    assert.check(val instanceof StringV);
    assert.check((val as StringV).getVal() === "2");
  });
});

describe( 'ExprSeqLabel', function () : void {
    it( 'should evaluate to a NumberV equaling 3', function () : void {
        const rootLabel = new labels.ExprSeqLabel();
        const op1 = labels.mkNumberLiteral("1");
        const op2 = labels.mkNumberLiteral("2");
        const root = new PNode(rootLabel, [op1, op2]);
        const vm = makeStdVMS( root )  ;
        assert.check( ! vm.isReady() ) ;
        vm.advance() ; // select the root
        assert.check(  vm.isReady() ) ;
        vm.advance() ; // previsits the root
        assert.check( ! vm.isReady() ) ;
        vm.advance() ; // select the first child
        assert.check(  vm.isReady() ) ;
        vm.advance() ; // step the first child
        assert.check( ! vm.isReady() ) ;
        vm.advance() ; // select the second child
        assert.check(  vm.isReady() ) ;
        vm.advance() ; // step the second child
        assert.check( ! vm.isReady() ) ;
        vm.advance() ; // select root again
        assert.check(  vm.isReady() ) ;
        vm.advance() ; // step the root again
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( ( val as NumberV ).getVal() === 2 ) ;
    } );
    it( 'should work when the sequence is empty', function () : void {
        const rootLabel = new labels.ExprSeqLabel();
        const root = new PNode(rootLabel, []);
        const vm = makeStdVMS( root )  ;
        assert.check( ! vm.isReady() ) ;
        vm.advance() ; // select the root
        assert.check(  vm.isReady() ) ;
        vm.advance() ; // previsits the root
        assert.check( ! vm.isReady() ) ;
        vm.advance() ; // select root again
        assert.check(  vm.isReady() ) ;
        vm.advance() ; // step the root again
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof valueTypes.DoneV ) ;
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
        assert.checkEqual( "Condition is neither true nor false.", vm.getError() ) ;
    });

    it('should evaluate to a NumberV equaling 5 when true', function() : void {
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

        //select condition node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step condition node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //parse condition node to select the first expr sequence
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step expr seq node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select number literal 5
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
        assert.check(val instanceof NumberV, "The value is not a NumberV.");
        const result : number = (val as NumberV).getVal();
        assert.check(result === 5, "It did not return 5 as expected. It returned " + result);

    });

    it('should evaluate to a NumberV equaling 7 when false', function() : void {
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

        //parse condition node to select the second expr sequence
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step expr seq node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

        //select number literal 7
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
        assert.check(val instanceof NumberV, "The value is not a Numberv.");
        const result : number = (val as NumberV).getVal();
        assert.check(result === 7, "It did not return 7 as expected. It returned " + result);
    });
});

//test this here since it is needed for while
describe('scrub', function () : void {
    it ('should unmap a single element', function () : void {
        //setup
        const numberNode : PNode = labels.mkNumberLiteral("5");
        const root : PNode = new PNode(new ExprSeqLabel(), [numberNode]);
        const vm = makeStdVMS( root )  ;

        //run test
        //select expr seq node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step expr seq node
        assert.check(vm.isReady(), "VMS is not ready when it should be.");
        vm.advance();

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

    it ('should unmap two elements', function () : void {
        //setup
        const numberNode : PNode = labels.mkNumberLiteral("5");
        const stringNode : PNode = labels.mkStringLiteral("hello");
        const root : PNode = new PNode(new ExprSeqLabel(), [numberNode, stringNode]);
        const vm = makeStdVMS( root )  ;

        //run test
        //select expr seq node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step expr seq node
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
        assert.check(vm.isChildMapped(0), "The number literal is not mapped.");
        assert.check(vm.isChildMapped(1), "The string literal is not mapped.");

        //scrub the node
        vm.scrub(vm.getPending());

        //ensure that it is no longer mapped
        assert.check(!vm.isChildMapped(0), "The number literal is still mapped.");
        assert.check(!vm.isChildMapped(1), "The string literal is still mapped.");
    });
    it ('should unmap four elements', function ()  : void {
        //setup
        const numberNode : PNode = labels.mkNumberLiteral("5");
        const stringNode : PNode = labels.mkStringLiteral("hello");
        const numberNode2 : PNode = labels.mkNumberLiteral("6");
        const stringNode2 : PNode = labels.mkStringLiteral("goodbye");
        const root : PNode = new PNode(new ExprSeqLabel(), [numberNode, stringNode, numberNode2, stringNode2]);
        const vm = makeStdVMS( root )  ;

        //run test
        //select expr seq node
        assert.check(!vm.isReady(), "VMS is ready when it should not be.");
        vm.advance();

        //step expr seq node
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
        const varDeclNode : PNode = new PNode(varDeclLabel, [variableNode, typeNode, valueNode]);
        const root : PNode = labels.mkExprSeq( [varDeclNode] ) ;
        const vm = makeStdVMS( root )  ;

        //run the test
        const stackDepth = vm.getEval().getStack().getAllFrames().length ;
        // step the expr seq node to create a new stack frame.
        selectAndStep( vm ) ; 

        const newStackDepth = vm.getEval().getStack().getAllFrames().length ;
        assert.checkEqual( stackDepth+1, newStackDepth ) ;
        
        assert.check( vm.getEval().getStack().hasField( "a" ) ) ;
        const f : vms.FieldI = vm.getEval().getStack().getField( "a" ) ;
        assert.check( f.getIsDeclared() === false ) ;

        // step the mumber literal node
        selectAndStep( vm ) ;

        // step the declaration node
        selectAndStep( vm ) ;

        assert.check( vm.getEval().getStack().hasField( "a" ) ) ;
        const f1 : vms.FieldI = vm.getEval().getStack().getField( "a" ) ;
        assert.check( f === f1 ) ;
        assert.check( f.getIsDeclared() === true ) ;
        assert.check( f.getValue() instanceof NumberV ) ;
        assert.check( (f.getValue() as NumberV ).getVal() === 5 ) ;

        // step the expr seq node
        selectAndStep( vm ) ;

        const finalStackDepth = vm.getEval().getStack().getAllFrames().length ;
        assert.checkEqual( finalStackDepth, stackDepth ) ;

        assert.check(vm.isDone(), "VMS is not done");
        assert.check(vm.isMapped(emptyList), "Empty list is not mapped.");
        assert.check( vm.getVal( emptyList ) instanceof valueTypes.DoneV ) ;
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

        // Select the expr seq node
        vm.advance() ;
        // Step the expr seq node
        vm.advance() ;
        assert.check( vm.hasError() ) ;
        assert.checkEqual( "Variable 'a' is declared twice.", vm.getError() ) ;
    });

    it('should declare variables with no initializer', function () : void {
        //setup
        const variableNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const noExpNode : PNode = labels.mkNoExpNd( ) ;
        const varDeclNode1 : PNode = labels.mkVarDecl(variableNode, typeNode, noExpNode);
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [varDeclNode1]);
        const vm = makeStdVMS( root )  ;

        // Select the expr seq node
        vm.advance() ;
        // Step the expr seq node
        vm.advance() ;
        const field = vm.getStack().getField( "a" ) ;
        assert.check( ! field.getIsDeclared() ) ;
        assert.check( ! vm.isMapped( list(0) ) ) ;
        // Select the variable declaration node
        vm.advance() ;
        // Step the variable declaration node
        vm.advance() ;
        assert.check( field.getIsDeclared() ) ;
        assert.check( field.getValue().isNullV() ) ;
        assert.check( vm.isMapped( list(0) ) ) ;
        assert.check( vm.getVal( list(0) ).isDoneV() ) ;
        // Select and step the expr seq node again.
        vm.advance() ;
        vm.advance() ;
        assert.check( vm.isDone() ) ;
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

        //run the test until the top evaluation is done or there is an error
        while( vm.canAdvance() && ! vm.isDone() ) {
            vm.advance() ; }

        assert.check(vm.isDone(), "VMS is not done.");
        assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
        const val : Value = vm.getVal(emptyList);
        assert.check(val instanceof NumberV, "The value is not a NumberV.");
        const result : number = (val as NumberV ).getVal();
        assert.check(result === 1729, "It did not return 1729 as expected. It returned " + result);
    });

    it('should fail if used before being declared', function () : void {
        //setup
        const varNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode : PNode = labels.mkNumberLiteral("1729");
        const varDeclNode : PNode = labels.mkVarDecl(varNode, typeNode, valueNode);
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [varNode, varDeclNode]);
        const vm = makeStdVMS( root )  ;

        //run the test until the top evaluation is done or there is an error
        while( vm.canAdvance() && ! vm.isDone() ) {
            vm.advance() ; }

        
        assert.check( vm.hasError() ) ;
        assert.checkEqual( "The variable named 'a' has not been declared yet.", vm.getError() ) ;
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
        assert.check( vm.getError() === "No variable named 'a' is in scope." ) ;
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
        assert.checkEqual( "No variable named 'a' is in scope.", vm.getError() ) ;

    });

    it('should assign a new value to a previously declared variable', function () : void {
        //setup
        // exprSeq( decl a:= 1, a := 2, a )
        const assignLabel : AssignLabel = labels.AssignLabel.theAssignLabel;
        const variableNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode1 : PNode = labels.mkNumberLiteral("1");
        const valueNode2 : PNode = labels.mkNumberLiteral("2");
        const varDeclNode : PNode = labels.mkVarDecl(variableNode, typeNode, valueNode1);
        const assignNode : PNode = new PNode(assignLabel, [variableNode, valueNode2]);
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [varDeclNode, assignNode, variableNode]);
        const vm = makeStdVMS( root )  ;

        //run the test until the top evaluation is done or there is an error
        while( vm.canAdvance() && ! vm.isDone() ) {
            vm.advance() ; }

        assert.check(vm.isDone(), "VMS is not done.");
        assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
        const val : Value = vm.getVal(emptyList);
        assert.check(val instanceof NumberV, "The value is not a NumberV.");
        const result : number = (val as NumberV).getVal();
        assert.check(result === 2, "It did not return 2 as expected. It returned " + result);
    });

    it('should fail if assigning to a constant', function () : void {
        //setup
        // exprSeq( decl a:= 1, a := 2, a )
        const assignLabel : AssignLabel = labels.AssignLabel.theAssignLabel;
        const variableNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode1 : PNode = labels.mkNumberLiteral("1");
        const valueNode2 : PNode = labels.mkNumberLiteral("2");
        const varDeclNode : PNode = labels.mkConstDecl(variableNode, typeNode, valueNode1);

        const assignNode : PNode = new PNode(assignLabel, [variableNode, valueNode2]);
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [varDeclNode, assignNode, variableNode]);
        const vm = makeStdVMS( root )  ;

        //run the test until the top evaluation is done or there is an error
        while( vm.canAdvance() && ! vm.isDone() ) {
            vm.advance() ; }
        
        assert.check( vm.hasError() ) ;
        assert.checkEqual( "The variable named 'a' is a constant and may not be assigned.", vm.getError() ) ;
    });

    it('should fail when trying to assign to a variable not yet declared', function () : void {
        //setup
        // exprSeq( a := 2, decl a: := 1 )
        const assignLabel : AssignLabel = labels.AssignLabel.theAssignLabel;
        const variableNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode1 : PNode = labels.mkNumberLiteral("1");
        const valueNode2 : PNode = labels.mkNumberLiteral("2");
        const varDeclNode : PNode = labels.mkVarDecl(variableNode, typeNode, valueNode1);
        const assignNode : PNode = new PNode(assignLabel, [variableNode, valueNode2]);
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [assignNode, varDeclNode]);
        const vm = makeStdVMS( root )  ;

        //run the test until the top evaluation is done or there is an error
        while( vm.canAdvance() && ! vm.isDone() ) {
            vm.advance() ; }
        
        assert.check( vm.hasError() ) ;
        assert.checkEqual( "The variable named 'a' has not been declared yet.", vm.getError() ) ;
    });

    it('should fail when trying to assign to something that is not a variable', function () : void {
        //setup
        // exprSeq( a := 2, decl a: := 1 )
        const assignLabel : AssignLabel = labels.AssignLabel.theAssignLabel;
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode1 : PNode = labels.mkNumberLiteral("1");
        const valueNode2 : PNode = labels.mkNumberLiteral("2");
        const assignNode : PNode = new PNode(assignLabel, [valueNode1, valueNode2]);
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [assignNode]);
        const vm = makeStdVMS( root )  ;

        //run the test until the top evaluation is done or there is an error
        while( vm.canAdvance() && ! vm.isDone() ) {
            vm.advance() ; }
        
        assert.check( vm.hasError() ) ;
        assert.checkEqual( "Attempting to assign to something that isn't a variable.", vm.getError()) ;
    });

    it('should assign to the field of an object', function(): void {
      const field = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const object = new PNode(new labels.ObjectLiteralLabel(), [field]);
      const objDecl = mkVarDecl(mkVar("obj"), mkNoTypeNd(), object);
      const accesor1 = new PNode(labels.AccessorLabel.theAccessorLabel, [mkVar("obj"), labels.mkStringLiteral("x")]);
      const val = mkNumberLiteral("10");
      const assign = new PNode(labels.AssignLabel.theAssignLabel, [accesor1, val]);
      const accessor2 = new PNode(labels.AccessorLabel.theAccessorLabel, [mkVar("obj"), labels.mkStringLiteral("x")]);
      const root = new PNode(new labels.ExprSeqLabel(), [objDecl, assign, accessor2]) ;
      const vm = makeStdVMS(root);

      //run the test until the top evaluation is done or there is an error
      while( vm.canAdvance() && ! vm.isDone() ) {
          vm.advance() ; }
      assert.check(vm.isDone(), "VMS is not done.");
      assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
      const value : Value = vm.getVal(emptyList);
      assert.check(value instanceof NumberV, "The value is not a NumberV.");
      const result : number = (value as NumberV).getVal();
      assert.check(result === 10, "It did not return 10 as expected. It returned " + result); 
    });

    it('should fail to assign to field if object does contain that field', function(): void {
      const field = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const object = new PNode(new labels.ObjectLiteralLabel(), [field]);
      const objDecl = mkVarDecl(mkVar("obj"), mkNoTypeNd(), object);
      const accesor1 = new PNode(labels.AccessorLabel.theAccessorLabel, [mkVar("obj"), labels.mkStringLiteral("y")]);
      const val = mkNumberLiteral("10");
      const assign = new PNode(labels.AssignLabel.theAssignLabel, [accesor1, val]);
      const accessor2 = new PNode(labels.AccessorLabel.theAccessorLabel, [mkVar("obj"), labels.mkStringLiteral("x")]);
      const root = new PNode(new labels.ExprSeqLabel(), [objDecl, assign, accessor2]) ;
      const vm = makeStdVMS(root);

      //run the test until the top evaluation is done or there is an error
      while( vm.canAdvance() && ! vm.isDone() ) {
          vm.advance() ; }
  
      assert.check( vm.hasError() ) ;
      assert.checkEqual( "Object has no field named 'y'.", vm.getError() ) ;
    });

    it('should fail to assign if object is not in scope', function(): void {
      const field = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const object = new PNode(new labels.ObjectLiteralLabel(), [field]);
      const objDecl = mkVarDecl(mkVar("obj"), mkNoTypeNd(), object);
      const accesor1 = new PNode(labels.AccessorLabel.theAccessorLabel, [mkVar("NoObj"), labels.mkStringLiteral("x")]);
      const val = mkNumberLiteral("10");
      const assign = new PNode(labels.AssignLabel.theAssignLabel, [accesor1, val]);
      const root = new PNode(new labels.ExprSeqLabel(), [objDecl, assign]) ;
      //  We have expSeq( varDecl[false]( Variable["obj"],
      //                                  NoType,
      //                                  objectLiteral(
      //                                         varDecl( Variable("x", NoType, NumberLiteral["5"] ) ) ),
      //                  Assign( Accessor( Variable["NoObj"], StringLiteral["x"] ),
      //                          NumberLiteral["10"] ) )
      //
      const vm = makeStdVMS(root);

      //run the test until the top evaluation is done or there is an error
      while( vm.canAdvance() && ! vm.isDone() ) {
          vm.advance() ; }
  
      assert.check( vm.hasError() ) ;
      assert.checkEqual( "No variable named 'NoObj' is in scope.", vm.getError() ) ;
    });

    it('should assign to a field of an object within another object', function(): void {
      const field = mkVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("123"));
      const innerObj = new PNode(new labels.ObjectLiteralLabel(), [field]);
      const outerObj = new PNode(new labels.ObjectLiteralLabel(), [mkVarDecl(mkVar("io"), mkNoTypeNd(), innerObj)]);
      const objDecl = mkVarDecl(mkVar("o"), mkNoTypeNd(), outerObj);
      const accessor1 = new PNode(labels.AccessorLabel.theAccessorLabel, [mkVar("o"), labels.mkStringLiteral("io")]);
      const accessor2 = new PNode(labels.AccessorLabel.theAccessorLabel, [accessor1, labels.mkStringLiteral("x")]);
      const assign = new PNode(labels.AssignLabel.theAssignLabel, [accessor2, mkNumberLiteral("666")]);
      const accessor3 = new PNode(labels.AccessorLabel.theAccessorLabel, [accessor1, labels.mkStringLiteral("x")]);
      const root = mkExprSeq([objDecl, assign, accessor3]);
      const vm = makeStdVMS(root);
      //run the test until the top evaluation is done or there is an error
      while( vm.canAdvance() && ! vm.isDone() ) {
          vm.advance() ; } 
      assert.check(vm.isDone(), "VMS is not done.");
      assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
      const value : Value = vm.getVal(emptyList);
      assert.check(value instanceof NumberV, "The value is not a NumberV.");
      const result : number = (value as NumberV).getVal();
      assert.check(result === 666, "It did not return 666 as expected. It returned " + result);
    });
});

describe('WhileLabel', function () : void {
    it('should not work when the guard does not evaluate to true or false', function () : void {
        //setup  while( "not_a_boolean ", exprSeq( 5 ) )
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
        //setup   while( "true", exprSeq( 5 ) )
        const guardNode : PNode = labels.mkTrueBooleanLiteral();
        const numberNode : PNode = labels.mkNumberLiteral("5");
        const bodyNode : PNode = new PNode(new labels.ExprSeqLabel(), [numberNode]);
        const whileNode : PNode = labels.mkWhile(guardNode, bodyNode);
        const vm = makeStdVMS( whileNode )  ;

        //run the test
        selectAndStep( vm ) ; // The guard, which is true

        vm.advance() ; // Select the body
        assert.check( vm.isReady() ) ;
        assert.check( vm.getPending().equals( collections.list(1) ) ) ;
        
        assert.check( vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( ! vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( ! vm.getValMap().isMapped( collections.list(1,0) ) );
        assert.check( ! vm.hasExtraInformation() ) ;

        vm.advance() ; // Step the body for the first time this iteration
        assert.check( ! vm.isReady() ) ;
        assert.check( vm.getPending().equals( collections.list(1) ) ) ;
        
        assert.check( vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( ! vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( ! vm.getValMap().isMapped( collections.list(1,0) ) );
        assert.check( vm.hasExtraInformation() ) ;

        selectAndStep( vm ) ; // The number node.

        selectAndStep( vm ) ; // The expression seq again

        // So the expression seq is now mapped.
        assert.check( ! vm.isReady() ) ;
        assert.check( vm.getPending().equals( collections.list() ) ) ;

        assert.check( vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( vm.getValMap().isMapped( collections.list(1,0) ) );
        // TODO Check that the expr seq has extra information still

        // Select the guard again.  This should have the side effect of scrubbing.
        vm.advance() ;
        assert.check( vm.isReady() ) ;
        assert.check( vm.getPending().equals( collections.list(0) ) ) ;
        
        assert.check( ! vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( ! vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( ! vm.getValMap().isMapped( collections.list(1,0) ) );
        // TODO Find a way to check that the extra information on the ExpSeq was scrubbed

        //  Run a second iteration 
        vm.advance() ; // Step the guard.

        vm.advance() ; // Select the body
        assert.check( vm.isReady() ) ;
        assert.check( vm.getPending().equals( collections.list(1) ) ) ;
        
        assert.check( vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( ! vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( ! vm.getValMap().isMapped( collections.list(1,0) ) );
        assert.check( ! vm.hasExtraInformation() ) ;

        vm.advance() ; // Step the body for the first time this iteration
        assert.check( ! vm.isReady() ) ;
        assert.check( vm.getPending().equals( collections.list(1) ) ) ;
        
        assert.check( vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( ! vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( ! vm.getValMap().isMapped( collections.list(1,0) ) );
        assert.check( vm.hasExtraInformation() ) ;

        selectAndStep( vm ) ; // The number node.

        selectAndStep( vm ) ; // The expression seq again

        // So the expression seq is now mapped.
        assert.check( ! vm.isReady() ) ;
        assert.check( vm.getPending().equals( collections.list() ) ) ;

        assert.check( vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( vm.getValMap().isMapped( collections.list(1,0) ) );
        // TODO Check that the expr seq has extra information still

        // Select the guard again.  This should have the side effect of scrubbing.
        vm.advance() ;
        assert.check( vm.isReady() ) ;
        assert.check( vm.getPending().equals( collections.list(0) ) ) ;
        
        assert.check( ! vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( ! vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( ! vm.getValMap().isMapped( collections.list(1,0) ) );
        // TODO Find a way to check that the extra information on the ExpSeq was scrubbed

    });

    it('should run one time when flipping the value of the guard in the body', function () : void {
        //setup:  seq( decl guard:= true,
        //             while( guard,
        //                    seq( guard := false ) ),
        //             guard ) 
        const guardNode : PNode = labels.mkVar("guard");
        const trueNode : PNode = labels.mkTrueBooleanLiteral();
        const varDeclNode : PNode = labels.mkVarDecl(guardNode, labels.mkNoTypeNd(), trueNode);
        const falseNode : PNode = labels.mkFalseBooleanLiteral();
        const assignNode : PNode = new PNode(labels.AssignLabel.theAssignLabel, [guardNode, falseNode]);
        const bodyNode : PNode = new PNode(new labels.ExprSeqLabel(), [assignNode]);
        const whileNode : PNode = labels.mkWhile(guardNode, bodyNode);
        const root : PNode = new PNode(new ExprSeqLabel(), [varDeclNode, whileNode, guardNode]);
        const vm = makeStdVMS( root )  ;

        //run the test.  We expect to select  and step the following nodes.
        const nodes = [root, trueNode, varDeclNode,
                       guardNode, bodyNode, falseNode, assignNode, bodyNode,
                       guardNode, whileNode,
                       guardNode, root ] ;
        
        let i = 0 ;
        nodes.forEach( (n : PNode) : void => {
            assert.check( vm.canAdvance() ) ;
            assert.check( !vm.isReady()  ) ;
            vm.advance() ; // Select
            assert.check( vm.isReady()  ) ;
            assert.check( vm.getPendingNode() === n,
                          "Wrong node selected on iteration " +i+ ".\nSelected " +vm.getPendingNode()
                          + "\nrather than " +n+ ".") ;
            vm.advance() ; // Step
            i += 1 ;
        } ) ;

        assert.check(vm.isDone(), "VMS is not done.");
        assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
        const val : Value = vm.getVal(emptyList);
        assert.check(val instanceof BoolV, "The value is not a BoolV.");
        const result : boolean = (val as BoolV).getVal();
        assert.check(result === false, "It did not return false as expected. It returned " + result);

    }) ;

});

describe('ExprPHLable', function () : void {
    it('should cause an error', function () : void {
        const phNode : PNode = labels.mkExprPH( ) ;
        const vm = makeStdVMS( phNode )  ;

        vm.advance();
        vm.advance();

        assert.check( vm.hasError() ) ;
        assert.check( vm.getError() === "Missing code." ) ;
    });
});

function selectAndStep( vm : VMS ) : void {
    assert.checkPrecondition(!vm.isReady() ) ;
    // Select
    vm.advance();
    assert.check(vm.isReady(), "VMS is not ready when it should be.");
    // Step
    vm.advance();
}
