xquery version "1.0-ml";

module namespace qh = "http://marklogic.com/smart-mastering/query-hasher";

declare function number-friendly-double-metaphone($value) {
  spell:double-metaphone(fn:translate($value, "0123456789", "abcdfghlmn"))
};

declare function query-to-hashes($query as cts:query, $is-fuzzy as xs:boolean) as xs:unsignedLong* {
  build-hashes(document {$query}, if ($is-fuzzy) then number-friendly-double-metaphone#1 else function($val) {fn:lower-case(fn:string($val))})
};

declare function build-hashes($node as node(), $value-convert-function as function(item()?) as item()*) {
  typeswitch ($node)
    case document-node() return
      fn:distinct-values($node/node() ! build-hashes(., $value-convert-function) ! xdmp:hash64(fn:normalize-space(.)))
    case element(cts:not-query) return
      ()
    case element(cts:and-not-query) return
      $node/cts:positive/node() ! build-hashes(., $value-convert-function)
    case element(cts:and-query) return
       fn:fold-left(function($accumulative, $query) {
         for $item in $query/node() ! build-hashes(., $value-convert-function),
             $combination in $accumulative
         return $combination || " " || $item
       }, "", $node/schema-element(cts:query))
    case element(cts:or-query) return
      $node/node() ! build-hashes(.,$value-convert-function)
    case schema-element(cts:query) return
      if (fn:exists($node/(cts:value|cts:text))) then
        for $value in $node/(cts:value|cts:text)
        return $value-convert-function($value)[. ne ""]
      else
        $node/node() ! build-hashes(., $value-convert-function)
    default return ()
};

declare function compare-hashes($hashesA as xs:unsignedLong*, $hashesB as xs:unsignedLong*) as xs:boolean {
  $hashesA = $hashesB
};