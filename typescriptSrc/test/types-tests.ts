/// <reference path="../typings/main/ambient/mocha/index.d.ts" />
/// <reference path="../assert.ts" />
/// <reference path="../collections.ts" />
/// <reference path="../types.ts" />

import assert = require( '../assert' ) ;
import collections = require( '../collections' ) ;
import types = require('../types') ;

import some = collections.some ;
import none = collections.none ;
import match = collections.match ;
import caseAlways = collections.caseAlways ;
import Type = types.Type ;

const bottom = types.BottomType.theBottomType ;
const top = types.TopType.theTopType ;

describe( "Type.equals()", function() : void {
    it( "should be equal for Bottom", function() : void {
        const ty = bottom ;
        const result = ty.equals(ty) ;
        assert.checkEqual( true, result ) ;
    } ) ;

    it( "should be equal for other Function", function() : void {
        const ty = types.FunctionType.createFunctionType(bottom, bottom) ;
        const ty2 = types.FunctionType.createFunctionType(bottom, bottom) ;
        const result = ty.equals(ty2) ;
        assert.checkEqual( true, result ) ;
    } ) ;

    it( "should be equal for same Function", function() : void {
        const ty = types.FunctionType.createFunctionType(bottom, bottom) ;
        const result = ty.equals(ty) ;
        assert.checkEqual( true, result ) ;
    } ) ;

    it( "should not be equal for other Function", function() : void {
        const ty = types.FunctionType.createFunctionType(bottom, top) ;
        const ty2 = types.FunctionType.createFunctionType(top, bottom) ;
        const result = ty.equals(ty2) ;
        assert.checkEqual( false, result ) ;
    } ) ;

    it( "should be equal for Top", function() : void {
        const ty = top ;
        const result = ty.equals(ty) ;
        assert.checkEqual( true, result ) ;
    } ) ;

    it( "should be equal for same Meet", function() : void {
        const ty = types.MeetType.createMeetType(top, bottom) ;
        const result = ty.equals(ty) ;
        assert.checkEqual( true, result ) ;
    } ) ;

    it( "should be equal for other Meet", function() : void {
        const ty = types.MeetType.createMeetType(top, bottom) ;
        const ty2 = types.MeetType.createMeetType(top, bottom) ;
        const result = ty.equals(ty2) ;
        assert.checkEqual( true, result ) ;
    } ) ;

    it( "should not be equal for different Meet", function() : void {
        const ty = types.MeetType.createMeetType(top, bottom) ;
        const ty2 = types.MeetType.createMeetType(bottom, bottom) ;

        const result = ty.equals(ty2) ;
        assert.checkEqual( false, result ) ;
    } ) ;

    it( "should not be equal for not Bottom", function() : void {
        const ty = bottom ;
        const ty2 =  top ;
        const result = ty.equals(ty2) ;
        assert.checkEqual( false, result ) ;
    } ) ;
        
    it("should work for Same join" , function() : void {
        const ty = types.JoinType.createJoinType(top, bottom) ;
        const result = ty.equals(ty) ;
        assert.checkEqual( true, result ) ;
        });
    it( "should be equal for other Join", function() : void {
            const ty = types.JoinType.createJoinType(top, bottom) ;
            const ty2 = types.JoinType.createJoinType(top, bottom) ;
            const result = ty.equals(ty2) ;
            assert.checkEqual( true, result ) ;
        } ) ;    

    it( "should not be equal for different Join", function() : void {
            const ty = types.JoinType.createJoinType(top, bottom) ;
            const ty2 = types.JoinType.createJoinType(bottom, bottom) ;
            const result = ty.equals(ty2) ;
            assert.checkEqual( false, result ) ;  
        } );      
    
    // it("should work for primitive" , function() : void {
            
    //         assert.checkEqual("Function", result ) ;
    //     });
    
    it("should work for Tuple" , function() : void {
        const ty = types.TupleType.createTupleType([top , bottom]);  
        const result = ty.equals(top);  
        assert.checkEqual(false, result ) ;
        });
    
    // it("should work for Field" , function() : void {
    //     const ty = types.FieldType.createFieldType(bottom , "top");
    //     const result = ty.equals(top);    
    //     assert.checkEqual(false, result ) ;
    //     });
        
    it("should work for Location" , function() : void {
        const ty = types.LocationType.createLocationType(top);
        const result = ty.equals(top);  
        assert.checkEqual(false, result ) ;
        });
    } ) ;


describe( "Type.exBottom", function() : void {
        it( "should be equal for Bottom", function() : void {
        const ty = bottom ;
        const message = "The test has passed!";
        const testFunctor = function() : collections.Option<String>{
            return some(message);
        }
        const result = ty.exBottom<String>( testFunctor ) ;
        assert.checkEqual( message , result.first() ) ;
    } ) ;
} ) ;

describe( "Type.toString()", function() : void {
    it( "should work for Bottom", function() : void {
        const ty = bottom ;
        const result = ty.toString() ;
        assert.checkEqual( "Bottom", result ) ;
    } ) ;

    it( "should work for Top", function() : void {
        const ty = top ;
        const result = ty.toString() ;
        assert.checkEqual( "Top", result ) ;
    } ) ;

    it ("should work for same Meet", function() : void{
        const ty = types.MeetType.createMeetType(top, bottom) ;
        const result = ty.toString()
        assert.checkEqual( "Meet(Top, Bottom)", result ) ;
    })

    
    it ("should work for same Tuple", function() : void{
        const ty = types.TupleType.createTupleType([bottom, top]) ;
        const result = ty.toString() ;
        assert.checkEqual( "TupleType(Bottom,Top)", result ) ;
    })

    
    it ("should work for bool Primative", function() : void{
        const ty = types.PrimitiveType.boolType ;
        const result = ty.toString() ; 
        assert.checkEqual("Bool", result);
    })


    it( "should work for Join", function() : void {
        const ty0 = types.JoinType.createJoinType( top, bottom ) ;
        const ty1 = types.JoinType.createJoinType( bottom, top ) ;
        const ty = types.JoinType.createJoinType( ty0, ty1) ;
        const result = ty.toString() ;
        assert.checkEqual( "Join(Join(Top, Bottom), Join(Bottom, Top))", result ) ;
    } ) ;

    
    it("should work for Function" , function() : void {
        const ty0 = types.FunctionType.createFunctionType(top , bottom);
        const ty1 = types.FunctionType.createFunctionType(top , bottom); 
        const ty = types.FunctionType.createFunctionType(ty0 , ty1 );
        const result = ty.toString();
        assert.checkEqual("Function(Function(Top, Bottom), Function(Top, Bottom))", result);
     });
    it("should work for Field" , function() : void {
        const ty =types.FieldType.createFieldType(bottom , "bottom");
        const result = ty.toString();
        assert.checkEqual("FieldType[bottom](Bottom)", result ) ;
         });

    it("should work for Location" , function() : void {
        const ty = types.LocationType.createLocationType(top);
        const result = ty.toString(); 
        assert.checkEqual("LocationType(Top)",result)
        
    });




    describe( "Type.exBottom() and types.caseBottom", function() : void {
    function f() { return some( 4 ) ; }

    it( "deconstructor should return none if sent to the wrong type", function() : void {
        const ty = types.TopType.theTopType  ;
        const result = ty.exBottom( f ) ;
        assert.check(  result.isEmpty() ) ;
    } ) ;


    it( "deconstructor should return some for the right type", function() : void {
        const ty = bottom  ;
        const result = ty.exBottom( f ) ;
        assert.checkEqual( 4, result.first() ) ;
    } ) ;

    it( "case function should return none if sent to the wrong type", function() : void {
        const ty = top  ;
        const result = types.caseBottom( f )( ty )  ;
        assert.check(  result.isEmpty() ) ;
    } ) ;


    it( "case function should return some for the right type", function() : void {
        const ty = bottom  ;
        const result = types.caseBottom( f )( ty ) ;
        assert.checkEqual( 4, result.first() ) ;
    } ) ;

} ) ;

    describe( "match on types", function() : void {

    function testFunc( ty : Type ) : string 
    {
        return  match( ty, 
                       types.caseBottom( () => some( "Bottom")  ),
                       types.caseJoin( ( l, r) => some(  "Join" ) ),
                       caseAlways( () => some( "other") )
            ) ;
    }

    it( "match bottom", function() : void {
        const ty = types.BottomType.theBottomType  ;
        const result = testFunc( ty ) ;
        assert.checkEqual( "Bottom", result ) ;
    } ) ;

    it( "match join", function() : void {
        const ty = types.JoinType.createJoinType( bottom, top ) ;  ;
        const result = testFunc( ty ) ;
        assert.checkEqual( "Join", result ) ;
    } ) ;

    it( "match top", function() : void {
        const ty = top   ;
        const result = testFunc( ty ) ;
        assert.checkEqual( "other", result ) ;
    } ) ;
    } ) ;
});