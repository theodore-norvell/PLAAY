/// <reference path="assert.ts" />
/// <reference path="collections.ts" />
/// <reference path="labels.ts" />
/// <reference path="pnode.ts" />



import assert = require( './assert' ) ;
import collections = require('./collections') ;
import labels  = require('./labels') ;
import pnode = require( './pnode' ) ;

module types {

    import PNode = pnode.PNode ;
    import Option = collections.Option ;
    import some = collections.some ;
    import none = collections.none ;
    import collapseArray = collections.collapseArray ;

    export enum TypeKind {
        BOTTOM,
        TOP,
        MEET,
        JOIN,
        LOCATION,
        FIELD,
        FUNCTION,
        TUPLE,
        BOOL,
        STRING,
        NUMBER,
        INT,
        NAT,
        NULL
    }

    export abstract class Type {

        public abstract getKind() : TypeKind;

        constructor() {}

        public isBottomT() : boolean {
            return this.getKind() === TypeKind.BOTTOM;
        }

        public isTopT() : boolean {
            return this.getKind() === TypeKind.TOP;
        }

        public isMeetT() : boolean {
            return this.getKind() === TypeKind.MEET;
        }

        public isJoinT() : boolean {
            return this.getKind() === TypeKind.JOIN;
        }

        public isLocationT() : boolean {
            return this.getKind() === TypeKind.LOCATION;
        }

        public isFieldT() : boolean {
            return this.getKind() === TypeKind.FIELD;
        }

        public isFunctionT() : boolean {
            return this.getKind() === TypeKind.FUNCTION;
        }

        public isTupleT() : boolean {
            return this.getKind() === TypeKind.TUPLE;
        }

        public isBoolT() : boolean {
            return this.getKind() === TypeKind.BOOL;
        }

        public isStringT() : boolean {
            return this.getKind() === TypeKind.STRING;
        }

        public isNumberT() : boolean {
            return this.getKind() === TypeKind.NUMBER;
        }

        public isIntT() : boolean {
            return this.getKind() === TypeKind.INT;
        }

        public isNatT() : boolean {
            return this.getKind() === TypeKind.NAT;
        }

        public isNullT() : boolean {
            return this.getKind() === TypeKind.NULL;
        }

        public abstract equals( ty : Type ) : boolean ;

        public abstract toString() : string ;

        public length() : Option<number> {
            // Default implementation.
            return none() ; }
        
        public exBottom <A> ( f : () => Option<A> ) : Option<A> {
            return none() ;
        }

        public exJoin <A> ( f : (left:Type, right:Type) => Option<A> ) : Option<A> {
            return none() ;
        }
        
        public exTop <A> ( f : () => Option<A> ) : Option<A> {
            return none() ;
        }

        public exMeet <A> ( f : (left:Type, right:Type) => Option<A> ) : Option<A> {
            return none() ;
        }

        public exPrimitive <A> ( f : (kind:TypeKind) => Option<A> ) : Option<A> {
            return none() ;
        }

        public exTuple <A> ( f : (children:Array<Type>) => Option<A> ) : Option<A> {
            return none() ;
        }

        public exFunction <A> ( f : (source:Type, target:Type) => Option<A> ) : Option<A> {
            return none() ;
        }

        public exField <A> ( f : (id:String, childType:Type) => Option<A> ) : Option<A> {
            return none() ;
        }

        public exLocation <A> ( f : (contentsType:Type) => Option<A> ) : Option<A> {
            return none() ;
        }
    }   

    export class BottomType extends Type {

        public getKind() : TypeKind {
            return TypeKind.BOTTOM;
        }

        private constructor() {
            super();
        }

        public static readonly theBottomType = new BottomType() ;

        public toString() : string {
            return "Bottom" ;
        }

        public equals(ty: Type) : boolean {
            return ty.isBottomT() ;
        }

        public exBottom <A> ( f : () => Option<A> ) : Option<A> {
            return f() ;

        }
    }

    export class JoinType extends Type {

        private readonly children : [Type,Type] ;

        public getKind() : TypeKind {
            return TypeKind.JOIN;
        }

        public toString() : string {
            return "Join(" + this.children[0].toString() + ", " 
                           + this.children[1].toString() + ")" ;
        }

        public equals(ty: Type) : boolean {
            if( ty.isJoinT() ) {
                const ty1 = ty as JoinType ;
                return this.children[0].equals( ty1.children[0] )
                &&  this.children[1].equals( ty1.children[1] ) ;
            }
            else return false  ;
        }

        private constructor(left : Type, right : Type) {
            super();
            this.children = [left,right];
        }

        public static createJoinType(left:Type, right:Type) : JoinType {
            return new JoinType(left,right);
        }

        public getChild(i:number) : Type {
            assert.checkPrecondition(i === 0  || i === 1);
            return this.children[i];
        }

        //Override
        public exJoin <A> ( f : (left:Type, right:Type) => Option<A> ) : Option<A> {
            return f( this.children[0], this.children[1] ) ;
        }
    }

    abstract class TypeTerm extends Type {

        constructor() {
            super();
        }

    }

    export class TopType extends TypeTerm {

        public getKind() : TypeKind {
            return TypeKind.TOP;
        }

        private constructor() {
            super();
        }

        public toString() : string {
            return "Top" ;
        }

        public equals( ty : Type ) : boolean {
            return ty.isTopT() ;
        }
        
        // Override
        public exTop <A> ( f : () => Option<A> ) : Option<A> {
            return f() ;
        }

        public static readonly theTopType : TopType = new TopType();

    }

    export class MeetType extends TypeTerm {

        private readonly children :[TypeTerm,TypeTerm];

        public getKind() : TypeKind {
            return TypeKind.MEET;
        }

        public toString() : string {
            return "Meet(" + this.children[0].toString() + ", " 
                           + this.children[1].toString() + ")" ;
        }

        public equals(ty: Type) : boolean {
            if( ty.isMeetT() ) {
                const ty1 = ty as MeetType ;
                return this.children[0].equals( ty1.children[0] )
                &&  this.children[1].equals( ty1.children[1] ) ;
            }
            else return false  ;
        }

        private constructor(left:TypeTerm, right:TypeTerm)  {
            super();
            this.children = [left,right];
        }

        public static createMeetType(left:TypeTerm, right:TypeTerm) : MeetType {
            return new MeetType(left,right);
        }

        public getChild(i:number) : TypeTerm {
            assert.checkPrecondition(i === 0 || i === 1);
            return this.children[i];
        }

        //Override
        public exMeet <A> ( f : (left:Type, right:Type) => Option<A> ) : Option<A> {
            return f( this.children[0], this.children[1] ) ;
        }
    }

    abstract class TypeFactor extends TypeTerm {

        constructor() {
            super();
        }
    
    }

    export class PrimitiveType extends TypeFactor {

        public static readonly boolType : PrimitiveType = new PrimitiveType(TypeKind.BOOL);
        public static readonly stringType : PrimitiveType = new PrimitiveType(TypeKind.STRING);
        public static readonly numberType : PrimitiveType = new PrimitiveType(TypeKind.NUMBER);
        public static readonly intType : PrimitiveType = new PrimitiveType(TypeKind.INT);
        public static readonly natType : PrimitiveType = new PrimitiveType(TypeKind.NAT);
        public static readonly nullType : PrimitiveType = new PrimitiveType(TypeKind.NULL);

        public readonly kind : TypeKind;

        public length() : Option<number> {
            return some(1) ; }

        public getKind() : TypeKind {
            return this.kind;
        }

        private constructor(type:TypeKind) {
            super();
            this.kind = type;
        }

        public toString() : string {
            let ret : string = TypeKind[this.kind].toString();
            ret = ret.charAt(0).toUpperCase() + ret.slice(1).toLowerCase();
            return ret;
        }

        public equals(ty: Type) : boolean {
            return ty.getKind() === this.getKind();
        }

        //Override
        public exPrimitive <A> ( f : (kind:TypeKind) => Option<A> ) : Option<A> {
            return f( this.kind ) ;
        }

    }

    export class TupleType extends TypeFactor {

        private readonly childTypes : Array<Type>;

        public getKind() : TypeKind {
            return TypeKind.TUPLE;
        }

        public length() : Option<number> {
            return some( this.childTypes.length ) ; }

        public getTypeByIndex( index : number ) : Type {
            assert.checkPrecondition( 0 <= index && index < this.childTypes.length ) ;
            return this.childTypes[index] ;
        }

        private constructor(tys:Array<Type>) {
            super();
            this.childTypes = tys.slice();
        }

        public toString() : string {
            return "TupleType(" + this.childTypes.toString() + ")" ;
        }

        public equals(ty: Type) : boolean {
            if(ty.getKind() !== TypeKind.TUPLE ) {
                return false ;
            } else {
                const other : TupleType = ty as TupleType ;
                if( other.length().first() !== this.childTypes.length ) {
                    return false ;
                } else {
                    function isTheSameType( t : Type, i : number ) : boolean {
                        return t.equals( other.childTypes[i] ) ;
                    }
                    return this.childTypes.every( isTheSameType ) ; }  }
        }
        
        //Override
        public exTuple <A> ( f : (children:Array<Type>) => Option<A> ) : Option<A> {
            return f( this.childTypes.slice() ) ;
        }

        public static readonly theZeroTupleType = new TupleType([]);

        public static createTupleType(tys:Array<Type>) : Type {
            if( tys.length === 0 ) return this.theZeroTupleType ;
            if( tys.length === 1 ) return tys[0] ;
            return new TupleType(tys); }
    }

    export class FunctionType extends TypeFactor {

        private readonly parameterType : Type;
        private readonly returnType : Type;

        public getKind() : TypeKind {
            return TypeKind.FUNCTION;

        }

        public length() : Option<number> {
            return some(1) ; }

        private constructor(prameterType:Type, returnType:Type) {
            super();
            this.parameterType = prameterType;
            this.returnType = returnType;
        }

        public toString() : string {
            return "Function(" + this.parameterType.toString() + ", " 
                           + this.returnType.toString() + ")" ;
        }

        public equals(ty: Type) : boolean {
            if( ty.isFunctionT() ) {
                const ty1 = ty as FunctionType ;
                return this.parameterType.equals( ty1.parameterType )
                &&  this.returnType.equals( ty1.returnType ) ;
            }
            else return false  ;
        }

        public getSource() : Type {
            return this.parameterType;
        }

        public getTarget() : Type {
            return this.returnType;
        }

        // Override
        public exFunction <A> ( f : (source:Type, target:Type) => Option<A> ) : Option<A> {
            return f( this.parameterType, this.returnType ) ;
        }

        public static createFunctionType(valueT:Type,returnT:Type) : FunctionType {
            return new FunctionType(valueT,returnT);
        }
    }

    export class FieldType extends TypeFactor {

        private readonly childType : Type;
        private readonly identifier : string;

        public getKind() : TypeKind {
            return TypeKind.FIELD;
        }

        public length() : Option<number> {
            return some(1) ; }

        private constructor(childType:Type, identifier : string) {
            super();
            this.childType = childType;
            this.identifier = identifier;
        }

        public toString() : string {
            return "FieldType[" + this.identifier + "](" + this.childType.toString() + ")" ;
        }

        public equals(ty: Type) : boolean {
            if(ty.getKind() === TypeKind.FIELD ) {
                const other = ty as FieldType ;
                return this.identifier === other.identifier
                    && this.childType.equals( other.childType ) ;
            } else {
                return false;
            }
        }

        public static  createFieldType(identifier:string, type:Type) : FieldType {
            return new FieldType(type,identifier);
        }

        public getId() : string {
            return this.identifier;
        }

        public getType() : Type {
            return this.childType;
        }

        public exField <A> ( f : (id:String, childType:Type) => Option<A> ) : Option<A> {
            return f( this.identifier, this.childType ) ;
        }
    } 
    
    export class LocationType extends TypeFactor {

        private readonly childType: Type;

        public getKind() : TypeKind {
            return TypeKind.LOCATION;
        }

        public length() : Option<number> {
            return some(1) ; }

        private constructor(type:Type)  {
            super();
            this.childType = type;
        }

        public toString() : string {
            return "LocationType(" + this.childType.toString() + ")" ;
        }

        public equals(ty: Type) : boolean {
            if(ty.getKind() === TypeKind.LOCATION ) {
                const other = ty as LocationType ;
                return this.childType.equals( other.childType );
            } else {
                return false;
            }
        }

        public static createLocationType(type:Type) : LocationType {
            return new LocationType(type);
        }

        public exLocation <A> ( f : (contentsType:Type) => Option<A> ) : Option<A> {
            return f( this.childType ) ;
        }
    }

    export function createType(node:PNode) : Option<Type> {
        const label = node.label() ;
        const kind : string = label.kind();
        switch(kind) {
            // Place Holder
            case labels.TypePHLabel.kindConst :
                return none() ; // REVIEW: Should this give a message.
            //Primitive types
            case labels.PrimitiveTypesLabel.kindConst :
                const primitiveKind : string = (label as labels.PrimitiveTypesLabel).type;
                switch(primitiveKind) {
                    case "stringType" :
                        return some(PrimitiveType.stringType);
                    case "numberType" :
                        return some(PrimitiveType.numberType);                        
                    case "booleanType" :
                        return some(PrimitiveType.boolType);                        
                    case "nullType" :
                        return some(PrimitiveType.nullType) ;                        
                    case "integerType" :
                        return some(PrimitiveType.intType) ;                        
                    case "natType" :
                        return some(PrimitiveType.natType) ;                        
                    case "topType" :
                        return some(TopType.theTopType) ;                        
                    case "bottomType" :
                        return some(BottomType.theBottomType) ;                        
                    default :
                        return assert.failedPrecondition( "Unknown primitive type in createType ");
                }
            case labels.LocationTypeLabel.kindConst  : {
                const child = node.child(0);
                return createType(child).map( 
                          chTy => LocationType.createLocationType(chTy));
            }

            case labels.FieldTypeLabel.kindConst : {
                const identifier = node.child(0).label().getString(); 
                const typeNode = node.child(1);
                return createType(typeNode).map(
                        chTy => FieldType.createFieldType(identifier, chTy) ) ;
            }

            case labels.FunctionTypeLabel.kindConst : {
                return createType(node.child(0)).bind(
                    valueType => createType(node.child(1)).map( 
                        returnType => FunctionType.createFunctionType(valueType,returnType) ) ) ;
            }

            case  labels.TupleTypeLabel.kindConst : {
                const children = node.children();
                const tysOpts : Array<Option<Type>> = children.map(
                    child => createType(child) ) ;
                const optTys : Option<Array<Type>> = collapseArray( tysOpts ) ;
                return optTys.map( tys => TupleType.createTupleType(tys) );
            }

            case labels.JoinTypeLabel.kindConst : {
                const tysOpts = node.children().map(createType);
                const optTys : Option<Array<Type>> = collapseArray( tysOpts ) ;
                return optTys.map( (childTypes:Array<Type>) =>
                                   childTypes.reduce(JoinType.createJoinType) );
            }

            case labels.MeetTypeLabel.kindConst : {
                const tysOpts = node.children().map(createType);
                const optTys : Option<Array<Type>> = collapseArray( tysOpts ) ;
                return optTys.map( (childTypes:Array<Type>) =>
                                   childTypes.reduce(makeMeet) );
            }

            case labels.NoTypeLabel.kindConst : {
                return some( TopType.theTopType );
            }

            default :
                return assert.failedPrecondition("Unknown type node in createType");
        }
    }

    function makeMeet(left:Type, right:Type) : Type {
        if( left instanceof TypeTerm) {
            if( right instanceof TypeTerm) {
                return MeetType.createMeetType(left,right);
            }
            else if( right.isBottomT() ) {
                return BottomType.theBottomType;
            }
            else {
                return JoinType.createJoinType(makeMeet(left,(right as JoinType).getChild(0)), makeMeet(left, (right as JoinType).getChild(1))); 
            }
        }
        else if( left.isBottomT() ) {
            return BottomType.theBottomType;
        }
        else {
            return JoinType.createJoinType( makeMeet((left as JoinType).getChild(0),right), makeMeet((left as JoinType).getChild(1),right));
        }
    }

    

    export function caseBottom<B>( f : ( ) => Option<B> ) : (t:Type) => Option<B> {
        return ( t : Type ) => t.exBottom( f ) ;
    }

    export function caseJoin<B>( f : ( left : Type, right : Type ) => Option<B> ) : (t:Type) => Option<B> {
        return ( t : Type ) => t.exJoin( f ) ;
    }

    export function caseTop<B>( f : () => Option<B> ) : (t:Type) => Option<B> {
        return (t : Type ) => t.exTop( f ) ;
    }

    export function caseMeet<B>( f : ( left : Type, right : Type ) => Option<B> ) : (t:Type) => Option<B> {
        return ( t : Type ) => t.exMeet( f ) ;
    }

    export function casePrimitive<B>( f : (kind:TypeKind) => Option<B> ) : (t:Type) => Option<B> {
        return ( t : Type ) => t.exPrimitive( f ) ;
    }

    export function caseTuple<B>( f : (children:Array<Type>) => Option<B> ) : (t:Type) => Option<B> {
        return ( t : Type ) => t.exTuple( f ) ;
    }

    export function caseFunction<B>( f : (source:Type, target:Type) => Option<B> ) : (t:Type) => Option<B> {
        return ( t : Type ) => t.exFunction( f ) ;
    }

    export function caseField<B>( f : (id:String, childType:Type) => Option<B> ) : (t:Type) => Option<B> {
        return ( t : Type ) => t.exField( f ) ;
    }

    export function caseLocation<B>( f : (contentsType:Type) => Option<B> ) : (t:Type) => Option<B> {
        return ( t : Type ) => t.exLocation( f ) ;
    }

}
export = types;
