{-# LANGUAGE FlexibleInstances, MultiParamTypeClasses #-}
{-# LANGUAGE DeriveGeneric #-}
module PlaayTypes where

import Data.List(all)
import Control.Monad( guard, msum )
import Control.Applicative((<|>))
import Test.SmallCheck.Series
import Test.SmallCheck(Testable,Property,smallCheck,forAll,(==>))
import GHC.Generics
import Blocks

del :: [a] -> Int -> [a]
del xs i = take i xs ++ drop (i+1) xs
data Type = TTop | TBot | TBool | TString | TNumber | TInt | TNat | TNull
          | TTuple0 | TTuple2 Type Type | TArrow Type Type 
          | TField String Type | TLoc Type | TMeet Type Type | TJoin Type Type
          deriving (Eq, Generic,Show)

len :: Type -> Maybe Int
len TTop = Nothing
len TBot = Nothing
len TBool = Just 1
len TString = Just 1
len TNumber = Just 1
len TInt = Just 1
len TNat = Just 1
len TNull = Just 1
len TTuple0 = Just 0
len (TTuple2 t u) = Just 2
len (TArrow t u) = Just 1
len (TField s t) = Just 1
len (TLoc t) = Just 1
len (TMeet t u) = Nothing
len (TJoin t u) = Nothing

sameLength :: Type -> Type -> Bool
sameLength t u =
    case (len t, len u) of
        (Just p, Just q) -> p==q
        _ -> False 

isTop TTop = True
isTop _ = False

isBottom TBot = True
isBottom _ = False

isBool TBool = True
isBool _ = False

isString TString = True
isString _ = False

isNumber TNumber = True
isNumber _ = False

isInt TInt = True
isInt _ = False

isNat TNat = True
isNat _ = False

isNull TNull = True
isNull _ = False

isTuple0 TTuple0 = True
isTuple0 _ = False

isTuple2 (TTuple2 t u) = True 
isTuple2 _ = False

isArrow (TArrow t u) = True
isArrow _ = False

isField (TField str t) = True
isField _ = False

isLocation (TLoc t) = True
isLocation _ = False

isMeet (TMeet t u) = True
isMeet _ = False

isJoin (TJoin t u) = True
isJoin _ = False

isPrimitive t = isBool t || isString t || isNumber t || isInt t || isNat t || isNull t

data Sequent = [Type] :<: [Type]

instance Show Sequent where
    show (theta :<: delta) = lhs ++ " <: " ++ rhs
        where
            lhs = listToString theta
            rhs = listToString delta
            listToString [] = "empty"
            listToString xs = foldl1 join $ map show xs 
            join a b = a ++ "," ++ b

data Proof = LeafProof Sequent String
           | BranchProof Sequent String [Proof]

instance Show Proof where
    show = ((++)"\n")  . Blocks.block2String . proof2Block
        where
            proof2Block :: Proof -> Blocks.Block
            
            proof2Block (LeafProof seq hint ) =
                let
                    hintLine = ["---" ++ hint ++ "---"]
                    bot = [ show seq ]
                    w = Blocks.width hintLine `max` Blocks.width bot
                    hintLine' = Blocks.pad hintLine '-' w
                    bot' = Blocks.pad bot ' ' w
                in  Blocks.stack [hintLine', bot']
            
            proof2Block (BranchProof seq hint proofs) =
                
                let top = case length proofs of
                        1 -> proof2Block $ head proofs
                        _ -> let spaceLine = [" "]
                                 top0 = Blocks.stack $ interleave (map proof2Block proofs) spaceLine
                             in Blocks.prefix "|  " top0
                    hintLine = ["---" ++ hint ++ "---"]
                    bot = [ show seq ]
                    w = Blocks.width top `max` Blocks.width hintLine `max` Blocks.width bot
                    top' = Blocks.pad top ' ' w
                    hintLine' = Blocks.pad hintLine '-' w
                    bot' = Blocks.pad bot ' ' w
                in  Blocks.stack [top', hintLine', bot']
            
            interleave [] y = []
            interleave [x] y = [x]
            interleave (x:xs) y = x : y : interleave xs y
            
type Rule = Sequent -> [([Sequent], [Proof] -> Proof)]

orElse :: Rule -> Rule -> Rule
orElse r0 r1 = \ sequent -> r0 sequent ++ r1 sequent

failRule :: Rule
failRule seq = []

combineRules :: [Rule] -> Rule
combineRules rules = foldl orElse failRule rules

subtype :: Sequent -> Maybe Proof
subtype (theta :<: delta) = 
    let (subgoals, f) = simplify (theta :<: delta)
        listOfMaybeProofs = map proveClause subgoals
    in case listOfMaybeToMaybeList listOfMaybeProofs of
       Just proofs -> Just( f proofs )
       Nothing -> Nothing

listOfMaybeToMaybeList :: [Maybe a] -> Maybe [a]
listOfMaybeToMaybeList [] = Just []
listOfMaybeToMaybeList (x:xs) =
    do a <- x
       as <- listOfMaybeToMaybeList xs
       return(a:as)

proveClause :: Sequent -> Maybe Proof
proveClause subgoal =
    let rule = combineRules [,
                    everyBoth reflexive ,
                    everyBoth primNatInt ,
                    everyBoth primNatNumber ,
                    everyBoth primIntNumber ,
                    everyBoth function ,
                    everyBoth tuple2 ,
                    everyBoth field ,
                    everyBoth location ,
                    everyLeftLeft lenDisjointness ,
                    everyLeftLeft primDisjointness ,
                    everyLeftLeft tupleDisjointness0 ,
                    everyLeftLeft tupleDisjointness1 ,
                    everyLeftLeft otherDisjointnessPL ,
                    everyLeftLeft otherDisjointnessPA ,
                    everyLeftLeft otherDisjointnessPF ,
                    everyLeftLeft otherDisjointnessAL ]
    in proveClauseWith rule subgoal


proveClauseWith :: Rule -> Sequent -> Maybe Proof
proveClauseWith rule goal =
    let results = rule goal
    in msum $ map try results
  where
    try (subgoals, f) = 
        case proveAllSubgoals subgoals of
                Just( proofs ) -> Just( f proofs )
                Nothing -> Nothing

proveAllSubgoals :: [Sequent] -> Maybe [Proof]
proveAllSubgoals goals =
   listOfMaybeToMaybeList $ map subtype goals

simplify :: Sequent ->  ([Sequent], [Proof] -> Proof) 
simplify (theta :<: delta) = 
    case simplify1 (theta :<: delta) of
    [ ] -> ([theta :<: delta], \x-> head x)
    (subgoals, f) : _ ->
        let simplifiedResults :: [([Sequent], [Proof] -> Proof)]
            simplifiedResults = map simplify subgoals
            subgoalsList :: [[Sequent]]
            subgoalsList = map fst simplifiedResults
            lengths :: [Int]
            lengths = map length subgoalsList
            functions :: [[Proof] -> Proof]
            functions = map snd simplifiedResults
            --- Note that functions!!i is a function expecting
            --- lengths!!i proofs and it returns a proof of subgoals!!i.
            f0 :: [Proof] -> Proof
            f0 subproofs =
                let segmentedSubproofs :: [[Proof]]
                    segmentedSubproofs = split lengths subproofs
                    apply (f, a) = f a
                    proofsOfSubgoals :: [Proof]
                    proofsOfSubgoals = map apply (zip functions segmentedSubproofs)
                in f proofsOfSubgoals
        in (concat subgoalsList, f0)

split :: [Int] -> [a] -> [[a]]
split [] [] = []
split (n:ns) xs = take n xs : split ns (drop n xs)

simplify1 :: Rule
simplify1 (theta :<: delta) =
   let simplificationRules = combineRules [
            everyLeft leftBottom,
            everyRight rightBottom,
            everyLeft leftTop,
            everyRight rightTop,
            everyLeft leftMeet,
            everyRight rightMeet,
            everyLeft leftJoin,
            everyRight rightJoin ]
    in firstSuccess simplificationRules (theta :<: delta)

firstSuccess :: Rule -> Rule
firstSuccess rule (theta :<: delta)  = 
    case rule (theta :<: delta) of
        [] -> []
        (r:rs) -> [r]

everyLeft :: (Int -> Rule) -> Rule
everyLeft func (theta :<: delta) =
    let rightIndecies = take (length theta) (natsFrom 0)
    in combineRules [ func r | r <- rightIndecies ] (theta :<: delta)

everyRight :: (Int -> Rule) -> Rule
everyRight func (theta :<: delta) =
    let rightIndecies = take (length delta) (natsFrom 0)
    in combineRules [ func r | r <- rightIndecies ] (theta :<: delta)


everyBoth :: (Int -> Int -> Rule) -> Rule
everyBoth func (theta :<: delta) =
    let leftIndecies = take (length theta) (natsFrom 0)
        rightIndecies = take (length delta) (natsFrom 0)
    in combineRules [ func l r | l <-leftIndecies, r <-rightIndecies ] (theta :<: delta)

everyLeftLeft :: (Int -> Int -> Rule) -> Rule
everyLeftLeft func (theta :<: delta) =
    let leftIndecies = take (length theta) (natsFrom 0)
    in combineRules [ func l r | l <-leftIndecies, r <-leftIndecies ] (theta :<: delta)
    


natsFrom n = n : natsFrom (n+1) 

-- Top and Bottom rules

--   ---Left Bottom---
--   Bottom,theta' <: delta
--
leftBottom :: Int -> Rule
leftBottom i (theta :<: delta) =
    do  guard( isBottom (theta!!i))
        return( [], f )
    where f :: [Proof] -> Proof
          f [] = LeafProof (theta :<: delta) "Left Bottom"

--     theta <: delta'
--   ---Right Bottom---
--   theta <: Bottom,delta'
--
rightBottom :: Int -> Rule
rightBottom i (theta :<: delta) =
    do guard( isBottom (delta!!i) )
       return ([theta :<: (delta `del` i)], f)
    where f :: [Proof] -> Proof 
          f [p] = BranchProof (theta :<: delta) "Right Bottom" [p]


--     theta' <: delta
--   ---Left Top---
--   Top, theta' <: delta
--
leftTop :: Int -> Rule
leftTop i (theta :<: delta) =
    do guard( isTop (theta!!i) )
       return ([(del theta i) :<: delta], f)
    where f :: [Proof] -> Proof 
          f [p] = BranchProof (theta :<: delta) "Left Top" [p]

--   ---Right Top---
--   theta <: Top,delta
--
rightTop :: Int -> Rule
rightTop i (theta :<: delta) =
    do  guard( isTop (delta!!i))
        return( [], f )
    where f :: [Proof] -> Proof
          f [] = LeafProof (theta :<: delta) "Right Top"

--    r0, r1, theta' <: delta
--    -----Left Meet----------
--     r0 Meet r1, theta' <: delta
leftMeet :: Int -> Rule
leftMeet i (theta :<: delta) =
    case (theta !! i) of
        TMeet r0 r1 -> [([([r0,r1] ++ theta `del` i) :<: delta], f)]
        _ -> []
    where f :: [Proof] -> Proof
          f [p] = BranchProof (theta :<: delta) "Left Meet" [p]

--   theta <: u0,delta'    theta <: u1, delta'
--   -------------Right Meet-------------------
--           theta <: u0 Meet u1, delta'
rightMeet :: Int -> Rule
rightMeet i (theta :<: delta) =
    case (delta !! i) of
        TMeet u0 u1 -> [( [theta :<: (u0 : delta `del` i),
                              theta :<: (u1 : delta `del` i)],
                          f ) ]
        _ -> []
    where f :: [Proof] -> Proof
          f [lp,rp] = BranchProof (theta :<: delta) "Right Meet" [lp,rp]

--   t0,theta' <: delta    t1,theta' <: delta
--   -------------Left Join-------------------
--           t0 Join t1, theta' <: delta
leftJoin :: Int -> Rule
leftJoin i (theta :<: delta) =
    case (theta !! i) of
        TJoin t0 t1 -> [( [(t0 : theta `del` i) :<: delta,
                              (t1 : theta `del` i) :<: delta],
                          f )]
        _ -> [ ]
    where f :: [Proof] -> Proof
          f [lp,rp] = BranchProof (theta :<: delta) "Left Join" [lp,rp]


--    theta <: u0,u1,delta'
--    -----Right Join----------
--     theta <: u0 Join u1, delta'
rightJoin :: Int -> Rule
rightJoin i (theta :<: delta) =
    case (delta !! i) of
        TJoin u0 u1 -> [( [theta :<: (u0 : u1 : delta `del` i)], f )]
        _ -> []
    where f :: [Proof] -> Proof
          f [p] = BranchProof (theta :<: delta) "Right Join" [p]


--     -----Reflexive------
--     t,theta' <: t,delta'
reflexive :: Int -> Int -> Rule
reflexive i j (theta :<: delta) = 
    if( (theta !! i) == (delta !! j) )
    then [ ( [], f )]
    else []
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Reflexive"

--    -------Nat is in Int------
--       Nat, theta' <: Int, delta'
primNatInt :: Int -> Int -> Rule
primNatInt i j (theta :<: delta) =
    case (theta!!i, delta!!j) of
        (TNat, TInt) -> [ ( [], f) ]
        (_, _) -> [ ]
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Nat is in Int"

--    -------Nat is in Number--------
--       Nat, theta' <: Number, delta'
primNatNumber :: Int -> Int -> Rule
primNatNumber i j (theta :<: delta) =
    case (theta!!i, delta!!j) of
        (TNat, TNumber) -> [ ( [], f) ]
        (_, _) -> []
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Nat is in Number"

--    -------Int is in Number--------
--       Int, theta' <: Number, delta'
primIntNumber :: Int -> Int -> Rule
primIntNumber i j (theta :<: delta) =
    case (theta!!i, delta!!j) of
        (TInt, TNumber) -> [( [], f)] 
        (_, _) -> [ ]
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Int is in Number"

--     u0 <: t0                          t1 <: u1
--    ---------------Function----------------------
--       (t0 -> t1), theta' <: (u0 -> u1), delta'
function :: Int -> Int -> Rule
function i j (theta :<: delta) = 
    case (theta!!i, delta!!j) of
        (TArrow t0 t1, TArrow u0 u1) -> [( [ [u0] :<: [t0], [t1] :<: [u1] ], f )]
        (_, _) -> [ ]
    where f :: [Proof] -> Proof
          f [lp, rp] = BranchProof (theta :<: delta) "Function" [lp, rp]

--          t0 <: u0      t1 <: u1
--    ---------------Tuple 2----------------------
--       TTuple2 t0 t1, theta' <: Tuple2 u0 u1, delta'
tuple2 :: Int -> Int -> Rule
tuple2 i j (theta :<: delta) = 
    case (theta!!i, delta!!j) of
        (TTuple2 t0 t1, TTuple2 u0 u1) ->
            [( [[t0] :<: [u0], [t1] :<: [u1]], f )]
            
        (_, _) -> [ ]
    where f :: [Proof] -> Proof
          f [p0, p1] = BranchProof (theta :<: delta) "Tuple 2" [p0, p1]

--          t0 <: u0
--    ---------------Field----------------------
--       TField i t0, theta' <: TField i t1, delta'
field :: Int -> Int -> Rule
field i j (theta :<: delta) = 
    case (theta!!i, delta!!j) of
        (TField id0 t0, TField id1 u0) | id0==id1 ->
                [( [[t0] :<: [u0]], f )]
        (_, _) -> [ ]
    where f :: [Proof] -> Proof
          f [p0] = BranchProof (theta :<: delta) "Field" [p0]


--          t <: u     u <: t
--    ---------------Location----------------------
--       TLoc t, theta' <: TLoc u, delta'
location :: Int -> Int -> Rule
location i j (theta :<: delta) = 
    case (theta!!i, delta!!j) of
        (TLoc t, TLoc u) ->
                [( [[t] :<: [u], [u] :<: [t]], f )]
        (_, _) -> [ ]
    where f :: [Proof] -> Proof
          f [p0, p1] = BranchProof (theta :<: delta) "Loc" [p0, p1]


--   -------Length Disjoint---------  if length t /= length u
--     t, u, theta' <: delta
lenDisjointness :: Int -> Int -> Rule
lenDisjointness i j (theta :<: delta) = 
    if not (sameLength (theta!!i) (theta!!j)) then [( [], f )] 
    else [ ]
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Length Disjointness"


--   -------Prim Disjointess---------  if t and u are primitives with no overlap
--     t, u, theta' <: delta
primDisjointness :: Int -> Int -> Rule
primDisjointness i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (TBool, TNumber) -> [( [], f)]
        (TBool, TInt) -> [( [], f)]
        (TBool, TNat) -> [( [], f)]
        (TBool, TString) -> [( [], f)]
        (TBool, TNull) -> [( [], f)]
        (TNumber, TString) -> [( [], f)]
        (TInt, TString) -> [( [], f)]
        (TNat, TString) -> [( [], f)]
        (TNumber, TNull) -> [( [], f)]
        (TInt, TNull) -> [( [], f)]
        (TNat, TNull) -> [( [], f)]
        (TString, TNull) -> [( [], f)]
        (_, _) -> [ ]
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Primitive Disjointness"

--       t0,u0 <: empty 
--   -------Tuple Disjointess--------- 
--     (t0, t1), (u0, u1) theta' <: delta
tupleDisjointness0 :: Int -> Int -> Rule
tupleDisjointness0 i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (TTuple2 t0 t1, TTuple2 u0 u1) -> [( [[t0,u0] :<: []], f)]
        (_, _) -> [ ]
    where f :: [Proof] -> Proof
          f [p] = BranchProof (theta :<: delta) "Tuple Disjointness 0" [p]

--       t1,u1 <: empty 
--   -------Tuple Disjointess--------- 
--     (t0, t1), (u0, u1) theta' <: delta
tupleDisjointness1 :: Int -> Int -> Rule
tupleDisjointness1 i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (TTuple2 t0 t1, TTuple2 u0 u1) -> [( [[t1,u1] :<: []], f)]
        (_, _) -> [ ]
    where f :: [Proof] -> Proof
          f [p] = BranchProof (theta :<: delta) "Tuple Disjointness 1" [p]


--     
--   -------Other Disjointess PL---------
--    p, Loc(u), theta' <: delta               
otherDisjointnessPL :: Int -> Int -> Rule
otherDisjointnessPL i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (t, u) | isPrimitive t && isLocation u -> [( [], f)]
               | otherwise -> [ ]
    where f :: [Proof] -> Proof
          f [] = LeafProof (theta :<: delta) "Other disjointness PL"

--     
--   -------Other Disjointess PA--------- 
--    p, t -> u, theta' <: delta               
otherDisjointnessPA :: Int -> Int -> Rule
otherDisjointnessPA i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (t, u) | isPrimitive t && isArrow u -> [( [], f)]
               | otherwise -> [ ]
    where f :: [Proof] -> Proof
          f [] = LeafProof (theta :<: delta) "Other disjointness PA"

--     
--   -------Other Disjointess PF--------- 
--    p, i:t, theta' <: delta               
otherDisjointnessPF :: Int -> Int -> Rule
otherDisjointnessPF i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (t, u) | isPrimitive t && isField u -> [( [], f)]
               | otherwise -> [ ]
    where f :: [Proof] -> Proof
          f [] = LeafProof (theta :<: delta) "Other disjointness PA"

--     
--   -------Other Disjointess AL--------- 
--    t0 -> t1, Loc(u), theta' <: delta               
otherDisjointnessAL :: Int -> Int -> Rule
otherDisjointnessAL i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (t, u) | isArrow t && isLocation u -> [( [], f)]
               | otherwise -> [ ]
    where f :: [Proof] -> Proof
          f [] = LeafProof (theta :<: delta) "Other disjointness AL"