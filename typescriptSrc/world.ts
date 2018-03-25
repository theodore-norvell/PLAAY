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
    import DoneV = valueTypes.DoneV;
    import Type = vms.Type;
    import VMS = vms.VMS;
    import EvalStack = vms.EvalStack;
    import Evaluation = vms.Evaluation;

    
    const done : DoneV = new DoneV() ;

    function checkNumberOfArgs( min : number, max : number, args : Array<Value>, vm : VMS ) : boolean {
        if( args.length < min || args.length > max ) {
            if( min===max ) {
                vm.reportError( "Expected " +min+ " arguments." ) ; }
            else {
                vm.reportError("Expected from " +min+ " to " +max+ " arguments." ) ; }
            return false ;
        } else {
            return true ; }
    }

    function checkArgsAreNumbers( first : number, cap : number, args : Array<Value>, vm : VMS ) : boolean {
        for( let i = first ; i < cap && i < args.length ; ++i ) {
            const arg = args[i] ;
            if( ! arg.isStringV() || ! canConvertToNumber( arg ) ) {
                vm.reportError( "Expected argument " +i+ " to be a number." ) ;
                return false ; } }
        return true ;
    }

    function canConvertToNumber( val : Value ) : boolean {
        if( val.isStringV() ) {
            const str = (val as StringV).getVal() ;
            return /^([0-9, ]+(\.[0-9, ]*)?|\.[0-9, ]+)$/.test(str) ;
        } else return false ;
    }
    
    function convertToNumber( val : Value ) : number {
        let str = (val as StringV).getVal() ;
        str = str.replace(/ |,/g, "" ) ;
        const n = parseFloat( str ) ;
        assert.check( ! isNaN( n ) ) ;
        return n ;
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
      if(!val.isStringV()) return false;
      const str = (val as StringV).getVal();
      return str === "true" || str === "false";
    }

    function convertToBool(val: Value) : boolean {
      return (val as StringV).getVal() === "true" ? true : false;
    }

    function arithmeticStepperFactory( callback: (leftOperand: number, rightOperand: number) => number )
             : (vms: VMS, args: Array<Value>) => void {
        return function(vm: VMS, args: Array<Value>) : void {
          const vals : Array<number>= [] ;
          let ok = true ;
          for( let i=0 ; i < args.length ; ++i ) {
              if( canConvertToNumber( args[i] ) ) {
                  vals.push( convertToNumber( args[i] ) ) ; }
              else {
                  vm.reportError( "The "+nth(i+1)+" argument is not a number.") ;
                  ok = false ; } }
          
          if( ok ) {
              const result = vals.reduce(callback);
              const val = new StringV(result+"");
              vm.finishStep(val);
          }
        } ;
    }

    function comparatorStepperFactory(callback: (vals: Array<number>) => boolean): (vms: VMS, args: Array<Value>) => void {
      return function(vm : VMS, args : Array<Value>) : void {
        const vals : Array<number>= [] ;
        let ok = true ;
        for( let i=0 ; i < args.length ; ++i ) {
            if( canConvertToNumber( args[i] ) ) {
                vals.push( convertToNumber( args[i] ) ) ; }
            else {
                vm.reportError( "The "+nth(i+1)+" argument is not a number.");
                ok = false ; } }
        
        if( ok ) {
            const result = callback(vals);
            const val = new StringV( result+"" );
            vm.finishStep( val ) ;
        }
      } ;
    }

    function logicalStepperFactory( callback: (leftOperand: boolean, rightOperand: boolean) => boolean)
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
            const result = vals.reduce(callback);
            const val = new StringV(result+"") ;
            vm.finishStep(val);
        }
      } ;
    }

    export class World extends ObjectV {

        constructor(manager : TransactionManager ) {
            super(manager);
            //console.log("World's fields array is length: " + this.fields.length);

            const addCallback = (leftOperand: number, rightOperand: number): number => { return leftOperand + rightOperand; } ;
            const addstep = arithmeticStepperFactory(addCallback);
            const plus = new BuiltInV(addstep);
            const addf = new Field("+", plus, Type.METHOD, true, true, manager);
            this.addField(addf);

            const subCallback = (leftOperand: number, rightOperand: number): number => { return leftOperand - rightOperand; } ;
            const substep = arithmeticStepperFactory(subCallback);
            const sub = new BuiltInV(substep);
            const subf = new Field("-", sub, Type.NUMBER, true, true, manager);
            this.addField(subf);

            const multCallback = (leftOperand: number, rightOperand: number): number => { return leftOperand * rightOperand; } ;
            const multstep = arithmeticStepperFactory(multCallback);
            const mult = new BuiltInV(multstep);
            const multf = new Field("*", mult, Type.NUMBER, true, true, manager);
            this.addField(multf);

            const divCallback = (dividend: number, divisor: number) : number => {
              assert.check(divisor !== 0, "Division by zero is not allowed");
              return dividend/divisor;
            } ;
            const divstep = arithmeticStepperFactory(divCallback);
            const div = new BuiltInV(divstep);
            const divf = new Field("/", div, Type.NUMBER, true, true, manager);
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
            const greaterf = new Field(">", greaterthan, Type.BOOL, true, true, manager);
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
            const greaterequalf = new Field(">=", greaterthanequal, Type.BOOL, true, true, manager);
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
            const lessf = new Field("<", lessthan, Type.BOOL, true, true, manager);
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
            const lessequalf = new Field("<=", lessequalthan, Type.BOOL, true, true, manager);
            this.addField(lessequalf);

            function equalstep(vm : VMS, args : Array<Value>) : void {
              let bool = true;
              for(let i = 0; i < args.length-1; i++) { 
                if (!(args[i] === args[i+1])) bool = false;
              }
              const val = new StringV( bool+"" ) ;
              vm.finishStep( val ) ;  
            }
            const equal = new BuiltInV(equalstep);
            const equalf = new Field("=", equal, Type.BOOL, true, true, manager);
            this.addField(equalf);

            const andCallback = (leftOperand: boolean, rightOperand: boolean): boolean => { return leftOperand && rightOperand; } ;
            const andstep = logicalStepperFactory(andCallback);
            const and = new BuiltInV(andstep);
            const andf = new Field("and", and, Type.BOOL, true, true, manager);
            this.addField(andf);

            const orCallback = (leftOperand: boolean, rightOperand: boolean): boolean => { return leftOperand || rightOperand; } ;
            const orstep = logicalStepperFactory(orCallback);
            const or = new BuiltInV(orstep);
            const orf = new Field("or", or, Type.BOOL, true, true, manager);
            this.addField(orf);
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
                        const n : number = convertToNumber( args[0] ) ;
                        tw.forward( n ) ;
                        vm.finishStep( done ) ; } } ;
            const forwardValue = new BuiltInV( forwardStepper ) ;
            const forwardField = new Field("forward", forwardValue, Type.METHOD, true, true, tMan) ;
            this.addField( forwardField ) ;


            const rightStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 1, 1, args, vm ) 
                    && checkArgsAreNumbers(0, 1, args, vm ) ) {
                    const n : number = convertToNumber( args[0] ) ;
                    tw.right( n ) ;
                    vm.finishStep( done ) ; } } ;
            const rightValue = new BuiltInV( rightStepper ) ;
            const rightField = new Field("right", rightValue, Type.METHOD, true, true, tMan) ;
            this.addField( rightField ) ;


            const leftStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 1, 1, args, vm ) 
                    && checkArgsAreNumbers(0, 1, args, vm ) ) {
                    const n : number = convertToNumber( args[0] ) ;
                    tw.left( n ) ;
                    vm.finishStep( done ) ; } } ;
            const leftValue = new BuiltInV( leftStepper ) ;
            const leftField = new Field("left", leftValue, Type.METHOD, true, true, tMan) ;
            this.addField( leftField ) ;


            const penUpStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 0, 0, args, vm ) ) {
                    tw.penUp( ) ;
                    vm.finishStep( done ) ; } } ;
            const penUpValue = new BuiltInV( penUpStepper ) ;
            const penUpField = new Field("penUp", penUpValue, Type.METHOD, true, true, tMan) ;
            this.addField( penUpField ) ;


            const penDownStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 0, 0, args, vm ) ) {
                    tw.penDown( ) ;
                    vm.finishStep( done ) ; } } ;
            const penDownValue = new BuiltInV( penDownStepper ) ;
            const penDownField = new Field("penDown", penDownValue, Type.METHOD, true, true, tMan) ;
            this.addField( penDownField ) ;


            const hideStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 0, 0, args, vm ) ) {
                    tw.hide( ) ;
                    vm.finishStep( done ) ; } } ;
            const hideValue = new BuiltInV( hideStepper ) ;
            const hideField = new Field("hide", hideValue, Type.METHOD, true, true, tMan) ;
            this.addField( hideField ) ;


            const showStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 0, 0, args, vm ) ) {
                    tw.show( ) ;
                    vm.finishStep( done ) ; } } ;
            const showValue = new BuiltInV( showStepper ) ;
            const showField = new Field("show", showValue, Type.METHOD, true, true, tMan) ;
            this.addField( showField ) ;


            const clearStepper = (vm : VMS, args : Array<Value> ) : void => {
                if( checkNumberOfArgs( 0, 0, args, vm ) ) {
                    tw.clear( ) ;
                    vm.finishStep( done ) ; } } ;
            const clearValue = new BuiltInV( clearStepper ) ;
            const clearField = new Field("clear", clearValue, Type.METHOD, true, true, tMan) ;
            this.addField( clearField ) ;
        }
    }
}

export = world;
