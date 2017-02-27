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

    /** Abstract base class for all type labels.  */
    export abstract class TypeLabel implements Label {

        abstract isValid(children: Array<PNode>);

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

        step(vms: VMS) {
            //TODO not sure yet
        }

        isExprNode() { return false; }

        isExprSeqNode() { return false; }

        isTypeNode() { return true; }

        public abstract toJSON(): any;
    }

    /** References to variables.  */
    export class VariableLabel extends ExprLabel {
        _val: string;
        strategy: varStrategy = new varStrategy();

        isValid(children: Array<PNode>): boolean {
            return children.length == 0;
        }

        toString(): string {
            return "variable";
        }

        getVal(): string {
            return this._val;
        }

        changeValue(newString: string): Option<Label> {
            var newLabel = new VariableLabel(newString);
            return new Some(newLabel);
        }

        nodeStep(node, evalu) {
            var v = lookUp(this._val, evalu.stack).getValue();

            evalu.finishStep(v)
        }

        private
        constructor(name: string) {
            super();
            this._val = name;
        }

        public static theVariableLabel = new VariableLabel("");

        public toJSON(): any {
            return { kind: "VariableLabel", name: this._val };
        }

        public static fromJSON(json: any): VariableLabel {
            return new VariableLabel(json.name);
        }

    }

    /** Variable declaration nodes. */
    export class VarDeclLabel extends ExprLabel {
        // TODO. Fix this node type to conform to the abstract syntax.
        // The label needs a string and a boolean.
        // There should be 2 children: a type and an expression.
        _val: string;

        isValid(children: Array<PNode>): boolean {
            if (children.length != 3) return false;
            if (!children[0].isExprNode()) return false;
            if (!children[1].isTypeNode()) return false;
            return true;
        }

        strategy: varDeclStrategy = new varDeclStrategy();

        toString(): string {
            return "vdecl";
        }

        /*private*/
        constructor(name: string) {
            super();
            this._val = name;
        }

        changeValue(newString: string): Option<Label> {
            var newLabel = new VarDeclLabel(newString);
            return new Some(newLabel);
        }

        nodeStep(node, evalu) {
            var varNamePath = evalu.getPending().concat([0]);
            var typePath = evalu.getPending().concat([1]);
            var varValuePath = evalu.getPending().concat([2]);

            var name = <StringV>evalu.varmap.get(varNamePath);
            var value = evalu.varmap.get(varValuePath);
            var typelabel = evalu.getRoot().get(arrayToList(typePath)).label();

            var type = Type.NULL;
            if (typelabel.toString() == "noType") {
                type = Type.ANY;
            }

            var isConst = false; //TODO false for now for testing purposes
            if (this._val == "true") {
                isConst = true;
            } else {
                isConst = false;
            }

            var v = new Field(name.getVal(), value, type, isConst);

            evalu.getStack().top().addField(v);

            evalu.finishStep(v.getValue());
        }

        // Singleton
        // TODO Delete this.
        public static theVarDeclLabel = new VarDeclLabel("");

        public toJSON(): any {
            return { kind: "VarDeclLabel", name: this._val };
        }

        public static fromJSON(json: any): VarDeclLabel {
            return new VarDeclLabel(json.name);
        }
    }

    /** Assignments.  */
    export class AssignLabel extends ExprLabel {
        isValid(children: Array<PNode>): boolean {
            if (children.length != 2) return false;
            if (!children[0].isExprNode()) return false;
            if (!children[1].isExprNode()) return false;
            return true;
        }

        strategy: assignStrategy = new assignStrategy();

        toString(): string {
            return "assign";
        }

        /*private*/
        constructor() {
            super();
        }

        changeValue(newString: string): Option<Label> {
            return new None<Label>();
        }

        nodeStep(node, evalu) {
            var leftside = evalu.getPending().concat([0]);
            var rightside = evalu.getPending().concat([1]);
            var rs = <StringV>evalu.varmap.get(rightside);

            var lNode = evalu.getRoot().get(leftside);
            //make sure left side is var
            if (lNode.label().toString() == VariableLabel.theVariableLabel.toString()) {
                //if in stack
                if (evalu.getStack().inStack(lNode.label().getVal())) {
                    evalu.getStack().setField(lNode.label().getVal(), rs);
                }
                else {
                    throw new Error("Variable is not in map! Declare it first!");
                }
                evalu.finishStep(rs);

            }
            else {
                //invalid node
            }
        }

        // Singleton
        public static theAssignLabel = new AssignLabel();

        public toJSON(): any {
            return { kind: "AssignLabel" };
        }

        public static fromJSON(json: any): AssignLabel {
            return AssignLabel.theAssignLabel;
        }
    }


    /** Calls to explicitly named functions.  */
    export class CallWorldLabel extends ExprLabel {

        _val: string;//the operation

        strategy: lrStrategy = new lrStrategy();

        isValid(children: Array<PNode>): boolean {
            return children.every(function (c: PNode) { return c.isExprNode() });
        }

        toString(): string {
            return "callWorld";
        }

        getVal(): string {
            return this._val;
        }

        changeValue(newString: string): Option<Label> {
            var newLabel = new CallWorldLabel(newString);
            return new Some(newLabel);
        }

        nodeStep(node, evalu, vms) {
            if (evalu.getStack().inStack(this._val.toString())) {
                var field = evalu.getStack().getField(this._val.toString());
                if (field.getValue().isBuiltInV()) {
                    return (<BuiltInV>field.getValue()).step(node, evalu);
                }
                else if (field.getValue().isClosureV()) {
                    var v: Value = field.getValue();
                    var c: ClosureV = <ClosureV>v;
                    var f: PNode = c.getLambdaNode();

                    //a bunch of pNodes(non parameter children)
                    var argList: Array<Value> = new Array();

                    var i = 0;
                    while (evalu.varmap.get(evalu.getPending().concat(i)) != null) {
                        argList.push(evalu.varmap.get(evalu.getPending().concat(i)));
                        i++;
                    }

                    if (argList.length != f.child(0).count()) { }//error
                    //		if (any argument has a value not compatible with the corresponding parameter type){}
                    // error!

                    //list of parameters (I think)
                    var param = f.child(0).children; //TODO

                    var arFields: Array<Field>;//fields to go in the stack
                    arFields = new Array();

                    for (var j = 0; j < f.child(0).count(); j++) {
                        //name, val, type, isConst
                        var fields = new Field(param[j].name, argList[j], Type.ANY, false);//TODO, what should argList be giving? Values?
                        //Also, do we even know the values? Do we look them up?
                        arFields.push(fields);
                    }

                    var activationRecord = new ObjectV();
                    for (var k = 0; k < arFields.length; k++) {
                        activationRecord.addField(arFields[k]);
                    }

                    var stack = new VarStack(activationRecord, c.getContext());

                    var newEval = new Evaluation(f, stack);
                    newEval.setPending([]);
                    vms.stack.push(newEval);
                }
                else {
                    // TODO report error. Field exists but is not a function.
                }
            }
            else {
                // TODO report error. Field with the name does not exist.
            }
        }

        /*private*/
        constructor(name: string) {
            super();
            this._val = name;
        }

        public static theCallWorldLabel = new CallWorldLabel("");

        public toJSON(): any {
            return { kind: "CallWorldLabel", name: this._val };
        }

        public static fromJSON(json: any): CallWorldLabel {
            return new CallWorldLabel(json.name);
        }
    }

    /** Place holder nodes for expression. */
    export class ExprPHLabel extends ExprLabel {

        isValid(children: Array<PNode>): boolean {
            if (children.length != 0) return false;
            return true;
        }

        toString(): string {
            return "expPH";
        }

        private
        constructor() {
            super();
        }

        // TODO: Stepping a place holder is a run time error.
        nodeStep(node, evalu) { }

        // Singleton
        public static theExprPHLabel = new ExprPHLabel();

        public toJSON(): any {
            return { kind: "ExprPHLabel" };
        }

        public static fromJSON(json: any): ExprPHLabel {
            return ExprPHLabel.theExprPHLabel;
        }
    }

    // TODO: What is this?  It seems to me that places where
    // expressions are optional we either need a "NoExprLabel" node or
    // some sort of ExprLabel node.
    export class ExprOptLabel extends ExprLabel {

        strategy: LiteralStrategy = new LiteralStrategy();

        isValid(children: Array<PNode>): boolean {
            if (children.length != 0) return false;
            return true;
        }

        toString(): string {
            return "expOpt";
        }

        /*private*/
        constructor() {
            super();
        }

        nodeStep(node, evalu) {
            //add in a null value to signify that it is null to signify that
            var v = new StringV("null");
            evalu.finishStep(v);

        }

        // Singleton
        public static theExprOptLabel = new ExprOptLabel();

        public toJSON(): any {
            return { kind: "ExprOptLabel" };
        }

        public static fromJSON(json: any): ExprOptLabel {
            return ExprOptLabel.theExprOptLabel;
        }
    }

    /** Function (or method) literals. */
    export class LambdaLabel extends ExprLabel {
        // TODO Eliminate the _val field.
        _val: string;
        strategy: lambdaStrategy = new lambdaStrategy();

        isValid(children: Array<PNode>) {
            // TODO: Lambdas should have 4 children. See AST docs.
            if (children.length != 3) return false;
            if (!children[0].isExprSeqNode()) return false;
            if (!children[1].isTypeNode()) return false;
            if (!children[2].isExprSeqNode()) return false;
            return true;
        }

        toString(): string {
            return "lambda";
        }


        changeValue(newString: string): Option<Label> {
            var newLabel = new LambdaLabel(newString);
            return new Some(newLabel);
        }

        getVal(): string {
            return this._val;
        }

        /*private*/
        constructor(val: string) {
            super();
            this._val = val;
        }

        nodeStep(node, evalu) {
            var clo = new ClosureV(node, evalu.getStack());//TODO this is the correct stack?

            //            var name = <StringV> node.label().getVal();
            var v = new Field(node.label().getVal(), clo, Type.ANY, true);
            evalu.getStack().top().addField(v);

            evalu.finishStep(clo);
            //TODO should there be anything about creating a new stack in here, or is this for call?

            /* var paramPath = evalu.getPending().concat([0]);
             var functionPath = evalu.getPending().concat([2]);
 
             var paramNode = evalu.getRoot().get(arrayToList(paramPath));
             var argList = new Array();
             for (var i = 0; i < paramNode.count(); i++){
                 argList.push(evalu.getVarMap().get(paramPath.concat([i])));
             }
 */
        }

        // Singleton
        public static theLambdaLabel = new LambdaLabel("");

        public toJSON(): any {
            return { kind: "LambdaLabel" };
        }

        public static fromJSON(json: any): LambdaLabel {
            return LambdaLabel.theLambdaLabel;
        }
    }

    /** If expressions */
    export class IfLabel extends ExprLabel {

        strategy: ifStrategy = new ifStrategy();

        isValid(children: Array<PNode>): boolean {
            if (children.length != 3) return false;
            if (!children[0].isExprNode()) return false;
            if (!children[1].isExprSeqNode()) return false;
            if (!children[2].isExprSeqNode()) return false;
            return true;
        }

        toString(): string {
            return "if";
        }

        /*private*/
        constructor() {
            super();
        }

        nodeStep(node, evalu) {
            var guardPath = evalu.getPending().concat([0]);
            var thenPath = evalu.getPending().concat([1]);
            var elsePath = evalu.getPending().concat([2]);
            var v: Value;
            var string = <StringV>evalu.varmap.get(guardPath);
            if (string.contents.match("true")) {
                v = evalu.varmap.get(thenPath);
            }

            else {
                v = evalu.varmap.get(elsePath);
            }
            evalu.finishStep(v);
        }

        // Singleton
        public static theIfLabel = new IfLabel();

        public toJSON(): any {
            return { kind: "IfLabel" };
        }

        public static fromJSON(json: any): IfLabel {
            return IfLabel.theIfLabel;
        }
    }

    /** While loop expressions */
    export class WhileLabel extends ExprLabel {

        strategy: whileStrategy = new whileStrategy();

        isValid(children: Array<PNode>): boolean {
            if (children.length != 2) return false;
            if (!children[0].isExprNode()) return false;
            if (!children[1].isExprSeqNode()) return false;
            return true;
        }

        toString(): string {
            return "while";
        }

        /*private*/
        constructor() {
            super();
        }

        nodeStep(node, evalu) {
            var loopPath = evalu.getPending().concat([1]);
            var v = evalu.varmap.get(loopPath);
            evalu.finishStep(v);
        }

        // Singleton
        public static theWhileLabel = new WhileLabel();

        public toJSON(): any {
            return { kind: "WhileLabel" };
        }

        public static fromJSON(json: any): WhileLabel {
            return WhileLabel.theWhileLabel;
        }
    }

    /** A missing type label */
    export class NoTypeLabel extends TypeLabel {
        // TODO: Should this really extend TypeLabel?

        // TODO:  Note that no selection strategy is needed for this label
        strategy: nodeStrategy;

        isValid(children: Array<PNode>): boolean {
            return children.length == 0;
        }

        toString(): string {
            return "noType";
        }

        // TODO: No step is needed for this label
        step(vms: VMS) {

        }

        changeValue(newString: string): Option<Label> {
            return new None<Label>();
        }

        getVal(): string {
            return null;
        }

        /*private*/
        constructor() { super(); }

        // Singleton
        public static theNoTypeLabel = new NoTypeLabel();

        public toJSON(): any {
            return { kind: "NoTypeLabel" };
        }

        public static fromJSON(json: any): NoTypeLabel {
            return NoTypeLabel.theNoTypeLabel;
        }
    }

    /** String literals. */
    export class StringLiteralLabel extends ExprLabel {
        _val: string;

        strategy: LiteralStrategy = new LiteralStrategy();

        constructor(val: string) { super(); this._val = val; }

        val(): string { return this._val; }

        isValid(children: Array<PNode>) {
            return children.length == 0;
        }

        changeValue(newString: string): Option<Label> {
            var newLabel = new StringLiteralLabel(newString);
            return new Some(newLabel);
        }

        getVal(): string {
            return this._val;
        }

        toString(): string { return "string[" + this._val + "]"; }

        public static theStringLiteralLabel = new StringLiteralLabel("");

        nodeStep(node, evalu) {
            evalu.finishStep(new StringV(this._val));
        }

        public toJSON(): any {
            return { kind: "StringLiteralLabel", val: this._val };
        }

        public static fromJSON(json: any): StringLiteralLabel {
            return new StringLiteralLabel(json.val);
        }
    }

    /** Number literals. */
    export class NumberLiteralLabel extends ExprLabel {
        _val: string;

        constructor(val: string) { super(); this._val = val; }

        val(): string { return this._val; }

        isValid(children: Array<PNode>) {
            return children.length == 0;
        }

        changeValue(newString: string): Option<Label> {
            var newLabel = new NumberLiteralLabel(newString);
            return new Some(newLabel);
        }

        getVal(): string {
            return this._val;
        }

        toString(): string { return "number[" + this._val + "]"; }

        // TODO Stepper should be shared with string literal.
        nodeStep(node, evalu) {

        }

        public static theNumberLiteralLabel = new NumberLiteralLabel("");

        public toJSON(): any {
            return { kind: "NumberLiteralLabel", val: this._val };
        }

        public static fromJSON(json: any): NumberLiteralLabel {
            return new NumberLiteralLabel(json.val);
        }
    }

    /** Boolean literals */
    export class BooleanLiteralLabel extends ExprLabel {
        _val: string;

        constructor(val: string) { super(); this._val = val; }

        val(): string { return this._val; }

        changeValue(newString: string): Option<Label> {
            var newLabel = new BooleanLiteralLabel(newString);
            return new Some(newLabel);
        }

        isValid(children: Array<PNode>) {
            if (children.length != 0) { return false }
            if (this.val() != "true" && this.val() != "false") { return false; }
            return true;
        }

        getVal(): string {
            return this._val;
        }

        toString(): string { return "boolean[" + this._val + "]"; }

        // TODO Stepper should be shared with string literal.
        nodeStep(node, evalu) {

        }

        // The following line makes no sense.
        public static theBooleanLiteralLabel = new BooleanLiteralLabel("");

        public toJSON(): any {
            return { kind: "BooleanLiteralLabel", val: this._val };
        }

        public static fromJSON(json: any): BooleanLiteralLabel {
            return new BooleanLiteralLabel(json.val);
        }
    }

    /** Null literals. */
    export class NullLiteralLabel extends ExprLabel {
        constructor() { super(); }

        isValid(children: Array<PNode>) {
            return children.length == 0;
        }

        toString(): string { return "null"; }

        nodeStep(node, evalu) {

        }

        public static theNullLiteralLabel = new NullLiteralLabel();

        public toJSON(): any {
            return { kind: "NullLiteralLabel" };
        }

        public static fromJSON(json: any): NullLiteralLabel {
            return NullLiteralLabel.theNullLiteralLabel;
        }
    }

    /** Call a function.  */
    export class CallLabel extends ExprLabel {

        strategy: lrStrategy = new lrStrategy();


        isValid(children: Array<PNode>) {
            return children.every(function (c: PNode) {
                return c.isExprNode()
            });
        }

        toString(): string {
            return "call";
        }

        changeValue(newString: string): Option<Label> {
            return new None<Label>();
        }

        getVal(): string {
            return null;
        }

        /*private*/
        constructor() {
            super();
        }

        // TODO Complete this!
        nodeStep(node, evalu, vms) { }

        // Singleton
        public static theCallLabel = new CallLabel();

        public toJSON(): any {
            return { kind: "CallLabel" };
        }

        public static fromJSON(json: any): CallLabel {
            return CallLabel.theCallLabel;
        }
    }

    // TODO. Get rid of this and similar labels.
    export class PenLabel extends ExprLabel {
        _val: string; //either up or down
        strategy: TurtleStrategy = new TurtleStrategy();

        constructor(val: string) {
            super();
            this._val = val;
        }

        val(): string {
            return this._val;
        }

        changeValue(newString: string): Option<Label> {
            var newLabel = new PenLabel(newString);
            return new Some(newLabel);
        }

        isValid(children: Array<PNode>) {
            if (children.length != 1) {
                return false
            }
            return true;
        }

        getVal(): string {
            return this._val;
        }

        toString(): string {
            return "penup";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("penup")) {
                var f = evalu.getStack().getField("penup");
                if (f.getValue().isBuiltInV()) {
                    return (<BuiltInV>f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static thePenLabel = new PenLabel("");

        public toJSON(): any {
            return { kind: "PenLabel" };
        }

        public static fromJSON(json: any): PenLabel {
            return PenLabel.thePenLabel;
        }
    }

    export class ForwardLabel extends ExprLabel {
        _val: string; //
        strategy: TurtleStrategy = new TurtleStrategy();

        constructor(val: string) {
            super();
            this._val = val;
        }

        val(): string {
            return this._val;
        }

        changeValue(newString: string): Option<Label> {
            var newLabel = new ForwardLabel(newString);
            return new Some(newLabel);
        }

        isValid(children: Array<PNode>) {
            if (children.length != 1) {
                return false;
            }
            return true;
        }

        getVal(): string {
            return this._val;
        }

        toString(): string {
            return "forward";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("forward")) {
                var f = evalu.getStack().getField("forward");
                if (f.getValue().isBuiltInV()) {
                    return (<BuiltInV>f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theForwardLabel = new ForwardLabel("");

        public toJSON(): any {
            return { kind: "forward" };
        }

        public static fromJSON(json: any): ForwardLabel {
            return ForwardLabel.theForwardLabel;
        }
    }

    export class RightLabel extends ExprLabel {
        _val: string; //either left or right, depending on the sign of the value
        strategy: TurtleStrategy = new TurtleStrategy();

        constructor(val: string) {
            super();
            this._val = val;
        }

        val(): string {
            return this._val;
        }

        changeValue(newString: string): Option<Label> {
            var newLabel = new RightLabel(newString);
            return new Some(newLabel);
        }

        isValid(children: Array<PNode>) {
            if (children.length != 1) {
                return false;
            }
            return true;
        }

        getVal(): string {
            return this._val;
        }

        toString(): string {
            return "right";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("right")) {
                var f = evalu.getStack().getField("right");
                if (f.getValue().isBuiltInV()) {
                    return (<BuiltInV>f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theRightLabel = new RightLabel("");

        public toJSON(): any {
            return { kind: "RightLabel" };
        }

        public static fromJSON(json: any): RightLabel {
            return RightLabel.theRightLabel;
        }
    }

    export class ClearLabel extends ExprLabel {
        _val: string;
        strategy: LiteralStrategy = new LiteralStrategy();

        constructor() {
            super();
        }

        val(): string {
            return this._val;
        }

        changeValue(newString: string): Option<Label> {
            return new None<Label>();
        }

        isValid(children: Array<PNode>) {
            if (children.length != 0) {
                return false
            }
            return true;
        }

        getVal(): string {
            return this._val;
        }

        toString(): string {
            return "clear";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("clear")) {
                var f = evalu.getStack().getField("clear");
                if (f.getValue().isBuiltInV()) {
                    return (<BuiltInV>f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theClearLabel = new ClearLabel();

        public toJSON(): any {
            return { kind: "ClearLabel" };
        }

        public static fromJSON(json: any): ClearLabel {
            return ClearLabel.theClearLabel;
        }
    }

    export class HideLabel extends ExprLabel {
        _val: string;
        strategy: LiteralStrategy = new LiteralStrategy();

        constructor() {
            super();
        }

        val(): string {
            return this._val;
        }

        changeValue(newString: string): Option<Label> {
            return new None<Label>();
        }

        isValid(children: Array<PNode>) {
            if (children.length != 0) {
                return false
            }
            return true;
        }

        getVal(): string {
            return this._val;
        }

        toString(): string {
            return "hide";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("hide")) {
                var f = evalu.getStack().getField("hide");
                if (f.getValue().isBuiltInV()) {
                    return (<BuiltInV>f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theHideLabel = new HideLabel();

        public toJSON(): any {
            return { kind: "HideLabel" };
        }

        public static fromJSON(json: any): HideLabel {
            return HideLabel.theHideLabel;
        }
    }

    export class ShowLabel extends ExprLabel {
        _val: string;
        strategy: LiteralStrategy = new LiteralStrategy();

        constructor() {
            super();
        }

        val(): string {
            return this._val;
        }

        changeValue(newString: string): Option<Label> {
            return new None<Label>();
        }

        isValid(children: Array<PNode>) {
            if (children.length != 0) {
                return false
            }
            return true;
        }

        getVal(): string {
            return this._val;
        }

        toString(): string {
            return "show";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("show")) {
                var f = evalu.getStack().getField("show");
                if (f.getValue().isBuiltInV()) {
                    return (<BuiltInV>f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theShowLabel = new ShowLabel();

        public toJSON(): any {
            return { kind: "ShowLabel" };
        }

        public static fromJSON(json: any): HideLabel {
            return ShowLabel.theShowLabel;
        }
    }

    export class LeftLabel extends ExprLabel {
        _val: string; //either left or right, depending on the sign of the value
        strategy: TurtleStrategy = new TurtleStrategy();

        constructor(val: string) {
            super();
            this._val = val;
        }

        val(): string {
            return this._val;
        }

        changeValue(newString: string): Option<Label> {
            var newLabel = new LeftLabel(newString);
            return new Some(newLabel);
        }

        isValid(children: Array<PNode>) {
            if (children.length != 1) {
                return false
            }
            return true;
        }

        getVal(): string {
            return this._val;
        }

        toString(): string {
            return "left";
        }

        nodeStep(node, evalu) {
            if (evalu.getStack().inStack("left")) {
                var f = evalu.getStack().getField("left");
                if (f.getValue().isBuiltInV()) {
                    return (<BuiltInV>f.getValue()).step(node, evalu);
                }
            }
        }

        // Singleton
        public static theLeftLabel = new LeftLabel("");

        public toJSON(): any {
            return { kind: "LeftLabel" };
        }

        public static fromJSON(json: any): LeftLabel {
            return LeftLabel.theLeftLabel;
        }
    }

    /** Convert a simple object created by toJSON to a PNode */
    //static fromJSON( json : any ) : PNode {
    //     var label = fromJSONToLabel( json.label ) ;
    //     var children = json.children.map( PNode.fromJSON ) ;
    //     return make( label, children ) ;

    export function lookUp(varName: string, stack: VarStack): FieldI {
        return stack.getField(varName);
    }

}