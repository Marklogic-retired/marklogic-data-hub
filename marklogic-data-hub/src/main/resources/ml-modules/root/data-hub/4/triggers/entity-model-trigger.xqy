xquery version '1.0-ml';

import module namespace es = "http://marklogic.com/entity-services"
  at "/MarkLogic/entity-services/entity-services.xqy";
import module namespace hent = "http://marklogic.com/data-hub/hub-entities" at "/data-hub/4/impl/hub-entities.xqy";
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

let $entity-def := fn:doc($trgr:uri)
let $_validate := es:model-validate($entity-def)
let $default-permissions := xdmp:default-permissions()
let $entity-title := $entity-def/info/title
let $entity-version := $entity-def/info/version
let $tde-uri := "/tde/" || $entity-title || "-" || $entity-version || ".tdex"
return (
  xdmp:invoke-function(
    function() {
      xdmp:document-insert(
        $trgr:uri,
        $entity-def,
        $default-permissions,
        $ENTITY-MODEL-COLLECTION
      )
    }, map:entry("database", xdmp:schema-database())
  ),
  if (local:should-write-tde($tde-uri)) then
    tde:template-insert(
      $tde-uri,
      hent:dump-tde(json:to-array($entity-def)),
      $default-permissions,
      ("ml-data-hub-tde")
    )
  else ()
)
