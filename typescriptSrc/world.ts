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
                var leftside = evalu.pending.concat([0]);
                var rightside = evalu.pending.concat([1]);

                var ls = <StringV>evalu.varmap.get(leftside);
                var rs = <StringV>evalu.varmap.get(rightside);

                var v = new StringV(String(Number(ls) + Number(rs)));
                evalu.finishStep( v );
            }

            var plus = new BuiltInV(addstep);
            var addf = new Field("+", plus, Type.NUMBER, true);

            this.fields.push(addf);

            //TODO add subtract, multiply, divide, etc.
        }



        //this.values = new ObjectV();

        addField(field:Field) {

            //check to see if the field with the same name already exist
            var field = this.getField(field.getName());

            assert.check(field == null,
                "Field with that name already exists!");

            this.addField(field);
        }

        deleteField(name:String):boolean {
            return this.deleteField(name);
        }

        getField(name:String):Field {
            var field = this.getField(name);
            assert.check(field != null,
                "field does not exist!");
            return null;
            return field;
        }
    }


    export class Method {

    }
}

export = world;