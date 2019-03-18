xquery version "1.0-ml";

(:
 : This is an implementation library, not an interface to the Smart Mastering functionality.
 :
 : Functions in this library store, retrieve, and transform match options.
 : Options are stored and used as XML, but clients may submit them as JSON or
 : XML.
 :)

module namespace opt-impl = "http://marklogic.com/smart-mastering/options-impl";

import module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms"
  at "/com.marklogic.smart-mastering/algorithms/base.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";

declare option xdmp:mapping "false";

(:
 : Directory where matching options are stored.
 :)
declare variable $ALGORITHM-OPTIONS-DIR := "/com.marklogic.smart-mastering/options/algorithms/";

declare variable $options-json-config := opt-impl:_options-json-config();

declare function opt-impl:_options-json-config()
{
  let $config := json:config("custom")
  return (
    map:put($config, "camel-case", fn:true()),
    map:put($config, "array-element-names",
      ("algorithm","threshold","property", "reduce", "add", "expand","results", "zip")),
    map:put($config, "element-namespace", "http://marklogic.com/smart-mastering/matcher"),
    map:put($config, "element-namespace-prefix", "matcher"),
    map:put($config, "attribute-names",
      ("name","localname", "namespace", "function", "origin",
      "at", "property-name", "propertyName", "weight", "above", "label","algorithm-ref","algorithmRef")
    ),
    $config
  )
};

declare function opt-impl:get-option-names-as-xml()
  as element(matcher:options)
{
  let $options := cts:uris('', (), cts:collection-query($const:MATCH-OPTIONS-COLL))
  let $option-names := $options !
    fn:replace(
      fn:replace(., $ALGORITHM-OPTIONS-DIR, ""),
      "\.xml$", ""
    )
  return
    element matcher:options {
      $option-names ! element matcher:option { . }
    }
};

declare function opt-impl:get-option-names-as-json()
  as array-node()?
{
  opt-impl:option-names-to-json(
    opt-impl:get-option-names-as-xml()
  )
};

declare variable $option-names-json-config := opt-impl:option-names-json-config();

declare function opt-impl:option-names-json-config()
{
  let $config := json:config("custom")
  return (
    map:put($config, "array-element-names", ("option","content")),
    map:put($config, "element-namespace", "http://marklogic.com/smart-mastering/matcher"),
    map:put($config, "element-namespace-prefix", "matcher"),
    $config
  )
};

declare function opt-impl:option-names-to-json($options-xml)
  as array-node()?
{
  if (fn:exists($options-xml)) then
    array-node {
      xdmp:to-json(
        json:transform-to-json-object($options-xml, $option-names-json-config)
      )/node()/options/option
    }
  else ()
};

declare function opt-impl:get-options-as-xml($options-name as xs:string)
{
  fn:doc($ALGORITHM-OPTIONS-DIR||$options-name||".xml")/matcher:options
};

declare function opt-impl:get-options-as-json($options-name as xs:string)
  as object-node()?
{
  opt-impl:options-to-json(
    fn:doc($ALGORITHM-OPTIONS-DIR||$options-name||".xml")/matcher:options
  )
};

declare function opt-impl:save-options(
  $name as xs:string,
  $options as node()
)
{
  let $options :=
    if ($options instance of document-node()) then
      $options/node()
    else
      $options
  let $options :=
    if ($options instance of object-node()) then
      opt-impl:options-from-json($options)
    else
      $options
  return (
    algorithms:setup-algorithms($options/(self::*:options|*:options)),
    xdmp:document-insert(
      $ALGORITHM-OPTIONS-DIR||$name||".xml",
      $options,
      xdmp:default-permissions(),
      ($const:OPTIONS-COLL, $const:MATCH-OPTIONS-COLL, $const:ALGORITHM-COLL)
    )
  )
};

(: Convert JSON match options to XML :)
declare function opt-impl:options-from-json($options-json)
{
  (: TODO consider more explicit translation, like merge options :)
  let $xml := json:transform-from-json($options-json, $opt-impl:options-json-config)
  return
    if (fn:exists($options-json/options/collections/content[. instance of null-node()])) then
      element matcher:options {
        $xml/* except $xml/matcher:collections,
        element matcher:collections {
          element matcher:content {attribute none {"true"}}
        }
      }
    else
      $xml
};

declare function opt-impl:options-to-json($options-xml as element(matcher:options)?)
  as object-node()?
{
  if (fn:exists($options-xml)) then
    xdmp:to-json(
      json:transform-to-json-object($options-xml, $opt-impl:options-json-config)
    )/object-node()
  else ()
};

