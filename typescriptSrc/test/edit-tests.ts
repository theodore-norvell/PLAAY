/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../pnodeEdits.ts" />

import collections = require( '../collections' ) ;
import assert = require( '../assert' ) ;
import pnode = require( '../pnode' ) ;
import pnodeEdits = require( '../pnodeEdits' ) ;


var a : pnode.PNode = pnode.mkStringLiteral( "a" ) ;
var b : pnode.PNode = pnode.mkStringLiteral( "b" ) ;
var c : pnode.PNode = pnode.mkStringLiteral( "c" ) ;
var d : pnode.PNode = pnode.mkStringLiteral( "d" ) ;
var s0 : pnode.PNode = pnode.mkExprSeq( [a,b] ) ;
var s1 : pnode.PNode = pnode.mkExprSeq( [c] ) ;
var ite0 = pnode.mkIf( a, s0, s1 )  ;

// The next few tests build a tree top down using the InsertChildrenEdit

var t0 = pnode.mkExprSeq( [] ) ;


describe( 'pnodeEdits.InsertChildrenEdit', () => {
    var t1 : pnode.PNode ;

    it( 'should insert a single if-then-else node at ((),0,0)', () => {
        var p0 = collections.list<number>( ) ;
        var sel0 = new pnodeEdits.Selection( t0, p0, 0, 0 ) ;
        var edit0 = new pnodeEdits.InsertChildrenEdit( [ ite0 ] ) ;
        //console.log( edit0.toString() ) ;
        var editResult0 = edit0.applyEdit( sel0 ) ;
        //console.log( "Add an if expression as a new child to the root at position 0" ) ;
        //console.log( "editResult0 is " + editResult0.toString() ) ;
        editResult0.choose(
            s => {
                t1 = s.root() ;
                assert.check( t1.label() instanceof pnode.ExprSeqLabel ) ;
                assert.check( t1.child(0) == ite0 ) ;
                assert.check( s.path() == sel0.path() ) ;
                assert.check( s.focus() == 1 ) ;
                assert.check( s.anchor() == 1 ) ;
            },
            () => assert.check( false ) ) ; } ) ;

    var t2 : pnode.PNode ;

    it( 'should replace a node at at ((0),0,1)', () => {
        var sel1 = new pnodeEdits.Selection( t1, collections.list(0), 0, 1 ) ;
        //console.log( sel1.toString() ) ;
        var edit1 = new pnodeEdits.InsertChildrenEdit( [ c ] ) ;
        //console.log( edit1.toString() ) ;
        var editResult1 = edit1.applyEdit( sel1 ) ;
        //console.log( "Replace the guard with c" ) ;
        //console.log( "editResult1 is " + editResult1.toString() ) ;
        editResult1.choose(
            s => {
                t2 = s.root() ;
                assert.check( t2.label() instanceof pnode.ExprSeqLabel ) ;
                //console.log( "t2 is " + t2.toString() ) ;
                assert.check( t2.child(0).label() instanceof pnode.IfLabel ) ;
                assert.check( t2.child(0).child(0) == c ) ;
                assert.check( s.path() == sel1.path() ) ;
                assert.check( s.focus() == 1 ) ;
                assert.check( s.anchor() == 1 ) ;
            },
            () => assert.check( false ) ) ; } ) ;
} ) ;

describe( 'pnodeEdits.Selection', () => {
    it('should fail to make a bad selection. Path too long.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(0,0), 0, 0 ) ) ;
        try {
            var badSel = new pnodeEdits.Selection( ite0, collections.list(0,0), 0, 0 ) ;
            assert.check( false ) ; }
        catch( e  ) { }
        } ) ;
        
    it('should fail to make a bad sselection. Path item too big.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(1,2), 0, 0 ) ) ;
        try {
            var badSel0 = new pnodeEdits.Selection( ite0, collections.list(1,2), 0, 0 ) ;
            assert.check( false ) ; }
        catch( e  ) { }
        } ) ;
        
    it('should fail to make a bad selection. Anchor too small.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(1,1), -1, 0 ) ) ;
        try {
            var badSel0 = new pnodeEdits.Selection( ite0, collections.list(1,1), -1, 0 );
            assert.check( false ) ; }
        catch( e  ) { }
        } ) ;
        
    it('should fail to make a bad selection. Anchor too big.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(1), 3, 0 ) ) ;
        try {
            var badSel0 = new pnodeEdits.Selection( ite0, collections.list(1), 3, 0 ) ;
            assert.check( false ) ; }
        catch( e  ) { }
        } ) ;
        
    it('should fail to make a bad selection. Focus too small.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(1,1), 0, -1 ) ) ;
        try {
            var badSel0 = new pnodeEdits.Selection( ite0, collections.list(1,1), 0, -1 ) ;
            assert.check( false ) ; }
        catch( e  ) { }
        } ) ;
        
    it('should fail to make a bad selection. Focus too big.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(1), 0, 3 ) ) ;
        try {
            var badSel0 = new pnodeEdits.Selection( ite0, collections.list(1), 0, 3 ) ;
            assert.check( false ) ; }
        catch( e  ) { }
        } ) ;
} ) ;