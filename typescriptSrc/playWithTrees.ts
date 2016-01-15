/// <reference path="pnode.ts" />

var a : pnode.ExprNode = pnode.mkStringConst( "a" ) ;
console.log( a.toString() ) ;

var b : pnode.ExprNode = pnode.mkStringConst( "b" ) ;
console.log( b.toString() ) ;

var c : pnode.ExprNode = pnode.mkStringConst( "c" ) ;
console.log( c.toString() ) ;

var d : pnode.ExprNode = pnode.mkStringConst( "d" ) ;
console.log( d.toString() ) ;

var s0 : pnode.ExprSeqNode = pnode.mkExprSeq( [a,b] ) ;
console.log( s0.toString() ) ;

var s1 : pnode.ExprSeqNode = pnode.mkExprSeq( [c] ) ;
console.log( s1.toString() ) ;

var ite0 = pnode.mkIf( a, s0, s1 )  ;
console.log( ite0.toString() ) ;

// We'd like the following to fail at compile time.
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