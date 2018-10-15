import PlaayTypes
import Test.QuickCheck
import Test.QuickCheck.Property
import System.Random(mkStdGen)
import Control.Monad(liftM, liftM2, replicateM_)

instance Arbitrary Type where
    arbitrary =
        sized (\ n ->
            if n==0
            then 
                oneof [
                    return TTop,
                    return TBot,
                    return TBool,
                    return TString,
                    return TNumber,
                    return TInt,
                    return TNat,
                    return TNull,
                    return TTuple0]
            else 
                resize (n-1) $
                    oneof [
                        return TTop,
                        return TBot,
                        return TBool,
                        return TString,
                        return TNumber,
                        return TInt,
                        return TNat,
                        return TNull,
                        return TTuple0,
                        liftM2 TTuple2 arbitrary arbitrary,
                        liftM2 TArrow arbitrary arbitrary,
                        liftM (TField "a") arbitrary,
                        liftM (TField "b") arbitrary,
                        liftM TLoc arbitrary,
                        liftM2 TMeet arbitrary arbitrary,
                        liftM2 TJoin arbitrary arbitrary
                        -- TODO identifiers
                        ] )

instance Arbitrary Value where
    arbitrary =
        sized (\ n ->
            if n==0
            then 
                oneof [
                    return VError,
                    return VTrue,
                    return VFalse,
                    return VString0,
                    return VString1,
                    return VNat0,
                    return VNat1,
                    return VInt0,
                    return VInt1,
                    return VNum0,
                    return VNum1]
            else
                resize (n-1) $
                       oneof [
                           return VError,
                           return VTrue,
                           return VFalse,
                           return VString0,
                           return VString1,
                           return VNat0,
                           return VNat1,
                           return VInt0,
                           return VInt1,
                           return VNum0,
                           return VNum1,
                           return VNull,
                           return VTuple0,
                           liftM2 VTuple2 arbitrary arbitrary,
                           liftM VArrow arbitrary,
                           liftM (VField "a") arbitrary,
                           liftM (VField "b") arbitrary,
                           liftM VLoc arbitrary ] )

valDepth x = case x of 
               VError -> 0
               VTrue -> 0
               VFalse -> 0
               VString0 -> 0
               VString1  -> 0
               VNat0 -> 0
               VNat1 -> 0
               VInt0 -> 0
               VInt1 -> 0
               VNum0 -> 0
               VNum1 -> 0
               VNull  -> 0
               VTuple0 -> 0
               VTuple2 x y -> 1 + max (valDepth x) (valDepth y)
               VArrow graph -> 1 + maximum (0 : map (\(x,y) -> (valDepth x) `max` (valDepth y)) graph)
               VField s x -> 1 + valDepth x
               VLoc t -> 1 + typeDepth t 

typeDepth t = case t of 
                TTop -> 0
                TBot -> 0
                TBool -> 0
                TString -> 0
                TNumber -> 0
                TInt -> 0
                TNat -> 0
                TNull -> 0
                TTuple0 -> 0
                TTuple2 t u -> 1 + max (typeDepth t) (typeDepth u)
                TArrow t u -> 1 + max (typeDepth t) (typeDepth u)
                TField s t -> 1 + typeDepth t
                TLoc t -> 1 + typeDepth t
                TMeet t u -> 1 + max (typeDepth t) (typeDepth u)
                TJoin t u -> 1 + max (typeDepth t) (typeDepth u)
                TId s -> 0

reflexiveProp :: Type -> Bool
reflexiveProp t = (subtype noGamma t t)

transitiveProp :: Type -> Type -> Type -> Property
transitiveProp t u v = (subtype noGamma t u) && (subtype noGamma u v) ==>
                       counterexample "Transitivity" (subtype noGamma t v)

coherenceProp :: Type -> Type -> Value -> Property
coherenceProp t u x = (subtype noGamma t u) && x `isIn` t ==>
                      counterexample "Coherence " (x `isIn` u)

locEquivProp0 :: Type -> Type -> Property
locEquivProp0 t u = (equivTypes noGamma t u) ==> (equivTypes noGamma (TLoc t) (TLoc u))

locEquivProp1 :: Type -> Type -> Property
--Need to add a condition that (TLoc t) is not equivalent to TBot
locEquivProp1 t u = (subtype noGamma (TLoc t) (TLoc u)) ==> (equivTypes noGamma t u)

main = do
    --replicateM_ 100 $ quickCheck (withMaxSuccess 1000 transitiveProp)
    replicateM_ 100 $ quickCheck (withMaxSuccess 1000 coherenceProp)
    --replicateM_ 100 $ quickCheck (withMaxSuccess 1000 locEquivProp0)
    --replicateM_ 100 $ quickCheck (withMaxSuccess 1000 locEquivProp1)
