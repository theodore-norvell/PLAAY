/**
 * Created by Jessica on 2/22/2016.
 */

import stack = require( './stackManager' ) ;
import collections = require( './collections' ) ;
import value = require('./value') ;
import assert = require( './assert' ) ;


module world {
    import Stack = stack.Stack;
    import list = collections.list;
    import List = collections.List;
    import ObjectV = value.ObjectV;
    import Field  = value.Field;
    import Value = value.Value;
    import Type = value.Type;

    export class World {
        values : ObjectV;

       constructor() {
            this.values = new ObjectV();
        }

        addField(name : String, value : Value, type : Type, isConstant : boolean){

            var field = this.values.getField(name);

            assert.check(field == null,
                "Field with that name already exists!");


            var f = new Field(name, value, type, isConstant);
            this.values.addField(f);
        }

        deleteField(name : String) {
            this.values.deleteField(name);
        }

        getField(name : String) {
            var field = this.values.getField(name);
            assert.check(field != null,
                "field does not exist!");
        }
    }

    export class Method {

    }

}

export = world;