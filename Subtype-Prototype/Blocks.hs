{-# LANGUAGE FlexibleInstances, MultiParamTypeClasses #-}
{-# LANGUAGE DeriveGeneric #-}
module Blocks(Block, block2String, string2Block, stack, row, width, center, pad, prefix) 
where
import Data.Foldable( maximum )


type Block = [[Char]]

block2String :: Block -> String
block2String block = concat $ map (\line -> line++"\n") block

string2Block :: String -> Block
string2Block = evenUp . splitUp

evenUp :: [[Char]] -> Block
evenUp strs =
        let maxWidth = maximum $ map length strs
        in map (expandTo maxWidth ' ') strs
    where
        expandTo w ch str = let d = w - length str in str ++ take d (repeat ch)

splitUp :: String -> [[Char]]
splitUp [] = [[]]
splitUp str =
        case find '\n' str of
           (line,[]) -> [line]
           (line, rest) -> line : splitUp rest
    where
        find ch [] = ([], [])
        find ch (ch1:chs) 
            | ch1 == ch = ([], chs)
            | ch1 /= ch = let (line, rest) = find ch chs in (ch1:line, rest)

            
width (line:lines) = length line

pad :: Block -> Char -> Int -> Block
pad block char width = map (pad1 char width) block
    where
        pad1 char width line =
            let f = width-length line
                padding = take f $ repeat char
            in line ++ padding

center :: Block -> Char -> Int -> Block
center block char width = map (expand1 char width) block
    where
        expand1 char width line =
            let f = width-length line
                f0 = f `div` 2
                f1 = f - f0
                left = take f0 $ repeat char
                right = take f1 $ repeat char
            in left ++ line ++ right

stack :: [Block] -> Block
stack blocks = foldl stack2 [] blocks
    where
        stack2 :: Block -> Block -> Block
        stack2 b0 b1 = b0 ++ b1

prefix :: String -> Block -> Block
prefix str block = map (\line->str++line) block

row :: String -> [Block] -> Block
row str blocks = foldl1 row2 blocks
    where
        row2 :: Block -> Block -> Block
        row2 b0 b1 = 
            let h0 = length b0
                h1 = length b1
                h = h0 `max` h1
                b0' = expandVert b0 h
                b1' = expandVert b1 h
            in zipWith glue b0' b1'
        glue s0 s1 = s0 ++ str ++ s1

expandVert :: Block -> Int -> Block
expandVert block h =
    let w = width block
        fill = take w $ repeat ' '
        h0 = length block
        h1 = h - h0
        filler = take h1 $ repeat fill
    in filler ++ block
