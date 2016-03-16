/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../vms.ts" />
/// <reference path="../evaluation.ts" />


import collections = require( '../collections' ) ;
import assert = require( '../assert' ) ;
import pnode = require( '../pnode' ) ;
import vms = require( '../vms' ) ;
import evaluation = require( '../evaluation' ) ;
import Evaluation = evaluation.Evaluation;
import VMS = vms.VMS;


var a : pnode.ExprNode = pnode.mkVar("a");
var b : pnode.ExprNode = pnode.mkVar("interesting");
var eva : Evaluation = new Evaluation(b);
var ms : VMS = new VMS(eva);

describe( 'pnode.varSelect', () => {
    it('should succeed in setting variable node to ready', () => {

    } )
} ) ;
