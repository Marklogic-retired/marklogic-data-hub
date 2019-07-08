xquery version "1.0-ml";

import module namespace sem = "http://marklogic.com/semantics"
  at "/MarkLogic/semantics.xqy";

declare option xdmp:mapping "false";

sem:graph-delete(sem:iri("http://marklogic.com/semantics#default-graph"))
