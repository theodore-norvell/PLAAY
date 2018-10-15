{-# LANGUAGE FlexibleInstances, MultiParamTypeClasses #-}
{-# LANGUAGE DeriveGeneric #-}

-- Smallcheck tests

import Test.SmallCheck.Series
import Test.SmallCheck(Testable,Property,smallCheck,forAll,(==>))
import PlaayTypes

-- Types are Serial
instance Monad m => Serial m Type 

relexiveProp :: Type -> Bool
relexiveProp t = (subtype noGamma t t)

testRefx = smallCheck 3 (forAll $ \t -> relexiveProp t)

transProp :: Monad m => Type -> Type -> Type -> Property m
transProp t u v = subtype noGamma t u && subtype noGamma u v ==> subtype noGamma t v

testTrans = smallCheck 2 (forAll $ \(t,u,v) -> transProp t u v)

-----------

-- Values are Serial
instance Monad m => Serial m Value 

coherenceProp :: Monad m => Type -> Type -> Value -> Property m
coherenceProp t u x = subtype noGamma t u && x `isIn` t ==> x `isIn` u 

testCoherence = smallCheck 3 (forAll $ \(t, u, x) -> coherenceProp t u x)

main :: IO () 

main = do
    testRefx
    testTrans
    testCoherence

