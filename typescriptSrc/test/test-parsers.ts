/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../parsers.ts" />

import assert = require( '../assert' ) ;
import collections = require( '../collections' ) ;
import parsers = require( '../parsers' ) ;

import parseString = parsers.parseString ;
import unparseString = parsers.unparseString ;
import stringToNumber = parsers.stringToNumber ;

import none = collections.none ;
import some = collections.some ;

describe( 'parseString', function() : void {
    it('should handle empty strings', function() : void {
        let input = "" ;
        let expected = "" ;
        let output = parseString( input ) ;
        assert.checkEqual( expected, output ) ;
    } );

    it('should handle nonempty strings', function() : void {
        let input = "abc" ;
        let expected = "abc" ;
        let output = parseString( input ) ;
        assert.checkEqual( expected, output ) ;
    } );

    it('should handle escapes strings', function() : void {
        let input = "a\\f\\n\\r\\t\\\\c" ;
        let expected = "a\f\n\r\t\\c" ;
        let output = parseString( input ) ;
        assert.checkEqual( expected, output ) ;
    } );

    it('should handle backslashes at the end', function() : void {
        let input = "\\" ;
        let expected = "\\" ;
        let output = parseString( input ) ;
        assert.checkEqual( expected, output ) ;
    } );

    it('should handle backslashes followed by other characters', function() : void {
        let input = "\\*" ;
        let expected = "*" ;
        let output = parseString( input ) ;
        assert.checkEqual( expected, output ) ;
    } );
} ) ;

describe( 'unparseString', function() : void {
    it('should handle empty strings', function() : void {
        let input = "" ;
        let expected = "" ;
        let output = unparseString( input, false ) ;
        assert.checkEqual( expected, output ) ;
    } );

    it('should handle nonempty strings', function() : void {
        let input = "abc" ;
        let expected = "abc" ;
        let output = unparseString( input, false ) ;
        assert.checkEqual( expected, output ) ;
    } );

    it('should handle newlines etc', function() : void {
        let input = "a\f\n\r\t\\c" ;
        let expected = "a\\f\\n\\r\\t\\\\c" ;
        let output = unparseString( input , false) ;
        assert.checkEqual( expected, output ) ;
    } );

    it('should handle backslashes at the end', function() : void {
        let input = "\\" ;
        let expected = "\\\\" ;
        let output = unparseString( input, false ) ;
        assert.checkEqual( expected, output ) ;
    } );

    it('should not replace space ', function() : void {
        let input = " abc def " ;
        let expected = " abc def " ;
        let output = unparseString( input, false ) ;
        assert.checkEqual( expected, output ) ;
    } );

    it('should replace space ', function() : void {
        let input = " abc def " ;
        let expected = parsers.OPENBOX + "abc" + parsers.OPENBOX +  "def" + parsers.OPENBOX ;
        let output = unparseString( input, true ) ;
        assert.checkEqual( expected, output ) ;
    } );
} ) ;

describe( 'parse number', function() : void {
    it('should fail on empty strings', function() : void {
        let input = "" ;
        let expected = none() ;
        let output = stringToNumber( input ) ;
        assert.check( output.isEmpty() );
    } );
    it('should handle 0', function() : void {
        let input = "0" ;
        let expected = some(0) ;
        let output = stringToNumber( input ) ;
        assert.check( !output.isEmpty() );
        assert.checkEqual( expected.first(), output.first() );
    } );

    it('should handle 123', function() : void {
        let input = "123" ;
        let expected = some(123) ;
        let output = stringToNumber( input ) ;
        assert.check( !output.isEmpty() );
        assert.checkEqual( expected.first(), output.first() );
    } );

    it('should handle " 123 456 "  ', function() : void {
        let input = " 123 456 " ;
        let expected = some(123456) ;
        let output = stringToNumber( input ) ;
        assert.check( !output.isEmpty() );
        assert.checkEqual( expected.first(), output.first() );
    } );

    it('should handle " +123 456 "  ', function() : void {
        let input = " +123 456 " ;
        let expected = some(123456) ;
        let output = stringToNumber( input ) ;
        assert.check( !output.isEmpty() );
        assert.checkEqual( expected.first(), output.first() );
    } );

    it('should handle "- 123,456"  ', function() : void {
        let input = "- 123,456" ;
        let expected = some(-123456) ;
        let output = stringToNumber( input ) ;
        assert.check( !output.isEmpty() );
        assert.checkEqual( expected.first(), output.first() );
    } );

    it('should handle "- 123 456. "  ', function() : void {
        let input = "- 123 456. " ;
        let expected = some(-123456) ;
        let output = stringToNumber( input ) ;
        assert.check( !output.isEmpty() );
        assert.checkEqual( expected.first(), output.first() );
    } );

    it('should handle "-123.987 654,321"  ', function() : void {
        let input = "-123.987 654,321" ;
        let expected = some(-123.987654321) ;
        let output = stringToNumber( input ) ;
        assert.check( !output.isEmpty() );
        assert.checkEqual( expected.first(), output.first() );
    } );

    it('should handle " + .987 654,321"  ', function() : void {
        let input = " + .987 654,321" ;
        let expected = some(0.987654321) ;
        let output = stringToNumber( input ) ;
        assert.check( !output.isEmpty() );
        assert.checkEqual( expected.first(), output.first() );
    } );

    it('should handle ".456 789 123 999 888 7"  ', function() : void {
        // With node on Intel, we can get about 16 digits after the decimal point. 
        let input = " + .456 789 123 999 888 7" ;
        let expected = some(0.4567891239998887) ;
        let output = stringToNumber( input ) ;
        assert.check( !output.isEmpty() );
        assert.checkEqual( expected.first(), output.first() );
    } );

    it('should reject " + . "  ', function() : void {
        let input = " + . " ;
        let output = stringToNumber( input ) ;
        assert.check( output.isEmpty() );
    } );

    it('should reject "."  ', function() : void {
        let input = "." ;
        let output = stringToNumber( input ) ;
        assert.check( output.isEmpty() );
    } );

    it('should reject "123..456"  ', function() : void {
        let input = "123..456" ;
        let output = stringToNumber( input ) ;
        assert.check( output.isEmpty() );
    } );

    it('should reject "123a"  ', function() : void {
        let input = "123a" ;
        let output = stringToNumber( input ) ;
        assert.check( output.isEmpty() );
    } );

    it('should give Infinity for super big numbers', function() : void {
        let input = "1" ;
        for( let i = 0 ; i < 400 ; ++i ) input = input + "0" ;
        let output = stringToNumber( input ) ;
        assert.check( ! output.isEmpty() );
        assert.checkEqual( Infinity, output.first() );
    } );

    it('should give -Infinity for super small numbers', function() : void {
        let input = "-1" ;
        for( let i = 0 ; i < 400 ; ++i ) input = input + "0" ;
        let output = stringToNumber( input ) ;
        assert.check( ! output.isEmpty() );
        assert.checkEqual( -Infinity, output.first() );
    } );

    it('should give Nan for super long fractions', function() : void {
        let input = "0.1" ;
        for( let i = 0 ; i < 400 ; ++i ) input = input + "1" ;
        let output = stringToNumber( input ) ;
        assert.check( ! output.isEmpty() );
        assert.check( isNaN( output.first() ) ) ;
    } );
} ) ;