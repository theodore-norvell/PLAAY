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

var wrld : World = new World();
var xStack : VarStack = new VarStack(wrld, null);


describe( 'Variable Stack ', () => {

    it('Should be initialized properly', () => {
        assert.check(xStack.getNext() == null);
        assert.check(xStack.obj == wrld);
        assert.check( xStack.inStack("+") );
        assert.check( xStack.getField("+") != null);
    } );

    it('Should not find values not in the stack', () => {
        assert.check(!xStack.inStack("not in stack"));
        //assert.check(xStack.getField("not in stack") == null);
    } );

    it('Should be able to look up values', () => {

        var str = new valueTypes.StringV("");
        var f : Field = new Field("abc", str, Type.ANY , false);
        var obj : ObjectV = new ObjectV() ;
        obj.addField( f ) ;
        var yStack = new VarStack( obj, xStack) ;
        assert.check( yStack.inStack(f.getName()));
        assert.check( yStack.top().getField(f.getName()) == f );
        assert.check( yStack.getField(f.getName()) == f );
        assert.check( yStack.inStack("+") );
        assert.check( yStack.getField("+") != null );
        assert.check( ! yStack.inStack("not in stack") );
        //assert.check( yStack.getField("not in stack") == null );
    } );
} ) ;
