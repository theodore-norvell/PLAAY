/// <reference path="assert.ts" />


import assert = require( './assert' ) ;
import { PNode, make } from './pnode';
import labels  = require('./labels') ;

module types {

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

    export interface Type {

        getKind : () => TypeKind;

        isBottomT : () => boolean;
        isTopT : () => boolean;
        isMeetT : () => boolean;
        isJoinT : () => boolean;
        isLocationT : () => boolean;
        isFieldT : () => boolean;
        isFunctionT : () => boolean;
        isTupleT : () => boolean;
        isBoolT : () => boolean;
        isStringT : () => boolean;
        isNumberT : () => boolean;
        isIntT : () => boolean;
        isNatT : () => boolean;
        isNullT : () => boolean;
    }

    abstract class AbstractType implements Type {

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

    }   

    export class BottomType extends AbstractType {

        public getKind() : TypeKind {
            return TypeKind.BOTTOM;
        }

        private constructor() {
            super();
        }

        public static readonly theBottomType : BottomType = new BottomType();
    }

    export class JoinType extends AbstractType {

        private readonly children : [Type,Type] ;

        public getKind() : TypeKind {
            return TypeKind.JOIN;
        }

        private constructor(left : Type, right : Type) {
            super();
            this.children = [left,right];
        }

        public static CreateJoinType(left:Type, right:Type) {
            return new JoinType(left,right);
        }

        public getChild(i:number) : Type {
            assert.checkPrecondition(i === 0  || i === 1);
            return this.children[i];
        }
    }

    abstract class TypeTerm extends AbstractType {

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

        public static readonly theTopType : TopType = new TopType();

    }

    export class MeetType extends TypeTerm {

        private readonly children :[TypeTerm,TypeTerm];

        public getKind() : TypeKind {
            return TypeKind.MEET;
        }

        private constructor(left:TypeTerm, right:TypeTerm)  {
            super();
            this.children = [left,right];
        }

        public static createMeetType(left:TypeTerm, right:TypeTerm) {
            return new MeetType(left,right);
        }

        public getChild(i:number) : TypeTerm {
            assert.checkPrecondition(i === 0 || i === 1);
            return this.children[i];
        }

    }

    abstract class TypeFactor extends TypeTerm {

        public abstract getLength() : number;

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

        public getLength() : number {
            return 1;
        }

        public getKind() : TypeKind {
            return this.kind;
        }

        private constructor(type:TypeKind) {
            super();
            this.kind = type;
        }

    }

    export class TupleType extends TypeFactor {

        private readonly types : Array<Type>;

        public getKind() : TypeKind {
            return TypeKind.TUPLE;
        }

        public getLength() : number {
            return this.types.length;
        }

        private constructor(types:Array<Type>) {
            super();
            this.types = types.slice();
        }

        public static readonly theZeroTupleType = new TupleType([]);

        public static CreateTupleType(types:Array<Type>) {
            return new TupleType(types);
        }
    }

    export class FunctionType extends TypeFactor {

        private readonly valueType : Type;
        private readonly returnType : Type;

        public getKind() : TypeKind {
            return TypeKind.FUNCTION;

        }

        public getLength() : number {
            return 1;
        }

        private constructor(valueT:Type, returnT:Type) {
            super();
            this.valueType = valueT;
            this.returnType = returnT;
        }

        public static CreateFunctionType(valueT:Type,returnT:Type) {
            return new FunctionType(valueT,returnT);
        }

        public getSource() : Type {
            return this.valueType;
        }

        public getTarget() : Type {
            return this.returnType;
        }

    }

    export class FieldType extends TypeFactor {

        private readonly type : Type;
        private readonly identifier : string;

        public getKind() : TypeKind {
            return TypeKind.FIELD;
        }

        public getLength() : number {
            return 1;
        }

        private constructor(type:Type, identifier : string) {
            super();
            this.type = type;
            this.identifier = identifier;
        }

        public static  CreateFieldType(type:Type,identifier:string) {
            return new FieldType(type,identifier);
        }

        public getId() : string {
            return this.identifier;
        }

        public getType() : Type {
            return this.type;
        }
    } 
    
    export class LocationType extends TypeFactor {

        private readonly type: Type;

        public getKind() : TypeKind {
            return TypeKind.LOCATION;
        }

        public getLength() : number {
            return 1;
        }

        private constructor(type:Type)  {
            super();
            this.type = type;
        }

        public static CreateLocationType(type:Type) {
            return new LocationType(type);
        }
    }

    export function CreateType(node:PNode) : Type {
        
        const kind : string = node.label().kind();
        switch(kind) {

            //Primitive types
            case labels.PrimitiveTypesLabel.kindConst :
                const primitiveKind : string = (node.label() as labels.PrimitiveTypesLabel).type;
                switch(primitiveKind) {

                    case "stringType" :
                        return PrimitiveType.stringType;
                    case "numberType" :
                        return PrimitiveType.numberType;                        
                    case "booleanType" :
                        return PrimitiveType.boolType;                        
                    case "nullType" :
                        return PrimitiveType.nullType;                        
                    case "integerType" :
                        return PrimitiveType.intType;                        
                    case "natType" :
                        return PrimitiveType.natType;                        
                    case "topType" :
                        return TopType.theTopType;                        
                    case "bottomType" :
                        return BottomType.theBottomType;                        
                    default :
                        assert.failedPrecondition( "Unknown primitive type in CreateType ");
                }

            case labels.LocationTypeLabel.kindConst  : {
                const child = node.child(0);
                const type = CreateType(child);
                return LocationType.CreateLocationType(type);
            }

            case labels.FieldTypeLabel.kindConst : {
                const identifier = node.child(0).label().getVal(); 
                const typeNode = node.child(1);
                const type = CreateType(typeNode);
                return FieldType.CreateFieldType(type,identifier);
            }

            case labels.FunctionTypeLabel.kindConst : {
                const valueType = CreateType(node.child(0));
                const returnType =  CreateType(node.child(1));
                return FunctionType.CreateFunctionType(valueType,returnType);
            }

            case  labels.TupleTypeLabel.kindConst : {
                const children = node.children();
                let types : Type[] = [] ;
                for(let i=0; i<children.length; i++ ) {
                    types.push(CreateType(children[i]));
                }
                return TupleType.CreateTupleType(types);
            }

            case labels.JoinTypeLabel.kindConst : {
                const childTypes = node.children().map(CreateType);
                return childTypes.reduce(JoinType.CreateJoinType);
            }

            case labels.MeetTypeLabel.kindConst : {
                const childTypes = node.children().map(CreateType);
                return childTypes.reduce(makeMeet);
            }

            case labels.NoTypeLabel.kindConst : {
                return TopType.theTopType;
            }

            default :
                assert.failedPrecondition("Unknown type node in CreateType");
        }
        return PrimitiveType.nullType; // Review: Should return something else
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
                return JoinType.CreateJoinType(makeMeet(left,(right as JoinType).getChild(0)), makeMeet(left, (right as JoinType).getChild(1))); 
            }
        }
        else if( left.isBottomT() ) {
            return BottomType.theBottomType;
        }
        else {
            return JoinType.CreateJoinType( makeMeet((left as JoinType).getChild(0),right), makeMeet((left as JoinType).getChild(1),right));
        }
    }

}
export = types;