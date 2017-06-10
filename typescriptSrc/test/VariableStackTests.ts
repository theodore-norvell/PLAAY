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

var wrld : World = new World();
var xStack : VarStack = new NonEmptyVarStack(wrld, EmptyVarStack.theEmptyVarStack);


describe( 'Variable Stack ', () => {

    it('Should be initialized properly', () => {
        assert.check( xStack.hasField("+") );
        assert.check( xStack.getField("+") !== null);
    } );

    it('Should not find values not in the stack', () => {
        assert.check(!xStack.hasField("not in stack"));
        //assert.check(xStack.getField("not in stack") == null);
    } );

    it('Should be able to look up values', () => {

        var str = new valueTypes.StringV("");
        var f : Field = new Field("abc", str, Type.ANY , false);
        var obj : ObjectV = new ObjectV() ;
        obj.addField( f ) ;
        var yStack = new NonEmptyVarStack( obj, xStack) ;
        assert.check( yStack.hasField(f.getName()));
        assert.check( yStack.getTop().getField(f.getName()) == f );
        assert.check( yStack.getField(f.getName()) == f );
        assert.check( yStack.hasField("+") );
        assert.check( yStack.getField("+") != null );
        assert.check( ! yStack.hasField("not in stack") );
        //assert.check( yStack.getField("not in stack") == null );
    } );
} ) ;
