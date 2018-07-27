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
        NULL,
        NOTYPE
    }

    export interface Type {

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

        // Review: Do we need this?
        public abstract isValid(children : Array<Type>) : boolean;

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

        public isValid(children : Array<Type>) {
            return children.length === 0;
        }

        private constructor() {
            super();
        }

        public static readonly theBottomType : BottomType = new BottomType();
    }

    export class JoinType extends AbstractType {

        public getKind() : TypeKind {
            return TypeKind.JOIN;
        }

        public isValid(children : Array<Type>) {
            return children.length === 2 ;
        }

        private constructor() {
            super();
        }

        public static readonly theJoinType : JoinType = new JoinType();
    }

    abstract class TypeTerms extends AbstractType {

        constructor() {
            super();
        }

    }

    export class TopType extends TypeTerms {

        public getKind() : TypeKind {
            return TypeKind.TOP;
        }

        public isValid(children : Array<Type>) {
            return children.length === 0;
        }

        private constructor() {
            super();
        }

        public static readonly theTopType : TopType = new TopType();

    }

    export class MeetType extends TypeTerms {

        private readonly typeTerms : Array<TypeTerms>;

        public getKind() : TypeKind {
            return TypeKind.MEET;
        }

        public isValid(children:Array<TypeTerms>) {
            return children.length === 2
        }

        private constructor(children:Array<TypeTerms>)  {
            if(children.length === 2) {
                super();
                this.typeTerms = children.slice();
            }
            else {
                this.typeTerms = [];
                assert.failedPrecondition( "MeetType can accept only two TypeTerms." );
            }
        }

        public static createMeetType(children:Array<TypeTerms>) {
            return new MeetType(children);
        }

    }

    abstract class TypeFactor extends TypeTerms {

        public abstract getLength() : number;

        constructor() {
            super();
        }
    }

    export class PrimitiveType extends TypeFactor {

        private readonly kind : TypeKind ;

        public getKind() : TypeKind {
            return this.kind;
        }

        public getLength() : number {
            return 1;
        }

        public isValid(children:Array<TypeFactor>) : boolean {
            return children.length === 0 && (["BOOL","STRING","NUMBER","INT","NAT","NULL"].indexOf(this.kind.toString()) > -1)
        }

        private constructor(type:TypeKind) {
            super();
            this.kind = type;
        }

        public static CreatePrimitiveType(type:TypeKind) {
            return new PrimitiveType(type);
        } 
    }

    export class TupleType extends TypeFactor {

        private readonly types : Array<Type>;

        public getKind() : TypeKind {
            return TypeKind.TUPLE;
        }

        public getLength() : number {
            return this.types.length
        }

        public isValid() : boolean {
            return this.types.length === 0 || this.types.length > 1;
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

        public isValid(children:Array<Type>) : boolean {
            return children.length === 2;
        }

        private constructor(valueT:Type, returnT:Type) {
            super();
            this.valueType = valueT;
            this.returnType = returnT;
        }

        public static CreateFunctionType(valueT:Type,returnT:Type) {
            return new FunctionType(valueT,returnT);
        }

    }

    export class FieldType extends TypeFactor {

        private readonly type : Type;

        public getKind() : TypeKind {
            return TypeKind.FIELD;
        }

        public getLength() : number {
            return 1;
        }

        public isValid(children : Array<Type>) : boolean {
            return children.length === 1;
        }

        private constructor(type:Type) {
            super();
            this.type = type;
        }

        public static  CreateFieldType(type:Type) {
            return new FieldType(type);
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

        public isValid(children:Array<Type>) : boolean {
            return children.length === 1;
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