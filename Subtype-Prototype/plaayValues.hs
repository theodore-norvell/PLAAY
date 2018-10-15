{-# LANGUAGE FlexibleInstances, MultiParamTypeClasses #-}
{-# LANGUAGE DeriveGeneric #-}
module PlaayTypes where

import Data.List(all)
import Control.Applicative((<|>))
import Test.SmallCheck.Series
import Test.SmallCheck(Testable,Property,smallCheck,forAll,(==>))
import GHC.Generics

import PlaayTypes

data Type = TTop | TBot | TBool | TString | TNumber | TInt | TNat | TNull
          | TTuple0 | TTuple2 Type Type | TArrow Type Type 
          | TField String Type | TLoc Type | TMeet Type Type | TJoin Type Type
          | TId String
          deriving (Eq, Generic,Show)

data Sequent = [Type] :<: [Type]

data Proof = LeafProof( Sequent, String )
           | BranchProof( Sequent, String, [Proof] )

first :  a -> [a -> Maybe b] -> Maybe b
first a fs = foldl (<|>) Nothing (map (\f -> f a) fs)

subtype :: Sequent -> Maybe Proof
subtype (theta :<: delta) =
    first (theta :<: delta) 
        [refl, bottom, top, prim, tuple, func, field,
         location0, location1, meet0, meet1, join0, join1]

-- Reflexivity   t,Theta' <: t:Delta'
refl :: Sequent -> Maybe Proof
refl (theta :<: delta) = 
    if any theta (\ t -> any delta (\ u -> t==u ) )
    then Just( LeafProof( (theta :<: delta), "refl" ) )
    else Nothing

-- Top and Bottom rules
bottomLeft :: Sequent -> Maybe Proof
bottomLeft (theta :<: delta) =
    do  if any theta isBottom
        return LeafProof((theta :<: delta), "bottomLeft" )


bottomRight :: Sequent -> Maybe Proof
bottomRight (theta :<: delta) =
    do if any delta isBottom
       p <- subtype( theta :<: [] )
       return BranchProof( (theta :<: delta), "bottomRight", [p] )

topLeft :: Sequent -> Maybe Proof
topLeft (theta :<: delta) =
        do if any theta isTop
           p <- subtype( [] :<: delta )
           return BranchProof( (theta :<: delta), "topLeft", [p] )

topRight :: Sequent -> Maybe Proof
topRight (theta :<: delta) =
    do if any theta isTop
       return LeafProof((theta :<: delta), "topRight" )

-----------VALUES-------------------

data Value = VError | VTrue | VFalse | VString0 | VString1 | VNat0 | VNat1
           | VInt0 | VInt1 | VNum0 | VNum1 | VNull 
           | VTuple0 | VTuple2 Value Value
           | VArrow [(Value, Value)]
           | VField String Value
           | VLoc Type
           deriving (Eq, Generic,Show)


-- inPrim (together with errorIn) covers cases where the type is TTop, TBot, TBool, .. , TNull
inPrim :: Value -> Type -> Bool
x `inPrim` TTop = True
VTrue `inPrim` TBool = True
VFalse `inPrim` TBool = True
VString0 `inPrim` TString = True
VString1 `inPrim` TString = True
VNat0 `inPrim` TNat = True
VNat1 `inPrim` TNat = True
VNat0 `inPrim` TInt = True
VNat1 `inPrim` TInt = True
VNat0 `inPrim` TNumber = True
VNat1 `inPrim` TNumber = True
VInt0 `inPrim` TInt = True
VInt1 `inPrim` TInt = True
VInt0 `inPrim` TNumber = True
VInt1 `inPrim` TNumber = True
VNum0 `inPrim` TNumber = True
VNum1 `inPrim` TNumber = True
VNull `inPrim` TNull = True
x `inPrim` t = False


-- ErrorIn
VError `errorIn0` t = True
x `errorIn0` t = False

(VLoc TBot) `errorIn` t = True
x `errorIn` t = False

-- Tuples
VTuple0 `tupleIn` TTuple0 = True
(VTuple2 x y) `tupleIn` (TTuple2 t u) = x `isIn` t && y `isIn` u
x `tupleIn` t = False

--TArrow -- Allowing nondeterministic, partial functions
(VArrow graph) `arrowIn` (TArrow t u) = all ok graph
    where ok (x,y) =   not(x `isIn` t) || (y `isIn` u)
x `arrowIn` t = False

-- TField
(VField s x) `fieldIn` (TField s' t) = (s==s') && x `isIn` t
x `fieldIn` t = False

-- Locations (really we need a gamma parameter)
(VLoc t) `locIn` (TLoc u) = equivTypes noGamma t u
x `locIn` t = False

-- Meets
x `meetIn` (TMeet t u) = x `isIn` t && x `isIn` u
x `meetIn` t = False

-- Joins
x `joinIn` (TJoin t u) = x `isIn` t || x `isIn` u
x `joinIn` t = False

--Identifiers (TODO)
x `idIn` (TId s) = False
x `idIn` t = False

-- Locations that hold t are in any supertype of t

(VLoc t) `vLocIn` u = subtype noGamma t u
x `vLocIn` u = False

isIn :: Value -> Type -> Bool
x `isIn` t = any (\rule -> x `rule` t)
                 [inPrim, errorIn, tupleIn, arrowIn, fieldIn, locIn,
                  meetIn, joinIn, idIn, vLocIn]
