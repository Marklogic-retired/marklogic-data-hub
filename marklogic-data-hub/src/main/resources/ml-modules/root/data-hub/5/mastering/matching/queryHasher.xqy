xquery version "1.0-ml";

module namespace qh = "http://marklogic.com/smart-mastering/query-hasher";

declare function query-to-hashes($query as cts:query) as xs:unsignedLong* {
  build-hashes(document {$query})
};

declare function build-hashes($node as node()) {
  typeswitch ($node)
    case document-node() return
      fn:distinct-values($node/node() ! build-hashes(.) ! xdmp:hash64(fn:normalize-space(.)))
    case element(cts:not-query) return
      ()
    case element(cts:and-not-query) return
      $node/cts:positive/node() ! build-hashes(.)
    case element(cts:and-query) return
       fn:fold-left(function($accumulative, $query) {
         for $item in $query/node() ! build-hashes(.),
             $combination in $accumulative
         return $combination || " " || $item
       }, "", $node/schema-element(cts:query))
    case element(cts:or-query) return
      $node/node() ! build-hashes(.)
    case schema-element(cts:query) return
      if (fn:exists($node/(cts:value|cts:text))) then
        for $value in $node/(cts:value|cts:text)
        return spell:double-metaphone($value)[. ne ""]
      else
        $node/node() ! build-hashes(.)
    default return ()
};