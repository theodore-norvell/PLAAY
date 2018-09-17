/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../library.ts" />
/// <reference path="../types.ts" />
/// <reference path="../values.ts" />
/// <reference path="../vms.ts" />

import assert = require( '../assert' ) ;
import collections = require( '../collections' ) ;
import library = require('../library') ;
import types = require('../types') ;
import values = require( '../values' ) ;
import vms = require( '../vms' ) ;

import ObjectV = values.ObjectV;
import Evaluation = vms.Evaluation;
import VMS = vms.VMS;
import World = library.World;
import Field = values.Field;
import Type = types.TypeKind;
import VarStack = vms.VarStack;
import { Transaction, TransactionManager } from '../backtracking';




describe( 'World', function () : void {
    it('Should be able to have fields added to it', function () : void {
        const manager : TransactionManager = new TransactionManager();
        const wld = new World(manager);
        const str = new values.StringV("hello");
        const f : Field = new Field("abcd", Type.TOP , manager, str);
        const n = wld.numFields() ;
        wld.addField(f);
        assert.check(wld.getField(f.getName()) === f);
        assert.check( n+1 === wld.numFields() ) ;
    } );

} ) ;