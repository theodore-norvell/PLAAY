/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="pnode.ts" />
/// <reference path="pnodeEdits.ts" />

import collections = require( './collections' ) ;
import assert = require( './assert' ) ;
import pnode = require( './pnode' ) ;
import pnodeEdits = require( './pnodeEdits' ) ;

var a : pnode.ExprNode = pnode.mkStringLiteral( "a" ) ;
console.log( a.toString() ) ;

var b : pnode.ExprNode = pnode.mkStringLiteral( "b" ) ;
console.log( b.toString() ) ;

var c : pnode.ExprNode = pnode.mkStringLiteral( "c" ) ;
console.log( c.toString() ) ;

var d : pnode.ExprNode = pnode.mkStringLiteral( "d" ) ;
console.log( d.toString() ) ;

var s0 : pnode.ExprSeqNode = pnode.mkExprSeq( [a,b] ) ;
console.log( s0.toString() ) ;

var s1 : pnode.ExprSeqNode = pnode.mkExprSeq( [c] ) ;
console.log( s1.toString() ) ;

var ite0 = pnode.mkIf( a, s0, s1 )  ;
console.log( ite0.toString() ) ;

// We'd like the following to fail at compile time.
// Uncomment to see whether it does.
//var ite1 = pnode.mkIf( a, b, c )  ;
//console.log( ite1.toString() ) ;

var opt0 = pnode.tryMake( pnode.IfLabel.theIfLabel, [a, s0, s1] ) ;
console.log( opt0.toString() ) ;

var opt1 = pnode.tryMake( pnode.IfLabel.theIfLabel, [a, b, c] ) ;
console.log( opt1.toString() ) ;

// Try to swap the then and else parts of ite0
var opt2 = ite0.tryModify( [s1,s0], 1, 3 ) ;
console.log( opt2.toString() ) ;

// Try to swap the guard and then parts of ite0
var opt2 = ite0.tryModify( [s0, a], 0, 2 ) ;
console.log( opt2.toString() ) ;

// Convert to a JSON string.
var string0 = pnode.fromPNodeToJSON( ite0 ) ;
console.log( string0 ) ;

// Convert back from a string
var ite0a = pnode.fromJSONToPNode( string0 ) ;
console.log( ite0a.toString() ) ;

// Try to create a tree using edits.
console.log( "Building a tree from the top down using edits" ) ;

// 0. Start with an empty sequence.
var t0 = pnode.mkExprSeq( [] ) ;
console.log( "Start with a sequence with no children" ) ;
console.log( "t0 is " + t0.toString() ) ;

// 1. Make a selection so that the insertion point is position 0 of the sequence's
// children
var p0 = collections.list<number>( ) ;

//console.log( util.inspect(p0) ) ;
console.log( p0.toString() ) ;

var sel0 = new pnodeEdits.Selection( t0, p0, 0, 0 ) ;
console.log( "sel0 is " + sel0.toString() ) ;

var edit0 = new pnodeEdits.InsertChildrenEdit( [ ite0 ] ) ;
//console.log( edit0.toString() ) ;


var editResult0 = edit0.applyEdit( sel0 ) ;
console.log( "Add an if expression as a new child to the root at position 0" ) ;
console.log( "editResult0 is " + editResult0.toString() ) ;

var sel0a = (<collections.Some<pnodeEdits.Selection>> editResult0).first() ;
console.log( sel0a.toString() ) ;

// Select the guard of the if expression
var sel1 = new pnodeEdits.Selection( sel0a.root(), collections.list(0), 0, 1 ) ;
console.log( "Select the guard of the if expression." ) ;
console.log( "sel1 is " + sel1.toString() ) ;

// Replace the guard with node c.
var edit1 = new pnodeEdits.InsertChildrenEdit( [ c ] ) ;
//console.log( edit1.toString() ) ;


var editResult1 = edit1.applyEdit( sel1 ) ;
console.log( "Replace the selection with node c." ) ;
console.log( "editResult1 is " + editResult1.toString() ) ;

// Make a bad selection:  Path is too long.
try {
    var badSel0 = new pnodeEdits.Selection( ite0, collections.list(0,0), 0, 0 ) ;
    console.log( badSel0.toString() ) ; }
catch( e  ) {
     console.log( "Failed as expected" ) ; }
     
// Make a bad selection:  Path is item is too big.
try {
    var badSel1 = new pnodeEdits.Selection( ite0, collections.list(1,2), 0, 0 ) ;
    console.log( badSel1.toString() )  ; }
catch( e  ) {
     console.log( "Failed as expected" ) ; }
     
// Make a bad selection:  Anchor too small.
try {
    var badSel1 = new pnodeEdits.Selection( ite0, collections.list(1,1), -1, 0 ) ;
    console.log( badSel1.toString() )  ; }
catch( e  ) {
     console.log( "Failed as expected" ) ; }
     
// Make a bad selection:  Anchor too big.
try {
    var badSel1 = new pnodeEdits.Selection( ite0, collections.list(1), 3, 0 ) ;
    console.log( badSel1.toString() )  ; }
catch( e  ) {
     console.log( "Failed as expected" ) ; }
     
// Make a bad selection:  Focus too small.
try {
    var badSel1 = new pnodeEdits.Selection( ite0, collections.list(1,1), 0, -1 ) ;
    console.log( badSel1.toString() )  ; }
catch( e  ) {
     console.log( "Failed as expected" ) ; }
     
// Make a bad selection:  Focus too big.
try {
    var badSel1 = new pnodeEdits.Selection( ite0, collections.list(1), 0, 3 ) ;
    console.log( badSel1.toString() )  ; }
catch( e  ) {
     console.log( "Failed as expected" ) ; }
