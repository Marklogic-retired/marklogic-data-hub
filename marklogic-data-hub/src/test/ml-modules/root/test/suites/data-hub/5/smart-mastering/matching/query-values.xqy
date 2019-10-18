xquery version "1.0-ml";

import module namespace match-impl = "http://marklogic.com/smart-mastering/matcher-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/matcher-impl.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare variable $STRING-ONLY := "this is not castable to other types";
declare variable $STRING-INT := "23";
declare variable $STRING-INT-EXPANDED := ( "23", 23 );
declare variable $STRING-NUMBER := "17.42";
declare variable $STRING-NUMBER-EXPANDED := ( "17.42", 17.42 );
declare variable $STRING-TRUE := "true";
declare variable $STRING-TRUE-EXPANDED := ( "true", fn:true() );
declare variable $STRING-FALSE := "false";
declare variable $STRING-FALSE-EXPANDED := ( "false", fn:false() );
declare variable $STRING-INT-TRUE := "1";
declare variable $STRING-INT-TRUE-EXPANDED := ( "1", 1, fn:true() );
declare variable $STRING-INT-FALSE := "0";
declare variable $STRING-INT-FALSE-EXPANDED := ( "0", 0, fn:false() );

(
  test:assert-equal(
    match-impl:expand-values-by-type($STRING-ONLY),
    $STRING-ONLY
  ),
  test:assert-equal(
    match-impl:expand-values-by-type($STRING-INT),
    $STRING-INT-EXPANDED
  ),
  test:assert-equal(
    match-impl:expand-values-by-type($STRING-NUMBER),
    $STRING-NUMBER-EXPANDED
  ),
  test:assert-equal(
    match-impl:expand-values-by-type($STRING-TRUE),
    $STRING-TRUE-EXPANDED
  ),
  test:assert-equal(
    match-impl:expand-values-by-type($STRING-FALSE),
    $STRING-FALSE-EXPANDED
  ),
  test:assert-equal(
    match-impl:expand-values-by-type($STRING-INT-TRUE),
    $STRING-INT-TRUE-EXPANDED
  ),
  test:assert-equal(
    match-impl:expand-values-by-type($STRING-INT-FALSE),
    $STRING-INT-FALSE-EXPANDED
  )
)
