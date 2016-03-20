/**
 * Created by Jessica on 2/22/2016.
 */

import stack = require( './stackManager' ) ;
import pnode = require( './pnode' ) ;
import collections = require( './collections' ) ;
import value = require('./value') ;
import assert = require( './assert' ) ;
import vms = require('./vms');
import evaluation = require('./evaluation');


module world {
    import Stack = stack.Stack;
    import list = collections.list;
    import List = collections.List;
    import ObjectV = value.ObjectV;
    import Field  = value.Field;
    import Value = value.Value;
    import BuiltInV = value.BuiltInV;
    import Type = value.Type;
    import VMS = vms.VMS;
    import Evaluation = evaluation.Evaluation;
    import StringV = value.StringV;
    import PNode = pnode.PNode;

    export class World extends ObjectV {
        fields:Array<Field>;


        constructor() {
            super();

            function addstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++){
                    //first check left side
                    if (! (ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )){
                        isNum = false;
                    }

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++){
                    //first check left side
                    if (! (ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )){
                        isNum = false;
                    }

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++){
                    //first check left side
                    if (! (ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )){
                        isNum = false;
                    }

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++){
                    //first check left side
                    if (! (ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )){
                        isNum = false;
                    }

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++){
                    //first check left side
                    if (! (ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )){
                        isNum = false;
                    }

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++){
                    //first check left side
                    if (! (ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )){
                        isNum = false;
                    }

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
                    throw new Error("Error evaulating " + ls.getVal() + " >= " + rs.getVal() + "! Make sure these values are numbers.");
                }
            }

            var greaterthanequal = new BuiltInV(greaterthanequalstep);
            var greaterequalf = new Field(">=", greaterthanequal, Type.BOOL, true);

            this.fields.push(greaterequalf);

            function lessthanstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++){
                    //first check left side
                    if (! (ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )){
                        isNum = false;
                    }

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

                var isNum = true;
                //need to check if each character is a digit before continuing
                for (var i = 0; i < ls.getVal().length ; i ++){
                    //first check left side
                    if (! (ls.getVal().charAt(i) == "0" || ls.getVal().charAt(i) == "1"
                        || ls.getVal().charAt(i) == "2" || ls.getVal().charAt(i) == "3"
                        || ls.getVal().charAt(i) == "4" || ls.getVal().charAt(i) == "5"
                        || ls.getVal().charAt(i) == "6" || ls.getVal().charAt(i) == "7"
                        || ls.getVal().charAt(i) == "8" || ls.getVal().charAt(i) == "9"
                        || ls.getVal().charAt(i) == "." || ls.getVal().charAt(0) == "-" )){
                        isNum = false;
                    }

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);


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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);


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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

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
                if (this.fields[i].getName()== fieldName) {
                    this.fields.splice(i, 1);
                    return true;
                }
            }

            return false;
        }

        public getField(fieldName:string):Field {
            for (var i = 0; i < this.fields.length; i++) {
                if (this.fields[i].getName() == fieldName) {
                    return this.fields[i];
                }
            }
            return null;
        }
    }


    export class Method {

    }
}

export = world;