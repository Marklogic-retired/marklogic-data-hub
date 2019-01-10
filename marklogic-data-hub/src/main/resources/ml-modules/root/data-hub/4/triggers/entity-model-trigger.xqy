xquery version '1.0-ml';

import module namespace es = "http://marklogic.com/entity-services"
  at "/MarkLogic/entity-services/entity-services.xqy";
import module namespace tde = "http://marklogic.com/xdmp/tde"
        at "/MarkLogic/tde.xqy";
import module namespace trgr = 'http://marklogic.com/xdmp/triggers' at '/MarkLogic/triggers.xqy';

declare variable $ENTITY-MODEL-COLLECTION as xs:string := "http://marklogic.com/entity-services/models";

declare variable $trgr:uri as xs:string external;

let $entity-def := fn:doc($trgr:uri)
let $_validate := es:model-validate($entity-def)
let $default-permissions := xdmp:default-permissions()
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
  tde:template-insert(
    $trgr:uri || ".tde.xml",
    es:extraction-template-generate($entity-def),
    $default-permissions,
    ("ml-data-hub-tde")
  )
);
