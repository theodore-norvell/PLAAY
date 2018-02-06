/// <reference path="../typings/main/ambient/mocha/index.d.ts" />

/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../labels.ts" />
/// <reference path="../pnode.ts" />
/// <reference path="../pnodeEdits.ts" />

import assert = require( '../assert' ) ;
import collections = require( '../collections' ) ;
import labels = require( '../labels' ) ;
import pnode = require( '../pnode' ) ;
import pnodeEdits = require( '../pnodeEdits' ) ;

const list = collections.list ;


const a : pnode.PNode = labels.mkStringLiteral( "a" ) ;
const b : pnode.PNode = labels.mkStringLiteral( "b" ) ;
const c : pnode.PNode = labels.mkStringLiteral( "c" ) ;
const d : pnode.PNode = labels.mkStringLiteral( "d" ) ;
const s0 : pnode.PNode = labels.mkExprSeq( [a,b] ) ;
const s1 : pnode.PNode = labels.mkExprSeq( [c] ) ;
const ite0 = labels.mkIf( a, s0, s1 )  ;
//  ite0 is if( a, seq(a, b), seq(c)) 

const seq0= labels.mkExprSeq( [] ) ;
const seq1= labels.mkExprSeq( [a] ) ;
const seq2 = labels.mkExprSeq( [a,b] ) ;
const seq3 = labels.mkExprSeq( [a,b,c] ) ;

const ite1 = labels.mkIf( a, labels.mkExprSeq([b]), labels.mkExprSeq([c])) ;
// ite0 is if( a, seq(b), seq(c))


describe( 'pnodeEdits.Selection', () => {
    it('should fail to make a bad selection. Path too long.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(0,0), 0, 0 ) ) ;
        try {
            const badSel = new pnodeEdits.Selection( ite0, collections.list(0,0), 0, 0 ) ;
            assert.check( false ) ; }
        catch( e ) { }
        } ) ;
        
    it('should fail to make a bad sselection. Path item too big.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(1,2), 0, 0 ) ) ;
        try {
            const badSel0 = new pnodeEdits.Selection( ite0, collections.list(1,2), 0, 0 ) ;
            assert.check( false ) ; }
        catch( e  ) { }
        } ) ;
        
    it('should fail to make a bad selection. Anchor too small.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(1,1), -1, 0 ) ) ;
        try {
            const badSel0 = new pnodeEdits.Selection( ite0, collections.list(1,1), -1, 0 );
            assert.check( false ) ; }
        catch( e  ) { }
        } ) ;
        
    it('should fail to make a bad selection. Anchor too big.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(1), 3, 0 ) ) ;
        try {
            const badSel0 = new pnodeEdits.Selection( ite0, collections.list(1), 3, 0 ) ;
            assert.check( false ) ; }
        catch( e  ) { }
        } ) ;
        
    it('should fail to make a bad selection. Focus too small.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(1,1), 0, -1 ) ) ;
        try {
            const badSel0 = new pnodeEdits.Selection( ite0, collections.list(1,1), 0, -1 ) ;
            assert.check( false ) ; }
        catch( e ) { }
        } ) ;
        
    it('should fail to make a bad selection. Focus too big.', () => {
        assert.check( ! pnodeEdits.checkSelection( ite0, collections.list(1), 0, 3 ) ) ;
        try {
            const badSel0 = new pnodeEdits.Selection( ite0, collections.list(1), 0, 3 ) ;
            assert.check( false ) ; }
        catch( e  ) { }
        } ) ;
} ) ;

// The next few tests build a tree top down using the InsertChildrenEdit

const t0 = labels.mkExprSeq( [] ) ;


describe( 'pnodeEdits.InsertChildrenEdit', () => {
    let t1 : pnode.PNode ;

    it( 'should insert a single if-then-else node at ((),0,0)', () => {
        const p0 = collections.list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( t0, p0, 0, 0 ) ;
        const edit0 = new pnodeEdits.InsertChildrenEdit( [ ite0 ] ) ;
        //console.log( edit0.toString() ) ;
        const editResult0 = edit0.applyEdit( sel0 ) ;
        //console.log( "Add an if expression as a new child to the root at position 0" ) ;
        //console.log( "editResult0 is " + editResult0.toString() ) ;
        editResult0.choose(
            s => {
                t1 = s.root() ;
                assert.check( t1.label() instanceof labels.ExprSeqLabel ) ;
                assert.check( t1.child(0) === ite0 ) ;
                assert.check( s.path() === sel0.path() ) ;
                assert.check( s.anchor() === 0 ) ;
                assert.check( s.focus() === 1 ) ;
            },
            () => assert.check( false ) ) ; } ) ;

    let t2 : pnode.PNode ;

    it( 'should replace a node at at ((0),0,1)', () => {
        const sel1 = new pnodeEdits.Selection( t1, collections.list(0), 0, 1 ) ;
        //console.log( sel1.toString() ) ;
        const edit1 = new pnodeEdits.InsertChildrenEdit( [ c ] ) ;
        //console.log( edit1.toString() ) ;
        const editResult1 = edit1.applyEdit( sel1 ) ;
        //console.log( "Replace the guard with c" ) ;
        //console.log( "editResult1 is " + editResult1.toString() ) ;
        editResult1.choose(
            s => {
                t2 = s.root() ;
                assert.check( t2.label() instanceof labels.ExprSeqLabel ) ;
                //console.log( "t2 is " + t2.toString() ) ;
                assert.check( t2.child(0).label() instanceof labels.IfLabel ) ;
                assert.check( t2.child(0).child(0) === c ) ;
                assert.check( s.path() === sel1.path() ) ;
                assert.check( s.anchor() === 0 ) ;
                assert.check( s.focus() === 1 ) ;
            },
            () => assert.check( false ) ) ; } ) ;

    it( 'should backfill a copy of zeros nodes', () => {

        // Select the guard
        const p1 = list<number>() ;
        const sel1 = new pnodeEdits.Selection( ite0, p1, 0, 1 ) ;
        // Insert 0 nodes
        const edit = new pnodeEdits.InsertChildrenEdit( [ ] ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( expPH() seq( string[a]() string[b]()) seq( string[c]()))"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;
} ) ;

describe( 'pnodeEdits.DeleteEdit', () => {

    it( 'should delete a single node', () => {
        // Select the  first child of the second child
        const p1 = list<number>( 1 ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p1, 0, 1 ) ;
        const edit0 = new pnodeEdits.DeleteEdit( ) ;
        //console.log( edit0.toString() ) ;
        const editResult0 = edit0.applyEdit( sel0 ) ;
        //console.log( "editResult0 is " + editResult0.toString() ) ;
        editResult0.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[b]()) seq( string[c]())) _path:( 1 ) _anchor: 0 _focus: 0)",
                                   s.toString() ) ;
            },
            () => assert.check( false ) ) ; } ) ;

    it( 'should delete a single node', () => {
        // Select the  second child of the second child
        const p1 = list<number>( 1 ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p1, 1, 2 ) ;
        const edit0 = new pnodeEdits.DeleteEdit( ) ;
        //console.log( edit0.toString() ) ;
        const editResult0 = edit0.applyEdit( sel0 ) ;
        //console.log( "editResult0 is " + editResult0.toString() ) ;
        editResult0.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[a]()) seq( string[c]())) _path:( 1 ) _anchor: 1 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false ) ) ; } ) ;

    it( 'should back fill with a place holder', () => {
        // Select the  first child of the if
        const empty = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( ite0, empty, 0, 1 ) ;
        const edit0 = new pnodeEdits.DeleteEdit( ) ;
        //console.log( edit0.toString() ) ;
        const editResult0 = edit0.applyEdit( sel0 ) ;
        //console.log( "editResult0 is " + editResult0.toString() ) ;
        editResult0.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( expPH() seq( string[a]() string[b]()) seq( string[c]()))"
                                           + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false ) ) ; } ) ;

    for( let k = 0 ; k <= 2 ; ++k ) {
        it( 'should delete zeros nodes', () => {
            // make an empty selection
            const p1 = list<number>( 1 ) ;
            const sel0 = new pnodeEdits.Selection( ite0, p1, k, k ) ;
            const edit0 = new pnodeEdits.DeleteEdit( ) ;
            //console.log( edit0.toString() ) ;
            const editResult0 = edit0.applyEdit( sel0 ) ;
            //console.log( "editResult0 is " + editResult0.toString() ) ;
            editResult0.choose(
                s => {
                    assert.checkEqual( "Selection( _root:if( string[a]() seq( string[a]() string[b]()) seq( string[c]()))"
                                                  +" _path:( 1 ) _anchor: "+k+" _focus: "+k+")",
                                       s.toString() ) ;
                },
                () => assert.check( false ) ) ; } ) ; }
                
    it( 'should delete two nodes', () => {
        const p1 = list<number>( 1 ) ;
        // Select both children of the second child
        const sel0 = new pnodeEdits.Selection( ite0, p1, 0, 2 ) ;
        const edit0 = new pnodeEdits.DeleteEdit( ) ;
        //console.log( edit0.toString() ) ;
        const editResult0 = edit0.applyEdit( sel0 ) ;
        //console.log( "editResult0 is " + editResult0.toString() ) ;
        editResult0.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq() seq( string[c]())) _path:( 1 ) _anchor: 0 _focus: 0)",
                                   s.toString() ) ;
            },
            () => assert.check( false ) ) ; } ) ;

    

    it( 'should not delete if that makes the tree invalid', () => {
        const p1 = list<number>( ) ;
        // Select the first seq under the if node.
        const sel0 = new pnodeEdits.Selection( ite0, p1, 1, 2 ) ;
        const edit0 = new pnodeEdits.DeleteEdit( ) ;
        //console.log( edit0.toString() ) ;
        const editResult0 = edit0.applyEdit( sel0 ) ;
        //console.log( "editResult0 is " + editResult0.toString() ) ;
        editResult0.choose(
            s => {
                assert.check( false, "Unexpected success" ) ;
            },
            () => { } ) ; } ) ;

} ) ;

describe( 'pnodeEdits.CopyEdit', function() : void {

    it( 'should copy a single node', function() : void {
        // Select the the second child of the if
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 1, 2 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select the third child of the if
        const sel1 = new pnodeEdits.Selection( ite0, p0, 2, 3 ) ;
        // Copy the second child over the third
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult0.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[a]() string[b]()) seq( string[a]() string[b]()))"
                                 + " _path:() _anchor: 2 _focus: 3)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;


    it( 'should copy a single node', () => {
        // Select the the third child of the if
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 2, 3 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select the second child of the if
        const sel1 = new pnodeEdits.Selection( ite0, p0, 1, 2 ) ;
        // Copy the third child over the second
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult0.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[c]()) seq( string[c]()))"
                                 + " _path:() _anchor: 1 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should copy a single node', () => {
        // Select the the second child of the second child
        const p0 = list<number>( 1 ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 1, 2 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select the first child of the if
        const p1 = list<number>() ;
        const sel1 = new pnodeEdits.Selection( ite0, p1, 0, 1 ) ;
        // Copy 
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[b]() seq( string[a]() string[b]()) seq( string[c]()))"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should copy a single node', () => {
        // Select the first child of the if
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 0, 1 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select the position before the first child of the then part
        const p1 = list<number>(1) ;
        const sel1 = new pnodeEdits.Selection( ite0, p1, 0, 0 ) ;
        // Copy 
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[a]() string[a]() string[b]()) seq( string[c]()))"
                                 + " _path:( 1 ) _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should copy a single node', () => {
        // Select the first child of the if
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 0, 1 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select the position before the second child of the then part
        const p1 = list<number>(1) ;
        const sel1 = new pnodeEdits.Selection( ite0, p1, 1, 1 ) ;
        // Copy 
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[a]() string[a]() string[b]()) seq( string[c]()))"
                                 + " _path:( 1 ) _anchor: 1 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should copy a single node', () => {
        // Select the first child of the if
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 0, 1 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select the position after all children of the then-part
        const p1 = list<number>(1) ;
        const sel1 = new pnodeEdits.Selection( ite0, p1, 2, 2 ) ;
        // Copy 
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[a]() string[b]() string[a]()) seq( string[c]()))"
                                 + " _path:( 1 ) _anchor: 2 _focus: 3)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should copy a single node', () => {
        // Select the first child of the if
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 0, 1 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select all the nodes of the then part
        const p1 = list<number>(1) ;
        const sel1 = new pnodeEdits.Selection( ite0, p1, 0, 2 ) ;
        // Copy 
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[a]()) seq( string[c]()))"
                                 + " _path:( 1 ) _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should copy a two nodes', () => {
        // Select the first and second nodes of the then part
        const p0 = list<number>( 1 ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 0, 2 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select the second node of the then part
        const p1 = list<number>(1) ;
        const sel1 = new pnodeEdits.Selection( ite0, p1, 1, 2 ) ;
        // Copy 
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[a]() string[a]() string[b]()) seq( string[c]()))"
                                 + " _path:( 1 ) _anchor: 1 _focus: 3)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should copy a zeros nodes', () => {
        // An empty selection
        const p0 = list<number>( 1 ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 2, 2 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select the second node of the then part
        const p1 = list<number>(1) ;
        const sel1 = new pnodeEdits.Selection( ite0, p1, 1, 2 ) ;
        // Copy 
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[a]()) seq( string[c]()))"
                                 + " _path:( 1 ) _anchor: 1 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should backfill a copy of zeros nodes', () => {
        // An empty selection
        const p0 = list<number>( 1 ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 2, 2 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select the guard
        const p1 = list<number>() ;
        const sel1 = new pnodeEdits.Selection( ite0, p1, 0, 1 ) ;
        // Copy 
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult.toString() ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( expPH() seq( string[a]() string[b]()) seq( string[c]()))"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should fail to make an invalid node', () => {
        // Select the then part
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( ite0, p0, 1, 2 ) ;
        const edit = new pnodeEdits.CopyEdit( sel0 ) ;
        // Select the guard
        const p1 = list<number>() ;
        const sel1 = new pnodeEdits.Selection( ite0, p1, 0, 1 ) ;
        // Copy the then part over the guard.
        const editResult = edit.applyEdit( sel1 ) ;
        //console.log( "editResult0 is " + editResult.toString() ) ;
        editResult.choose(
            s => {
                assert.check( false, "Unexpected success.") ;
            },
            () => { } ) ; } ) ;

} ) ;

describe( 'pnodeEdits.MoveEdit with common parent', () => {

    it( 'should move 0 nodes of 0', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq0, p0, 0, 0 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq0, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq()"
                                 + " _path:() _anchor: 0 _focus: 0)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,0) to (0,0) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 0, 0 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 0 _focus: 0)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,0) to (1,1) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 0, 0 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 1, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 1 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,0) to (0,1) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 0, 0 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq()"
                                 + " _path:() _anchor: 0 _focus: 0)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (1,1) to (0,0) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 1, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 0 _focus: 0)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (1,1) to (1,1) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 1, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 1, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 1 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,1) to (0,1) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 0, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,1) to (0,0) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,1) to (1,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,1) to (2,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 2, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[b]() string[a]())"
                                 + " _path:() _anchor: 1 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,1) to (0,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,1) to (1,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (1,2) to (0,0) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[b]() string[a]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (1,2) to (1,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 1 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (1,2) to (2,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 2, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 1 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (1,2) to (0,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[b]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (2,1) to (1,0) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 2, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[b]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (1,2) to (0,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[b]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,2) to (0,0) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,2) to (1,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,2) to (2,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 2, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,2) to (0,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,2) to (1,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should move (0,2) to (0,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

} ) ;

describe( 'pnodeEdits.SwapEdit with common parent', () => {

    it( 'should swap 0 nodes of 0', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq0, p0, 0, 0 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq0, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq()"
                                 + " _path:() _anchor: 0 _focus: 0)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (0,0) and (0,0) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 0, 0 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 0 _focus: 0)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (0,0) and (1,1) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 0, 0 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 1, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 1 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;
    
    it( 'should swap (0,0) and (0,1) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 0, 0 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 1 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (1,1) and (0,0) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 1, 1 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 0 _focus: 0)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (1,1) and (1,1) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 1, 1 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 1, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]())"
                                 + " _path:() _anchor: 1 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should fail to swap (0,1) and (0,1) in seq1', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq1, p0, 0, 1 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq1, p0, 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.map(
            s => {
                assert.unreachable("Non-empty overlapping elements cannot be swapped") ;
            } ) ; } ) ;

    it( 'should swap (0,1) and (0,0) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (0,1) and (1,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (0,1) and (2,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 2, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[b]() string[a]())"
                                 + " _path:() _anchor: 1 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should fail to swap (0,1) and (0,1) in seq2', () => {
      const p0 = list<number>( ) ;
      const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
      const edit = new pnodeEdits.SwapEdit( sel0 ) ;
      const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
      const editResult = edit.applyEdit( sel1 ) ;
      editResult.map(
            s => {
                assert.unreachable("Non-empty overlapping elements cannot be swapped") ;
            } ) ; } ) ;

    it( 'should swap (0,1) and (1,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[b]() string[a]())"
                                 + " _path:() _anchor: 1 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (1,2) and (0,0) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[b]() string[a]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (1,2) and (1,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 1 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (1,2) and (2,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 2, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 1 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (1,2) and (0,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[b]() string[a]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (2,1) and (1,0) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 2, 1 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[b]() string[a]())"
                                 + " _path:() _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should fail to swap (1,2) and (0,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.map(
            s => {
                assert.unreachable("Non-empty overlapping elements cannot be swapped") ;
            } ) ; } ) ;

    it( 'should swap (0,2) and (0,0) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 0 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (0,2) and (1,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (0,2) and (2,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 2, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:seq( string[a]() string[b]())"
                                 + " _path:() _anchor: 0 _focus: 2)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should fail to swap (0,2) and (0,1) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.map(
            s => {
                assert.unreachable("Non-empty overlapping elements cannot be swapped") ;
            } ) ; } ) ;

    it( 'should fail to swap (0,2) and (1,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 1, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.map(
            s => {
                assert.unreachable("Non-empty overlapping elements cannot be swapped") ;
            } ) ; } ) ;

    it( 'should fail to swap (0,2) and (0,2) in seq2', () => {
        const p0 = list<number>( ) ;
        const sel0 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( seq2, p0, 0, 2 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.map(
            s => {
                assert.unreachable("Non-empty overlapping elements cannot be swapped") ;
            } ) ; } ) ;

} ) ;

describe( 'swap without common parent', function() : void {
    it( 'should swap (1) (0,..1) with (2) (0,..1)', () => {
        const sel0 = new pnodeEdits.Selection( ite1, list(1), 0, 1 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( ite1, list(2), 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[c]()) seq( string[b]()))"
                                      + " _path:( 2 ) _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;

    it( 'should swap (2) (0,..1) with (2) (0,..1)', function() : void {
        const sel0 = new pnodeEdits.Selection( ite1, list(2), 0, 1 ) ;
        const edit = new pnodeEdits.SwapEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( ite1, list(1), 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[c]()) seq( string[b]()))"
                                     + " _path:( 1 ) _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;
} ) ;

describe( 'move without common parent', function() : void {
    it( 'should move from (1) (0,..1) to (2) (0,..1)', () => {
        const sel0 = new pnodeEdits.Selection( ite1, list(1), 0, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( ite1, list(2), 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq() seq( string[b]()))"
                                      + " _path:( 2 ) _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;
    it( 'should move from (2) (0,..1) to (1) (0,..1)', function() : void {
        const sel0 = new pnodeEdits.Selection( ite1, list(2), 0, 1 ) ;
        const edit = new pnodeEdits.MoveEdit( sel0 ) ;
        const sel1 = new pnodeEdits.Selection( ite1, list(1), 0, 1 ) ;
        const editResult = edit.applyEdit( sel1 ) ;
        editResult.choose(
            s => {
                assert.checkEqual( "Selection( _root:if( string[a]() seq( string[c]()) seq())"
                                       + " _path:( 1 ) _anchor: 0 _focus: 1)",
                                   s.toString() ) ;
            },
            () => assert.check( false, "Unexpected failure." ) ) ; } ) ;
} ) ;