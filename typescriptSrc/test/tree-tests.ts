/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../labels.ts" />
/// <reference path="../pnode.ts" />

import assert = require( '../assert' ) ;
import labels = require( '../labels' ) ;
import pnode = require( '../pnode' ) ;

const a : pnode.PNode = labels.mkStringLiteral( "a" ) ;
const b : pnode.PNode = labels.mkStringLiteral( "b" ) ;
const c : pnode.PNode = labels.mkStringLiteral( "c" ) ;
const d : pnode.PNode = labels.mkStringLiteral( "d" ) ;
const s0 : pnode.PNode = labels.mkExprSeq( [a,b] ) ;
const s1 : pnode.PNode = labels.mkExprSeq( [c] ) ;
const ite0 = labels.mkIf( a, s0, s1 )  ;

// We'd like the following to fail at compile time.
// Uncomment to see whether it does.
//const ite1 = pnode.mkIf( a, b, c )  ;

describe( 'pnode.tryMake', function() : void {
    it('should succeed making a valid if', function() : void {
        const opt = pnode.tryMake( labels.IfLabel.theIfLabel, [a, s0, s1] ) ;
        opt.choose(
            p => { assert.check( p.label() instanceof labels.IfLabel ) ; },
            () => { assert.check( false ) ; } ) ; } ) ;

    it('should fail making an invalid if', function() : void {
        const opt = pnode.tryMake( labels.IfLabel.theIfLabel, [a, b, c] ) ;
        opt.choose(
            p => { assert.check( false ) ; },
            () => {  } ) ; } );

    it('should fail making an invalid if', function() : void {
        const opt = pnode.tryMake( labels.IfLabel.theIfLabel, [a, s0] ) ;
        opt.choose(
            p => { assert.check( false ) ; },
            () => {  } ) ; } ) ; } ) ;

describe( 'pnode.tryModify', function() : void {
    
    // Try to swap the then and else parts of ite0

    it('should succeed swapping else and then parts', function() : void {
        const opt = ite0.tryModify( [s1,s0], 1, 3 ) ;
        opt.choose(
            p => { assert.check( p.child(0) === a ) ;
                   assert.check( p.child(1) === s1 ) ;
                   assert.check( p.child(2) === s0 ) ; },
            () => {  } ) ; } ) ;

    // Try to swap the guard and then parts of ite0

    it('should fail swapping the guard and then parts' , function() : void {
        const opt = ite0.tryModify( [s0, a], 0, 2 ) ;
        opt.choose(
            p => { assert.check( false ) ; },
            () => {  } ) ; } ) ; 
} ) ;

describe("Labels", function() : void {
    it("Should forbid NoTypeNode as a part of a type", function() : void {
        const lab = labels.mkNoTypeNd() ;
        const opt = pnode.tryMake(
                        new labels.FieldTypeLabel(),
                        [labels.mkNoExpNd(), labels.mkNoTypeNd() ] ) ;
        opt.choose(
            p => { assert.check( false, "Allowed Bad field type" ) ; },
            () => {  } ) ; 
    } ) ;
} ) ;

let string0 : string ;

describe( 'pnode.fromPNodeToJSON', () => {

    it( 'should convert a node to a JSON string', () => {
        string0 = pnode.fromPNodeToJSON( ite0 ) ;
        assert.checkEqual('{"label":{"kind":"IfLabel"},'+
                           '"children":[{"label":{"kind":"StringLiteralLabel","val":"a","open":true},"children":[]},'+
                                       '{"label":{"kind":"ExprSeqLabel"},'+
                                                  '"children":[{"label":{"kind":"StringLiteralLabel","val":"a","open":true},"children":[]},'+
                                                              '{"label":{"kind":"StringLiteralLabel","val":"b","open":true},"children":[]}]},'+
                                       '{"label":{"kind":"ExprSeqLabel"},'+
                                        '"children":[{"label":{"kind":"StringLiteralLabel","val":"c","open":true},"children":[]}]}]}',
                          string0);
        console.log( string0 ) ; } ) ; } ) ;

describe( 'pnode.fromJSONToPNode', () => {
    it( 'should convert a string to a node', () => {
        const ite0a = pnode.fromJSONToPNode( string0 ) ;
        console.log( ite0a.toString() ) ;
        assert.check( ite0a.label() instanceof labels.IfLabel ) ;
        assert.check( ite0a.count() === 3 ) ;
        const string0a = pnode.fromPNodeToJSON( ite0a ) ;
        assert.check( string0a === string0 ) ; } ) ; } ) ;