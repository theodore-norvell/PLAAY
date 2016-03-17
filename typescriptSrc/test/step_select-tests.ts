/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../evaluation.ts" />
/// <reference path="../world.ts" />

import collections = require( '../collections' ) ;
import assert = require( '../assert' ) ;
import pnode = require( '../pnode' ) ;
import vms = require( '../vms' ) ;
import evaluation = require( '../evaluation' ) ;
import world = require('../world') ;
import Evaluation = evaluation.Evaluation;
import VMS = vms.VMS;
import World = world.World;


var wrd : World;
var a : pnode.ExprNode = pnode.mkVar("a");
var b : pnode.ExprNode = pnode.mkVar("interesting");
var ms : VMS = new VMS(b, this.wrd);

describe( 'varNode', () => {
    it('should be initialized properly', () => {
        assert.check(this.b.label() instanceof pnode.VariableLabel);
        assert.check(this.b.strategy instanceof pnode.varStrategy);
        assert.check(this.b.getVal().match("interesting"));
        assert.check(this.a.label() == pnode.VariableLabel);
        assert.check(this.a.strategy == pnode.varStrategy);
        assert.check(this.a.getVal().match("a"));
    } );

    it('', () => {

    } );
} ) ;

describe( '', () => {
    it('', () => {

    } );
} ) ;

describe( '', () => {
    it('', () => {

    } );
} ) ;

describe( '', () => {
    it('', () => {

    } );
} ) ;
