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