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


    function checkNumberArgs( min : number, max : number, args : Array<Value>, vms : VMS ) : void {
        if( args.length < min || args.length > max ) {
            if( min===max ) {
                vms.reportError( "Expected " +min+ " arguments." ) ; }
            else {
                vms.reportError("Expected from " +min+ " to " +max+ " arguments." ) ; }
        }
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
      let str = (val as StringV).getVal();
      return str === "true" || str === "false";
    }

    function convertToBool(val: Value) : boolean {
      return (val as StringV).getVal() === "true" ? true : false;
    }

    function arithmeticStepperFactory(callback: (leftOperand: number, rightOperand: number) => number): (vms: VMS, args: Array<Value>) => void {
        return function(vms: VMS, args: Array<Value>) : void {
          const vals : Array<number>= [] ;
          let ok = true ;
          for( let i=0 ; i < args.length ; ++i ) {
              if( canConvertToNumber( args[i] ) ) {
                  vals.push( convertToNumber( args[i] ) ) ; }
              else {
                  vms.reportError( "The "+nth(i+1)+" argument is not a number.") ;
                  ok = false ; } }
          
          if( ok ) {
              const result = vals.reduce(callback);
              const val = new StringV(result+"");
              vms.finishStep(val);
          }
        }
    }

    function comparatorStepperFactory(callback: (vals: Array<number>) => boolean): (vms: VMS, args: Array<Value>) => void {
      return function(vms : VMS, args : Array<Value>) : void {
        const vals : Array<number>= [] ;
        let ok = true ;
        for( let i=0 ; i < args.length ; ++i ) {
            if( canConvertToNumber( args[i] ) ) {
                vals.push( convertToNumber( args[i] ) ) ; }
            else {
                vms.reportError( "The "+nth(i+1)+" argument is not a number.");
                ok = false ; } }
        
        if( ok ) {
            const result = callback(vals);
            const val = new StringV( result+"" );
            vms.finishStep( val ) ;
        }
      }
    }

    function logicalStepperFactory(callback: (leftOperand: boolean, rightOperand: boolean) => boolean): (vms: VMS, args: Array<Value>) => void {
      return function andstep( vms : VMS, args : Array<Value> ) : void {
        const vals : Array<boolean>= [] ;
        let ok = true ;
        for( let i=0 ; i < args.length ; ++i ) {
            if(isBool(args[i])) {
              vals.push(convertToBool(args[i]));                    
            } else {
              vms.reportError("The "+nth(i+1)+" argument is not a bool.");
              ok = false;
            }
        }    
        if(ok) {
            const result = vals.reduce(callback);
            const val = new StringV(result+"") ;
            vms.finishStep(val);
        }
      }
    }

    export class World extends ObjectV {

        constructor(manager : TransactionManager ) {
            super(manager);
            //console.log("World's fields array is length: " + this.fields.length);

            let addCallback = (leftOperand: number, rightOperand: number): number => { return leftOperand + rightOperand; }
            let addstep = arithmeticStepperFactory(addCallback);
            const plus = new BuiltInV(addstep);
            const addf = new Field("+", plus, Type.METHOD, true, true, manager);
            this.addField(addf);

            let subCallback = (leftOperand: number, rightOperand: number): number => { return leftOperand - rightOperand; }
            let substep = arithmeticStepperFactory(subCallback);
            var sub = new BuiltInV(substep);
            var subf = new Field("-", sub, Type.NUMBER, true, true, manager);
            this.addField(subf);

            let multCallback = (leftOperand: number, rightOperand: number): number => { return leftOperand * rightOperand; } 
            let multstep = arithmeticStepperFactory(multCallback);
            var mult = new BuiltInV(multstep);
            var multf = new Field("*", mult, Type.NUMBER, true, true, manager);
            this.addField(multf);

            let divCallback = (dividend: number, divisor: number) : number => {
              assert.check(divisor !== 0, "Division by zero is not allowed");
              return dividend/divisor;
            }
            let divstep = arithmeticStepperFactory(divCallback);
            var div = new BuiltInV(divstep);
            var divf = new Field("/", div, Type.NUMBER, true, true, manager);
            this.addField(divf);

            let greaterthanCallback = (vals: Array<number>): boolean => {
              let result = true;
              for(let i = 0; i < vals.length-1; i++) { 
                if (!(vals[i] > vals[i+1])) result = false;
              }
              return result;
            }
            let greaterthanstep = comparatorStepperFactory(greaterthanCallback);
            var greaterthan = new BuiltInV(greaterthanstep);
            var greaterf = new Field(">", greaterthan, Type.BOOL, true, true, manager);
            this.addField(greaterf);

            let greaterthanequalCallback = (vals: Array<number>): boolean => {
              let result = true;
              for(let i = 0; i < vals.length-1; i++) { 
                if (!(vals[i] >= vals[i+1])) result = false;
              }
              return result;
            }
            let greaterthanequalstep = comparatorStepperFactory(greaterthanequalCallback);
            var greaterthanequal = new BuiltInV(greaterthanequalstep);
            var greaterequalf = new Field(">=", greaterthanequal, Type.BOOL, true, true, manager);
            this.addField(greaterequalf);

            let lessthanCallback = (vals: Array<number>): boolean => {
              let result = true;
              for(let i = 0; i < vals.length-1; i++) { 
                if (!(vals[i] < vals[i+1])) result = false;
              }
              return result;
            }
            let lessthanstep = comparatorStepperFactory(lessthanCallback);
            var lessthan = new BuiltInV(lessthanstep);
            var lessf = new Field("<", lessthan, Type.BOOL, true, true, manager);
            this.addField(lessf);

            let lessthanequalCallback = (vals: Array<number>): boolean => {
              let result = true;
              for(let i = 0; i < vals.length-1; i++) { 
                if (!(vals[i] <= vals[i+1])) result = false;
              }
              return result;
            }
            let lessthanequalstep = comparatorStepperFactory(lessthanequalCallback);
            var lessequalthan = new BuiltInV(lessthanequalstep);
            var lessequalf = new Field("<=", lessequalthan, Type.BOOL, true, true, manager);
            this.addField(lessequalf);

            function equalstep(vms : VMS, args : Array<Value>) : void {
              let bool = true;
              for(let i = 0; i < args.length-1; i++) { 
                if (!(args[i] === args[i+1])) bool = false;
              }
              const val = new StringV( bool+"" ) ;
              vms.finishStep( val ) ;  
            }
            var equal = new BuiltInV(equalstep);
            var equalf = new Field("=", equal, Type.BOOL, true, true, manager);
            this.addField(equalf);

            let andCallback = (leftOperand: boolean, rightOperand: boolean): boolean => { return leftOperand && rightOperand; }
            let andstep = logicalStepperFactory(andCallback);
            var and = new BuiltInV(andstep);
            var andf = new Field("and", and, Type.BOOL, true, true, manager);
            this.addField(andf);

            let orCallback = (leftOperand: boolean, rightOperand: boolean): boolean => { return leftOperand || rightOperand; }
            let orstep = logicalStepperFactory(orCallback);
            var or = new BuiltInV(orstep);
            var orf = new Field("or", or, Type.BOOL, true, true, manager);
            this.addField(orf);

            function lenStep(vms: VMS, args: Array<Value>) : void  {
              if (args.length !== 1) {
                vms.reportError("len expects 1 argument, of type object.");
                return;
              }
              const obj = args[0];
              if (!(obj instanceof ObjectV)) {
                vms.reportError("len only works with object values.");
                return;
              }
              const len = obj.numFields();
              const val = new StringV(len+"");
              vms.finishStep(val);
            }

            const len = new BuiltInV(lenStep);
            const lenf = new Field("len", len, Type.NUMBER, true, true, manager);
            this.addField(lenf);

            function pushStep(vms: VMS, args: Array<Value>) {
              if (args.length !== 2) {
                vms.reportError("push expects 2 arguments, an object and a value to be pushed.");
                return;
              }
              const obj = args[0];
              if (!(obj instanceof ObjectV)) {
                vms.reportError("First argument should be an object value.");
                return;
              }
              const val = args[1];
              console.log(obj.numFields()+"");
              const field = new Field(obj.numFields()+"", val, Type.NOTYPE, false, false, manager);
              obj.addField(field);
              vms.finishStep(DoneV.theDoneValue);
            }

            const push = new BuiltInV(pushStep);
            const pushf = new Field("push", push, Type.NOTYPE, true, true, manager);
            this.addField(pushf);

          function popStep(vms: VMS, args: Array<Value>) {
            if (args.length !== 1) {
              vms.reportError("pop expects 1 arguments of type object.");
              return;
            }
            const obj = args[0];
            if (!(obj instanceof ObjectV)) {
              vms.reportError("pop argument should be an object value.");
              return;
            }
            const len = obj.numFields();
            if (!obj.hasField((len-1)+"")) {
              vms.reportError("Cannot perform pop on " + obj.toString());
              return;
            }
            obj.popField();
            vms.finishStep(DoneV.theDoneValue);
          }

          const pop = new BuiltInV(popStep);
          const popf = new Field("pop", pop, Type.NOTYPE, false, false, manager);
          this.addField(popf);
        }
    }

    // TODO:  Really each library should be in its own module.
    // Having this here creates a dependence between the standard
    // library stuff and syemour.
    export class TurtleWorldObject extends ObjectV {

        constructor(  tw : seymour.TurtleWorld, manager : TransactionManager ){
            super(manager) ;

            // The forward function returns the function
            // that does the work of the builtin function.
            function forward ( )
                    : ( vms : VMS, args : Array<Value> ) => void {
                return  (vms : VMS, args : Array<Value> ) => {
                    if( checkNumberArgs( 1, 1, args, vms ) ) {
                        const n : number = convertToNumber( args[0] ) ;
                        tw.forward( n ) ;
                        vms.finishStep( done ) ;
                    }
                } ;
            }

            
            const forw = new BuiltInV(forward());
            const forwardf = new Field("forward", forw, Type.METHOD, true, true, manager );
            this.addField(forwardf);

            // TODO The other builtins for the TurtleWorld

            // var pen = new BuiltInV(this.penUp);
            // var penf = new Field("penup", pen, Type.NUMBER, true);
            // this.addField(penf);

            // var right = new BuiltInV(this.right);
            // var rightf = new Field("right", right, Type.NUMBER, true);
            // this.addField(rightf);

            // var left = new BuiltInV(this.left);
            // var leftf = new Field("left", left, Type.NUMBER, true);
            // this.addField(leftf);

            // var clear = new BuiltInV(this.clear);
            // var clearf = new Field("clear", clear, Type.NUMBER, true);
            // this.addField(clearf);

            // var show = new BuiltInV(this.show);
            // var showf = new Field("show", show, Type.NUMBER, true);
            // this.addField(showf);

            // var hide = new BuiltInV(this.hide);
            // var hidef = new Field("hide", hide, Type.NUMBER, true);
            // this.addField(hidef);
        }
    }
}

export = world;
