xquery version '1.0-ml';

import module namespace es = "http://marklogic.com/entity-services"
  at "/MarkLogic/entity-services/entity-services.xqy";
import module namespace entityTrigger = "http://marklogic.com/data-hub/entity-trigger"
  at "./entity-model-validate-trigger-lib.xqy";
import module namespace hent = "http://marklogic.com/data-hub/hub-entities" at "/data-hub/5/impl/hub-entities.xqy";
import module namespace tde = "http://marklogic.com/xdmp/tde"
        at "/MarkLogic/tde.xqy";
import module namespace trgr = 'http://marklogic.com/xdmp/triggers' at '/MarkLogic/triggers.xqy';

declare variable $ENTITY-MODEL-COLLECTION as xs:string := "http://marklogic.com/entity-services/models";

declare variable $trgr:uri as xs:string external;

(: Don't overwrite TDE if it exists and doesn't have the collection specifc to TDEs created via trigger :)
declare function local:should-write-tde($tde-uri as xs:string) {
  xdmp:invoke-function(
    function() {
      fn:not(fn:doc-available($tde-uri))
        or
      xdmp:document-get-collections($tde-uri) = "ml-data-hub-tde"
    }, map:entry("database", xdmp:schema-database())
  )
};

let $entity-def := fn:doc($trgr:uri)/object-node()
(: Create map version so we can update $ref to external links if we have to :)

let $schema-permissions := (
  xdmp:default-permissions(),
  xdmp:permission("data-hub-common", "read"),
  xdmp:permission("data-hub-entity-model-writer", "update")
)

let $entity-title := $entity-def/info/title
let $entity-version := $entity-def/info/version
let $tde-uri := "/tde/" || $entity-title || "-" || $entity-version || ".tdex"

return (
  (: build uber model with original info :)
  let $uber-model := entityTrigger:entity-validate($trgr:uri)
  let $valid-entity-model := xdmp:to-json($uber-model)

  let $schemas := es:schema-generate($uber-model)
  let $schema-collection := "ml-data-hub-xml-schema"

  return (
    xdmp:invoke-function(
      function() {
        if (fn:count($schemas) = 1) then
          xdmp:document-insert(fn:replace($trgr:uri, "\.json$", ".xsd"), $schemas, $schema-permissions, $schema-collection)
        else
          for $schema in $schemas
          let $uri :=
            (: The last xs:element is expected to be the name of the entity type. Unfortunately there's not a more
            reliable way to determine this from the output of es:schema-generate :)
            let $entity-type-name := $schema/xs:element[fn:last()]/@name/fn:string()
            return "/entities/" || $entity-type-name || ".entity.xsd"
          return xdmp:document-insert($uri, $schema, $schema-permissions, $schema-collection),

        xdmp:document-insert(
          fn:replace($trgr:uri, "\.json$", ".schema.json"),
          hent:json-schema-generate($entity-title, $uber-model),
          $schema-permissions,
          "ml-data-hub-json-schema"
        ),

        xdmp:document-insert(
          $trgr:uri,
          $valid-entity-model,
          $schema-permissions,
          $ENTITY-MODEL-COLLECTION
        )
      }, map:entry("database", xdmp:schema-database())
    ),

  (: Attempt to generate TDE :)
  if (local:should-write-tde($tde-uri) and hent:is-tde-generation-enabled($entity-def))then
    try {
      tde:template-insert(
        $tde-uri,
        hent:dump-tde(json:to-array($uber-model)),
        $schema-permissions,
        ("ml-data-hub-tde")
      )
    } catch * {
      xdmp:log("Unable to generate valid TDE for entity: " || $trgr:uri || " (error: " || $err:description || ")")
    }
  else ()
  )
)
