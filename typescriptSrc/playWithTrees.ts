/// <reference path="pnode.ts" />



var a : pnode.ExprNode = pnode.mkStringConst( "a" ) ;
console.log( a ) ;

var b : pnode.ExprNode = pnode.mkStringConst( "b" ) ;
console.log( b ) ;

var c : pnode.ExprNode = pnode.mkStringConst( "c" ) ;
console.log( c ) ;

var d : pnode.ExprNode = pnode.mkStringConst( "c" ) ;
console.log( d ) ;

var s0 : pnode.ExprSeqNode = pnode.mkExprSeq( [a,b] ) ;
console.log( s1 ) ;

var s1 : pnode.ExprSeqNode = pnode.mkExprSeq( [c] ) ;
console.log( s1 ) ;

var ite0 = pnode.mkIf( a, s0, s1 )  ;
console.log( ite0 ) ;

var ite0 = pnode.mkIf( a, b, c )  ;
console.log( ite0 ) ;

var opt0 = pnode.PNode.tryMake( pnode.IfLabel.theIfLabel, [a, s0, s1] ) ;
console.log( opt0 ) ;

var opt1 = pnode.PNode.tryMake( pnode.IfLabel.theIfLabel, [a, b, c] ) ;
console.log( opt1 ) ;