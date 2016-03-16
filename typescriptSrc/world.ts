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

    export class World extends ObjectV {
        values : ObjectV;

       constructor() {
           super();
            this.values = new ObjectV();
        }

        addField(field : Field){

            //check to see if the field with the same name already exist
            var field = this.values.getField(field.getName());

            assert.check(field == null,
                "Field with that name already exists!");

            this.values.addField(field);
        }

        deleteField(name : String) : boolean {
            return this.values.deleteField(name);
        }

        getField(name : String) : Field {
            var field = this.values.getField(name);
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