/// <reference path="assert.ts" />
/// <reference path="collections.ts" />

import assert = require( './assert' ) ;
import collections = require( './collections' ) ;

/** Parsing and unparsing utilities.
 * Also parsers and unparsers for common formats.
 */
module parsers {

    import Option = collections.Option ;
    import none = collections.none ;
    import some = collections.some ;
    import List = collections.List ;
    import nil = collections.nil ;
    import cons = collections.cons ;


    export interface Parser<A> {
        parse : (s:string, i:number) => Option<[string,number,A]> ;
        bind : <B>( f : (a:A) => Parser<B> ) => Parser<B> ;
        map : <B>( f : (a:A)=>B ) => Parser<B> ;
    }

    export abstract class AbstractParser<A> {
        public abstract parse(s:string, i:number) :  Option<[string,number,A]> ;

        public bind<B>( f : (a:A) => Parser<B> ) : Parser<B> {
            return new SeqParser( this, f ) ;
        }

        public map<B>( f : (a:A)=>B ) : Parser<B> {
            return new MapParser( this, f) ;
        }
    }

    export class SeqParser<A,B> extends AbstractParser<B> {
        private p : Parser<A> ;
        private f : (a:A) => Parser<B> ;
        public constructor( p : Parser<A>, f : (a:A) => Parser<B> ) {
            super() ; this.p = p ; this.f = f ; }

        public parse(s:string, i:number) : Option<[string,number,B]> {
            return this.p.parse(s,i).bind(
                (a : [string, number, A]) => {
                    const q = this.f(a[2]) ;
                    return q.parse(a[0], a[1] ) ; }
            ) ;
        }
    }

    export class MapParser<A,B> extends AbstractParser<B> {
        private p : Parser<A> ;
        private f : (a:A) => B ;
        public constructor( p : Parser<A>, f : (a:A) => B ) {
            super() ; this.p = p ; this.f = f ; }

        public parse(s:string, i:number) : Option<[string,number,B]> {
            return this.p.parse(s,i).map( 
                (a : [string, number, A]) =>
                    [a[0], a[1], this.f(a[2])] as [string,number,B]
            ) ;
        }
    }

    export class AltParser<A> extends AbstractParser< A > {
        private  ps : Array< Parser<A> > ;

        public constructor( ps : Array< Parser<A> > ) {
            super() ; this.ps = ps ; }

        public parse(s:string, i:number) : Option<[string,number,A]> {
            let result = none<[string,number,A]>() ;
            for( let k = 0 ; k < this.ps.length && result.isEmpty() ; ++k ) {
                this.ps[k].parse(s, i).map( (a:[string, number, A]) => result = some(a) ) ;
            }
            return result ;
        }
    }

    export class StringParser extends AbstractParser< string > {
        private  str : string ;

        public constructor( str : string ) {
            super() ; this.str = str ; }

        public parse(s:string, i:number) : Option<[string,number,string]> {
            if( s.substr(i, this.str.length ) === this.str ) {
                return some( [s, i+this.str.length, this.str] as [string,number,string] ) ; 
            } else {
                return none() ; }
        }
    }

    export class TestParser extends AbstractParser< null > {
        private  pred : (s:string, i:number) => boolean ;

        public constructor( pred : (s:string, i:number) => boolean ) {
            super() ; this.pred = pred ; }

        public parse(s:string, i:number) : Option<[string,number,null]> {
            if( this.pred(s, i) ) return some([s,i,null] as [string, number, null]) ;
            else return none() ;
        }
    }

    export function string( s:string) : Parser<string> {
        return new StringParser( s ) ;
    }

    export function seq2<A,B>( p : Parser<A>, q : Parser<B>) : Parser<B> {
        return p.bind( (a:A) => q ) ;
    }

    export function pair<A,B>( p : Parser<A>, q : Parser<B>) : Parser<[A,B]> {
        return p.bind( (a:A) => q.map( (b:B) => [a,b] as [A,B] ) ) ;
    }

    export function alt<A>( ...ps : Array< Parser<A> > ) : Parser<A>{
        return new AltParser( ps ) ;
    }

    export function test( pred : (s:string, i:number) => boolean ) : Parser<null> {
        return new TestParser( pred ) ;
    }

    export function end() : Parser<null> {
        return test((s:string, i:number) => (i===s.length) ) ;
    }

    export const nothing : Parser<null> = test( (s:string, i:number) => true ) ;

    export function unit<A>( a : A) : Parser<A> {
        return nothing.map( (n:null) => a ) ;
    }

    export function zeroOrMore<A>( p : Parser<A> ) : Parser< List<A> > {
        const u : Parser<List<A>> = unit( nil() ) ;
        const q : Parser<List<A>> = oneOrMore(p) ;
        return alt( u, q ) ;
    }


    export function oneOrMore<A>( p : Parser<A> ) : Parser< List<A> > {
        const q : Parser<List<A>> = p.bind( (a) =>
                                            zeroOrMore(p).map( (as:List<A>) =>
                                                               cons(a,as))) ;
        return q ;
    }

    const space = string( " " ) ;
    const spaces = zeroOrMore( space ) ;
    const digit = alt( seq2( string("0"), unit(0) ),
                       seq2( string("1"), unit(1) ),
                       seq2( string("2"), unit(2) ),
                       seq2( string("3"), unit(3) ),
                       seq2( string("4"), unit(4) ),
                       seq2( string("5"), unit(5) ),
                       seq2( string("6"), unit(6) ),
                       seq2( string("7"), unit(7) ),
                       seq2( string("8"), unit(8) ),
                       seq2( string("9"), unit(0) ) ) ;

    const digits = oneOrMore( digit ) ;

    const stringToNumberParser = 

    export function stringToNumber( str : string ) : Option<number> {
        stringToNumberParser.parse( str, 0).map( (a:[string, number, number]) => a[2] ) ;
    }
}
