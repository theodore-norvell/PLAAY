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
    import nodeStrategy = pnode.nodeStrategy;
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

    var kindStrategy =
            [null,
            null, null,
            pnode.varStrategy, pnode.varDeclStrategy, pnode.assignStrategy, pnode.lrStrategy,
            null, null,
            pnode.lambdaStrategy,
            pnode.ifStrategy, pnode.whileStrategy,
            pnode.LiteralStrategy, pnode.LiteralStrategy, pnode.LiteralStrategy, pnode.LiteralStrategy,
            pnode.TurtleStrategy, pnode.TurtleStrategy, pnode.TurtleStrategy, pnode.TurtleStrategy, pnode.TurtleStrategy, pnode.TurtleStrategy, pnode.TurtleStrategy]

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

}