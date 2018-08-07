/**
 * Created by Jessica on 2/22/2016.
 */

/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="seymour.ts" />
/// <reference path="valueTypes.ts" />
/// <reference path="vms.ts" />

import assert = require( './assert' ) ;
import backtracking = require( './backtracking' ) ;
import collections = require( './collections' ) ;
import pnode = require( './pnode' ) ;
import seymour = require('./seymour') ;
import valueTypes = require( './valueTypes' ) ;
import vms = require('./vms');

/** This module contains code for the standard library.
 * 
 */
module world {
    import list = collections.list;
    import List = collections.List;
    import TransactionManager = backtracking.TransactionManager ;
    import PNode = pnode.PNode;
    import ObjectV = valueTypes.ObjectV;
    import Field  = valueTypes.Field;
    import Value = vms.Value;
    import BuiltInV = valueTypes.BuiltInV ;
    import NullV = valueTypes.NullV ;
    import StringV = valueTypes.StringV;
    import NumberV = valueTypes.NumberV;
    import BoolV = valueTypes.BoolV;
    import TupleV = valueTypes.TupleV;
    import Type = vms.Type;
    import VMS = vms.VMS;
    import EvalStack = vms.EvalStack;
    import Evaluation = vms.Evaluation;

    
    const done : TupleV = TupleV.theDoneValue;

    function checkNumberOfArgs( min : number, max : number, args : Array<Value>, vm : VMS ) : boolean {
        if( args.length < min || args.length > max ) {
            if( min===max ) {
                const s = min===1 ? "" : "s" ;
                vm.reportError( "Expected " +min+ " argument"+s+"." ) ; }
            else {
                vm.reportError("Expected from " +min+ " to " +max+ " arguments." ) ; }
            return false ;
        } else {
            return true ; }
    }

    function checkArgsAreNumbers( first : number, cap : number, args : Array<Value>, vm : VMS ) : boolean {
        for( let i = first ; i < cap && i < args.length ; ++i ) {
            const arg = args[i] ;
            if( ! arg.isNumberV() ) {
                vm.reportError( "Expected the "+nth(i+1)+" argument to be a number." ) ;
                return false ; } }
        return true ;
    }

    function argsAreStrings( args : Array<Value>) : boolean {
        return args.every( (v:Value) => v.isStringV() ) ;
    }

    function argsAreNumbers( args : Array<Value>) : boolean {
        return args.every( (v:Value) => v.isNumberV() ) ;
    }

    function argsAreTuples( args : Array<Value>) : boolean {
        return args.every( (v:Value) => v.isTupleV() );
    }

    function argsAreNulls( args : Array<Value> ) : boolean {
        return args.every( (v:Value) => v.isNullV() ) ;
    }

    function argsAreDones( args : Array<Value> ) : boolean {
        return args.every( (v:Value) => v.isTupleV() ) ;
    }

    
    
    function nth( n : number ) : string {
        switch( n ) {
            case 1 : return "1st" ;
            case 2 : return "2nd" ;
            case 3 : return "3rd" ;
            default : return n+"th" ;
        }
    }

    function isBool(val: Value) : boolean {
      if(!val.isBoolV()) return false;
      const bool = (val as BoolV).getVal();
      return bool === true || bool === false;
    }

    function convertToBool(val: Value) : boolean {
      return (val as BoolV).getVal() === true ? true : false;
    }

    function arithmeticStepperFactory(
        callback: (leftOperand: number, rightOperand: number) => number,
        defaultResult : number )
             : (vms: VMS, args: Array<Value>) => void {
        return function(vm: VMS, args: Array<Value>) : void {
          const numbers : Array<number>= [] ;
          let ok = true ;
          for( let i=0 ; i < args.length ; ++i ) {
              if( args[i].isNumberV() ) {
                  const num = args[i] as NumberV;
                  if( num.canConvertToNumber() ) {
                    numbers.push( num.converToNumber() ) ; 
                  }
                  else {
                      vm.reportError("The "+nth(i+1)+" argument is not a number.") ;
                      ok = false ;
                  }
                }
              else {
                  vm.reportError( "The "+nth(i+1)+" argument is not a number.") ;
                  ok = false ; } }
          
          if( ok ) {
              const result = numbers.length===0
                             ? defaultResult
                             : numbers.length===1
                               ? callback( defaultResult, numbers[0] )
                               : numbers.reduce( callback ) ;
              const val = new NumberV( result ) ;
              vm.finishStep(val, false);
          }
        } ;
    }

    function comparatorStepperFactory(callback: (vals: Array<number>) => boolean): (vms: VMS, args: Array<Value>) => void {
      return function(vm : VMS, args : Array<Value>) : void {
        const vals : Array<number>= [] ;
        let ok = true ;
        if (args.length === 0) {
            vm.reportError("0 arguments passed in.") ;
        }
        for( let i=0 ; i < args.length ; ++i ) {
            if( args[i].isNumberV() ) {
                const num = args[i] as NumberV;
                if( num.canConvertToNumber() ) {
                    vals.push( num.converToNumber() ) ; 
                }
                else {
                    vm.reportError( "The "+nth(i+1)+" argument is not a number.");
                    ok = false ;
                }
            }
                
            else {
                vm.reportError( "The "+nth(i+1)+" argument is not a number.");
                ok = false ; } }
        
        if( ok ) {
            const result = callback(vals);            
            const val : BoolV = BoolV.getVal(result);
            vm.finishStep( val, false ) ;
        }
      } ;
    }

    function logicalStepperFactory(
        callback: (leftOperand: boolean, rightOperand: boolean) => boolean,
        initialValue : boolean )
             : (vms: VMS, args: Array<Value>) => void {
      return function andstep( vm : VMS, args : Array<Value> ) : void {
        const vals : Array<boolean>= [] ;
        let ok = true ;
        for( let i=0 ; i < args.length ; ++i ) {
            if(isBool(args[i])) {
              vals.push(convertToBool(args[i]));                    
            } else {
              vm.reportError("The "+nth(i+1)+" argument is not a bool.");
              ok = false;
            }
        }
        if(ok) {
            const result = vals.reduce(callback, initialValue);
            const val : BoolV = BoolV.getVal(result);          
            vm.finishStep(val, false);
        }
      } ;
    }

    
    function impliesStepperFactory( callback: (vals: Array<boolean>) => boolean) 
             : (vm : VMS, arg : Array<Value>) => void {
                 return function( vm : VMS, args : Array<Value> ) : void {            
                     const vals : Array<boolean> = [];
                     let ok = true;
                     if(args.length === 0) {
                        const val : BoolV = BoolV.getVal(!ok);
                        vm.finishStep(val, false);
                        return;            
                     }
                     for(let i=0; i< args.length; ++i) {
                         if(isBool(args[i])) {
                            vals.push(convertToBool(args[i]));
                         }
                         else {
                             vm.reportError("Implies function accepts only arguments of type bool.");
                             ok = false;
                         }                         
                     }
                     if(ok) {
                         const result = callback(vals);
                         const val : BoolV = BoolV.getVal(result);                         
                         vm.finishStep(val, false);
                     }
                 } ;
             }

    export class World extends ObjectV {

        constructor(manager : TransactionManager ) {
            super(manager);
            //console.log("World's fields array is length: " + this.fields.length);

            const addCallback = (leftOperand: number, rightOperand: number): number => { return leftOperand + rightOperand; } ;
            const addstep = arithmeticStepperFactory(addCallback, 0);
            const plus = new BuiltInV(addstep);
            const addf = new Field("+", Type.TOP, manager, plus );
            this.addField(addf);

            const subCallback = (leftOperand: number, rightOperand: number): number => { return leftOperand - rightOperand; } ;
            const substep = arithmeticStepperFactory(subCallback, 0);
            const sub = new BuiltInV(substep);
            const subf = new Field("-", Type.TOP, manager, sub);
            this.addField(subf);

            const multCallback = (leftOperand: number, rightOperand: number): number => { return leftOperand * rightOperand; } ;
            const multstep = arithmeticStepperFactory(multCallback, 1);
            const mult = new BuiltInV(multstep);
            const multf = new Field("*", Type.TOP, manager, mult);
            this.addField(multf);

            const divCallback = (dividend: number, divisor: number) : number => {
                // In case of division by 0 we get + or - ininity.
                // Except 0/0 gives NaN
                return dividend/divisor;
            } ;
            const divstep = arithmeticStepperFactory(divCallback, 1);
            const div = new BuiltInV(divstep);
            const divf = new Field("/", Type.TOP, manager, div);
            this.addField(divf);

            const greaterthanCallback = (vals: Array<number>): boolean => {
              let result = true;
              for(let i = 0; i < vals.length-1; i++) { 
                if (!(vals[i] > vals[i+1])) result = false;
              }
              return result;
            } ;
            const greaterthanstep = comparatorStepperFactory(greaterthanCallback);
            const greaterthan = new BuiltInV(greaterthanstep);
            const greaterf = new Field(">", Type.TOP, manager, greaterthan);
            this.addField(greaterf);

            const greaterthanequalCallback = (vals: Array<number>): boolean => {
              let result = true;
              for(let i = 0; i < vals.length-1; i++) { 
                if (!(vals[i] >= vals[i+1])) result = false;
              }
              return result;
            } ;
            const greaterthanequalstep = comparatorStepperFactory(greaterthanequalCallback);
            const greaterthanequal = new BuiltInV(greaterthanequalstep);
            const greaterequalf = new Field(">=", Type.TOP, manager, greaterthanequal);
            this.addField(greaterequalf);

            const lessthanCallback = (vals: Array<number>): boolean => {
              let result = true;
              for(let i = 0; i < vals.length-1; i++) { 
                if (!(vals[i] < vals[i+1])) result = false;
              }
              return result;
            } ;
            const lessthanstep = comparatorStepperFactory(lessthanCallback);
            const lessthan = new BuiltInV(lessthanstep);
            const lessf = new Field("<", Type.TOP, manager, lessthan);
            this.addField(lessf);

            const lessthanequalCallback = (vals: Array<number>): boolean => {
              let result = true;
              for(let i = 0; i < vals.length-1; i++) { 
                if (!(vals[i] <= vals[i+1])) result = false;
              }
              return result;
            } ;
            const lessthanequalstep = comparatorStepperFactory(lessthanequalCallback);
            const lessequalthan = new BuiltInV(lessthanequalstep);
            const lessequalf = new Field("<=", Type.TOP, manager, lessequalthan);
            this.addField(lessequalf);

            function equalstep(vm : VMS, args : Array<Value>) : void {
                let bool : boolean;
                if (argsAreStrings(args)) {
                    bool = true ;
                    for (let i = 0; i < args.length - 1; i++) {
                        if ((args[i] as StringV).getVal() !== (args[i + 1] as StringV).getVal()) {
                            bool = false;
                        }
                    }
                } 
                else if( argsAreNumbers(args)) {
                    bool = true;
                    for (let i=0; i < args.length - 1; i++) {
                        if((args[i] as NumberV).getVal() !== (args[i +1] as NumberV).getVal()) {
                            bool = false;
                        }
                    }
                } 
                else if ( argsAreTuples(args)) {
                    bool = true;
                    for (let i=0; i < args.length - 1; i++) {
                        if((args[i] as TupleV).itemCount() !== (args[i+1] as TupleV).itemCount()) {
                            bool = false;
                            break;
                        }

                        for( let j=0; j < (args[i] as TupleV).itemCount() ; j++ ) {
                            if((args[i] as TupleV).getItemByIndex(j) !== (args[i+1] as TupleV).getItemByIndex(j)) {
                                bool = false;
                            }
                        }
                    }

                }
                 else if( argsAreDones( args ) ) {
                    bool = true ;
                } else if( argsAreNulls( args ) ) {
                    bool = true ;
                } else {
                    // In all other cases, we require pointer equality.
                    bool = true ;
                    for (let i = 0; i < args.length - 1; i++) {
                        if ( args[i] !== args[i + 1] ) {
                            bool = false ;
                        }
                    }
                }                
                const val : BoolV = BoolV.getVal(bool) ;
                vm.finishStep( val, false ) ;  
            }

            function notEqualStep(vm : VMS, args : Array<Value>) : void {
                // TODO Eliminate redundancy with EqualStep.
                let bool : boolean;
                if (argsAreStrings(args)) {
                    bool = true ;
                    for (let i = 0; i < args.length - 1; i++) {
                        if ((args[i] as StringV).getVal() === (args[i + 1] as StringV).getVal()) {
                            bool = false;
                        }
                    }
                } 
                else if( argsAreNumbers(args)) {
                    bool = true;
                    for (let i=0; i < args.length - 1; i++) {
                        if((args[i] as NumberV).getVal() === (args[i +1] as NumberV).getVal()) {
                            bool = false;
                        }
                    }
                }
                else if ( argsAreTuples(args)) {
                    bool = true;
                    for (let i=0; i < args.length - 1; i++) {
                        if((args[i] as TupleV).itemCount() === (args[i+1] as TupleV).itemCount()) {
                            bool = false;
                            break;
                        }

                        for( let j=0; j < (args[i] as TupleV).itemCount() ; j++ ) {
                            if((args[i] as TupleV).getItemByIndex(j) === (args[i+1] as TupleV).getItemByIndex(j)) {
                                bool = false;
                            }
                        }
                    }

                }
                 else if( argsAreDones( args ) ) {
                    bool = true ;
                } else if( argsAreNulls( args ) ) {
                    bool = true ;
                } else {
                    // In all other cases, we require pointer equality.
                    bool = true ;
                    for (let i = 0; i < args.length - 1; i++) {
                        if ( args[i] === args[i + 1] ) {
                            bool = false ;
                        }
                    }
                }
                const val : BoolV = BoolV.getVal(bool);
                vm.finishStep( val, false ) ;  
            }

            
            const equal = new BuiltInV(equalstep);
            const equalf = new Field("=", Type.TOP, manager, equal);
            this.addField(equalf);

            const notequal = new BuiltInV(notEqualStep);
            const notequalf = new Field("/=", Type.TOP, manager, notequal);
            this.addField(notequalf);

            const andCallback = (leftOperand: boolean, rightOperand: boolean): boolean => { return leftOperand && rightOperand; } ;
            const andstep = logicalStepperFactory(andCallback, true);
            const and = new BuiltInV(andstep);
            const andf = new Field("and", Type.TOP, manager, and);
            this.addField(andf);

            const orCallback = (leftOperand: boolean, rightOperand: boolean): boolean => { return leftOperand || rightOperand; } ;
            const orstep = logicalStepperFactory(orCallback, false);
            const or = new BuiltInV(orstep);
            const orf = new Field("or", Type.TOP, manager, or);
            this.addField(orf);

            const not = new BuiltInV(notStep);
            const notf = new Field("not", Type.TOP, manager, not );
            this.addField(notf);
            
            const impliesCallback = ( vals : Array<boolean>):boolean => {
                let result : boolean  = true;
                for(let i=0; i<vals.length - 1; i++) {
                    result = result && vals[i];
                }
                return !result || vals[vals.length -1];             
            } ;
            const impliesStep = impliesStepperFactory(impliesCallback);          
            const implies = new BuiltInV(impliesStep);
            const impliesf = new Field("implies", Type.TOP, manager, implies);
            this.addField(impliesf);

            function notStep(vm : VMS, args : Array<Value>) : void {
                if ( args.length !== 1) {
                    vm.reportError("not expects 1 argument of type boolean.");
                    return;
                }
                const bool = args[0];
                if (!(bool instanceof BoolV)) {
                    vm.reportError("not only works with boolean values.");
                    return;
                }
                const result = BoolV.getVal(!bool);
                vm.finishStep(result, false);
            }

            function lenStep(vm: VMS, args: Array<Value>) : void  {
                if (args.length !== 1) {
                    vm.reportError("len expects 1 argument, of type object.");
                    return;
                }
                const obj = args[0];
                if (!(obj instanceof ObjectV)) {
                    vm.reportError("len only works with object values.");
                    return;
                }
                const count = obj.numFields();
                const val = new NumberV(count);
                vm.finishStep(val, false);
            }

            const len = new BuiltInV(lenStep);
            const lenf = new Field("len", Type.TOP, manager, len);
            this.addField(lenf);

            const trueConstant = BoolV.trueValue;
            const trueConstantf = new Field("true", Type.TOP, manager, trueConstant);
            this.addField(trueConstantf);

            const falseConstant = BoolV.falseValue;
            const falseConstantf = new Field("false", Type.TOP, manager, falseConstant);
            this.addField(falseConstantf);

            function pushStep(vm: VMS, args: Array<Value>) : void {
                if (args.length !== 2) {
                    vm.reportError("push expects 2 arguments, an object and a value to be pushed.");
                    return;
                }
                const obj = args[0];
                if (!(obj instanceof ObjectV)) {
                    vm.reportError("First argument should be an object value.");
                    return;
                }
                const val = args[1];
                console.log(obj.numFields()+"");
                const field = new Field(obj.numFields()+"", Type.TOP, manager, val);
                obj.addField(field);
                vm.finishStep(TupleV.theDoneValue, false);
            }

            const push = new BuiltInV(pushStep);
            const pushf = new Field("push", Type.TOP, manager, push);
            this.addField(pushf);

            function popStep(vm: VMS, args: Array<Value>) : void {
                if (args.length !== 1) {
                    vm.reportError("pop expects 1 arguments of type object.");
                    return;
                }
                const obj = args[0];
                if (!(obj instanceof ObjectV)) {
                    vm.reportError("pop argument should be an object value.");
                    return;
                }
                const len = obj.numFields();
                if (!obj.hasField((len-1)+"")) {
                    vm.reportError("Cannot perform pop on " + obj.toString());
                    return;
                }
                obj.popField();
                vm.finishStep(TupleV.theDoneValue, false);
            }

            const pop = new BuiltInV(popStep);
            const popf = new Field("pop", Type.TOP, manager, pop);
            this.addField(popf);
        }
    }

    // TODO:  Really each library should be in its own module.
    // Having this here creates a dependence between the standard
    // library stuff and syemour.
    export class TurtleWorldObject extends ObjectV {

        constructor(  tw : seymour.TurtleWorld, tMan : TransactionManager ){
            super(tMan) ;

            const forwardStepper = (vm : VMS, args : Array<Value> ) : void => {
                    if( checkNumberOfArgs( 1, 1, args, vm ) 
                        && checkArgsAreNumbers(0, 1, args, vm ) ) {
                        const n : number = (args[0] as NumberV).converToNumber() ;
                        tw.forward( n ) ;
                        vm.finishStep( done, false ) ; } } ;
            const forwardValue = new BuiltInV( forwardStepper ) ;
            const forwardField = new Field("forward", Type.TOP, tMan, forwardValue) ;
            this.addField( forwardField ) ;


            const rightStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 1, 1, args, vm ) 
                    && checkArgsAreNumbers(0, 1, args, vm ) ) {
                    const n : number = (args[0] as NumberV).converToNumber() ;
                    tw.right( n ) ;
                    vm.finishStep( done, false ) ; } } ;
            const rightValue = new BuiltInV( rightStepper ) ;
            const rightField = new Field("right", Type.TOP, tMan, rightValue) ;
            this.addField( rightField ) ;


            const leftStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 1, 1, args, vm ) 
                    && checkArgsAreNumbers(0, 1, args, vm ) ) {
                    const n : number = (args[0] as NumberV).converToNumber() ;
                    tw.left( n ) ;
                    vm.finishStep( done , false) ; } } ;
            const leftValue = new BuiltInV( leftStepper ) ;
            const leftField = new Field("left", Type.TOP, tMan, leftValue) ;
            this.addField( leftField ) ;


            const penUpStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 0, 0, args, vm ) ) {
                    tw.penUp( ) ;
                    vm.finishStep( done, false ) ; } } ;
            const penUpValue = new BuiltInV( penUpStepper ) ;
            const penUpField = new Field("penUp", Type.TOP, tMan, penUpValue) ;
            this.addField( penUpField ) ;


            const penDownStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 0, 0, args, vm ) ) {
                    tw.penDown( ) ;
                    vm.finishStep( done, false ) ; } } ;
            const penDownValue = new BuiltInV( penDownStepper ) ;
            const penDownField = new Field("penDown", Type.TOP, tMan, penDownValue) ;
            this.addField( penDownField ) ;


            const hideStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 0, 0, args, vm ) ) {
                    tw.hide( ) ;
                    vm.finishStep( done, false ) ; } } ;
            const hideValue = new BuiltInV( hideStepper ) ;
            const hideField = new Field("hide", Type.TOP, tMan, hideValue) ;
            this.addField( hideField ) ;


            const showStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 0, 0, args, vm ) ) {
                    tw.show( ) ;
                    vm.finishStep( done, false ) ; } } ;
            const showValue = new BuiltInV( showStepper ) ;
            const showField = new Field("show", Type.TOP, tMan, showValue) ;
            this.addField( showField ) ;


            const clearStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 0, 0, args, vm ) ) {
                    tw.clear( ) ;
                    vm.finishStep( done, false ) ; } } ;
            const clearValue = new BuiltInV( clearStepper ) ;
            const clearField = new Field("clear", Type.TOP, tMan, clearValue) ;
            this.addField( clearField ) ;

            const setBackgroundStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 3, 3, args, vm ) 
                    && checkArgsAreNumbers(0, 3, args, vm ) ) {
                    const r : number = (args[0] as NumberV).converToNumber() ;
                    const g : number = (args[1] as NumberV).converToNumber() ;
                    const b : number = (args[2] as NumberV).converToNumber() ;
                    tw.setBackground( r,g,b ) ;
                    vm.finishStep( done, false ) ; } } ;
            const setBackgroundValue = new BuiltInV( setBackgroundStepper ) ;
            const setBackgroundField = new Field("setBackground", Type.TOP, tMan, setBackgroundValue) ;
            this.addField( setBackgroundField ) ;

            const setTurtleColorStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 3, 3, args, vm ) 
                    && checkArgsAreNumbers(0, 3, args, vm ) ) {
                    const r : number = (args[0] as NumberV).converToNumber() ;
                    const g : number = (args[1] as NumberV).converToNumber() ;
                    const b : number = (args[2] as NumberV).converToNumber() ;
                    tw.setTurtleColor( r,g,b ) ;
                    vm.finishStep( done, false ) ; } } ;
            const setTurtleColorValue = new BuiltInV( setTurtleColorStepper ) ;
            const setTurtleField = new Field("setTurtleColor", Type.TOP, tMan, setTurtleColorValue) ;
            this.addField( setTurtleField ) ;
        }
    }
}

export = world;
