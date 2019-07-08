xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace sem = "http://marklogic.com/semantics"
  at "/MarkLogic/semantics.xqy";

declare option xdmp:mapping "false";

(: Seed the database with a block :)
let $uri1 := "/content1.xml"
let $uri2 := "/content2.xml"
return
  sem:rdf-insert(
  (
    sem:triple(sem:iri($uri1), $const:PRED-MATCH-BLOCK, sem:iri($uri2)),
    sem:triple(sem:iri($uri2), $const:PRED-MATCH-BLOCK, sem:iri($uri1))
  )
)
