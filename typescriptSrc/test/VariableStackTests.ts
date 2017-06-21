/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../valueTypes.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../world.ts" />

import collections = require( '../collections' ) ;
import assert = require( '../assert' ) ;
import valueTypes = require( '../valueTypes' ) ;
import vms = require( '../vms' ) ;
import world = require('../world') ;

import Evaluation = vms.Evaluation;
import VMS = vms.VMS;
import World = world.World;
import Field = valueTypes.Field;
import ObjectV = valueTypes.ObjectV;
import Type = vms.Type;
import VarStack = vms.VarStack;
import NonEmptyVarStack = vms.NonEmptyVarStack ;
import EmptyVarStack = vms.EmptyVarStack ;

const wrld : World = new World();
const xStack : VarStack = new NonEmptyVarStack(wrld, EmptyVarStack.theEmptyVarStack);


describe( 'Variable Stack ', function() : void {

    it('Should be initialized properly', function() : void {
        assert.check( xStack.hasField("+") );
    } );

    it('Should not find values not in the stack', function() : void {
        assert.check(!xStack.hasField("not in stack"));
    } );

    it('Should be able to look up values', function() : void {

        const str = new valueTypes.StringV("");
        const f : Field = new Field("abc", str, Type.ANY , false);
        const obj : ObjectV = new ObjectV() ;
        obj.addField( f ) ;
        const yStack = new NonEmptyVarStack( obj, xStack) ;
        assert.check( yStack.hasField(f.getName()));
        assert.check( yStack.getTop().getField(f.getName()) === f );
        assert.check( yStack.getField(f.getName()) === f );
        assert.check( yStack.hasField("+") );
        assert.check( ! yStack.hasField("not in stack") );
    } );
} ) ;
