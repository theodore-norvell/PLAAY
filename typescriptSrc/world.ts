/**
 * Created by Jessica on 2/22/2016.
 */

/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="seymour.ts" />
/// <reference path="vms.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;
import pnode = require( './pnode' ) ;
import seymour = require('./seymour') ;
import vms = require('./vms');

module world {
    import EvalStack = vms.EvalStack;
    import list = collections.list;
    import List = collections.List;
    import ObjectV = vms.ObjectV;
    import Field  = vms.Field;
    import Value = vms.Value;
    import BuiltInV = vms.BuiltInV;
    import Type = vms.Type;
    import VMS = vms.VMS;
    import Evaluation = vms.Evaluation;
    import StringV = vms.StringV;
    import DoneV = vms.DoneV;
    import PNode = pnode.PNode;

    
   /*private*/ var done : DoneV = new DoneV() ;

    export class World extends ObjectV {
        fields:Array<Field>;


        constructor() {
            super();
            console.log("World's fields array is length: " + this.fields.length);

            function addstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length ; i ++) {
                    //then check right side
                    if (! (rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")){
                        isNum = false;
                    }
                }

                if (isNum) {
                    var v = new StringV(String(Number(ls.getVal()) + Number(rs.getVal())));
                    evalu.finishStep(v);
                } else {
                    throw new Error("Error evaulating " + ls.getVal() + " + " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }

            var plus = new BuiltInV(addstep);
            var addf = new Field("+", plus, Type.NUMBER, true);

            this.fields.push(addf);

            function substep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length ; i ++) {
                    //then check right side
                    if (! (rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")){
                        isNum = false;
                    }
                }

                if (isNum) {
                    var v = new StringV(String(Number(ls.getVal()) - Number(rs.getVal())));
                    evalu.finishStep(v);
                } else {
                    throw new Error("Error evaulating " + ls.getVal() + " - " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }

            var sub = new BuiltInV(substep);
            var subf = new Field("-", sub, Type.NUMBER, true);

            this.fields.push(subf);

            function multstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length ; i ++) {
                    //then check right side
                    if (! (rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")){
                        isNum = false;
                    }
                }

                if (isNum) {
                    var v = new StringV(String(Number(ls.getVal()) * Number(rs.getVal())));
                    evalu.finishStep(v);
                } else {
                    throw new Error("Error evaulating " + ls.getVal() + " * " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }

            var mult = new BuiltInV(multstep);
            var multf = new Field("*", mult, Type.NUMBER, true);

            this.fields.push(multf);

            function divstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length ; i ++) {
                    //then check right side
                    if (! (rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")){
                        isNum = false;
                    }
                }

                if (isNum) {
                    var v = new StringV(String(Number(ls.getVal()) / Number(rs.getVal())));
                    evalu.finishStep(v);
                } else {
                    throw new Error("Error evaulating " + ls.getVal() + " / " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }

            var div = new BuiltInV(divstep);
            var divf = new Field("/", div, Type.NUMBER, true);

            this.fields.push(divf);

            function greaterthanstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length ; i ++) {
                    //then check right side
                    if (! (rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")){
                        isNum = false;
                    }
                }

                if (isNum) {
                    var v;
                    if (Number(ls.getVal()) > Number(rs.getVal())) {
                        v = new StringV("true");
                    }
                    else {
                        v = new StringV("false");
                    }
                    evalu.finishStep(v);
                } else {
                    throw new Error("Error evaulating " + ls.getVal() + " > " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }

            var greaterthan = new BuiltInV(greaterthanstep);
            var greaterf = new Field(">", greaterthan, Type.BOOL, true);

            this.fields.push(greaterf);

            function greaterthanequalstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length ; i ++) {
                    //then check right side
                    if (! (rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")){
                        isNum = false;
                    }
                }

                if (isNum) {
                    var v;
                    if (Number(ls.getVal()) >= Number(rs.getVal())) {
                        v = new StringV("true");
                    }
                    else {
                        v = new StringV("false");
                    }
                    evalu.finishStep(v);
                } else {
                    throw new Error("Error evaluating " + ls.getVal() + " >= " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }

            var greaterthanequal = new BuiltInV(greaterthanequalstep);
            var greaterequalf = new Field(">=", greaterthanequal, Type.BOOL, true);

            this.fields.push(greaterequalf);

            function lessthanstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length ; i ++) {
                    //then check right side
                    if (! (rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")){
                        isNum = false;
                    }
                }

                if (isNum) {
                    var v;
                    if (Number(ls.getVal()) < Number(rs.getVal())) {
                        v = new StringV("true");
                    }
                    else {
                        v = new StringV("false");
                    }
                    evalu.finishStep(v);
                }
                else {
                    throw new Error("Error evaulating " + ls.getVal() + " < " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }

            var lessthan = new BuiltInV(lessthanstep);
            var lessf = new Field("<", lessthan, Type.BOOL, true);

            this.fields.push(lessf);

            function lessthanequalstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++) {
                    //first check left side
                    if (!(ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )) {
                        isNum = false;
                    }
                }
                for (var i = 0; i < rs.getVal().length ; i ++) {
                    //then check right side
                    if (! (rs.getVal().charAt(i) == "0" || rs.getVal().charAt(i) == "1"
                        || rs.getVal().charAt(i) == "2" || rs.getVal().charAt(i) == "3"
                        || rs.getVal().charAt(i) == "4" || rs.getVal().charAt(i) == "5"
                        || rs.getVal().charAt(i) == "6" || rs.getVal().charAt(i) == "7"
                        || rs.getVal().charAt(i) == "8" || rs.getVal().charAt(i) == "9"
                        || rs.getVal().charAt(i) == "." || rs.getVal().charAt(0) == "-")){
                        isNum = false;
                    }
                }

                if (isNum) {
                    var v;
                    if (Number(ls.getVal()) <= Number(rs.getVal())) {
                        v = new StringV("true");
                    }
                    else {
                        v = new StringV("false");
                    }
                    evalu.finishStep(v);
                }
                else {
                    throw new Error("Error evaulating " + ls.getVal() + " <= " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }

            var lessequalthan = new BuiltInV(lessthanequalstep);
            var lessequalf = new Field("<=", lessequalthan, Type.BOOL, true);

            this.fields.push(lessequalf);

            function equalstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);


                var v;

                if (ls.getVal() == rs.getVal()) {
                    v = new StringV("true");
                }
                else {
                    v = new StringV("false");
                }

                evalu.finishStep( v );
            }

            var equal = new BuiltInV(equalstep);
            var equalf = new Field("==", equal, Type.BOOL, true);

            this.fields.push(equalf);

            function andstep(node : PNode, evalu : Evaluation ) {
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);


                var v;

                if (ls.getVal() != ("true" || "false") ) {
                    throw new Error("Error evaulating " + ls.getVal() + " as a logical value!");
                }

                if (rs.getVal() != ("true" || "false") ) {
                    throw new Error("Error evaulating " + rs.getVal() + " as a logical value!");
                }

                if (ls.getVal() == "true" && rs.getVal() == "true") {
                    v = new StringV("true");
                }
                else {
                    v = new StringV("false");
                }

                evalu.finishStep( v );
            }

            var and = new BuiltInV(andstep);
            var andf = new Field("&", and, Type.BOOL, true);

            this.fields.push(andf);

            function orstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.map.get(leftside);
                var rs = <StringV>evalu.map.get(rightside);

                if (ls.getVal() != ("true" || "false") ) {
                    throw new Error("Error evaulating " + ls.getVal() + " as a logical value!");
                }

                if (rs.getVal() != ("true" || "false") ) {
                    throw new Error("Error evaulating " + rs.getVal() + " as a logical value!");
                }

                var v;

                if (ls.getVal() == "true" || rs.getVal() == "true") {
                    v = new StringV("true");
                }
                else {
                    v = new StringV("false");
                }

                evalu.finishStep( v );
            }

            var or = new BuiltInV(orstep);
            var orf = new Field("|", or, Type.BOOL, true);

            this.fields.push(orf);
        }

        //this.values = new ObjectV();

        public numFields():Number {
            return this.fields.length;
        }

        public addField(field:Field) {
            this.fields.push(field);
        }

        public deleteField(fieldName:string):boolean {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName() === fieldName) {
                    this.fields.splice(i, 1);
                    return true;
                }
            }

            return false;
        }

        public getField(fieldName:string):Field {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName() === fieldName) {
                    return this.fields[i];
                }
            }
            return null;
        }
    }

    export class TurtleWorldObject extends ObjectV {
        private tw : seymour.TurtleWorld  ;

        constructor(  tw : seymour.TurtleWorld ){
            super() ;
            this.tw = tw ;

            //mutators
            var pen = new BuiltInV(this.penUp);
            var penf = new Field("penup", pen, Type.NUMBER, true);
            this.fields.push(penf);

            var forw = new BuiltInV(this.forward);
            var forwardf = new Field("forward", forw, Type.NUMBER, true);
            this.fields.push(forwardf);

            var right = new BuiltInV(this.right);
            var rightf = new Field("right", right, Type.NUMBER, true);
            this.fields.push(rightf);

            var left = new BuiltInV(this.left);
            var leftf = new Field("left", left, Type.NUMBER, true);
            this.fields.push(leftf);

            var clear = new BuiltInV(this.clear);
            var clearf = new Field("clear", clear, Type.NUMBER, true);
            this.fields.push(clearf);

            var show = new BuiltInV(this.show);
            var showf = new Field("show", show, Type.NUMBER, true);
            this.fields.push(showf);

            var hide = new BuiltInV(this.hide);
            var hidef = new Field("hide", hide, Type.NUMBER, true);
            this.fields.push(hidef);

        }

        forward(node : PNode, evalu : Evaluation ) {
            checkNumberArgs( 0, evalu, "forward" ) ;
            var n : number = getNumber( getArg( 0, evalu ), "forward", 0 ) ;
            this.tw.forward( n ) ;
            evalu.finishStep( done ) ;
        }

        clear(node : PNode, evalu : Evaluation) {
            checkNumberArgs( 0, evalu, "clear" ) ;
            this.tw.clear() ;
            evalu.finishStep( done ) ;
        }

        right( node : PNode, evalu : Evaluation ) {
            checkNumberArgs( 0, evalu, "right" ) ;
            var n : number = getNumber( getArg( 0, evalu ), "right", 0 ) ;
            this.tw.right( n ) ;
            evalu.finishStep( done ) ;
        }

        left( node : PNode, evalu : Evaluation ) {
            checkNumberArgs( 0, evalu, "left" ) ;
            var n : number = getNumber( getArg( 0, evalu ), "left", 0 ) ;
            this.tw.left( n ) ;
            evalu.finishStep( done ) ;
        }

        penUp(node : PNode, evalu : Evaluation ) {
            checkNumberArgs( 0, evalu , "penUp" ) ;
            this.tw.setPenDown( false ) ;
            evalu.finishStep( done ) ;
        }

        penDown(node : PNode, evalu : Evaluation ) {
            checkNumberArgs( 0, evalu, "penDown" ) ;
            this.tw.setPenDown( true ) ;
            evalu.finishStep( done ) ;
        }

        hide(node : PNode, evalu : Evaluation) {
            checkNumberArgs( 0, evalu, "hide" ) ;
            this.tw.hide() ;
            evalu.finishStep( done ) ;
        }

        show(node : PNode, evalu : Evaluation) {
            checkNumberArgs( 0, evalu, "show" ) ;
            this.tw.show() ;
            evalu.finishStep( done ) ;
        }
    }

    /* private */ function checkNumberArgs( n : number, evalu : Evaluation, name : string ) : void {
        // TODO This following is all wrong, since it assumes the pending node is a callWorld.
        // But it could also be a call node.
        // In fact we should be doing built-ins completely differently.
        const node : PNode = evalu.getRoot().get( evalu.getPending() );
        if( node.count() != n+1 ) {
            // TODO We should not handle user errors by throwing exceptions.
            throw new Error( "Wrong number of arguments to " +name+ " expected " +n+ "."  ) ; }
    }

    /* private */ function getArg( n : number, evalu : Evaluation ) : Value {
        // TODO This following is all wrong, since it assumes the pending node is a callWorld.
        // But it could also be a call node.
        const path : Array<number>  = evalu.getPending().concat( [n] ) ;
        const val : Value = evalu.getValMap().get( path ) ;
        assert.check( val != null ) ;
        return val ;
    }

    /* private */ function getNumber( val : Value, name : string, n : number ) : number {
        // TODO: At this point there is no NumberV class implemented.
        // This is a mistake. There should be such a class and it should only
        // be possible to turn such a value into a number.
        // For now we make do with the StringV class.
        if( ! val.isStringV() )
            throw new Error( "Expected a string as argument " +n+ " to " +name+ "." ) ;
        else {
            const str : string = (val as StringV).getVal() ;
            const num : number = Number( str ) ;
            if( isNaN( num ) ) 
                throw new Error( "Expected a number" ) ;
            return num ;
        }
    }
}

export = world;