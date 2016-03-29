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
import seymour = require('./seymour') ;


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
    import Point = seymour.Point;
    import Segment = seymour.Segment;

    export class World extends ObjectV {
        fields:Array<Field>;


        constructor() {
            super();
            console.log("World's fields array is length: " + this.fields.length);

            function addstep(node : PNode, evalu : Evaluation ){
                var leftside = evalu.getPending().concat([0]);
                var rightside = evalu.getPending().concat([1]);

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

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

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

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

    export class TurtleFields {
        // Defining the world to view mapping
        private zoom : number = 1 ;
        private worldWidth : number = 100 ;
        private worldHeight : number = 100 ;

        // The turtle
        private posn : Point = new Point(0,0) ;
        // Invariant: The orientation is in [0,360)
        private orientation : number = 0.0 ;
        private visible = true ;
        private penIsDown = false ;

        // The segments
        private segments = new Array<Segment>() ;

        // The canvas
        //private canv : HTMLCanvasElement = document.createElement('canvas');

        getpenIsDown() : boolean {
            return this.penIsDown;
        }

        setpenIsDown(penIsDown : boolean) {
            this.penIsDown = penIsDown;
        }

        getZoom() : number {
            return this.zoom;
        }

        setZoom(zoom : number) {
            this.zoom = zoom;
        }

        getWorldWidth() : number {
            return this.worldWidth;
        }

        setWorldWidth(worldWidth : number) {
            this.worldWidth = worldWidth;
        }

        getWorldHeight() : number {
            return this.worldHeight;
        }

        setWorldHeight(worldHeight : number) {
            this.worldHeight = worldHeight;
        }

        getPosn() : Point{
            return this.posn;
        }

        setPosn(posn : Point) {
            this.posn = posn;
        }

        getOrientation() : number {
            return this.orientation;
        }

        setOrientation(orientation : number) {
            this.orientation = orientation;
        }

        getVisible() : boolean {
            return this.visible;
        }

        setVisible(visible : boolean) {
            this.visible = visible;
        }

        getSegments() : Array<Segment> {
            return this.segments;
        }

        setSegments(segments: Array<Segment>) {
            this.segments = segments;
        }

        world2View( p : Point, viewWidth : number, viewHeight : number ) {
            const hscale = viewWidth / this.worldWidth * this.zoom ;
            const vscale = viewHeight / this.worldHeight * this.zoom ;
            const x = p.x() * hscale + viewWidth/2 ;
            const y = p.y() * vscale + viewHeight/2 ;
            return new Point( x, y ) ;
        }
    }

    export class TurtleWorld extends ObjectV {

        constructor(){
            super();
            console.log("World's fields array is length: " + this.fields.length);



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
            var valuepath = evalu.getPending().concat([0]);
            var val = <StringV>evalu.varmap.get(valuepath);

            var isNum = true;
            for (var i = 0; i < val.getVal().length ; i ++) {
                //then check right side
                if (! (val.getVal().charAt(i) == "0" || val.getVal().charAt(i) == "1"
                    || val.getVal().charAt(i) == "2" || val.getVal().charAt(i) == "3"
                    || val.getVal().charAt(i) == "4" || val.getVal().charAt(i) == "5"
                    || val.getVal().charAt(i) == "6" || val.getVal().charAt(i) == "7"
                    || val.getVal().charAt(i) == "8" || val.getVal().charAt(i) == "9"
                    || val.getVal().charAt(0) == "-")){
                    isNum = false;
                }
            }

            if (isNum) {
                const theta = evalu.getTurtleFields().getOrientation() / 180.0 * Math.PI ;
                const newx = evalu.getTurtleFields().getPosn().x() + Number(val.getVal()) * Math.cos(theta) ;
                const newy = evalu.getTurtleFields().getPosn().y() + Number(val.getVal()) * Math.sin(theta) ;
                const newPosn = new Point(newx, newy) ;
                if( evalu.getTurtleFields().getpenIsDown() ) { evalu.getTurtleFields().getSegments().push(
                        {p0 : evalu.getTurtleFields().getPosn(), p1:newPosn})} ;
                evalu.getTurtleFields().setPosn(newPosn) ;
                evalu.finishStep(val);
            }
            else {
                throw new Error("Error evaluating " + val.getVal() + "! Make sure this value is a number.");
            }
        }

        clear(node : PNode, evalu : Evaluation) {
            evalu.getTurtleFields().setSegments( new Array<Segment>() );
            evalu.finishStep( new StringV(""));
        }

        right( node : PNode, evalu : Evaluation ) {

            var valuepath = evalu.getPending().concat([0]);
            var val = <StringV>evalu.varmap.get(valuepath);

            var isNum = true;
            for (var i = 0; i < val.getVal().length ; i ++) {
                //then check right side
                if (! (val.getVal().charAt(i) == "0" || val.getVal().charAt(i) == "1"
                    || val.getVal().charAt(i) == "2" || val.getVal().charAt(i) == "3"
                    || val.getVal().charAt(i) == "4" || val.getVal().charAt(i) == "5"
                    || val.getVal().charAt(i) == "6" || val.getVal().charAt(i) == "7"
                    || val.getVal().charAt(i) == "8" || val.getVal().charAt(i) == "9"
                    || val.getVal().charAt(0) == "-")){
                    isNum = false;
                }
            }

            if (isNum) {
                var r = (evalu.getTurtleFields().getOrientation() + Number(val.getVal())) % 360 ;
                while( r < 0 ) r += 360 ; // Once should be enough. Note that if r == -0 to start then it equals +360 to end!
                while( r >= 360 ) r -= 360 ; // Once should be enough.
                evalu.getTurtleFields().setOrientation(r) ;
                evalu.finishStep(val);

            }
            else {
                throw new Error("Error evaluating " + val.getVal() + "! Make sure this value is a number.");
            }
        }

        left( node : PNode, evalu : Evaluation ) {
            var valuepath = evalu.getPending().concat([0]);
            var val = <StringV>evalu.varmap.get(valuepath);

            var isNum = true;
            for (var i = 0; i < val.getVal().length ; i ++) {
                //then check right side
                if (! (val.getVal().charAt(i) == "0" || val.getVal().charAt(i) == "1"
                    || val.getVal().charAt(i) == "2" || val.getVal().charAt(i) == "3"
                    || val.getVal().charAt(i) == "4" || val.getVal().charAt(i) == "5"
                    || val.getVal().charAt(i) == "6" || val.getVal().charAt(i) == "7"
                    || val.getVal().charAt(i) == "8" || val.getVal().charAt(i) == "9"
                    || val.getVal().charAt(0) == "-")){
                    isNum = false;
                }
            }

            if (isNum) {
                var l = (evalu.getTurtleFields().getOrientation() - Number(val.getVal())) % 360 ;
                while( l < 0 ) l += 360 ; // Once should be enough. Note that if r == -0 to start then it equals +360 to end!
                while( l >= 360 ) l -= 360 ; // Once should be enough.
                evalu.getTurtleFields().setOrientation(l);
            }
            else {
                throw new Error("Error evaluating " + val.getVal() + "! Make sure this value is a number.");
            }
        }

        penUp(node : PNode, evalu : Evaluation ) {
            var valuepath = evalu.getPending().concat([0]);
            var val = <StringV>evalu.varmap.get(valuepath);

            if (val.getVal() == "true") {
                evalu.getTurtleFields().setpenIsDown(true);
                evalu.finishStep(val);
            }
            else if (val.getVal() == "false" ) {
                evalu.getTurtleFields().setpenIsDown(false);
                evalu.finishStep(val);
            }
            else {
                throw new Error("Error evaulating " + val.getVal() + " as a logical value!");
            }
        }

        hide(node : PNode, evalu : Evaluation) {
            evalu.getTurtleFields().setVisible(false);
            evalu.finishStep( new StringV(""));
        }

        show(node : PNode, evalu : Evaluation) {
            evalu.getTurtleFields().setVisible(true);
            evalu.finishStep( new StringV(""));
        }

        redraw() {
            const ctx = this.canv.getContext("2d") ;
            const w = this.canv.width ;
            const h = this.canv.height ;
            ctx.clearRect(0, 0, w, h);
            for( let i = 0 ; i < this.segments.length ; ++i ) {
                const p0v = this.world2View( this.segments[i].p0, w, h ) ;
                const p1v = this.world2View( this.segments[i].p1, w, h ) ;
                ctx.beginPath() ;
                ctx.moveTo( p0v.x(), p0v.y() ) ;
                ctx.lineTo( p1v.x(), p1v.y() ) ;
                ctx.stroke() ;
            }
            /*var base_image = new Image();
             base_image.src = 'turtle1.png';
             base_image.height = 25;
             base_image.width = 25;
             ctx.drawImage(base_image, this.posn.x(), this.posn.y());*/
            if( this.visible ) {
                // Draw a little triangle
                const theta = this.orientation / 180.0 * Math.PI ;
                const x = this.posn.x() ;
                const y = this.posn.y() ;
                const p0x = x + 4 *  Math.cos(theta) ;
                const p0y = y + 4 *  Math.sin(theta) ;
                const p1x = x + 5 * Math.cos(theta+2.5) ;
                const p1y = y + 5 * Math.sin(theta+2.5) ;
                const p2x = x + 5 * Math.cos(theta-2.5) ;
                const p2y = y + 5 * Math.sin(theta-2.5) ;
                const p0v = this.world2View( new Point(p0x,p0y), w, h ) ;
                const p1v = this.world2View( new Point(p1x,p1y), w, h ) ;
                const p2v = this.world2View( new Point(p2x,p2y), w, h ) ;
                ctx.beginPath() ;
                ctx.moveTo(p0v.x(),p0v.y()) ;
                ctx.lineTo(p1v.x(),p1v.y()) ;
                ctx.lineTo(p2v.x(),p2v.y()) ;
                ctx.lineTo(p0v.x(),p0v.y()) ;
                ctx.stroke() ;

            }
        }
    }
}

export = world;