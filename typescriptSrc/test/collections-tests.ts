/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />

import assert = require( '../assert' ) ;
import collections = require( '../collections' ) ;

import caseAlways = collections.caseAlways ;
import caseCons = collections.caseCons ;
import caseNil = collections.caseNil ;
import cat = collections.cat ;
import cons = collections.cons ;
import guard = collections.guard ;
import lazyCat = collections.lazyCat ;
import lazyCons = collections.lazyCons ;
import list = collections.list ;
import List = collections.List ;
import match = collections.match ;
import nil = collections.nil ;
import none = collections.none ;
import optMatch = collections.optMatch ;
import Option = collections.Option ;
import some = collections.some ;

describe( "match", function() : void {
    it( "should fail if no match", function() : void {
        let ok = true ;
        try {
            match( 0 ) ;
            ok = false ;
        } catch(ex ) { }
        assert.check(ok) ;
        let a : number = 0 ;
        let b : number = 1 ;
        try {
            match( 0, caseAlways( () => guard( a===b, () => 42 ) ) ) ;
            ok = false ;
        } catch(ex ) { }
        assert.check(ok) ;
    } ) ;

    it( "should match nil", function() : void {
        const aList = nil<number>() ;
        const x = match( aList,
                         caseNil( () =>
                            some( "nil")),
                         caseCons( (h:number, r:List<number>) =>
                            some( "cons ") )  ) ;
        assert.check(x === "nil") ;

        // Try the other way around
        const y = match( aList,
                         caseCons( (h:number, r:List<number>) =>
                            some( "cons ") ),
                         caseNil( () =>
                            some( "nil")) ) ;
        assert.check(y === "nil") ;
    } ) ;

    it( "should match cons", function() : void {
        const aList = cons( "abc", nil<string>() ) ;
        const x = match( aList,
                         caseNil( () =>
                            some( "nil")),
                         caseCons( (h:string, r:List<string>) =>
                            some(  h + r.size() ) ) ) ;
        assert.checkEqual("abc0", x) ;

        // Try the other way around
        const bList = lazyCons( "five", () => aList ) ;
        const y = match( bList,
                         caseCons( (h:string, r:List<string>) =>
                            some(  h + r.size() ) ),
                         caseNil( () =>
                            some( "nil") ) ) ;
        assert.checkEqual("five1", y) ;
    } ) ;

    function classify( n : number ) : string {
        return match( n,
                      (_)=>guard( n<50, () => "F"),
                      (_)=>guard( n<60, () => "D"),
                      (_)=>guard( n<70, () => "C"),
                      (_)=>guard( n<80, () => "B"),
                      (_) => some("A") 
        ) ;
    }

    it( "should work with guards", function() : void {
        assert.checkEqual( "F", classify(49) ) ;
        assert.checkEqual( "D", classify(50) ) ;
        assert.checkEqual( "C", classify(65) ) ;
        assert.checkEqual( "B", classify(79) ) ;
        assert.checkEqual( "A", classify(100) ) ;
    } ) ;

} ) ;

describe( "matchOpt", function() : void {
    it( "should fail if no match", function() : void {
        const opt0 = optMatch( 0 ) ;
        assert.check( opt0.isEmpty() ) ;
        let a : number = 0 ;
        let b : number = 1 ;
        const opt1 = optMatch( 0, caseAlways( () => guard( a===b, () => 42 ) ) ) ;
        assert.check( opt1.isEmpty() ) ;
    } ) ;

    it( "should match nil", function() : void {
        const aList = nil<number>() ;
        const x = optMatch( aList,
                            caseNil( () =>
                                some( "nil")),
                            caseCons( (h:number, r:List<number>) =>
                                some( "cons ") )  ) ;
        assert.checkEqual("nil", x.first()) ;

        // Try the other way around
        const y = optMatch( aList,
                            caseCons( (h:number, r:List<number>) =>
                                some( "cons ") ),
                            caseNil( () =>
                                some( "nil")) ) ;
        assert.checkEqual("nil", y.first()) ;
    } ) ;

    it( "should match cons", function() : void {
        const aList = cons( "abc", nil<string>() ) ;
        const x = optMatch( aList,
                         caseNil( () =>
                            some( "nil")),
                         caseCons( (h:string, r:List<string>) =>
                            some(  h + r.size() ) ) ) ;
        assert.checkEqual("abc0", x.first() ) ;

        // Try the other way around
        const bList = lazyCons( "five", () => aList ) ;
        const y = optMatch( bList,
                            caseCons( (h:string, r:List<string>) =>
                                some(  h + r.size() ) ),
                            caseNil( () =>
                                some( "nil") ) ) ;
        assert.checkEqual( "five1", y.first() ) ;
    } ) ;

    function classify( n : number ) : Option<string> {
        return optMatch( n,
                         (_)=>guard( 0 <= n && n<50, () => "F"),
                         (_)=>guard( 0 <= n && n<60, () => "D"),
                         (_)=>guard( 0 <= n && n<70, () => "C"),
                         (_)=>guard( 0 <= n && n<80, () => "B"),
                         (_) => guard( 0 <= n && n<80, () => "B"),
                         (_) => guard( 0 <= n && n<=100, () => "A")
        ) ;
    }

    it( "should work with guards", function() : void {
        assert.checkEqual( "F", classify(49).first() ) ;
        assert.checkEqual( "D", classify(50).first() ) ;
        assert.checkEqual( "C", classify(65).first() ) ;
        assert.checkEqual( "B", classify(79).first() ) ;
        assert.checkEqual( "A", classify(100).first() ) ;
        assert.check( classify( -10 ).isEmpty() ) ;
        assert.check( classify( 110 ).isEmpty() ) ;
    } ) ;

} ) ;