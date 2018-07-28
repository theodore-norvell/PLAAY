/// <reference path="assert.ts" />


import assert = require( './assert' ) ;

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

    abstract class PrimitiveType extends TypeFactor {

        public static readonly boolType : TypeKind = TypeKind.BOOL;
        public static readonly stringType : TypeKind = TypeKind.STRING;
        public static readonly numberType : TypeKind = TypeKind.NUMBER;
        public static readonly intType : TypeKind = TypeKind.INT;
        public static readonly natType : TypeKind = TypeKind.NAT;
        public static readonly nullType : TypeKind = TypeKind.NAT;

        public getLength() : number {
            return 1;
        }

        public abstract  getKind() : TypeKind

        private constructor(type:TypeKind) {
            super();
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
}
export = types;