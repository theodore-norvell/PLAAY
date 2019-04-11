/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../interpreter.ts" />
/// <reference path="../library.ts" />
/// <reference path="../labels.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../types.ts" />
/// <reference path="../values.ts" />
/// <reference path="../vms.ts" />

import assert = require( '../assert' ) ;
import backtracking = require( '../backtracking' ) ;
import collections = require( '../collections' ) ;
import interpreter = require( '../interpreter' ) ;
import labels = require( '../labels' ) ;
import library = require('../library') ;
import pnode = require( '../pnode' ) ;
import types = require('../types') ;
import values = require( '../values' ) ;
import vms = require( '../vms' ) ;

import Evaluation = vms.Evaluation;
import VMS = vms.VMS;
import World = library.World;
import Field = values.Field;
import Type = types.TypeKind;
import VarStack = vms.VarStack;
import ObjectV = values.ObjectV;
import ClosureV = values.ClosureV;
import StringV = values.StringV;
import NumberV = values.NumberV;
import LocationV = values.LocationV;
import BoolV = values.BoolV;
import TupleV = values.TupleV;
import NullV = values.NullV;
import PNode = pnode.PNode ;
import { mkAccessor, mkAssign, mkCall, mkConstDecl, mkDot, mkExprSeq,
         mkLambda, mkLoc, mkNoExpNd, mkNoTypeNd, mkNumberLiteral, mkObject, mkOpenCallVar,
         mkParameterList, mkPrimitiveTypeLabel, mkTuple, mkVar, mkLocVarDecl, mkVarOrLocDecl }
       from '../labels';
import TransactionManager = backtracking.TransactionManager ;
import {ExprSeqLabel, IfLabel, NumberLiteralLabel, VarDeclLabel, VariableLabel} from "../labels";
import {Value} from "../vms";

const emptyList = collections.nil<number>() ;
const list = collections.list ;
const interp = interpreter.getInterpreter() ;



const zero = labels.mkNumberLiteral("0");
const two = labels.mkNumberLiteral("2");  
const three = labels.mkNumberLiteral("3");
const five = labels.mkNumberLiteral("5");
const nine = labels.mkNumberLiteral("9");

function makeStdVMS( root : PNode ) : VMS {
  const manager = new TransactionManager() ;
  const wld = new World(manager);
  const wlds : Array<ObjectV> = new Array();
  wlds.push(wld);
  return new VMS( root, wlds, interp, manager ) ;
}

function getResult( root : PNode ) : Value {
    const vm = makeStdVMS(root);
    while( vm.canAdvance() ) { vm.advance(); }
    if( vm.hasError() ) {
        assert.check( false, "Unexpected Error: " + vm.getError() ) ; }
    return vm.getFinalValue() ;
}

function expectError( root : PNode, message : string ) : void {
    const vm = makeStdVMS(root);
    while( vm.canAdvance() ) { vm.advance(); }
    assert.check( vm.hasError(), "Expected error, but got none." ) ;
    assert.checkEqual( message, vm.getError() ) ;
}

describe( 'StringLiteralLabel', function() : void {
    const label = new labels.StringLiteralLabel( "hello", false ) ;
    const root = new PNode( label, [] ) ;
    const vm = makeStdVMS( root )  ;

    it('should evaluate to a StringV', function() : void {
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( vm.evalIsReadyToStep() ) ;
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
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === Number(label.getVal()) ) ;
    } );

    it('should error out on a bad numebr', function() : void {
        const label = new labels.NumberLiteralLabel( "123abc", false ) ;
        const root = new PNode( label, [] ) ;
        const vm = makeStdVMS( root )  ;
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( vm.hasError() ) ;
        assert.checkEqual( "Not a valid number.", vm.getError() ) ;
    } );
} ) ;

describe( 'BooleanLiteralLabel', function() : void {
    const label = new labels.BooleanLiteralLabel( "true", false ) ;
    const root = new PNode( label, [] ) ;
    const vm = makeStdVMS( root )  ;

    it('should evaluate to a BoolV', function() : void {
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( vm.evalIsReadyToStep() ) ;
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
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof NullV ) ;
    } );
} ) ;

describe ('LambdaLabel', function() : void {
    const paramlist = mkParameterList([mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNoExpNd())]);
    const root = mkLambda(paramlist, mkNoTypeNd(), mkExprSeq([mkNumberLiteral("1")]));
    const vm = makeStdVMS(root);

    it('should evaluate to a ClosureV', function(): void {
        assert.check(!vm.evalIsReadyToStep());
        vm.advance();
        assert.check(vm.evalIsReadyToStep());
        vm.advance();
        assert.check(vm.isDone());
        assert.check(vm.isMapped(emptyList));
        const val = vm.getVal(emptyList);
        assert.check(val instanceof ClosureV);
        assert.check((val as ClosureV).getLambdaNode().label() instanceof labels.LambdaLabel);
    });
});

describe ('LambdaLabel w/ duplicate parameter names', function() : void {
  const paramlist = mkParameterList([mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNoExpNd()), mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNoExpNd())]);
  const root = mkLambda(paramlist, mkNoTypeNd(), mkExprSeq([mkNumberLiteral("1")]));
  const vm = makeStdVMS(root);

  it('should fail with duplicate parameter names', function(): void {
      assert.check(!vm.evalIsReadyToStep());
      vm.advance();
      assert.check(vm.evalIsReadyToStep());
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

describe ('Call - method', function(): void {
    // con a : noType := object( 
    //                           var x : noType := 0
    //                           const f : notType := lambda con y : noType := noExp
    //                                                 -> noType { x := x + y } )
    // a.f _ 2
    // a.f _ 3
    // a.x // Should equal 5
    const decla =   mkConstDecl( mkVar("a"),
                                 mkNoTypeNd(),
                                 mkObject([
                                            mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("0")),
                                            mkConstDecl(mkVar("f"), mkNoTypeNd(),
                                                        mkLambda( mkParameterList([mkConstDecl(mkVar("y"), mkNoTypeNd(), mkNoExpNd())]),
                                                                  mkNoTypeNd(),
                                                                  mkExprSeq([
                                                                mkAssign( mkVar("x"),
                                                                          mkOpenCallVar("+", [mkVar("x"), mkVar("y")]))
                                                                ]) ))
                                    ]));
    const add2 = mkCall( mkDot( "f", false, mkVar("a") ),
                         mkNumberLiteral("2") ) ;
    const add3 = mkCall( mkDot( "f", false, mkVar("a") ),
                         mkNumberLiteral("3") ) ;
    const aDotx = mkDot( "x", false, mkVar("a") ) ;
    const root = mkExprSeq( [decla, add2, add3, aDotx] ) ;

    it('should evaluate done', function() : void {

        const vm = makeStdVMS(root) ;
        while ( vm.canAdvance() ) {
            vm.advance() ;
        }
        const error = vm.hasError() ? vm.getError() : "" ;
        assert.checkEqual( "", error ) ;
        const val = vm.getFinalValue() ;
        assert.check(val instanceof NumberV) ;
        assert.check((val as NumberV).getVal() === 5) ;
  });
});

describe ('CallWorldLabel - closure (no arguments)', function(): void {
    const lambda = mkLambda(mkParameterList([]), mkNoTypeNd(), mkExprSeq([mkNumberLiteral("42")]));
    const lambdaDecl = mkLocVarDecl(mkVar("f"), mkNoTypeNd(), lambda);
    const callWorld = new PNode(new labels.CallVarLabel("f", false), []);
    const root = mkExprSeq([lambdaDecl, callWorld]);
    // {  var f : := \ -> { 42 }
    //    callWorld[f]()
    // }
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
    const paramlist = mkParameterList([mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNoExpNd()), mkLocVarDecl(mkVar("y"), mkNoTypeNd(), mkNoExpNd())]);
    const lambdaBody = mkExprSeq([mkOpenCallVar("*", [mkVar("x"), mkVar("y")])]);
    const lambda = mkLambda(paramlist, mkNoTypeNd(), lambdaBody);
    const lambdaDecl = mkLocVarDecl(mkVar("f"), mkNoTypeNd(), lambda);
    const callWorld = new PNode(new labels.CallVarLabel("f", false), [mkNumberLiteral("3"), mkNumberLiteral("5")]);
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
    const varDecl = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("3"));
    const lambdaBody = mkExprSeq([mkOpenCallVar("+", [mkVar("x"), mkNumberLiteral("5")])]);
    const lambda = mkLambda(mkParameterList([]), mkNoTypeNd(), lambdaBody);
    const lambdaDecl = mkLocVarDecl(mkVar("f"), mkNoTypeNd(), lambda);
    const callWorld = new PNode(new labels.CallVarLabel("f", false), []);
    const root = mkExprSeq([varDecl, lambdaDecl, callWorld]);

    it('should evaluate to a NumberV equaling 8', function() : void {
        const val = getResult(root) ;
        assert.check(val instanceof NumberV);
        assert.check((val as NumberV).getVal() === 8 );
  });
});

describe( 'CallWorldLabel - addition', function() : void {
  const rootlabel = new labels.CallVarLabel("+", false);
  const op1 = labels.mkNumberLiteral("2");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a NumberV equaling 5', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof NumberV ) ;
      assert.check( (val as NumberV).getVal() === 5);
  } );
} ) ;

describe( 'CallWorldLabel - subtraction', function() : void {
  const op1 = labels.mkNumberLiteral("5");
  const op2 = labels.mkNumberLiteral("3");
  const op3 = labels.mkNumberLiteral("7");


  it('callWorld["-"]() should equal 0', function() : void {
    const root = mkOpenCallVar("-", []) ;
    const val = getResult( root ) ;
    assert.check( val instanceof NumberV ) ;
    assert.check( (val as NumberV).getVal() === 0 );
  } );


  it('callWorld["-"](5) should equal 5', function() : void {
    const root = mkOpenCallVar("-", [op1]) ;
    const val = getResult( root ) ;
    assert.check( val instanceof NumberV ) ;
    assert.check( (val as NumberV).getVal() === -5 );
  } );

  it('callWorld["-"](5, 3) should equal 2', function() : void {
      const root = mkOpenCallVar("-", [op1, op2]) ;
      const val = getResult( root ) ;
      assert.check( val instanceof NumberV ) ;
      assert.check( (val as NumberV).getVal() === 2 );
  } );

  it('callWorld["-"](5, 3, 7 ) should equal -5', function() : void {
      const root = mkOpenCallVar("-", [op1, op2, op3]) ;
      const val = getResult( root ) ;
      assert.check( val instanceof NumberV ) ;
      assert.check( (val as NumberV).getVal() === -5 );
  } );
} ) ;

describe( 'CallWorldLabel - multiplication', function() : void {


    it('*() should give 1', function() : void {
        const root = mkOpenCallVar("*", [] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 1);
    } );

    it('*(two) should give 2', function() : void {
        const root = mkOpenCallVar("*", [two] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 2);
    } );

    it('nine * three should give 27', function() : void {
        const root = mkOpenCallVar("*", [nine, three] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 27);
    } );

    it('* nine three two should give 54', function() : void {
        const root = mkOpenCallVar("*", [nine, three, two] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 54);
    } );

} ) ;

describe( 'CallWorldLabel - division', function() : void {

    it('/() should give 1', function() : void {
        const root = mkOpenCallVar("/", [] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 1);
    } );

    it('/ two should give 0.5', function() : void {
        const root = mkOpenCallVar("/", [two] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 0.5);
    } );

    it('nine / three should give 3', function() : void {
        const root = mkOpenCallVar("/", [nine, three] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 3);
    } );

    it('five / two should give 2.5', function() : void {
        const root = mkOpenCallVar("/", [five, two] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 2.5);
    } );

    it('/ nine three two should give 1.5', function() : void {
        const root = mkOpenCallVar("/", [nine, three, two] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 1.5);
    } );

    it('/ zero should give +infinity', function() : void {
        const root = mkOpenCallVar("/", [zero] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 1/0);
    } );

    it('two / zero should give +infinity', function() : void {
        const root = mkOpenCallVar("/", [two, zero] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 1/0);
    } );

    it('/(2,0,5) should give +infinity', function() : void {
        const root = mkOpenCallVar("/", [two, zero, five] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.check( (val as NumberV).getVal() === 1/0);
    } );

    it('zero / two should give zero', function() : void {
        const root = mkOpenCallVar("/", [zero, two] ) ;
        const val = getResult( root ) ;
        assert.check( val instanceof NumberV ) ;
        assert.checkEqual( 0.0, (val as NumberV).getVal() );
    } );
} ) ;

describe( 'CallWorldLabel - greater than', function() : void {
  const rootlabel = new labels.CallVarLabel(">", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - greater than', function() : void {
  const rootlabel = new labels.CallVarLabel(">", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("300");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - greater than or equal', function() : void {
  const rootlabel = new labels.CallVarLabel(">=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - greater than or equal', function() : void {
  const rootlabel = new labels.CallVarLabel(">=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("300");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - greater than or equal', function() : void {
  const rootlabel = new labels.CallVarLabel(">=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("10");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - less than', function() : void {
  const rootlabel = new labels.CallVarLabel("<", false);
  const op1 = labels.mkNumberLiteral("1");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - less than', function() : void {
  const rootlabel = new labels.CallVarLabel("<", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - less than or equal', function() : void {
  const rootlabel = new labels.CallVarLabel("<=", false);
  const op1 = labels.mkNumberLiteral("1");
  const op2 = labels.mkNumberLiteral("3");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - less than or equal', function() : void {
  const rootlabel = new labels.CallVarLabel("<=", false);
  const op1 = labels.mkNumberLiteral("1000");
  const op2 = labels.mkNumberLiteral("300");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - less than or equal', function() : void {
  const rootlabel = new labels.CallVarLabel("<=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("10");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
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
    const rootLabel = new labels.CallVarLabel("=",false);
    const op1 = labels.mkTrueBooleanLiteral();
    const op2 = labels.mkFalseBooleanLiteral();
    const op3 = labels.mkTrueBooleanLiteral();
    const op4 = labels.mkFalseBooleanLiteral();
    const root1 = new PNode(rootLabel, [op1,op3]);
    const root2 = new PNode(rootLabel, [op2,op4]);
    const vm1 = makeStdVMS( root1 );
    const vm2 = makeStdVMS( root2 );

    it( 'should evaluate to a BoolV equalling true', function() : void {
      assert.check( ! vm1.evalIsReadyToStep() ) ;
      vm1.advance() ;
      assert.check(  vm1.evalIsReadyToStep() ) ;
      vm1.advance() ;
      assert.check( ! vm1.evalIsReadyToStep() ) ;
      vm1.advance() ;
      assert.check(  vm1.evalIsReadyToStep() ) ;
      vm1.advance() ;
      assert.check( ! vm1.evalIsReadyToStep() ) ;
      vm1.advance() ;
      assert.check(  vm1.evalIsReadyToStep() ) ;
      vm1.advance() ;
      
      assert.check( ! vm2.evalIsReadyToStep() ) ;
      vm2.advance() ;
      assert.check(  vm2.evalIsReadyToStep() ) ;
      vm2.advance() ;
      assert.check( ! vm2.evalIsReadyToStep() ) ;
      vm2.advance() ;
      assert.check(  vm2.evalIsReadyToStep() ) ;
      vm2.advance() ;
      assert.check( ! vm2.evalIsReadyToStep() ) ;
      vm2.advance() ;
      assert.check(  vm2.evalIsReadyToStep() ) ;
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
    }) ;
});

/* Test for (true = x) = (x = true) = false for any x not true */
describe( 'CallWorldLabel - equal', function() : void {
    const rootLabel = new labels.CallVarLabel("=",false);
    const op1 = labels.mkTrueBooleanLiteral();
    const op2 = labels.mkNumberLiteral("123");
    const root = new PNode(rootLabel, [op1,op2,op2,op1]);
    const vm = makeStdVMS( root );
    
    it( 'should evaluate to a BoolV equalling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;

      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val1 = vm.getVal( emptyList ) ;
      assert.check( val1 instanceof BoolV ) ;
      assert.check( (val1 as BoolV).getVal()  === false);
    }) ;
});

/* Test for (false = x) = (x = false) = false for any x not false */
describe( 'CallWorldLabel - equal', function() : void {
    const rootLabel = new labels.CallVarLabel("=",false);
    const op1 = labels.mkFalseBooleanLiteral();
    const op2 = labels.mkNumberLiteral("123");
    const root = new PNode(rootLabel, [op1,op2,op2,op1]);
    const vm = makeStdVMS( root );
    
    it( 'should evaluate to a BoolV equalling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;

      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val1 = vm.getVal( emptyList ) ;
      assert.check( val1 instanceof BoolV ) ;
      assert.check( (val1 as BoolV).getVal()  === false);
    }) ;
});

describe( 'CallWorldLabel - equal', function() : void {
  const rootlabel = new labels.CallVarLabel("=", false);
  const op1 = labels.mkNumberLiteral("10");
  const op2 = labels.mkNumberLiteral("10");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - equal', function() : void {
  const rootlabel = new labels.CallVarLabel("=", false);
  const op1 = labels.mkStringLiteral("This is a string");
  const op2 = labels.mkStringLiteral("This is not the same string");
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - logical and', function() : void {
  const rootlabel = new labels.CallVarLabel("and", false);
  const op1 = labels.mkTrueBooleanLiteral();
  const op2 = labels.mkTrueBooleanLiteral();
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - logical and', function() : void {
  const rootlabel = new labels.CallVarLabel("and", false);
  const op1 = labels.mkTrueBooleanLiteral();
  const op2 = labels.mkFalseBooleanLiteral();
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - logical or', function() : void {
  const rootlabel = new labels.CallVarLabel("or", false);
  const op1 = labels.mkTrueBooleanLiteral();
  const op2 = labels.mkTrueBooleanLiteral();
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - logical or', function() : void {
  const rootlabel = new labels.CallVarLabel("or", false);
  const op1 = labels.mkTrueBooleanLiteral();
  const op2 = labels.mkFalseBooleanLiteral();
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling true', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === true);
  } );
} ) ;

describe( 'CallWorldLabel - logical or', function() : void {
  const rootlabel = new labels.CallVarLabel("or", false);
  const op1 = labels.mkFalseBooleanLiteral();
  const op2 = labels.mkFalseBooleanLiteral();
  const root = new PNode(rootlabel, [op1, op2]);
  const vm = makeStdVMS( root )  ;

  it('should evaluate to a BoolV equaling false', function() : void {
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( ! vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check(  vm.evalIsReadyToStep() ) ;
      vm.advance() ;
      assert.check( vm.isDone() ) ;
      assert.check( vm.isMapped( emptyList ) ) ;
      const val = vm.getVal( emptyList ) ;
      assert.check( val instanceof BoolV ) ;
      assert.check( (val as BoolV).getVal() === false);
  } );
} ) ;

describe( 'CallWorldLabel - implies', function() : void {
    const rootlabel = new labels.CallVarLabel("implies", false);
    const op1 = labels.mkFalseBooleanLiteral();
    const op2 = labels.mkFalseBooleanLiteral();
    const op3 = labels.mkFalseBooleanLiteral();
    const op4 = labels.mkTrueBooleanLiteral();
    const root = new PNode(rootlabel, [op1, op2, op3, op4]);
    const vm = makeStdVMS( root )  ;
  
    it('should evaluate to a BoolV equaling true', function() : void {
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ;    
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof BoolV ) ;
        assert.check( (val as BoolV).getVal() === true);
    } );
  } ) ;

describe( 'CallWorldLabel - implies', function() : void {
    const rootlabel = new labels.CallVarLabel("implies", false);
    const op1 = labels.mkTrueBooleanLiteral();
    const op2 = labels.mkTrueBooleanLiteral();
    const op3 = labels.mkTrueBooleanLiteral();
    const op4 = labels.mkFalseBooleanLiteral();
    const root = new PNode(rootlabel, [op1, op2, op3, op4]);
    const vm = makeStdVMS( root )  ;
  
    it('should evaluate to a BoolV equaling false', function() : void {
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ;
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ;    
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof BoolV ) ;
        assert.check( (val as BoolV).getVal() === false);
    } );
  } ) ;


describe ('Call Label with closure', function(): void {
    const varDecl = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("100"));
    const paramlist = mkParameterList([mkLocVarDecl(mkVar("y"), mkNoTypeNd(), mkNoExpNd())]);
    const lambdaBody = mkExprSeq([mkOpenCallVar("+", [mkVar("x"), mkVar("y")])]);
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

    // loc f := lambda con x -> x
    const dec_f = mkLocVarDecl(
                    mkVar("f"),
                    mkNoTypeNd(),
                    mkLambda( mkParameterList([mkConstDecl(mkVar("x"), mkNoTypeNd(), mkNoExpNd())]),
                              mkNoTypeNd(),
                              mkExprSeq([mkVar("x")]) )) ;
    // loc g := lambda con x con y -> x+y
    const dec_g = mkLocVarDecl(
                    mkVar("g"),
                    mkNoTypeNd(),
                    mkLambda( mkParameterList(
                                [mkConstDecl(mkVar("x"), mkNoTypeNd(), mkNoExpNd()),
                                 mkConstDecl(mkVar("y"), mkNoTypeNd(), mkNoExpNd())]),
                              mkNoTypeNd(),
                              mkExprSeq([mkOpenCallVar("+", [mkVar("x"), mkVar("y")])])) );
    // loc h := lambda -> 42
    const dec_h = mkLocVarDecl(
                    mkVar("h"),
                    mkNoTypeNd(),
                    mkLambda( mkParameterList([]),
                              mkNoTypeNd(),
                              mkExprSeq([ mkNumberLiteral("42") ])) );

    it( "call(f ()) should result in ()", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkCall(mkVar("f"), mkTuple([]))] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof TupleV ) ;
        assert.check( (result as TupleV).itemCount() === 0 ) ;
    } ) ;

    it( "call(f) should result in ()", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkCall(mkVar("f"))] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof TupleV ) ;
        assert.check( (result as TupleV).itemCount() === 0 ) ;
    } ) ;

    it( "callVar[f]( () ) should result in ()", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkOpenCallVar("f", [mkTuple([])])] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof TupleV ) ;
        assert.check( (result as TupleV).itemCount() === 0 ) ;
    } ) ;

    it( "callVar[f]() should result in ()", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkOpenCallVar("f", [])] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof TupleV ) ;
        assert.check( (result as TupleV).itemCount() === 0 ) ;
    } ) ;

    it( "call(f (1)) should result in 1", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkCall(mkVar("f"),
                                         mkTuple([mkNumberLiteral("1")]) ) ] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 1 ) ;
    } ) ;

    it( "call(f 1) should result in 1", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkCall(mkVar("f"), mkNumberLiteral("1"))] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 1 ) ;
    } ) ;

    it( "callVar[f](1) should result in 1", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkOpenCallVar("f",
                                              [mkTuple([mkNumberLiteral("1")])] ) ] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 1 ) ;
    } ) ;

    it( "callVar[f](1) should result in 1", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkOpenCallVar("f", [mkNumberLiteral("1")])] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 1 ) ;
    } ) ;

    it( "call(f (3,5)) should result in (3,5)", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkCall( mkVar("f"),
                                          mkTuple([mkNumberLiteral("3"),
                                                   mkNumberLiteral("5")]))] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof TupleV ) ;
        assert.check( (result as TupleV).itemCount() === 2 ) ;
    } ) ;

    it( "callWorld[f]((3,5)) should result in (3,5)", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkOpenCallVar( "f",
                                               [mkTuple([mkNumberLiteral("3"),
                                                         mkNumberLiteral("5")])])] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof TupleV ) ;
        assert.check( (result as TupleV).itemCount() === 2 ) ;
    } ) ;

    it( "call(f,3,5) should result in (3,5)", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkCall( mkVar("f"),
                                          mkNumberLiteral("3"),
                                          mkNumberLiteral("5"))] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof TupleV ) ;
        assert.check( (result as TupleV).itemCount() === 2 ) ;
    } ) ;

    it( "callVar[f](3,5) should result in (3,5)", function() : void {
        const root = mkExprSeq( [ dec_f,
                                  mkOpenCallVar( "f",
                                               [mkNumberLiteral("3"),
                                                mkNumberLiteral("5")])] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof TupleV ) ;
        assert.check( (result as TupleV).itemCount() === 2 ) ;
    } ) ;


    it( "call(g ()) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkCall(mkVar("g"), mkTuple([]))] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 2." ) ;
    } ) ;

    it( "call(g) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkCall(mkVar("g"))] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 2." ) ;
    } ) ;

    it( "callWorld[g](()) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkOpenCallVar("g", [mkTuple([])])] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 2." ) ;
    } ) ;

    it( "callWorld[g]() should result in an error", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkOpenCallVar("g", [])] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 2." ) ;
    } ) ;

    it( "call(g (1) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkCall(mkVar("g"),
                                         mkTuple([mkNumberLiteral("1")]) )] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 2." ) ;
    } ) ;

    it( "call(g 1) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkCall(mkVar("g"), mkNumberLiteral("1"))] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 2." ) ;
    } ) ;

    it( "callVar[g]((1)) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkOpenCallVar("g",
                                              [mkTuple([mkNumberLiteral("1")])  ])] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 2." ) ;
    } ) ;

    it( "callVar[g](1) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkOpenCallVar("g", [mkNumberLiteral("1")])] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 2." ) ;
    } ) ;

    it( "call(g (3,5)) should result in 8", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkCall( mkVar("g"),
                                          mkTuple([mkNumberLiteral("3"),
                                                   mkNumberLiteral("5")]))] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 8 ) ;
    } ) ;

    it( "callWorld[g]((3,5)) should result in 8", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkOpenCallVar( "g",
                                               [mkTuple([mkNumberLiteral("3"),
                                                         mkNumberLiteral("5")])])] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 8 ) ;
    } ) ;

    it( "call(g,3,5) should result in 8", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkCall( mkVar("g"),
                                          mkNumberLiteral("3"),
                                          mkNumberLiteral("5"))] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 8 ) ;
    } ) ;

    it( "callWorld(g,3,5) should result in 8", function() : void {
        const root = mkExprSeq( [ dec_g,
                                  mkOpenCallVar( "g",
                                               [mkNumberLiteral("3"),
                                                mkNumberLiteral("5") ] ) ] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 8 ) ;
    } ) ;

    it( "call(h ()) should result in 42", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkCall(mkVar("h"), mkTuple([]))] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 42 ) ;
    } ) ;

    it( "call(h) should result in 42", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkCall(mkVar("h"))] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 42 ) ;
    } ) ;

    it( "callVar[h](()) should result in 42", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkOpenCallVar("h", [mkTuple([])])] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 42 ) ;
    } ) ;

    it( "callVar[h]() should result in 42", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkOpenCallVar("h", [])] ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 42 ) ;
    } ) ;

    it( "call(h (1)) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkCall( mkVar("h"),
                                          mkTuple([mkNumberLiteral("1")]) )] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 0." ) ;
    } ) ;

    it( "call(h 1) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkCall(mkVar("h"), mkNumberLiteral("1"))] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 0." ) ;
    } ) ;

    it( "callVar[h]((1) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkOpenCallVar("h",
                                              [mkTuple([mkNumberLiteral("1")]) ])] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 0." ) ;
    } ) ;
    it( "callVar[h](1) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkOpenCallVar("h", [mkNumberLiteral("1")])] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 0." ) ;
    } ) ;

    it( "call(h (3,5)) should result in an error", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkCall( mkVar("h"),
                                          mkTuple([mkNumberLiteral("3"),
                                                   mkNumberLiteral("5")]))] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 0." ) ;
    } ) ;

    it( "callVar[h]((3,5)) should result in (3,5)", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkOpenCallVar( "h",
                                               [mkTuple([mkNumberLiteral("3"),
                                                         mkNumberLiteral("5")])])] ) ;
        
        expectError( root, "Call has the wrong number of arguments: expected 0." ) ;
    } ) ;

    it( "call(h,3,5) should result in (3,5)", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkCall( mkVar("h"),
                                          mkNumberLiteral("3"),
                                          mkNumberLiteral("5"))] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 0." ) ;
    } ) ;

    it( "callWorld(h,3,5) should result in (3,5)", function() : void {
        const root = mkExprSeq( [ dec_h,
                                  mkOpenCallVar( "h",
                                               [mkNumberLiteral("3"),
                                                mkNumberLiteral("5")] ) ] ) ;
        expectError( root, "Call has the wrong number of arguments: expected 0." ) ;
    } ) ;
});

describe('Calls to built-ins with tuples as arguments', function() : void {
    it( 'call should work with a 0 tuple', function() : void {
        const root = mkCall(mkVar("+"), mkTuple([]) ) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 0 ) ;
    } ) ;


    it( 'call should work with a so-called 1-tuple', function() : void {
        const root = mkCall(mkVar("+"), mkTuple([mkNumberLiteral("42")])) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 42 ) ;
    } ) ;

    it( 'call should work with a 3-tuple', function() : void {
        const root = mkCall(mkVar("+"), mkTuple([mkNumberLiteral("42"),
                                                 mkNumberLiteral("7"),
                                                 mkNumberLiteral("21") ])) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 70 ) ;
    } ) ;

    it( 'callWorld should work with a 0 tuple', function() : void {
        const root = mkOpenCallVar("+", [ mkTuple([])]) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 0 ) ;
    } ) ;


    it( 'callWorld should work with a so-called 1-tuple', function() : void {
        const root = mkOpenCallVar("+", [ mkTuple([mkNumberLiteral("42")])]) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 42 ) ;
    } ) ;


    it( 'callWorld should work with a 3-tuple', function() : void {
        const root = mkOpenCallVar("+", [ mkTuple([mkNumberLiteral("42"),
                                                 mkNumberLiteral("7"),
                                                 mkNumberLiteral("21")])]) ;
        const result = getResult( root ) ;
        assert.check( result instanceof NumberV ) ;
        assert.check( (result as NumberV).getVal() === 70 ) ;
    } ) ;
}) ;

describe('ObjectLiteralLabel', function(): void {
    it('should evaluate to an ObjectV with 2 fields', function () : void {
      const rootLabel = new labels.ObjectLiteralLabel();
      const field1 = labels.mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("3"));
      const field2 = labels.mkConstDecl(mkVar("y"), mkNoTypeNd(), mkNumberLiteral("5"));
      const root = new PNode(rootLabel, [field1, field2]);
      const vm = makeStdVMS( root )  ;
      while (vm.canAdvance()) {
        vm.advance();
      }
      assert.check(!vm.hasError());
      const val = vm.getFinalValue();
      assert.check(val instanceof ObjectV);
      assert.check((val as ObjectV).numFields() === 2);

      assert.check((val as ObjectV).getField("x").getValue().first() instanceof LocationV) ;
      const locX = (val as ObjectV).getField("x").getValue().first() as LocationV ;
      assert.check( locX.getValue().first() instanceof NumberV )  ;
      const numberVX = locX.getValue().first() as NumberV ;
      assert.check( numberVX.getVal() === 3) ;
      
      assert.check((val as ObjectV).getField("y").getValue().first() instanceof NumberV) ;
      const numberVY = (val as ObjectV).getField("y").getValue().first() as NumberV ;
      assert.check( numberVY.getVal() === 5) ;
  });
});

describe('AccessorLabel', function(): void {
    it ('should evaluate to a StringV equaling 5', function(): void {
        const field = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
        const object = new PNode(new labels.ObjectLiteralLabel(), [field]);
        const root = mkAccessor(object, labels.mkStringLiteral("x") );
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
      const field = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const object = new PNode(new labels.ObjectLiteralLabel, [field]);
      const root = mkAccessor( object, labels.mkStringLiteral("y") ) ;
      const vm = makeStdVMS(root);
      while( vm.canAdvance() ) {
        vm.advance(); }
      assert.check( vm.hasError() );
      const message = vm.getError() ;
      assert.checkEqual( "Object has no field named 'y'.", message );
    });

    it('should report an error when applied to non-object', function(): void {
      const field = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const stringLiteral = mkNumberLiteral("5");
      const root = mkAccessor( stringLiteral, labels.mkStringLiteral("y") ) ;
      const vm = makeStdVMS(root) ;
      while( vm.canAdvance() ) {
        vm.advance(); }
      assert.check( vm.hasError() );
      const message = vm.getError() ;
      assert.checkEqual( "The index operator may only be applied to objects and tuples.", message );
    });

    it('should report an error when the index is not a string', function(): void {
        const field = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
        const object = new PNode(new labels.ObjectLiteralLabel, [field]);
        const index = mkLambda( mkParameterList( [] ), mkNoTypeNd(), mkExprSeq( [] ) ) ;
        const root = mkAccessor( object, index ) ;
        const vm = makeStdVMS(root);
        while( vm.canAdvance() ) {
            vm.advance(); }
        assert.check( vm.hasError() );
        const message = vm.getError() ;
        assert.checkEqual( "The operand of the index operator must be a string or number.", message );
    });
});

describe('DotLabel', function(): void {
    it ('should work when the field is there', function(): void {
        const field = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
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
      const field = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const object = new PNode(new labels.ObjectLiteralLabel, [field]);
      const root = labels.mkDot( "y", false, object ) ;
      const vm = makeStdVMS(root);
      while( vm.canAdvance() ) {
        vm.advance(); }
      assert.check( vm.hasError() );
      const message = vm.getError() ;
      assert.checkEqual( "Object has no field named 'y'.", message );
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

      assert.check((val as ObjectV).getField("0").getValue().first() instanceof LocationV) ;
      const loc0 = (val as ObjectV).getField("0").getValue().first() as LocationV ;
      assert.check( loc0.getValue().first() instanceof NumberV )  ;
      const numberV0 = loc0.getValue().first() as NumberV ;
      assert.check( numberV0.getVal() === 12345 ) ;

      assert.check((val as ObjectV).getField("1").getValue().first() instanceof LocationV) ;
      const loc1 = (val as ObjectV).getField("1").getValue().first() as LocationV ;
      assert.check( loc1.getValue().first() instanceof NumberV )  ;
      const numberV1 = loc1.getValue().first() as NumberV ;
      assert.check( numberV1.getVal() === 67890 ) ;
  });
});

describe('len built in', function(): void {
  it('should return a len of 2', function(): void {
    const array = new PNode(new labels.ArrayLiteralLabel(), [mkNumberLiteral("23"), mkNumberLiteral("123127645")]);
    const lenCall = new PNode(new labels.CallVarLabel("len", false), [array]);
    const root = mkExprSeq([array, lenCall]);
    const vm = makeStdVMS(root);
    while (vm.canAdvance()) {
      vm.advance();
    }
    assert.check(!vm.hasError());
    const val = vm.getFinalValue();
    assert.check(val instanceof NumberV);
    assert.check((val as NumberV).getVal() === 2);
  });
});

describe('push built in', function(): void {
  it('should return a NumberV equaling 1000', function(): void {
    const array = new PNode(new labels.ArrayLiteralLabel(), [mkNumberLiteral("23")]);
    const arrayDecl = mkLocVarDecl(mkVar("a"), mkNoTypeNd(), array);
    const pushCall = new PNode(new labels.CallVarLabel("push", false), [mkVar("a"), mkNumberLiteral("1000")]);
    const accessor = mkAccessor( mkVar("a"), labels.mkStringLiteral("1") ) ;
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
    const arrayDecl = mkLocVarDecl(mkVar("a"), mkNoTypeNd(), array);
    const popCall = new PNode(new labels.CallVarLabel("pop", false), [mkVar("a")]);
    const lenCall = new PNode(new labels.CallVarLabel("len", false), [mkVar("a")]);
    const root = mkExprSeq([arrayDecl, popCall, lenCall]);
    const vm = makeStdVMS(root);
    while (vm.canAdvance()) {
      vm.advance();
    }
    assert.check(!vm.hasError());
    const val = vm.getFinalValue();
    assert.check(val instanceof NumberV);
    assert.check((val as NumberV).getVal() === 2);
  });
});

describe( 'ExprSeqLabel', function () : void {
    it( 'should evaluate to a NumberV equaling 3', function () : void {
        const op1 = labels.mkNumberLiteral("1");
        const op2 = labels.mkNumberLiteral("2");
        const root = labels.mkExprSeq( [op1, op2]) ;
        const vm = makeStdVMS( root ) ;
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ; // select op1
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ; // step the op1
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ; // select op2
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ; // step op2
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ; // select root
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ; // step the root
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
        assert.check( ! vm.evalIsReadyToStep() ) ;
        vm.advance() ; // select root again
        assert.check(  vm.evalIsReadyToStep() ) ;
        vm.advance() ; // step the root
        assert.check( vm.isDone() ) ;
        assert.check( vm.isMapped( emptyList ) ) ;
        const val = vm.getVal( emptyList ) ;
        assert.check( val instanceof values.TupleV ) ;
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
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step condition node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance();

        //parse condition node to select either true or false
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        //it should fail here
        vm.advance();
        assert.check( vm.hasError() ) ;
        assert.checkEqual( "Guard is neither true nor false.", vm.getError() ) ;
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
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        
        //select condition node
        vm.advance();
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        
        //step condition node
        vm.advance();
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        
        // Select the 5
        vm.advance();
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");

        //step the 5
        vm.advance();

        //select expr seq node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step expr seq node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance();

        //select if node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step if node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
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
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        
        //select condition node
        vm.advance();
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        
        //step condition node
        vm.advance();
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        
        // Select the 7
        vm.advance();
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");

        //step number literal 7
        vm.advance();
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");

        //select expr seq node
        vm.advance();
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");

        //step expr seq node
        vm.advance();

        //select if node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step if node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance();

        assert.check(vm.isDone(), "VMS is not done.");
        assert.check(vm.isMapped(emptyList), "The empty list is not mapped.");
        const val : Value = vm.getVal(emptyList);
        assert.check(val instanceof NumberV, "The value is not a Numberv.");
        const result : number = (val as NumberV).getVal();
        assert.check(result === 7, "It did not return 7 as expected. It returned " + result);
    });
    
    it('should select recursively', function() : void {
        //setup
        const ifLabel : IfLabel = new labels.IfLabel();
        const condition : PNode = labels.mkTrueBooleanLiteral();
        const theTwo : PNode = labels.mkNumberLiteral("2") ;
        const ifTrue : PNode = labels.mkClosedCallVar(
                                "+",
                                [theTwo,
                                 labels.mkNumberLiteral("3"),] ) ;
        const ifFalse : PNode = labels.mkNumberLiteral("7");
        const trueExprSeqNode : PNode = new PNode(new labels.ExprSeqLabel(), [ifTrue]);
        const falseExprSeqNode : PNode = new PNode(new labels.ExprSeqLabel(), [ifFalse]);
        const ifArray : Array<PNode> = [condition, trueExprSeqNode, falseExprSeqNode];
        const root : PNode = new PNode(ifLabel, ifArray);
        const vm = makeStdVMS( root )  ;

        //select condition node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step condition node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance(); 

        // Select the 2
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();  
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
        
        //select number literal node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step number literal node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
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

        //select number literal node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step number literal node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance();

        //select string literal node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step string literal node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
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

        //select number literal node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step number literal node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance();

        //select string literal node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step string literal node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance();
        //select number literal node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step number literal node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance();

        //select string literal node
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step string literal node
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
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
        assert.check( f.getValue().isEmpty() ) ;

        // step the mumber literal node
        selectAndStep( vm ) ;

        // step the declaration node
        selectAndStep( vm ) ;

        assert.check( vm.getEval().getStack().hasField( "a" ) ) ;
        const f1 : vms.FieldI = vm.getEval().getStack().getField( "a" ) ;
        assert.check( f === f1 ) ;
        assert.check( ! f.getValue().isEmpty() ) ;
        assert.check( f.getValue().first() instanceof LocationV ) ;
        const loc = f.getValue().first() as LocationV;
        assert.check( ! loc.getValue().isEmpty() ) ;
        assert.check( loc.getValue().first() instanceof NumberV ) ;

        // step the expr seq node
        selectAndStep( vm ) ;

        const finalStackDepth = vm.getEval().getStack().getAllFrames().length ;
        assert.checkEqual( finalStackDepth, stackDepth ) ;

        assert.check(vm.isDone(), "VMS is not done");
        assert.check(vm.isMapped(emptyList), "Empty list is not mapped.");
        assert.check( vm.getVal( emptyList ) instanceof values.TupleV ) ;
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
        const varDeclNode1 : PNode = labels.mkLocVarDecl(variableNode, typeNode, valueNode1);
        const varDeclNode2 : PNode = labels.mkLocVarDecl(variableNode, typeNode, valueNode2);
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
        const varDeclNode1 : PNode = labels.mkLocVarDecl(variableNode, typeNode, noExpNode);
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [varDeclNode1]);
        const vm = makeStdVMS( root )  ;

        // Select the expr seq node
        vm.advance() ;
        // Step the expr seq node
        vm.advance() ;
        const field = vm.getStack().getField( "a" ) ;
        assert.check( field.getValue().isEmpty() ) ;
        assert.check( ! vm.isMapped( list(0) ) ) ;
        // Select the variable declaration node
        vm.advance() ;
        // Step the variable declaration node
        vm.advance() ;
        assert.check( ! field.getValue().isEmpty() ) ;
        assert.check( field.getValue().first() instanceof LocationV ) ;
        const loc = field.getValue().first() as  LocationV ;
        assert.check( loc.getValue().isEmpty() ) ;

        assert.check( vm.isMapped( list(0) ) ) ;
        assert.check( vm.getVal( list(0) ).isTupleV() ) ;
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
        const varDeclNode : PNode = labels.mkLocVarDecl(varNode, typeNode, valueNode);
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
        const varDeclNode : PNode = labels.mkLocVarDecl(varNode, typeNode, valueNode);
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
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step root (this should fail)
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance();
        assert.check( vm.hasError() ) ;
        assert.check( vm.getError() === "No variable named 'a' is in scope." ) ;
    });
});

describe('AssignLabel', function () : void {
    it('should fail when assigning a non-declared variable', function () : void {
        //setup
        const variableNode : PNode = labels.mkVar("a");
        const valueNode : PNode = labels.mkNumberLiteral("5");
        const root : PNode = mkAssign( variableNode, valueNode );
        //   a := 5
        const vm = makeStdVMS( root )  ;

        //run test
        //select LHS
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step LHS
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance();

        assert.check( vm.hasError() ) ;
        assert.checkEqual( "No variable named 'a' is in scope.", vm.getError() ) ;

    });

    it('should assign a new value to a previously declared variable', function () : void {
        //setup
        // exprSeq( loc a::= 1, a := 2, a )
        const variableNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode1 : PNode = labels.mkNumberLiteral("1");
        const valueNode2 : PNode = labels.mkNumberLiteral("2");
        const varDeclNode : PNode = labels.mkLocVarDecl(variableNode, typeNode, valueNode1);
        const assignNode : PNode = mkAssign( variableNode, valueNode2 ); 
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

    it('should fail if assigning to a nonlocation', function () : void {
        //setup
        // exprSeq( decl a:= 1, a := 2, a )
        const variableNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode1 : PNode = labels.mkNumberLiteral("1");
        const valueNode2 : PNode = labels.mkNumberLiteral("2");
        const varDeclNode : PNode = labels.mkConstDecl(variableNode, typeNode, valueNode1);

        const assignNode : PNode = mkAssign( variableNode, valueNode2 );
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [varDeclNode, assignNode, variableNode]);
        const vm = makeStdVMS( root )  ;

        //run the test until the top evaluation is done or there is an error
        while( vm.canAdvance() && ! vm.isDone() ) {
            vm.advance() ; }
        
        assert.check( vm.hasError() ) ;
        assert.checkEqual( "The left operand of an assignment should be a location.", vm.getError() ) ;
    });

    it('should fail when trying to assign to a variable not yet declared', function () : void {
        //setup
        // exprSeq( a := 2, decl a: := 1 )
        const variableNode : PNode = labels.mkVar("a");
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode1 : PNode = labels.mkNumberLiteral("1");
        const valueNode2 : PNode = labels.mkNumberLiteral("2");
        const varDeclNode : PNode = labels.mkLocVarDecl(variableNode, typeNode, valueNode1);
        const assignNode : PNode = mkAssign( variableNode, valueNode2 );
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
        const typeNode : PNode = labels.mkNoTypeNd();
        const valueNode1 : PNode = labels.mkNumberLiteral("1");
        const valueNode2 : PNode = labels.mkNumberLiteral("2");
        const assignNode : PNode = mkAssign( valueNode1, valueNode2 );
        const root : PNode = new PNode(new labels.ExprSeqLabel(), [assignNode]);
        const vm = makeStdVMS( root )  ;

        //run the test until the top evaluation is done or there is an error
        while( vm.canAdvance() && ! vm.isDone() ) {
            vm.advance() ; }
        
        assert.check( vm.hasError() ) ;
        assert.checkEqual( "The left operand of an assignment should be a location.", vm.getError()) ;
    });

    it('should assign to the field of an object', function(): void {
      // ExprSeq( varDelc[loc]( var(obj) noType objectLiteral(varDelc[loc](var(x) noType numberLiteral(5)))
      //          assign( accessor( var[obj], stringLiteral[x]), 10)
      //          accessor( var[obj], stringLiteral[x] ) )
      const field = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const object = new PNode(new labels.ObjectLiteralLabel(), [field]);
      const objDecl = mkLocVarDecl(mkVar("obj"), mkNoTypeNd(), object);
      const accesor1 = mkAccessor( mkVar("obj"), labels.mkStringLiteral("x") );
      const val = mkNumberLiteral("10");
      const assign = new PNode(labels.AssignLabel.theAssignLabel, [accesor1, val]);
      const accessor2 = mkAccessor( mkVar("obj"), labels.mkStringLiteral("x") );
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
      const field = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const object = new PNode(new labels.ObjectLiteralLabel(), [field]);
      const objDecl = mkLocVarDecl(mkVar("obj"), mkNoTypeNd(), object);
      const accesor1 = mkAccessor( mkVar("obj"), labels.mkStringLiteral("y") );
      const val = mkNumberLiteral("10");
      const assign = new PNode(labels.AssignLabel.theAssignLabel, [accesor1, val]);
      const accessor2 = mkAccessor( mkVar("obj"), labels.mkStringLiteral("x") ) ;
      const root = new PNode(new labels.ExprSeqLabel(), [objDecl, assign, accessor2]) ;
      const vm = makeStdVMS(root);

      //run the test until the top evaluation is done or there is an error
      while( vm.canAdvance() && ! vm.isDone() ) {
          vm.advance() ; }
  
      assert.check( vm.hasError() ) ;
      assert.checkEqual( "Object has no field named 'y'.", vm.getError() ) ;
    });

    it('should fail to assign if object is not in scope', function(): void {
      const field = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("5"));
      const object = new PNode(new labels.ObjectLiteralLabel(), [field]);
      const objDecl = mkLocVarDecl(mkVar("obj"), mkNoTypeNd(), object);
      const accesor1 = mkAccessor( mkVar("NoObj"), labels.mkStringLiteral("x") ) ;
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
      const field = mkLocVarDecl(mkVar("x"), mkNoTypeNd(), mkNumberLiteral("123"));
      const innerObj = new PNode(new labels.ObjectLiteralLabel(), [field]);
      const outerObj = new PNode(new labels.ObjectLiteralLabel(), [mkLocVarDecl(mkVar("io"), mkNoTypeNd(), innerObj)]);
      const objDecl = mkLocVarDecl(mkVar("o"), mkNoTypeNd(), outerObj);
      const accessor1 = mkAccessor( mkVar("o"), labels.mkStringLiteral("io") );
      const accessor2 = mkAccessor( accessor1, labels.mkStringLiteral("x") );
      const assign = new PNode(labels.AssignLabel.theAssignLabel, [accessor2, mkNumberLiteral("666")]);
      const accessor3 = mkAccessor( accessor1, labels.mkStringLiteral("x") );
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
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
        vm.advance();

        //step guardNode
        assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
        vm.advance();

        //attempt to select the another node, but it should fail
        assert.check(!vm.evalIsReadyToStep(), "VMS is ready when it should not be.");
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

        selectAndStep( vm ) ; // The number node.

        selectAndStep( vm ) ; // The expression seq.

        // So the expression seq is now mapped.
        assert.check( ! vm.evalIsReadyToStep() ) ;
        assert.check( vm.getPending().equals( collections.list() ) ) ;

        assert.check( vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( vm.getValMap().isMapped( collections.list(1,0) ) );
        
        // Select the guard again.  This should have the side effect of scrubbing.
        vm.advance() ;
        assert.check( vm.evalIsReadyToStep() ) ;
        assert.check( vm.getPending().equals( collections.list(0) ) ) ;
        
        assert.check( ! vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( ! vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( ! vm.getValMap().isMapped( collections.list(1,0) ) );
        
        //  Run a second iteration 
        vm.advance() ; // Step the guard.

        selectAndStep( vm ) ; // The number node.

        selectAndStep( vm ) ; // The expression seq

        // So the expression seq is now mapped.
        assert.check( ! vm.evalIsReadyToStep() ) ;
        assert.check( vm.getPending().equals( collections.list() ) ) ;

        assert.check( vm.getValMap().isMapped( collections.list(0) ) );
        assert.check( vm.getValMap().isMapped( collections.list(1) ) ) ;
        assert.check( vm.getValMap().isMapped( collections.list(1,0) ) );
        
        
    });

    it('should run one time when flipping the value of the guard in the body', function () : void {
        //setup:  seq( decl guard:= true,
        //             while( guard,
        //                    seq( guard := false ) ),
        //             guard ) 
        const guardNode : PNode = labels.mkVar("guard");
        const trueNode : PNode = labels.mkTrueBooleanLiteral();
        const varDeclNode : PNode = labels.mkLocVarDecl(guardNode, labels.mkNoTypeNd(), trueNode);
        const falseNode : PNode = labels.mkFalseBooleanLiteral();
        const assignNode : PNode = new PNode(labels.AssignLabel.theAssignLabel, [guardNode, falseNode]);
        const bodyNode : PNode = new PNode(new labels.ExprSeqLabel(), [assignNode]);
        const whileNode : PNode = labels.mkWhile(guardNode, bodyNode);
        const root : PNode = new PNode(new ExprSeqLabel(), [varDeclNode, whileNode, guardNode]);
        const vm = makeStdVMS( root )  ;

        //run the test.  We expect to select  and step the following nodes.
        const nodes = [
                       /* make stack frame*/ root,
                       /* declare guard */ trueNode, varDeclNode,
                       /* find location and fetch */guardNode,
                       /* find location */ guardNode, falseNode, assignNode,
                       /* finish the body sequence */ bodyNode,
                       /* find location  and fetch */ guardNode,
                       /* finish the while loop */whileNode,
                       /* find location  and fetch */ guardNode,
                       /* finish the root sequence */ root ] ;
        
        let i = 0 ;
        nodes.forEach( (n : PNode) : void => {
            assert.check( vm.canAdvance(), "Can't advance on iteration " + i ) ;
            assert.check( !vm.evalIsReadyToStep(), "Not ready to select on iteration " + i   ) ;
            vm.advance() ; // Select
            assert.check( vm.evalIsReadyToStep(),
                          "Not ready to step on iteration " + i  ) ;
            assert.check( vm.getPendingNode() === n,
                          "Wrong node selected on iteration " +i+ ".\nSelected " +vm.getPendingNode()
                          + "\nrather than " +n+ ".") ;
            vm.advance() ; // Step
            // Do a fetch if needed.
            if( vm.evalIsReadyToFetch() ) vm.advance() ;
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

describe('TupleLable', function () : void {
    it('should return done value for empty tuple', function () : void {
            const tupleLable : labels.TupleLabel = labels.TupleLabel.theTupleLabel;
            const root = new PNode( tupleLable, [] ) ;
            const vm = makeStdVMS( root )  ;
            
            assert.check( ! vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.isDone() ) ;
            assert.check( vm.isMapped( emptyList ) ) ;
            const val = vm.getVal( emptyList ) ;
            assert.check( val instanceof TupleV ) ;
            assert.check( val === TupleV.theDoneValue);

    });
});

describe('TupleLable', function () : void {
    it('should return NumberV value for one value tuple containing a number', function () : void {
            const tupleLable : labels.TupleLabel = labels.TupleLabel.theTupleLabel;
            const numberNode : PNode = labels.mkNumberLiteral("10");
            const root = new PNode( tupleLable, [numberNode] ) ;
            const vm = makeStdVMS( root )  ;
            
            assert.check( ! vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( ! vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.isDone() ) ;
            assert.check( vm.isMapped( emptyList ) ) ;
            const val = vm.getVal( emptyList ) ;
            assert.check( val instanceof NumberV ) ;
            assert.check( (val as NumberV).getVal() === 10);

    });
});

describe('TupleLable', function () : void {
    it('should return StringV value for one value tuple containing a string.', function () : void {
            const tupleLable : labels.TupleLabel = labels.TupleLabel.theTupleLabel;
            const stringNode : PNode = labels.mkStringLiteral("test123");
            const root = new PNode( tupleLable, [stringNode] ) ;
            const vm = makeStdVMS( root )  ;
            
            assert.check( ! vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( ! vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.isDone() ) ;
            assert.check( vm.isMapped( emptyList ) ) ;
            const val = vm.getVal( emptyList ) ;
            assert.check( val instanceof StringV ) ;
            assert.check( (val as StringV).getVal() === "test123");

    });
});

describe('TupleLabel', function () : void {
    it('should return TupleV value for more than one value tuple.', function () : void {
            const tupleLable : labels.TupleLabel = labels.TupleLabel.theTupleLabel;
            const numberNode : PNode = labels.mkNumberLiteral("10");
            const stringNode : PNode = labels.mkStringLiteral("test123");
            const root = new PNode( tupleLable, [numberNode,stringNode] ) ;
            const vm = makeStdVMS( root )  ;
            
            assert.check( ! vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( ! vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( ! vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.evalIsReadyToStep() ) ;
            vm.advance() ;
            assert.check( vm.isDone() ) ;
            assert.check( vm.isMapped( emptyList ) ) ;
            const val = vm.getVal( emptyList ) ;
            assert.check( val instanceof TupleV ) ;            
            const val1 : Value = (val as TupleV).getItemByIndex(0);
            assert.check( val1 instanceof NumberV );
            const val1Result : number = (val1 as NumberV).getVal();
            const val2 : Value = (val as TupleV).getItemByIndex(1);
            assert.check( val2 instanceof StringV );
            const val2Result : string = (val2 as StringV).getVal();            
            assert.check( val1Result === 10 );
            assert.check( val2Result === "test123");

    });
});

describe('PrimitiveTypesLabel', function(): void {
    it('should evaluate to STRING TypeKind',function() : void {
        const stringTypeNode = mkPrimitiveTypeLabel("stringType");
        assert.check(stringTypeNode.count() === 0 );
        const type = types.createType(stringTypeNode);
        assert.check( type.getKind() === types.TypeKind.STRING);
    }) ;
});

describe('PrimitiveTypesLabel', function(): void {
    it('should evaluate to BOOL TypeKind',function() : void {
        const booleanTypeNode = mkPrimitiveTypeLabel("booleanType");
        assert.check(booleanTypeNode.count() === 0 );
        const type = types.createType(booleanTypeNode);
        assert.check( type.getKind() === types.TypeKind.BOOL);
    }) ;
});

describe('PrimitiveTypesLabel', function(): void {
    it('should evaluate to NUMBER TypeKind',function() : void {
        const numberTypeNode = mkPrimitiveTypeLabel("numberType");
        assert.check(numberTypeNode.count() === 0 );
        const type = types.createType(numberTypeNode);
        assert.check( type.getKind() === types.TypeKind.NUMBER);
    }) ;
});

describe('PrimitiveTypesLabel', function(): void {
    it('should evaluate to TOP TypeKind',function() : void {
        const topTypeNode = mkPrimitiveTypeLabel("topType");
        const type = types.createType(topTypeNode);
        assert.check( type.getKind() === types.TypeKind.TOP);
        assert.check( type instanceof types.TopType);
    }) ;
});

describe('PrimitiveTypesLabel', function(): void {
    it('should evaluate to BOTTOM TypeKind',function() : void {
        const bottomTypeNode = mkPrimitiveTypeLabel("bottomType");
        const type = types.createType(bottomTypeNode);
        assert.check( type.getKind() === types.TypeKind.BOTTOM);
        assert.check( type instanceof types.BottomType);
    }) ;
});

describe('TupleTypeLabel', function(): void {
    it('should evaluate to Tuple TypeKind',function() : void {
        const numberNode : PNode = mkPrimitiveTypeLabel("numberType");
        const stringNode : PNode = mkPrimitiveTypeLabel("stringType");
        const tupleTypeNode = labels.mkTupleType([numberNode,stringNode]);
        const type = types.createType(tupleTypeNode);
        assert.check( type.getKind() === types.TypeKind.TUPLE);
        assert.check( (type as types.TupleType).length().first() === 2 );
        assert.check( (type as types.TupleType).getTypeByIndex(0).getKind() === types.TypeKind.NUMBER);
        assert.check( (type as types.TupleType).getTypeByIndex(1).getKind() === types.TypeKind.STRING);
    }) ;
});

describe('LocationTypeLabel', function(): void {
    it('should evaluate to LOCATION TypeKind',function() : void {
        const numberNode = mkPrimitiveTypeLabel("numberType");
        const locationTypeNode = labels.mkLocationType(numberNode);
        const type = types.createType(locationTypeNode);
        assert.check( type.getKind() === types.TypeKind.LOCATION);
        assert.check( type instanceof types.LocationType);
        assert.check( (type as types.LocationType).length().first() === 1 );
    }) ;
});

describe('FunctionTypeLabel', function(): void {
    it('should evaluate to FUNCTION TypeKind',function() : void {
        const numberNode = mkPrimitiveTypeLabel("numberType");
        const stringNode = mkPrimitiveTypeLabel("stringType");
        const functionTypeNode = labels.mkFunctionType(numberNode,stringNode);
        const type = types.createType(functionTypeNode);
        assert.check( type.getKind() === types.TypeKind.FUNCTION);
        assert.check( type instanceof types.FunctionType);
    }) ;
});

describe('FieldTypeLabel', function(): void {
    it('should evaluate to FIELD TypeKind',function() : void {
        const varNode = mkVar("x");
        const stringNode = mkPrimitiveTypeLabel("stringType");
        const fieldTypeNode = labels.mkFieldType([varNode,stringNode]);
        const type = types.createType(fieldTypeNode);
        assert.check( type.getKind() === types.TypeKind.FIELD);
        assert.check( type instanceof types.FieldType);
    }) ;
});

describe('MeetTypeLabel', function(): void {
    it('should evaluate to MEET TypeKind',function() : void {
        const numberNode = mkPrimitiveTypeLabel("numberType");
        const stringNode = mkPrimitiveTypeLabel("stringType");
        const booleanNode = mkPrimitiveTypeLabel("booleanType");
        const meetTypeNode = labels.mkMeetType([numberNode,stringNode,booleanNode]);
        const type = types.createType(meetTypeNode);
        assert.check( type.getKind() === types.TypeKind.MEET);
        assert.check( type instanceof types.MeetType);
        //assert.check( (type as types.MeetType).getChild(0) instanceof types.);
        //  assert.check( (type as types.MeetType).getChild(1).getKind() === types.TypeKind.STRING);
    }) ;
});

describe('Loc operator', function () : void {
    it('Should suppress fetch of location variable.', function () : void {
            // loc x : := 0
            // loc x
            const root = mkExprSeq([
                             mkLocVarDecl( mkVar("x"), mkNoTypeNd(), 
                                        mkNumberLiteral("0")),
                             mkLoc( mkVar("x" ) ) ]) ;
            const result = getResult( root ) ;
            assert.check( result.isLocationV() ) ;
    });

    it('Should suppress fetch for dot operators.', function () : void {
            // obj : := object{ loc x : := 0 }
            // loc obj.x
            const root = mkExprSeq([
                             mkLocVarDecl( mkVar("obj"), mkNoTypeNd(), 
                                        mkObject([
                                            mkLocVarDecl( mkVar("x"), mkNoTypeNd(), 
                                                       mkNumberLiteral("0")),
                                ])),
                             mkLoc( mkDot("x", false, mkVar("obj")) ) ]) ;
            const result = getResult( root ) ;
            assert.check( result.isLocationV() ) ;
    });

    it('Should suppress fetch for index operators.', function () : void {
            // obj : := object{ loc x : := 0 }
            // loc obj["x"]
            const root = mkExprSeq([
                             mkLocVarDecl( mkVar("obj"), mkNoTypeNd(), 
                                        mkObject([
                                            mkLocVarDecl( mkVar("x"), mkNoTypeNd(), 
                                                       mkNumberLiteral("0")) ])),
                             mkLoc( mkAccessor( mkVar("obj"), labels.mkStringLiteral( "x") ) )
                         ]) ;
            const result = getResult( root ) ;
            assert.check( result.isLocationV() ) ;
    });

    it('Should suppress fetch for the call operator.', function () : void {
            // f : := \ -> {
            //            loc x : := 0 ;
            //            loc x }
            // loc call(f)
            const root = mkExprSeq([
                             mkLocVarDecl( mkVar("f"), mkNoTypeNd(), 
                                        mkLambda( mkParameterList([]),
                                                  mkNoTypeNd(),
                                                  mkExprSeq([
                                                    mkLocVarDecl( mkVar("x"), mkNoTypeNd(), 
                                                               mkNumberLiteral("0")),
                                                    mkLoc( mkVar("x") ) ] ) ) ),
                             mkLoc( mkCall(mkVar("f" ) ) )
                         ]) ;
            const result = getResult( root ) ;
            assert.check( result.isLocationV() ) ;
    });

    it('Should suppress fetch for the callWorld operator.', function () : void {
            // f : := \ -> {
            //            loc x : := 0 ;
            //            loc x }
            // loc callWorld("f")
            const root = mkExprSeq([
                             mkLocVarDecl( mkVar("f"), mkNoTypeNd(), 
                                        mkLambda( mkParameterList([]),
                                                  mkNoTypeNd(),
                                                  mkExprSeq([
                                                    mkLocVarDecl( mkVar("x"), mkNoTypeNd(), 
                                                               mkNumberLiteral("0")),
                                                    mkLoc( mkVar("x") ) ] ) ) ),
                             mkLoc( mkOpenCallVar("f", [] ) )
                         ]) ;
            const result = getResult( root ) ;
            assert.check( result.isLocationV() ) ;
    });
});

function selectAndStep( vm : VMS ) : void {
    assert.checkPrecondition(!vm.evalIsReadyToStep() ) ;
    // Select
    vm.advance();
    assert.check(vm.evalIsReadyToStep(), "VMS is not ready when it should be.");
    // Step
    vm.advance();
}
