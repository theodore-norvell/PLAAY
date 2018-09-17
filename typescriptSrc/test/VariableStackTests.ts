/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../library.ts" />
/// <reference path="../types.ts" />
/// <reference path="../values.ts" />
/// <reference path="../vms.ts" />

import assert = require( '../assert' ) ;
import library = require('../library') ;
import types = require('../types') ;
import values = require( '../values' ) ;
import vms = require( '../vms' ) ;

import Evaluation = vms.Evaluation;
import VMS = vms.VMS;
import World = library.World;
import Field = values.Field;
import ObjectV = values.ObjectV;
import Type = types.TypeKind;
import VarStack = vms.VarStack;
import NonEmptyVarStack = vms.NonEmptyVarStack ;
import EmptyVarStack = vms.EmptyVarStack ;
import { TransactionManager } from '../backtracking';

const manager : TransactionManager = new TransactionManager();
const wrld : World = new World(manager);
const xStack : VarStack = new NonEmptyVarStack(wrld, EmptyVarStack.theEmptyVarStack);


describe( 'Variable Stack ', function() : void {

    it('Should be initialized properly', function() : void {
        assert.check( xStack.hasField("+") );
    } );

    it('Should not find values not in the stack', function() : void {
        assert.check(!xStack.hasField("not in stack"));
    } );

    it('Should be able to look up values', function() : void {

        const str = new values.StringV("");
        const f : Field = new Field("abc", Type.TOP, manager, str);
        const obj : ObjectV = new ObjectV(manager ) ;
        obj.addField( f ) ;
        const yStack = new NonEmptyVarStack( obj, xStack) ;
        assert.check( yStack.hasField(f.getName()));
        assert.check( yStack.getTop().getField(f.getName()) === f );
        assert.check( yStack.getField(f.getName()) === f );
        assert.check( yStack.hasField("+") );
        assert.check( yStack.hasField("-") );
        assert.check( yStack.hasField("*") );
        assert.check( yStack.hasField("/") );
        assert.check( yStack.hasField("<") );
        assert.check( yStack.hasField("<=") );
        assert.check( yStack.hasField(">") );
        assert.check( yStack.hasField(">=") );
        assert.check( yStack.hasField("=") );
        assert.check( yStack.hasField("and") );
        assert.check( yStack.hasField("or") );
        assert.check( ! yStack.hasField("not in stack") );
    } );
} ) ;
