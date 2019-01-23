xquery version '1.0-ml';

import module namespace es = "http://marklogic.com/entity-services"
  at "/MarkLogic/entity-services/entity-services.xqy";
import module namespace tde = "http://marklogic.com/xdmp/tde"
        at "/MarkLogic/tde.xqy";
import module namespace trgr = 'http://marklogic.com/xdmp/triggers' at '/MarkLogic/triggers.xqy';

declare variable $ENTITY-MODEL-COLLECTION as xs:string := "http://marklogic.com/entity-services/models";

declare variable $trgr:uri as xs:string external;

declare function local:make-TDE-flexible($node as node()) {
  typeswitch($node)
  case document-node() return document {fn:map(local:make-TDE-flexible#1, $node/node())}
  case element(tde:template)|element(tde:templates)|element(tde:rows)|element(tde:row)|element(tde:columns)|element(tde:triples)|element(tde:triple)
    return element {fn:node-name($node)} { $node/@*, fn:map(local:make-TDE-flexible#1, $node/node()) }
  case element(tde:column)
    return element {fn:node-name($node)} {
      $node/@*,
      ($node/node() except $node/(tde:nullable|tde:invalid-values)),
      element tde:nullable {fn:true()},
      element tde:invalid-values {"ignore"}
    }
  case element(tde:subject)|element(tde:predicate)|element(tde:object)
      return element {fn:node-name($node)} {
        $node/@*,
        ($node/node() except $node/tde:invalid-values),
        element tde:invalid-values {"ignore"}
      }
  default return $node
};

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
    local:make-TDE-flexible(es:extraction-template-generate($entity-def)),
    $default-permissions,
    ("ml-data-hub-tde")
  )
);
