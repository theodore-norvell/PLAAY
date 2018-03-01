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
import collections = require( './collections' ) ;
import pnode = require( './pnode' ) ;
import seymour = require('./seymour') ;
import valueTypes = require( './valueTypes' ) ;
import vms = require('./vms');
import { NullV } from './valueTypes';
import { TransactionManager } from './backtracking';

/** This module contains code for the standard library.
 * 
 */
module world {
    import EvalStack = vms.EvalStack;
    import list = collections.list;
    import List = collections.List;
    import ObjectV = valueTypes.ObjectV;
    import Field  = valueTypes.Field;
    import Value = vms.Value;
    import BuiltInV = valueTypes.BuiltInV;
    import Type = vms.Type;
    import VMS = vms.VMS;
    import Evaluation = vms.Evaluation;
    import StringV = valueTypes.StringV;
    import DoneV = valueTypes.DoneV;
    import PNode = pnode.PNode;

    
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

    export class World extends ObjectV {
        protected stepperFactory: {[value: string]: (vms : VMS) => void;};

        constructor(manager : TransactionManager ) {
            super(manager);
            //console.log("World's fields array is length: " + this.fields.length);

            this.stepperFactory = {};

            function addstep(vms: VMS) : void {
              const node = vms.getPendingNode();
              const vals : Array<number>= [];
              let ok = true;
              if (node.count() > 0) {
                  for (let i = 0; i < node.count(); i++) {
                      let childVal = vms.getChildVal(i);
                      if (canConvertToNumber(childVal)) {
                          vals.push(convertToNumber(childVal))
                      } else {
                          vms.reportError( "The "+nth(i+1)+" argument is not a number.");
                          ok = false; 
                      } 
                  }
              }  
              if(ok) {
                  const sum = vals.reduce( (s, x) => s+x, 0 ) ;
                  const val = new StringV( sum+"") ;
                  vms.finishStep( val ) ;
              }
            }

            const plus = new BuiltInV(addstep);
            const addf = new Field("+", plus, Type.METHOD, true, true, manager);
            this.addField( addf ) ;
            this.stepperFactory["+"] = addstep;

            function substep(vms: VMS) : void {
              const node = vms.getPendingNode();
              const vals : Array<number>= [];
              let ok = true;
              if (node.count() > 0) {
                  for (let i = 0; i < node.count(); i++) {
                      let childVal = vms.getChildVal(i);
                      if (canConvertToNumber(childVal)) {
                          vals.push(convertToNumber(childVal))
                      } else {
                          vms.reportError( "The "+nth(i+1)+" argument is not a number.");
                          ok = false; 
                      } 
                  }
              }  
              if(ok) {
                  const diff = vals.reduce( (s, x) => s-x) ;
                  const val = new StringV( diff+"") ;
                  vms.finishStep( val ) ;
              }
            }

            var sub = new BuiltInV(substep);
            var subf = new Field("-", sub, Type.NUMBER, true, true, manager );
            this.addField(subf);
            this.stepperFactory["-"] = substep;

            function multstep(vms: VMS) : void {
              const node = vms.getPendingNode();
              const vals : Array<number>= [];
              let ok = true;
              if (node.count() > 0) {
                  for (let i = 0; i < node.count(); i++) {
                      let childVal = vms.getChildVal(i);
                      if (canConvertToNumber(childVal)) {
                          vals.push(convertToNumber(childVal))
                      } else {
                          vms.reportError( "The "+nth(i+1)+" argument is not a number.");
                          ok = false; 
                      } 
                  }
              }  
              if(ok) {
                  const prod = vals.reduce( (s, x) => s*x) ;
                  const val = new StringV( prod+"") ;
                  vms.finishStep( val ) ;
              }
            }

            var mult = new BuiltInV(multstep);
            var multf = new Field("*", mult, Type.NUMBER, true, true, manager );
            this.addField(multf);
            this.stepperFactory["*"] = multstep;

            function divstep(vms: VMS) : void {
              const node = vms.getPendingNode();
              const vals : Array<number>= [];
              let ok = true;
              if (node.count() > 0) {
                  for (let i = 0; i < node.count(); i++) {
                      let childVal = vms.getChildVal(i);
                      if (canConvertToNumber(childVal)) {
                          vals.push(convertToNumber(childVal))
                      } else {
                          vms.reportError( "The "+nth(i+1)+" argument is not a number.");
                          ok = false; 
                      } 
                  }
              }  
              if(ok) {
                  const quot = vals.reduce( (s, x) => s/x) ;
                  const val = new StringV( quot+"") ;
                  vms.finishStep( val ) ;
              }
            }

            var div = new BuiltInV(divstep);
            var divf = new Field("/", div, Type.NUMBER, true, true, manager);
            this.addField(divf);
            this.stepperFactory["/"] = divstep;

            // TODO create the functions for the following builtin function.

            // var greaterthan = new BuiltInV(greaterthanstep);
            // var greaterf = new Field(">", greaterthan, Type.BOOL, true);

            // this.fields.push(greaterf);


            // var greaterthanequal = new BuiltInV(greaterthanequalstep);
            // var greaterequalf = new Field(">=", greaterthanequal, Type.BOOL, true);

            // this.fields.push(greaterequalf);

            // var lessthan = new BuiltInV(lessthanstep);
            // var lessf = new Field("<", lessthan, Type.BOOL, true);

            // this.fields.push(lessf);

            // var lessequalthan = new BuiltInV(lessthanequalstep);
            // var lessequalf = new Field("<=", lessequalthan, Type.BOOL, true);

            // this.fields.push(lessequalf);

            // var equal = new BuiltInV(equalstep);
            // var equalf = new Field("==", equal, Type.BOOL, true);

            // this.fields.push(equalf);


            // var and = new BuiltInV(andstep);
            // var andf = new Field("&", and, Type.BOOL, true);

            // this.fields.push(andf);


            // var or = new BuiltInV(orstep);
            // var orf = new Field("|", or, Type.BOOL, true);

            // this.fields.push(orf);
        }

        public getStepperFactory() : {[value: string]: (vms : VMS) => void;} {
          return this.stepperFactory;
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
            // this.fields.push(penf);

            // var right = new BuiltInV(this.right);
            // var rightf = new Field("right", right, Type.NUMBER, true);
            // this.fields.push(rightf);

            // var left = new BuiltInV(this.left);
            // var leftf = new Field("left", left, Type.NUMBER, true);
            // this.fields.push(leftf);

            // var clear = new BuiltInV(this.clear);
            // var clearf = new Field("clear", clear, Type.NUMBER, true);
            // this.fields.push(clearf);

            // var show = new BuiltInV(this.show);
            // var showf = new Field("show", show, Type.NUMBER, true);
            // this.fields.push(showf);

            // var hide = new BuiltInV(this.hide);
            // var hidef = new Field("hide", hide, Type.NUMBER, true);
            // this.fields.push(hidef);
        }
    }
}

export = world;