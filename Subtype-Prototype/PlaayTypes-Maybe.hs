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
    let rules = everyBoth reflexive subgoal
                ++ everyBoth primNatInt subgoal
                ++ everyBoth primNatNumber subgoal
                ++ everyBoth primIntNumber subgoal
                ++ everyBoth function subgoal
                ++ everyBoth tuple2 subgoal
                ++ everyBoth field subgoal
                ++ everyBoth location subgoal
                ++ everyLeftLeft lenDisjointness subgoal
                ++ everyLeftLeft primDisjointness subgoal
                ++ everyLeftLeft tupleDisjointness0 subgoal
                ++ everyLeftLeft tupleDisjointness1 subgoal
                ++ everyLeftLeft otherDisjointnessPL subgoal
                ++ everyLeftLeft otherDisjointnessPA subgoal
                ++ everyLeftLeft otherDisjointnessPF subgoal
                ++ everyLeftLeft otherDisjointnessAL subgoal
    in proveClauseWithAny rules subgoal


proveClauseWithAny :: [Rule] -> Sequent -> Maybe Proof
proveClauseWithAny ruleList goal = 
    let results = map (\rule -> proveClauseWith rule goal) ruleList
    in msum results

proveClauseWith :: Rule -> Sequent -> Maybe Proof
proveClauseWith rule goal =
    case rule goal of
        Just( subgoals, f ) -> 
            case proveAllSubgoals subgoals of
                Just( proofs ) -> Just( f proofs )
                Nothing -> Nothing
        Nothing -> Nothing

proveAllSubgoals :: [Sequent] -> Maybe [Proof]
proveAllSubgoals goals =
   listOfMaybeToMaybeList $ map subtype goals

simplify :: Sequent ->  ([Sequent], [Proof] -> Proof) 
simplify (theta :<: delta) = 
    case simplify1 (theta :<: delta) of
    Nothing -> ([theta :<: delta], \x-> head x)
    Just(subgoals, f) ->
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

type Rule = Sequent -> Maybe ([Sequent], [Proof] -> Proof) 

simplify1 :: Rule
simplify1 (theta :<: delta) =
   let 
       leftBottomRules = anyLeft leftBottom
       rightBottomRules = anyRight rightBottom
       leftTopRules = anyLeft leftTop 
       rightTopRules = anyRight rightTop
       leftMeetRules = anyLeft leftMeet
       rightMeetRules = anyRight rightMeet
       leftJoinRules = anyLeft leftJoin
       rightJoinRules = anyRight rightJoin
       allRules = [leftBottomRules, rightTopRules, leftTopRules, rightBottomRules,
                  leftMeetRules, rightJoinRules, rightMeetRules, leftJoinRules]
    in firstSuccess allRules (theta :<: delta)

firstSuccess :: [Rule] -> Rule
firstSuccess ruleList (theta :<: delta)  = msum allResults
    where allResults = map (\rule -> rule (theta :<: delta)) ruleList

anyLeft :: (Int -> Rule) -> Rule
anyLeft func (theta :<: delta) =
    let indecies = take (length theta) (natsFrom 0)
        rules = map func indecies
    in firstSuccess rules (theta :<: delta)

anyRight :: (Int -> Rule) -> Rule
anyRight func (theta :<: delta) =
    let indecies = take (length delta) (natsFrom 0)
        rules = map func indecies
    in firstSuccess rules (theta :<: delta)

anyBoth :: (Int -> Int -> Rule) -> Rule
anyBoth func (theta :<: delta) =
    let rules = everyBoth func (theta :<: delta)
    in firstSuccess rules (theta :<: delta)


everyBoth :: (Int -> Int -> Rule) -> Sequent -> [Rule]
everyBoth func (theta :<: delta) =
    let leftIndecies = take (length theta) (natsFrom 0)
        rightIndecies = take (length delta) (natsFrom 0)
    in [ func l r | l <-leftIndecies, r <-rightIndecies ]

everyLeftLeft :: (Int -> Int -> Rule) -> Sequent -> [Rule]
everyLeftLeft func (theta :<: delta) =
    let leftIndecies = take (length theta) (natsFrom 0)
    in [ func l r | l <-leftIndecies, r <-leftIndecies ]
    


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
        TMeet r0 r1 -> Just( [([r0,r1] ++ theta `del` i) :<: delta], f )
        _ -> Nothing
    where f :: [Proof] -> Proof
          f [p] = BranchProof (theta :<: delta) "Left Meet" [p]

--   theta <: u0,delta'    theta <: u1, delta'
--   -------------Right Meet-------------------
--           theta <: u0 Meet u1, delta'
rightMeet :: Int -> Rule
rightMeet i (theta :<: delta) =
    case (delta !! i) of
        TMeet u0 u1 -> Just( [theta :<: (u0 : delta `del` i),
                              theta :<: (u1 : delta `del` i)],
                             f )
        _ -> Nothing
    where f :: [Proof] -> Proof
          f [lp,rp] = BranchProof (theta :<: delta) "Right Meet" [lp,rp]

--   t0,theta' <: delta    t1,theta' <: delta
--   -------------Left Join-------------------
--           t0 Join t1, theta' <: delta
leftJoin :: Int -> Rule
leftJoin i (theta :<: delta) =
    case (theta !! i) of
        TJoin t0 t1 -> Just( [(t0 : theta `del` i) :<: delta,
                              (t1 : theta `del` i) :<: delta],
                             f )
        _ -> Nothing
    where f :: [Proof] -> Proof
          f [lp,rp] = BranchProof (theta :<: delta) "Left Join" [lp,rp]


--    theta <: u0,u1,delta'
--    -----Right Join----------
--     theta <: u0 Join u1, delta'
rightJoin :: Int -> Rule
rightJoin i (theta :<: delta) =
    case (delta !! i) of
        TJoin u0 u1 -> Just( [theta :<: (u0 : u1 : delta `del` i)], f )
        _ -> Nothing
    where f :: [Proof] -> Proof
          f [p] = BranchProof (theta :<: delta) "Right Join" [p]


--     -----Reflexive------
--     t,theta' <: t,delta'
reflexive :: Int -> Int -> Rule
reflexive i j (theta :<: delta) = 
    if( (theta !! i) == (delta !! j) )
    then Just ( [], f )
    else Nothing
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Reflexive"

--    -------Nat is in Int------
--       Nat, theta' <: Int, delta'
primNatInt :: Int -> Int -> Rule
primNatInt i j (theta :<: delta) =
    case (theta!!i, delta!!j) of
        (TNat, TInt) -> Just( [], f) 
        (_, _) -> Nothing
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Nat is in Int"

--    -------Nat is in Number--------
--       Nat, theta' <: Number, delta'
primNatNumber :: Int -> Int -> Rule
primNatNumber i j (theta :<: delta) =
    case (theta!!i, delta!!j) of
        (TNat, TNumber) -> Just( [], f) 
        (_, _) -> Nothing
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Nat is in Number"

--    -------Int is in Number--------
--       Int, theta' <: Number, delta'
primIntNumber :: Int -> Int -> Rule
primIntNumber i j (theta :<: delta) =
    case (theta!!i, delta!!j) of
        (TInt, TNumber) -> Just( [], f) 
        (_, _) -> Nothing
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Int is in Number"

--     u0 <: t0                          t1 <: u1
--    ---------------Function----------------------
--       (t0 -> t1), theta' <: (u0 -> u1), delta'
function :: Int -> Int -> Rule
function i j (theta :<: delta) = 
    case (theta!!i, delta!!j) of
        (TArrow t0 t1, TArrow u0 u1) -> Just( [ [u0] :<: [t0], [t1] :<: [u1] ], f )
        (_, _) -> Nothing
    where f :: [Proof] -> Proof
          f [lp, rp] = BranchProof (theta :<: delta) "Function" [lp, rp]

--          t0 <: u0      t1 <: u1
--    ---------------Tuple 2----------------------
--       TTuple2 t0 t1, theta' <: Tuple2 u0 u1, delta'
tuple2 :: Int -> Int -> Rule
tuple2 i j (theta :<: delta) = 
    case (theta!!i, delta!!j) of
        (TTuple2 t0 t1, TTuple2 u0 u1) ->
            Just( [[t0] :<: [u0], [t1] :<: [u1]], f )
            
        (_, _) -> Nothing
    where f :: [Proof] -> Proof
          f [p0, p1] = BranchProof (theta :<: delta) "Tuple 2" [p0, p1]

--          t0 <: u0
--    ---------------Field----------------------
--       TField i t0, theta' <: TField i t1, delta'
field :: Int -> Int -> Rule
field i j (theta :<: delta) = 
    case (theta!!i, delta!!j) of
        (TField id0 t0, TField id1 u0) | id0==id1 ->
                Just( [[t0] :<: [u0]], f )
        (_, _) -> Nothing
    where f :: [Proof] -> Proof
          f [p0] = BranchProof (theta :<: delta) "Field" [p0]


--          t <: u     u <: t
--    ---------------Location----------------------
--       TLoc t, theta' <: TLoc u, delta'
location :: Int -> Int -> Rule
location i j (theta :<: delta) = 
    case (theta!!i, delta!!j) of
        (TLoc t, TLoc u) ->
                Just( [[t] :<: [u], [u] :<: [t]], f )
        (_, _) -> Nothing
    where f :: [Proof] -> Proof
          f [p0, p1] = BranchProof (theta :<: delta) "Loc" [p0, p1]


--   -------Length Disjoint---------  if length t /= length u
--     t, u, theta' <: delta
lenDisjointness :: Int -> Int -> Rule
lenDisjointness i j (theta :<: delta) = 
    if not (sameLength (theta!!i) (theta!!j)) then Just( [], f ) 
    else Nothing
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Length Disjointness"


--   -------Prim Disjointess---------  if t and u are primitives with no overlap
--     t, u, theta' <: delta
primDisjointness :: Int -> Int -> Rule
primDisjointness i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (TBool, TNumber) -> Just( [], f)
        (TBool, TInt) -> Just( [], f)
        (TBool, TNat) -> Just( [], f)
        (TBool, TString) -> Just( [], f)
        (TBool, TNull) -> Just( [], f)
        (TNumber, TString) -> Just( [], f)
        (TInt, TString) -> Just( [], f)
        (TNat, TString) -> Just( [], f)
        (TNumber, TNull) -> Just( [], f)
        (TInt, TNull) -> Just( [], f)
        (TNat, TNull) -> Just( [], f)
        (TString, TNull) -> Just( [], f)
        (_, _) -> Nothing
    where f :: [Proof] -> Proof
          f [] = LeafProof  (theta :<: delta) "Primitive Disjointness"

--       t0,u0 <: empty 
--   -------Tuple Disjointess--------- 
--     (t0, t1), (u0, u1) theta' <: delta
tupleDisjointness0 :: Int -> Int -> Rule
tupleDisjointness0 i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (TTuple2 t0 t1, TTuple2 u0 u1) -> Just( [[t0,u0] :<: []], f)
        (_, _) -> Nothing
    where f :: [Proof] -> Proof
          f [p] = BranchProof (theta :<: delta) "Tuple Disjointness 0" [p]

--       t1,u1 <: empty 
--   -------Tuple Disjointess--------- 
--     (t0, t1), (u0, u1) theta' <: delta
tupleDisjointness1 :: Int -> Int -> Rule
tupleDisjointness1 i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (TTuple2 t0 t1, TTuple2 u0 u1) -> Just( [[t1,u1] :<: []], f)
        (_, _) -> Nothing
    where f :: [Proof] -> Proof
          f [p] = BranchProof (theta :<: delta) "Tuple Disjointness 1" [p]


--     
--   -------Other Disjointess PL---------
--    p, Loc(u), theta' <: delta               
otherDisjointnessPL :: Int -> Int -> Rule
otherDisjointnessPL i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (t, u) | isPrimitive t && isLocation u -> Just( [], f)
               | otherwise -> Nothing
    where f :: [Proof] -> Proof
          f [] = LeafProof (theta :<: delta) "Other disjointness PL"

--     
--   -------Other Disjointess PA--------- 
--    p, t -> u, theta' <: delta               
otherDisjointnessPA :: Int -> Int -> Rule
otherDisjointnessPA i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (t, u) | isPrimitive t && isArrow u -> Just( [], f)
               | otherwise -> Nothing
    where f :: [Proof] -> Proof
          f [] = LeafProof (theta :<: delta) "Other disjointness PA"

--     
--   -------Other Disjointess PF--------- 
--    p, i:t, theta' <: delta               
otherDisjointnessPF :: Int -> Int -> Rule
otherDisjointnessPF i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (t, u) | isPrimitive t && isField u -> Just( [], f)
               | otherwise -> Nothing
    where f :: [Proof] -> Proof
          f [] = LeafProof (theta :<: delta) "Other disjointness PA"

--     
--   -------Other Disjointess AL--------- 
--    t0 -> t1, Loc(u), theta' <: delta               
otherDisjointnessAL :: Int -> Int -> Rule
otherDisjointnessAL i j (theta :<: delta) = 
    case ((theta!!i), (theta!!j)) of 
        (t, u) | isArrow t && isLocation u -> Just( [], f)
               | otherwise -> Nothing
    where f :: [Proof] -> Proof
          f [] = LeafProof (theta :<: delta) "Other disjointness AL"