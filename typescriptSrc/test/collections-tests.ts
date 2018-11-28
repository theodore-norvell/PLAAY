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
import lazyIntSeq = collections.lazyIntSeq ;
import list = collections.list ;
import List = collections.List ;
import match = collections.match ;
import nil = collections.nil ;
import none = collections.none ;
import optMatch = collections.optMatch ;
import Option = collections.Option ;
import some = collections.some ;


abstract class Notification {
    
    // Deconstructors: default implementation
    public exEmail<A>( f : (sender : String, title : String, body : String) => Option<A> ) : Option<A> {
        return none() ; }

    public exSMS<A>( f : (caller : String, message : String) => Option<A> ) : Option<A> {
        return none() ; }

    public exVoiceRecording<A>( f : (contactName : String, link : String) => Option<A> ) : Option<A> {
        return none() ; }
    
}

class Email extends Notification {
    private sender : String ;
    private title : String ;
    private body : String ;
    constructor( sender : String, title : String, body : String)  {
        super() ;
        this.sender = sender; this.title = title; this.body = body ; }

    public exEmail<A>( f : (sender : String, title : String, body : String) => Option<A> ) : Option<A> {
        return f( this.sender, this.title, this.body ) ; }
}
class SMS extends Notification {
    private caller : String ;
    private message : String ;
    constructor( caller : String, message : String)  {
        super() ;
        this.caller = caller; this.message = message; }

    public exSMS<A>( f : (caller : String, message : String) => Option<A> ) : Option<A> {
        return f( this.caller, this.message ) ; }
}
class VoiceRecording extends Notification {
    private contactName : String ;
    private link : String ;
    constructor( contactName : String, link : String)  {
        super() ;
        this.contactName = contactName; this.link = link; }

    public exVoiceRecording<A>( f : (contactName : String, link : String) => Option<A> ) : Option<A> {
        return f( this.contactName, this.link) ; }
}

function caseEMail<A>( f : (sender : String, title : String, body : String) => Option<A> ) : (n:Notification) => Option<A> {
    return  (n:Notification) => n.exEmail( f ) ; }

function caseSMS<A>( f : (caller : String, message : String) => Option<A> ) : (n:Notification) => Option<A> {
    return  (n:Notification) => n.exSMS( f ) ; }

function caseVoiceRecording<A>( f : (contactName : String, link : String) => Option<A> ) : (n:Notification) => Option<A> {
    return  (n:Notification) => n.exVoiceRecording( f ) ; }

function showNotification( notification : Notification ) : String {
    return match(
            notification,
            caseEMail( (sender, title, _) =>
                some( `You got an email from ${sender} with title ${title}`)  ),
            caseSMS( (caller, message) =>
                some( `You got an SMS from ${caller}! Message: ${message}` )  ),
            caseVoiceRecording( (name, link) =>
                some( `You received a Voice Recording from ${name}. Click the link to hear it: ${link}` )  )
    ) ;
}

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
    } ) ;

    it( "should match lazy cons", function() : void {
        // Try with lazyCons
        const aList = cons( "abc", nil<string>() ) ;
        const bList = lazyCons( () => "five", () => aList ) ;
        const y = match( bList,
                         caseCons( (h:string, r:List<string>) =>
                            some(  h + r.size() ) ),
                         caseNil( () =>
                            some( "nil") ) ) ;
        assert.checkEqual("five1", y) ;
    } ) ;

    it( "should match lazyCat", function() : void {
        // Try with lazyCons
        const aList = cons( "abc", nil<string>() ) ;
        const bList = lazyCons( () => "def", () => nil<string>() ) ;
        const cList = aList.lazyCat( bList ) ;
        const y = match( cList,
                         caseCons( (h:string, r:List<string>) =>
                            some(  h + r.size() ) ),
                         caseNil( () =>
                            some( "nil") ) ) ;
        assert.checkEqual("abc1", y) ;
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

    it( "should work with example from scala.org", function() : void {
        const someSms = new SMS("12345", "Are you there?")
        const someVoiceRecording = new VoiceRecording("Tom", "voicerecording.org/id/123") ;
        let r = showNotification( someVoiceRecording ) ;
        assert.checkEqual( "You received a Voice Recording from Tom. Click the link to hear it: voicerecording.org/id/123",
                           r ) ;
        r = showNotification( someSms ) ;
        assert.checkEqual( "You got an SMS from 12345! Message: Are you there?",
                           r ) ;

        r = match(
                someVoiceRecording,
                caseEMail( (sender, title, _) =>
                    some( `You got an email from ${sender} with title ${title}`)  ),
                (_) =>
                    some( `You received a notification` )
        ) ;
        assert.checkEqual( "You received a notification",
                           r ) ;
        const someEmail = new Email("Alice", "options", "See my latest blog post") ;
        r = match(
            someEmail,
            caseEMail( (sender, title, _) => guard( sender==="Alice", () =>
                `PRIORITY email from ${sender} with title ${title}`) ),
            caseEMail( (sender, title, _) =>
                some( `You got an email from ${sender} with title ${title}`)  ),
            caseSMS( (caller, message) =>
                some( `You got an SMS from ${caller}! Message: ${message}` )  ),
            caseVoiceRecording( (name, link) =>
                some( `You received a Voice Recording from ${name}. Click the link to hear it: ${link}` )  )
        ) ;
        assert.checkEqual( "PRIORITY email from Alice with title options",
                           r ) ;
    }
    ) ;

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
    } ) ;

    it( "should match lazyCons", function() : void {
        // Try with lazyCons
        const aList = cons( "abc", nil<string>() ) ;
        const bList = lazyCons( () => "def", () => nil<string>() ) ;
        const cList = aList.lazyCat( bList ) ;
        const y = optMatch( cList,
                            caseCons( (h:string, r:List<string>) =>
                                some(  h + r.size() ) ),
                            caseNil( () =>
                                some( "nil") ) ) ;
        assert.checkEqual( "abc1", y.first() ) ;
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


describe( "lazyIntSeq", function() : void {
    it( "ordered tuples", function() : void {

        function factory( i0 : number, i1 : number ) : string {
            return  "(" + i0 + "," + i1 + ")" ; 
        }
        const lst = lazyIntSeq(0, 2-1).lazyBind(
            (i0:number) => lazyIntSeq(i0+1, 2-i0-1).lazyMap( 
                (i1:number) => factory(i0,i1) ) ) ;
        assert.checkEqual( "( (0,1) )", lst.toString()) ;
    } ) ;
    it( "should map in a lazy way", function() : void {
        const l = lazyIntSeq( 0, 5 ) ;
        let s = "" ;
        function f( i : number ) : number {
            s = s + i.toString() + ";" ;
            return 2*i ;
        }
        let l2 = l.lazyMap( f ) ;
        assert.checkEqual( "", s ) ;

        let a = l2.first() ;
        assert.checkEqual( 0, a ) ;
        assert.checkEqual( "0;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 2, a ) ;
        assert.checkEqual( "0;1;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 4, a ) ;
        assert.checkEqual( "0;1;2;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;2;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 6, a ) ;
        assert.checkEqual( "0;1;2;3;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;2;3;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 8, a ) ;
        assert.checkEqual( "0;1;2;3;4;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;2;3;4;", s ) ;
        assert.check( l2.isEmpty() ) ;
    } ) ;

    it( "should map when made with lazyCat", function() : void {
        const l0 = lazyIntSeq( 0, 2 ) ;
        const l1 = lazyIntSeq( 2, 3 ) ;
        const l = l0.lazyCat( l1 ) ;

        let s = "" ;
        function f( i : number ) : number {
            s = s + i.toString() + ";" ;
            return 2*i ;
        }
        let l2 = l.lazyMap( f ) ;
        assert.checkEqual( "", s ) ;

        let a = l2.first() ;
        assert.checkEqual( 0, a ) ;
        assert.checkEqual( "0;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 2, a ) ;
        assert.checkEqual( "0;1;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 4, a ) ;
        assert.checkEqual( "0;1;2;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;2;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 6, a ) ;
        assert.checkEqual( "0;1;2;3;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;2;3;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 8, a ) ;
        assert.checkEqual( "0;1;2;3;4;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;2;3;4;", s ) ;
        assert.check( l2.isEmpty() ) ;
    } ) ;

    it( "should be lazy if mapped and then catted", function() : void {
        const l0 = lazyIntSeq( 0, 2 ) ;
        const l1 = lazyIntSeq( 2, 3 ) ;

        let s = "" ;
        function f( i : number ) : number {
            s = s + i.toString() + ";" ;
            return 2*i ;
        }
        const l0a = l0.lazyMap( f ) ;
        const l1a = l1.lazyMap( f ) ;
        let l2 = l0a.lazyCat( l1a ) ;
        assert.checkEqual( "", s ) ;

        let a = l2.first() ;
        assert.checkEqual( 0, a ) ;
        assert.checkEqual( "0;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 2, a ) ;
        assert.checkEqual( "0;1;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 4, a ) ;
        assert.checkEqual( "0;1;2;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;2;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 6, a ) ;
        assert.checkEqual( "0;1;2;3;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;2;3;", s ) ;
        a = l2.first() ;
        assert.checkEqual( 8, a ) ;
        assert.checkEqual( "0;1;2;3;4;", s ) ;
        
        l2 = l2.rest() ;
        assert.checkEqual( "0;1;2;3;4;", s ) ;
        assert.check( l2.isEmpty() ) ;
    } ) ;


    it( "should work with eager map and eager bind", function() : void {
        let s = "" ;
        function factory( i0 : number, i1 : number ) : number {
            s = s + "(" + i0 + "," + i1 + ")" ; 
            return 10*i0 + i1 ;
        }
        const listOfNumbers : List<number> 
            = lazyIntSeq(0, 3).bind(
                (i0:number) => lazyIntSeq(0, 3).map( 
                    (i1:number) => factory(i0,i1) ) ) ;
        
        
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)(2,0)(2,1)(2,2)", s ) ;
        assert.checkEqual("( 0 1 2 10 11 12 20 21 22 )", listOfNumbers.toString() ) ;
        assert.checkEqual(9 , listOfNumbers.size() ) ;
    } ) ;

    it( "should work with eager map and lazy bind", function() : void {
        let s = "" ;
        function factory( i0 : number, i1 : number ) : number {
            s = s + "(" + i0 + "," + i1 + ")" ; 
            return 10*i0 + i1 ;
        }
        const listOfNumbers : List<number> 
            = lazyIntSeq(0, 3).lazyBind(
                (i0:number) => lazyIntSeq(0, 3).map( 
                    (i1:number) => factory(i0,i1) ) ) ;
        
        
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)(2,0)(2,1)(2,2)", s ) ;
        assert.checkEqual("( 0 1 2 10 11 12 20 21 22 )", listOfNumbers.toString() ) ;
        assert.checkEqual(9 , listOfNumbers.size() ) ;
    } ) ;

    it( "should work with lazy map and eager bind", function() : void {
        let s = "" ;
        function factory( i0 : number, i1 : number ) : number {
            s = s + "(" + i0 + "," + i1 + ")" ; 
            return 10*i0 + i1 ;
        }
        const listOfNumbers : List<number> 
            = lazyIntSeq(0, 3).bind(
                (i0:number) => lazyIntSeq(0, 3).lazyMap( 
                    (i1:number) => factory(i0,i1) ) ) ;
        
        // Note that the function calls are in a strange order.
        
        assert.checkEqual( "(2,0)(2,1)(2,2)(1,0)(1,1)(1,2)(0,0)(0,1)(0,2)", s ) ;
        assert.checkEqual("( 0 1 2 10 11 12 20 21 22 )", listOfNumbers.toString() ) ;
        assert.checkEqual( "(2,0)(2,1)(2,2)(1,0)(1,1)(1,2)(0,0)(0,1)(0,2)", s ) ;
        assert.checkEqual(9 , listOfNumbers.size() ) ;
    } ) ;


    it( "should work with lazy map and bind -- 0", function() : void {
        let s = "" ;
        function factory( i0 : number, i1 : number ) : number {
            s = s + "(" + i0 + "," + i1 + ")" ; 
            return 10*i0 + i1 ;
        }
        const listOfNumbers : List<number> 
            = lazyIntSeq(0, 3).lazyBind(
                (i0:number) => lazyIntSeq(0, 3).lazyMap( 
                    (i1:number) => factory(i0,i1) ) ) ;
        
        assert.checkEqual( "", s ) ;

        assert.checkEqual("( 0 1 2 10 11 12 20 21 22 )", listOfNumbers.toString() ) ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)(2,0)(2,1)(2,2)", s ) ;

        assert.checkEqual(9 , listOfNumbers.size() ) ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)(2,0)(2,1)(2,2)", s ) ;

    } ) ;

    it( "should be lazy with map and bind -- 1", function() : void {
        let s = "" ;
        function factory( i0 : number, i1 : number ) : number {
            s = s + "(" + i0 + "," + i1 + ")" ; 
            return 10*i0 + i1 ;
        }
        const listOfNumbers : List<number> 
            = lazyIntSeq(0, 3).lazyBind(
                (i0:number) => lazyIntSeq(0, 3).lazyMap( 
                    (i1:number) => factory(i0,i1) ) ) ;
        
        assert.checkEqual( "", s ) ;

        let l = listOfNumbers ;
        let a = l.first() ;
        assert.checkEqual( a, 0) ;
        assert.checkEqual( "(0,0)", s ) ;
        l = l.rest() ;
        assert.checkEqual( "(0,0)", s ) ;

        a = l.first() ;
        assert.checkEqual( a, 1) ;
        assert.checkEqual( "(0,0)(0,1)", s ) ;
        l = l.rest() ;
        assert.checkEqual( "(0,0)(0,1)", s ) ;

        a = l.first() ;
        assert.checkEqual( a, 2) ;
        assert.checkEqual( "(0,0)(0,1)(0,2)", s ) ;
        l = l.rest() ;
        assert.checkEqual( "(0,0)(0,1)(0,2)", s ) ;

        a = l.first() ;
        assert.checkEqual( a, 10) ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)", s ) ;
        l = l.rest() ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)", s ) ;

        a = l.first() ;
        assert.checkEqual( a, 11) ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)", s ) ;
        l = l.rest() ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)", s ) ;

        a = l.first() ;
        assert.checkEqual( a, 12) ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)", s ) ;
        l = l.rest() ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)", s ) ;

        a = l.first() ;
        assert.checkEqual( a, 20) ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)(2,0)", s ) ;
        l = l.rest() ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)(2,0)", s ) ;

        a = l.first() ;
        assert.checkEqual( a, 21) ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)(2,0)(2,1)", s ) ;
        l = l.rest() ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)(2,0)(2,1)", s ) ;

        a = l.first() ;
        assert.checkEqual( a, 22) ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)(2,0)(2,1)(2,2)", s ) ;
        l = l.rest() ;
        assert.checkEqual( "(0,0)(0,1)(0,2)(1,0)(1,1)(1,2)(2,0)(2,1)(2,2)", s ) ;

        assert.check( l.isEmpty() ) ;
    } ) ;

} ) ;