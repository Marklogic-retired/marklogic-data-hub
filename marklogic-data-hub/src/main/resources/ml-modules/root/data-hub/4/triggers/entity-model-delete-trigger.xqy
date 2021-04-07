xquery version '1.0-ml';

import module namespace trgr = 'http://marklogic.com/xdmp/triggers' at '/MarkLogic/triggers.xqy';

declare namespace tde = "http://marklogic.com/xdmp/tde";

declare variable $trgr:uri as xs:string external;

let $tde-uri :=
  let $entity-name := fn:replace($trgr:uri, "/entities/", "")
  let $entity-name := fn:replace($entity-name, ".entity.json", "")
  where $entity-name
  return xdmp:invoke-function(
    function() {
      let $query := cts:and-query((
        cts:collection-query("ml-data-hub-tde"),
        cts:element-value-query(xs:QName("tde:context"), ".//" || $entity-name || "[node()]")
      ))
      return cts:uris((), ("limit=1"), $query)
    }, map:entry("database", xdmp:schema-database())
  )

let $schema-xml-uri := fn:replace($trgr:uri, "\.json$", ".xsd")
let $schema-json-uri := fn:replace($trgr:uri, "\.json$", ".schema.json")

return (
  xdmp:invoke-function(
    function() {
      for $uri in ($trgr:uri, $tde-uri, $schema-xml-uri, $schema-json-uri)
      return
        if (fn:doc-available($uri)) then (
          xdmp:trace("hub-entity", "Deleting: " || $uri),
          xdmp:document-delete($uri)
        ) else
          xdmp:trace("hub-entity", "Document not available, so not deleting: " || $uri)
    }, map:entry("database", xdmp:schema-database())
  )
);
