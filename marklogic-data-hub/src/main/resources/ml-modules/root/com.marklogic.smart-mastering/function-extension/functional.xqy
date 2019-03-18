xquery version "1.0-ml";

(:
 : Copyright (c) 2010-2011 John Snelson
 :
 : Licensed under the Apache License, Version 2.0 (the "License");
 : you may not use this file except in compliance with the License.
 : You may obtain a copy of the License at
 :
 :     http://www.apache.org/licenses/LICENSE-2.0
 :
 : Unless required by applicable law or agreed to in writing, software
 : distributed under the License is distributed on an "AS IS" BASIS,
 : WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 : See the License for the specific language governing permissions and
 : limitations under the License.
 :)

(:~
 : <h1>functional.xq</h1>
 : <p>A library of useful functionality for working with XQuery 3.0 higher order
 : functions. Includes a number of functions from the standard Haskell prelude,
 : as well as functions to perform currying, function composition, and
 : Y-combination.</p>
 :
 : @author John Snelson
 : @version 0.9
 :)
module namespace func = "http://snelson.org.uk/functions/functional";
declare default function namespace "http://snelson.org.uk/functions/functional";

(:~ Returns the argument :)
declare function id($a)
{
  $a
};

(:~ Adds one to the argument :)
declare function incr($a)
{
  $a + 1
};

(:~ Reverses the order of the arguments in the function passed as an argument :)
declare function flip(
  $f as function(item()*,item()*) as item()*
) as function(item()*,item()*) as item()*
{
  function($a, $b) { $f($b, $a) }
};

(:~
 : Returns an infinite sequence of ($a, $f($a), $f($f($a)), ...).
 : Only really useful on an implementation that supports lazy evaluation
 :)
declare function iterate($f, $a)
{
  $a, iterate($f, $f($a))
};

(:~
 : Returns an infinite sequence of the argument sequence repeated.
 : Only really useful on an implementation that supports lazy evaluation
 :)
declare function repeat($a)
{
  $a, repeat($a)
};

(:~
 : Returns the first $n items from the sequence $l
 : @param $n: the number of items to return
 : @param $l: the sequence to return items from
 :)
declare function take($n, $l)
{
  fn:subsequence($l, 1, $n)
};

(:~
 : Tests the predicate $p($a), returning $a if true, or until($p, $f, $f($a)) otherwise.
 : @param $p: the predicate function
 : @param $f: the function to iteratively apply
 : @param $a: the initial starting value
 :)
declare function until($p, $f, $a)
{
  if($p($a)) then $a
  else until($p, $f, $f($a))
};

(:~ Wrap a sequence as a function item  :)
declare function ref($arg as item()*) as function() as item()*
{
   function() { $arg }
};

(:~ Unwrap a sequence from a function item :)
declare function deref($arg as function() as item()*) as item()*
{
   $arg()
};

(:~
 : Curries a function (up to arity 10). Takes a function that accepts
 : a number of arguments, and returns a function that accepts the first argument,
 : then returns a new function to accept the second, and so on.
 : @param $f: The function to curry.
 : @return The curried version of the function.
 : @error If $f has an arity greater than 10 or less than 1.
 :)
declare function curry($f as function(*)) as function(item()*) as item()*
{
  let $arity := fn:function-arity($f)
  return

  if($arity eq 1) then $f
  else if($arity eq 2) then curry2($f)
  else if($arity eq 3) then curry3($f)
  else if($arity eq 4) then curry4($f)
  else if($arity eq 5) then curry5($f)
  else if($arity eq 6) then curry6($f)
  else if($arity eq 7) then curry7($f)
  else if($arity eq 8) then curry8($f)
  else if($arity eq 9) then curry9($f)
  else if($arity eq 10) then curry10($f)
  else if($arity eq 0) then fn:error(xs:QName("func:FNDY0001"), "Can't curry a 0 arity function item")
  else fn:error(xs:QName("func:FNDY0002"), "Currying not implemented for a function item with arity greater than 10")
};

declare %private function curry2($f as function(*)) as function(item()*) as item()*
{
  function($a) { $f($a, ?) }
};

declare %private function curry3($f as function(*)) as function(item()*) as item()*
{
  function($b) { curry2($f($b, ?, ?)) }
};

declare %private function curry4($f as function(*)) as function(item()*) as item()*
{
  function($c) { curry3($f($c, ?, ?, ?)) }
};

declare %private function curry5($f as function(*)) as function(item()*) as item()*
{
  function($d) { curry4($f($d, ?, ?, ?, ?)) }
};

declare %private function curry6($f as function(*)) as function(item()*) as item()*
{
  function($e) { curry5($f($e, ?, ?, ?, ?, ?)) }
};

declare %private function curry7($f as function(*)) as function(item()*) as item()*
{
  function($g) { curry6($f($g, ?, ?, ?, ?, ?, ?)) }
};

declare %private function curry8($f as function(*)) as function(item()*) as item()*
{
  function($h) { curry7($f($h, ?, ?, ?, ?, ?, ?, ?)) }
};

declare %private function curry9($f as function(*)) as function(item()*) as item()*
{
  function($i) { curry8($f($i, ?, ?, ?, ?, ?, ?, ?, ?)) }
};

declare %private function curry10($f as function(*)) as function(item()*) as item()*
{
  function($j) { curry9($f($j, ?, ?, ?, ?, ?, ?, ?, ?, ?)) }
};

(:~
 : Y combinator for a function (up to arity 10). Partially applies a function as
 : the first argument to itself, so that it can call itself recursively using the
 : value. Returns the partially applied function. ie:
 :
 : <code>
 : Y(function($f,$a) { if($a gt 0) then ($a, $f($a - 1)) else $a })(10)
 : </code>
 :
 : @param $f: The function to partially apply to itself.
 : @return The partially applied function.
 : @error If $f has an arity greater than 10 or less than 1.
 :)
declare function Y($f as function(*)) as function(*)
{
  let $arity := fn:function-arity($f)
  return

  if($arity eq 1) then Y1($f)
  else if($arity eq 2) then Y2($f)
  else if($arity eq 3) then Y3($f)
  else if($arity eq 4) then Y4($f)
  else if($arity eq 5) then Y5($f)
  else if($arity eq 6) then Y6($f)
  else if($arity eq 7) then Y7($f)
  else if($arity eq 8) then Y8($f)
  else if($arity eq 9) then Y9($f)
  else if($arity eq 10) then Y10($f)
  else fn:error(xs:QName("func:FNDY0002"), "Y combinator not implemented for a function item with arity greater than 10")
};

declare %private function Y1($f as function(*)) as function(*)
{
  function() { $f(Y1($f)) }
};

declare %private function Y2($f as function(*)) as function(*)
{
  function($a) { $f(Y2($f),$a) }
};

declare %private function Y3($f as function(*)) as function(*)
{
  function($a,$b) { $f(Y3($f),$a,$b) }
};

declare %private function Y4($f as function(*)) as function(*)
{
  function($a,$b,$c) { $f(Y4($f),$a,$b,$c) }
};

declare %private function Y5($f as function(*)) as function(*)
{
  function($a,$b,$c,$d) { $f(Y5($f),$a,$b,$c,$d) }
};

declare %private function Y6($f as function(*)) as function(*)
{
  function($a,$b,$c,$d,$e) { $f(Y6($f),$a,$b,$c,$d,$e) }
};

declare %private function Y7($f as function(*)) as function(*)
{
  function($a,$b,$c,$d,$e,$g) { $f(Y7($f),$a,$b,$c,$d,$e,$g) }
};

declare %private function Y8($f as function(*)) as function(*)
{
  function($a,$b,$c,$d,$e,$g,$h) { $f(Y8($f),$a,$b,$c,$d,$e,$g,$h) }
};

declare %private function Y9($f as function(*)) as function(*)
{
  function($a,$b,$c,$d,$e,$g,$h,$i) { $f(Y9($f),$a,$b,$c,$d,$e,$g,$h,$i) }
};

declare %private function Y10($f as function(*)) as function(*)
{
  function($a,$b,$c,$d,$e,$g,$h,$i,$j) { $f(Y10($f),$a,$b,$c,$d,$e,$g,$h,$i,$j) }
};

(:~
 : Compose a sequence of functions into a single function. All the functions 
 : except the last one must have an arity of 1. The last function may accept
 : between 0 and 10 arguments. ie:
 :
 : <code>
 : compose((fn:count#1, fn:filter#2))
 : </code>
 :
 : @param $functions: The sequence of functions to compose
 : @return The composed function.
 : @error If the last function has an arity greater than 10.
 :)
declare function compose($functions as function(*)+) as function(*)
{
  let $head := fn:head($functions)
  let $tail := fn:tail($functions)
  return

  if(fn:empty($tail)) then $head
  else compose-helper($tail, $head)
};

declare %private function compose-helper($functions as function(*)+, $result as function(*)) as function(*)
{
  let $head := fn:head($functions)
  let $tail := fn:tail($functions)
  return
    if(fn:empty($tail)) then compose($result,$head)
    else compose-helper($tail, function($a) { $result($head($a)) })
};

(:~
 : Compose two functions into a single function. All the functions 
 : except the last one must have an arity of 1. The last function may accept
 : between 0 and 10 arguments. ie:
 :
 : <code>
 : compose(fn:count#1, fn:filter#2)
 : </code>
 :
 : @return The composed function.
 : @error If the last function has an arity greater than 10.
 :)
declare function compose($f1 as function(*), $f2 as function(*)) as function(*)
{
  let $arity := fn:function-arity($f2)
  return

  if($arity eq 0) then function() { $f1($f2()) }
  else if($arity eq 1) then function($a) { $f1($f2($a)) }
  else if($arity eq 2) then function($a, $b) { $f1($f2($a, $b)) }
  else if($arity eq 3) then function($a, $b, $c) { $f1($f2($a, $b, $c)) }
  else if($arity eq 4) then function($a, $b, $c, $d) { $f1($f2($a, $b, $c, $d)) }
  else if($arity eq 5) then function($a, $b, $c, $d, $e) { $f1($f2($a, $b, $c, $d, $e)) }
  else if($arity eq 6) then function($a, $b, $c, $d, $e, $f) { $f1($f2($a, $b, $c, $d, $e, $f)) }
  else if($arity eq 7) then function($a, $b, $c, $d, $e, $f, $g) { $f1($f2($a, $b, $c, $d, $e, $f, $g)) }
  else if($arity eq 8) then function($a, $b, $c, $d, $e, $f, $g, $h) { $f1($f2($a, $b, $c, $d, $e, $f, $g, $h)) }
  else if($arity eq 9) then function($a, $b, $c, $d, $e, $f, $g, $h, $i) { $f1($f2($a, $b, $c, $d, $e, $f, $g, $h, $i)) }
  else if($arity eq 10) then function($a, $b, $c, $d, $e, $f, $g, $h, $i, $j) { $f1($f2($a, $b, $c, $d, $e, $f, $g, $h, $i, $j)) }
  else fn:error(xs:QName("func:FNDY0002"), "compose not implemented for final function items with arity greater than 10")
};

(:~
 : Compose three functions into a single function. All the functions 
 : except the last one must have an arity of 1. The last function may accept
 : between 0 and 10 arguments.
 :
 : @return The composed function.
 : @error If the last function has an arity greater than 10.
 :)
declare function compose($f1 as function(*), $f2 as function(*), $f3 as function(*)) as function(*)
{
  compose(function($a) { $f1($f2($a)) }, $f3)
};

(:~
 : Compose four functions into a single function. All the functions 
 : except the last one must have an arity of 1. The last function may accept
 : between 0 and 10 arguments.
 :
 : @return The composed function.
 : @error If the last function has an arity greater than 10.
 :)
declare function compose($f1 as function(*), $f2 as function(*), $f3 as function(*), $f4 as function(*)) as function(*)
{
  compose(function($a) { $f1($f2($f3($a))) }, $f4)
};

(:~
 : Compose five functions into a single function. All the functions 
 : except the last one must have an arity of 1. The last function may accept
 : between 0 and 10 arguments.
 :
 : @return The composed function.
 : @error If the last function has an arity greater than 10.
 :)
declare function compose($f1 as function(*), $f2 as function(*), $f3 as function(*), $f4 as function(*), $f5 as function(*)) as function(*)
{
  compose(function($a) { $f1($f2($f3($f4($a)))) }, $f5)
};

(:~
 : Compose six functions into a single function. All the functions 
 : except the last one must have an arity of 1. The last function may accept
 : between 0 and 10 arguments.
 :
 : @return The composed function.
 : @error If the last function has an arity greater than 10.
 :)
declare function compose($f1 as function(*), $f2 as function(*), $f3 as function(*), $f4 as function(*), $f5 as function(*),
  $f6 as function(*)) as function(*)
{
  compose(function($a) { $f1($f2($f3($f4($f5($a))))) }, $f6)
};

(:~
 : Compose seven functions into a single function. All the functions 
 : except the last one must have an arity of 1. The last function may accept
 : between 0 and 10 arguments.
 :
 : @return The composed function.
 : @error If the last function has an arity greater than 10.
 :)
declare function compose($f1 as function(*), $f2 as function(*), $f3 as function(*), $f4 as function(*), $f5 as function(*),
  $f6 as function(*), $f7 as function(*)) as function(*)
{
  compose(function($a) { $f1($f2($f3($f4($f5($f6($a)))))) }, $f7)
};

(:~
 : Compose eight functions into a single function. All the functions 
 : except the last one must have an arity of 1. The last function may accept
 : between 0 and 10 arguments.
 :
 : @return The composed function.
 : @error If the last function has an arity greater than 10.
 :)
declare function compose($f1 as function(*), $f2 as function(*), $f3 as function(*), $f4 as function(*), $f5 as function(*),
  $f6 as function(*), $f7 as function(*), $f8 as function(*)) as function(*)
{
  compose(function($a) { $f1($f2($f3($f4($f5($f6($f7($a))))))) }, $f8)
};

(:~
 : Compose nine functions into a single function. All the functions 
 : except the last one must have an arity of 1. The last function may accept
 : between 0 and 10 arguments.
 :
 : @return The composed function.
 : @error If the last function has an arity greater than 10.
 :)
declare function compose($f1 as function(*), $f2 as function(*), $f3 as function(*), $f4 as function(*), $f5 as function(*),
  $f6 as function(*), $f7 as function(*), $f8 as function(*), $f9 as function(*)) as function(*)
{
  compose(function($a) { $f1($f2($f3($f4($f5($f6($f7($f8($a)))))))) }, $f9)
};

(:~
 : Compose ten functions into a single function. All the functions 
 : except the last one must have an arity of 1. The last function may accept
 : between 0 and 10 arguments.
 :
 : @return The composed function.
 : @error If the last function has an arity greater than 10.
 :)
declare function compose($f1 as function(*), $f2 as function(*), $f3 as function(*), $f4 as function(*), $f5 as function(*),
  $f6 as function(*), $f7 as function(*), $f8 as function(*), $f9 as function(*), $f10 as function(*)) as function(*)
{
  compose(function($a) { $f1($f2($f3($f4($f5($f6($f7($f8($f9($a))))))))) }, $f10)
};
