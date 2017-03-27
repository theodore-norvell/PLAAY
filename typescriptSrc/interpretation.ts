/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="vms.ts" />
/// <reference path="valueTypes.ts" />

import assert = require('./assert');
import collections = require('./collections');
import valueTypes = require('./valueTypes');
import vms = require('./vms');
import pnode = require('./pnode');

module interpretation {
    import PNode = pnode.PNode;
    import Label = pnode.Label;
    import Option = collections.Option;
    import Some = collections.Some;
    import None = collections.None;
    import VMS = vms.VMS;
    import Evaluation = vms.Evaluation;
    import VarStack = vms.VarStack;
    import EvalStack = vms.EvalStack;
    import Value = vms.Value;
    import BuiltInV = valueTypes.BuiltInV;
    import ValueMap = vms.ValueMap;
    import FieldI = vms.FieldI;
    import Field = valueTypes.Field;
    import ClosureV = valueTypes.ClosureV;
    import StringV = valueTypes.StringV;
    import arrayToList = collections.arrayToList;
    import Type = vms.Type;
    import ObjectV = valueTypes.ObjectV;

    export interface nodeStrategy {
        select(vms: VMS, label: Label): void;
    }

    /** PNodes are abstract syntax trees for the PLAAY language.
     * Each PNode consists of a Label and a sequence of 0 or more children.
     *
     * PNodes are immutable objects.
     *
     * Each PNode represents a valid tree in the sense that, if `l` is its label
     * and `chs` is an array of its children, then `l.isValid(chs)` must be true.**/

    export interface nodeStrategy {
        select(vms: VMS, label: Label): void;
    }

    export class lrStrategy implements nodeStrategy {
        select(vms: VMS, label: Label): void {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();

            if (pending != null) {
                var node = evalu.root.get(arrayToList(pending));

                if (node.label() == label) {
                    var flag = true;
                    for (var i = 0; i < node.count(); i++) {
                        var p = pending.concat([i]);
                        if (!evalu.map.inMap(p)) {
                            flag = false;
                        }
                    }
                    if (flag) {
                        evalu.ready = true;// Select this node.
                    }
                    else {
                        var n;
                        for (var i = 0; i < node.count(); i++) {
                            var p = pending.concat([i]);
                            if (!evalu.map.inMap(p)) {
                                n = i;
                                break;
                            }
                        }
                        vms.evalStack.top().setPending(pending.concat([n]));
                        node.child(n).label().strategy.select(vms, node.child(n).label());
                    }
                }
            }
        }
    }

    export class varStrategy implements nodeStrategy {
        select(vms: VMS, label: Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(arrayToList(pending));
                if (node.label() == label) {
                    //TODO how to highlight  look up the variable in the stack and highlight it.
                    if (!evalu.getStack().inStack(label.getVal())) { } //error} //there is no variable in the stack with this name TODO THIS FUNCTION IS BROKEN
                    else { evalu.ready = true; }
                }
            }
        }
    }

    export class whileStrategy implements nodeStrategy {

        deletefromMap(vms: VMS, path: Array<number>) {
            for (var i = 0; i < vms.getEval().getRoot().get(path).count(); i++) {
                var childPath = path.concat([i]);
                this.deletefromMap(vms, childPath);
            }
            vms.getEval().getValMap().remove(path);

        }

        select(vms: VMS, label: Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            assert.check(pending != null);
            var node = evalu.root.get(pending);
            let guardPath = pending.concat([0]);
            let bodyPath = pending.concat([1]);
            let guardMapped = evalu.map.inMap(guardPath);
            let bodyMapped = evalu.map.inMap(bodyPath);
            if (guardMapped && bodyMapped) {
                // Both children mapped; step
                // this node.
                evalu.ready = true;
            } else if (guardMapped) {
                let value = evalu.map.get(guardPath);
                if (!(value instanceof StringV)) {
                    // TODO Fix error handling
                    throw new Error("Type error.  Guard of while loop must be true or false.");
                } else {
                    let strVal = <StringV>value;
                    let str = strVal.contents;
                    if (str == "true") {
                        evalu.setPending(bodyPath);
                        node.child(1).label().strategy.select(vms, node.child(1).label());
                    } else if (str == "false") {
                        evalu.ready = true;
                    } else {
                        // TODO Fix error handling
                        throw new Error("Type error.  Guard of while loop must be true or false.");
                    }
                }
            }
        }
    }

    export class lambdaStrategy implements nodeStrategy {

        select(vms: VMS, label: Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    evalu.ready = true;
                }
            }
        }
    }

    export class assignStrategy implements nodeStrategy {
        select(vms: VMS, label: Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(arrayToList(pending));
                if (node.label() == label) {
                    var p = pending.concat([1]);
                    if (!evalu.map.inMap(p)) {
                        vms.evalStack.top().setPending(p);
                        node.child(1).label().strategy.select(vms, node.child(1).label());
                    }

                    else {
                        evalu.ready = true;// Select this node.
                    }
                }
            }
        }
    }

    export class LiteralStrategy implements nodeStrategy {
        select(vms: VMS, label: Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(arrayToList(pending));
                if (node.label() == label) {
                    vms.evalStack.top().ready = true;
                }
            }
        }
    }

    export class ifStrategy implements nodeStrategy {
        select(vms: VMS, label: Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    var guardPath = pending.concat([0]);
                    var thenPath = pending.concat([1]);
                    var elsePath = pending.concat([2]);
                    if (evalu.map.inMap(guardPath)) {
                        var string = <StringV>evalu.map.get(guardPath);
                        if (string.contents.match("true")) {
                            if (evalu.map.inMap(thenPath)) {
                                evalu.ready = true;
                            }
                            else {
                                evalu.setPending(thenPath);
                                node.child(1).label().strategy.select(vms, node.child(1).label());
                            }
                        }

                        else if (string.contents.match("false")) {
                            if (evalu.map.inMap(elsePath)) {
                                evalu.ready = true;
                            }

                            else {
                                evalu.setPending(elsePath);
                                node.child(2).label().strategy.select(vms, node.child(2).label());
                            }
                        }

                        else {
                            throw new Error("Error evaluating " + string.contents + " as a conditional value.");
                        }
                    }

                    else {
                        evalu.setPending(guardPath);
                        node.child(0).label().strategy.select(vms, node.child(0).label());
                    }
                }
            }
        }
    }

    export class varDeclStrategy implements nodeStrategy {
        select(vms: VMS, label: Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    var nameofVar = pending.concat([0]);
                    var valueofVar = pending.concat([2]);
                    if (evalu.map.inMap(nameofVar)) {
                        var name = <StringV>evalu.map.get(nameofVar);
                        if (!lookUp(name.getVal(), evalu.getStack())) {
                            if (evalu.map.inMap(valueofVar)) {
                                evalu.ready = true;
                            } else {
                                evalu.setPending(valueofVar);
                                node.child(2).label().strategy.select(vms, node.child(2).label());
                            }
                        }
                        else {
                            throw new Error("Variable name already exists!");
                        }
                    }
                    else {
                        evalu.setPending(nameofVar);
                        node.child(0).label().strategy.select(vms, node.child(0).label());
                    }
                }
            }
        }
    }

    export class TurtleStrategy implements nodeStrategy {
        select(vms: VMS, label: Label) {
            var evalu = vms.evalStack.top();
            var pending = evalu.getPending();
            if (pending != null) {
                var node = evalu.root.get(pending);
                if (node.label() == label) {
                    var value = pending.concat([0]);
                    if (evalu.map.inMap(value)) {
                        evalu.ready = true;
                    }
                    else {
                        evalu.setPending(value);
                        node.child(0).label().strategy.select(vms, node.child(0).label());
                    }
                }
            }
        }
    }

    /* export class callStrategy implements nodeStrategy{
         select(){}
 
         step( vms : VMS, label : Label ){
             if( vms.stack.top().ready){
                 var eval = vms.stack.top();
                 if(eval.getPending() != null){
                     var node = eval.root.get(eval.getPending());
                     if( node.label() == label ){
                         var functionPath = eval.getPending() ^ [0];
                         var c = eval.varmap.get( functionPath );
                         if (!c.isClosureV()){}//  error!
                         var c1 = <ClosureV>c;
                         var f : LambdaNode = c1.function;
 
                         argList : Array<PNode>;
 
                         for(var i = 0; i <)
                         var argList = [eval.varmap.get( eval.getPending() ^ [1] ),
                             eval.varmap.get( eval.getPending() ^ [2],.. ]//for all arguments TODO
 
                         if( the length of arglist not= the length of f.params.children){} //error!
                         if (any argument has a value not compatible with the corresponding parameter type){}
                         // error!
                         var params = f.params.children; //TODO make params
                         var arFields := [ new Field( params[0].name, argList[0] ),
                             new Field( params[1].name, argList[1] ),
                             .. ] //for all f.params.children
                         var activationRecord = new ObjectV( arFields );
                         var stack = new Stack( activationRecord, cl.context );
 
                         var newEval = new Evaluation();
                         newEval.root = f.body; //TODO what is the body
                         newEval.stack = stack;
                         newEval.varmap = new varMap();
                         newEval.getPending() = [];
                         newEval.ready = false;
 
                         vms.stack.push( newEval );
                     }
                 }
             }
         }
     }
 */

    /** Abstract base class for all expression labels.  */
    export abstract class ExprLabel implements Label {

        abstract isValid(children: Array<PNode>);

        abstract nodeStep(node: PNode, evalu: Evaluation, vms: VMS): void;

        stepKind(labelKinds: kind): void;

        strategy: nodeStrategy;

        /*private*/
        constructor() {
        }

        changeValue(newString: string): Option<Label> {
            return new None<Label>();
        }

        getVal(): string {
            return null;
        }

        select(vms: VMS): void {
            this.strategy.select(vms, this);
        }

        //Template
        step(vms: VMS): void {
            // TODO fix this crap.
            if (vms.evalStack.top().ready == true) {
                var evalu = vms.evalStack.top();
                var pending = evalu.getPending();
                if (pending != null) {
                    var node = evalu.root.get(arrayToList(pending));
                    this.nodeStep(node, evalu, vms);
                }
                else { }//error
            }
        }

        isExprNode() { return true; }

        isExprSeqNode() { return false; }

        isTypeNode() { return false; }

        // Singleton
        //public static theExprLabel = new ExprLabel();

        abstract toJSON(): any;
    }

    /** A sequence of expressions. */
    export class ExprSeqLabel implements Label {
        isValid(children: Array<PNode>) {
            return children.every(function (c: PNode) {
                return c.isExprNode()
            });
        }

        strategy: lrStrategy = new lrStrategy();

        step(vms: VMS) {

            var pending = vms.getEval().getPending();

            var thisNode = vms.getEval().getRoot().get(arrayToList(pending));
            var valpath = pending.concat([thisNode.count() - 1]);

            var v = vms.getEval().map.get(valpath);

            vms.getEval().finishStep(v);

        }

        toString(): string {
            return "seq";
        }

        /*private*/
        constructor() {
        }

        changeValue(newString: string): Option<Label> {
            return new None<Label>();
        }

        getVal(): string {
            return null;
        }

        select(vms: VMS) {
            this.strategy.select(vms, this);
        }

        isExprNode() { return false; }

        isExprSeqNode() { return true; }

        isTypeNode() { return false; }

        // Singleton
        public static theExprSeqLabel = new ExprSeqLabel();

        public toJSON(): any {
            return { kind: "ExprSeqLabel" };
        }

        public static fromJSON(json: any): ExprSeqLabel {
            return ExprSeqLabel.theExprSeqLabel;
        }
    }

    /** A parameter list.  */
    export class ParameterListLabel implements Label {
        isValid(children: Array<PNode>) {
            return children.every(function (c: PNode) {
                // TODO Shouldn't these all be VarDecls?
                return c.isExprNode()
            });
        }

        strategy: lrStrategy = new lrStrategy();

        step(vms: VMS) {
            //TODO should the parameter list do anything? I don't think it does - JH
        }

        toString(): string {
            return "param";
        }

        /*private*/
        constructor() {
        }

        changeValue(newString: string): Option<Label> {
            return new None<Label>();
        }

        getVal(): string {
            return null;
        }

        select(vms: VMS) {
            this.strategy.select(vms, this);
        }

        // Singleton
        public static theParameterListLabel = new ParameterListLabel();

        isExprNode() { return false; }

        isExprSeqNode() { return false; }

        isTypeNode() { return false; }

        public toJSON(): any {
            return { kind: "ParamLabel" };
        }

        public static fromJSON(json: any): ParameterListLabel {
            return ParameterListLabel.theParameterListLabel;
        }
    }
}