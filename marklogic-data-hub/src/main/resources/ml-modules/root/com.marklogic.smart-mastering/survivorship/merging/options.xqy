xquery version "1.0-ml";

(:~
 : Merge options can be sent to Smart Mastering Core as XML or JSON, but they
 : are stored and worked with as XML. This library has functions to convert
 : from JSON to XML.
 :)
module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";
import module namespace mem = "http://maxdewpoint.blogspot.com/memory-operations/functional"
  at "/mlpm_modules/XQuery-XML-Memory-Operations/memory-operations-functional.xqy";

declare namespace merging = "http://marklogic.com/smart-mastering/merging";

declare option xdmp:mapping "false";

(:
 : Directory in which merging options are stored.
 :)
declare variable $MERGING-OPTIONS-DIR := "/com.marklogic.smart-mastering/options/merging/";

declare variable $event-names-json as xs:QName+ := (xs:QName("onMerge"),xs:QName("onArchive"),xs:QName("onNoMatch"),xs:QName("onNotification"));
declare variable $event-names-xml as xs:QName+ := (xs:QName("merging:on-merge"),xs:QName("merging:on-archive"),xs:QName("merging:on-no-match"),xs:QName("merging:on-notification"));

(:~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 : Functions related to merge options.
 :~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~:)

declare function merge-impl:get-options($format as xs:string)
{
  let $options :=
    cts:search(fn:collection(), cts:and-query((
        cts:collection-query($const:OPTIONS-COLL),
        (: In future version, remove mdm-merge collection from query
          Currently part of the query to avoid breaking changes.
        :)
        cts:collection-query(('mdm-merge',$const:MERGE-OPTIONS-COLL))
    )))/merging:options
  return
    if ($format eq $const:FORMAT-XML) then
      $options
    else if ($format eq $const:FORMAT-JSON) then
      array-node { $options ! merge-impl:options-to-json(.) }
    else
      fn:error(xs:QName("SM-INVALID-FORMAT"), "matcher:get-option-names called with invalid format " || $format)
};

declare function merge-impl:get-options($options-name, $format as xs:string)
{
  let $options := fn:doc($MERGING-OPTIONS-DIR||$options-name||".xml")/merging:options
  return
    if ($format eq $const:FORMAT-XML) then
      $options
    else if ($format eq $const:FORMAT-JSON) then
      merge-impl:options-to-json($options)
    else
      fn:error(xs:QName("SM-INVALID-FORMAT"), "merge-impl:get-options called with invalid format " || $format)
};

declare function merge-impl:save-options(
  $name as xs:string,
  $options as node()
) as empty-sequence()
{
  let $options :=
    if ($options instance of document-node()) then
      $options/node()
    else
      $options
  let $options :=
    if ($options instance of object-node()) then
      merge-impl:options-from-json($options)
    else
      $options
  return
    xdmp:document-insert(
      $MERGING-OPTIONS-DIR||$name||".xml",
      $options,
      xdmp:default-permissions(),
      ($const:OPTIONS-COLL, $const:MERGE-OPTIONS-COLL)
    )
};

declare variable $options-json-config := merge-impl:_options-json-config();

(: Removes whitespace nodes to keep the output json from options-to-json clean :)
declare function merge-impl:remove-whitespace($xml)
{
  for $x in $xml
  return
    typeswitch($x)
      case element() return
        element { fn:node-name($x) } {
          merge-impl:remove-whitespace(($x/@*, $x/node()))
        }
      case text() return
        if (fn:string-length(fn:normalize-space($x)) > 0) then
          $x
        else ()
      default return $x
};

(:
 : Convert merge options from XML to JSON.
 :)
declare function merge-impl:options-to-json($options-xml as element(merging:options))
{
  if (fn:exists($options-xml)) then
    xdmp:to-json(
      map:entry(
        "options",
        map:new((
          if (fn:exists($options-xml/merging:target-entity)) then
            map:entry("targetEntity", $options-xml/merging:target-entity/fn:string())
          else (),
          map:entry("matchOptions", $options-xml/merging:match-options/fn:string()),
          map:entry(
            "propertyDefs",
            map:new((
              map:entry(
                "properties",
                array-node {
                  for $prop in $options-xml/merging:property-defs/merging:property
                  return
                    if (fn:exists($prop/@path)) then
                      object-node {
                        "path": $prop/@path/fn:string(),
                        "name": $prop/@name/fn:string()
                      }
                    else
                      object-node {
                        "namespace": $prop/@namespace/fn:string(),
                        "localname": $prop/@localname/fn:string(),
                        "name": $prop/@name/fn:string()
                      }
                }
              ),
              if (fn:exists($options-xml/merging:property-defs/merging:property/@path)) then
                map:entry("namespaces", merge-impl:build-namespace-map($options-xml/merging:property-defs))
              else ()
            ))
          ),
          if ($options-xml/merging:collections) then
            map:entry("collections",
              map:new((
                for $collection-type in fn:distinct-values($options-xml/merging:collections/* ! fn:node-name(.))
                let $collection-type-values := $options-xml/merging:collections/*[fn:node-name(.) eq $collection-type]
                return map:entry(
                    fn:local-name-from-QName($collection-type),
                    if (fn:exists($collection-type-values/@none)) then
                      null-node {}
                    else
                      array-node {
                        $collection-type-values ! fn:string(.)
                      }
                  )
              ))
            )
          else (),
          if (fn:exists($options-xml/merging:algorithms)) then
            map:entry(
              "algorithms",
              map:new((
                map:entry(
                  "custom", array-node {
                    for $alg in $options-xml/merging:algorithms/merging:algorithm
                    return
                      object-node {
                        "name": $alg/@name/fn:string(),
                        "function": $alg/@function/fn:string(),
                        "at": let $at := $alg/@at/fn:string() return if (fn:exists($at)) then $at else ""
                      }
                  }),
                if (fn:exists($options-xml/merging:algorithms/merging:std-algorithm)) then
                  map:entry(
                    "stdAlgorithm", object-node {
                      "namespaces":
                        merge-impl:build-namespace-map($options-xml/merging:algorithms/merging:std-algorithm),
                      "timestamp": object-node {
                        "path":
                          let $path :=
                            fn:head($options-xml/merging:algorithms/merging:std-algorithm/merging:timestamp/@path/fn:string()[. ne ''])
                          return
                            if (fn:exists($path)) then $path
                            else null-node {}
                      }
                    }
                  )
                else (),
                map:entry(
                  "collections",
                  map:new(
                    for $qn in $event-names-xml
                    let $event := $options-xml/merging:algorithms/merging:collections/*[fn:node-name(.) eq $qn]
                    let $json := merge-impl:collection-event-to-json(
                          if (fn:exists($event)) then
                            $event
                          else
                            element {$qn} {()}
                        )
                    return
                      map:entry(fn:string(fn:node-name($json)), $json)
                  )
                )
              ))
            )
          else (),
          if (fn:exists($options-xml/merging:merging/merging:merge-strategy)) then
            map:entry(
              "mergeStrategies",
              array-node {
                for $merge in $options-xml/merging:merging/merging:merge-strategy
                return
                  merge-impl:propertyspec-to-json($merge)
              }
            )
          else (),
          if (fn:exists($options-xml/merging:merging/merging:merge)) then
            map:entry(
              "merging",
              array-node {
                for $merge in $options-xml/merging:merging/merging:merge
                return
                  merge-impl:propertyspec-to-json($merge)
              }
            )
          else (),
          if (fn:exists($options-xml/merging:triple-merge)) then
            map:entry(
              "tripleMerge",
              let $config := json:config("custom")
                => map:with("camel-case", fn:true())
                => map:with("whitespace", "ignore")
                => map:with("ignore-element-names", xs:QName("merging:merge"))
              return
                json:transform-to-json($options-xml/merging:triple-merge, $config)/*
            )
          else ()
        ))
      )
    )/node()
  else ()
};

declare variable $collection-event-json-config := json:config("custom")
                          => map:with("camel-case", fn:true())
                          => map:with("whitespace", "ignore")
                          => map:with("attribute-names", ("namespace", "at", "function"));

declare function merge-impl:collection-event-to-json($event as element())
{
  let $config := $collection-event-json-config => map:with("array-element-names", if (fn:empty($event/merging:function)) then xs:QName("merging:collection") else ())
  return
    json:transform-to-json($event, $config)/*
};


(:
 : Given an element, return a map entry with the key "namespaces" that holds
 : a map from namespace prefixes -> namespace URIs
 : @param $source  the element from which to draw the namespaces
 :)
declare function merge-impl:build-namespace-map($source as element()?)
{
  let $obj := json:object()
  let $populate :=
    if (fn:exists($source)) then
      for $prefix in fn:in-scope-prefixes($source)
      (: xml prefix is predefined (see https://www.w3.org/XML/1998/namespace) :)
      where fn:not($prefix = ("", "xml"))
      return map:put($obj, $prefix, fn:namespace-uri-for-prefix($prefix, $source))
    else ()
  return $obj
};

(:
 : Convert merge options from JSON to XML.
 :)
declare function merge-impl:options-from-json($options-json as object-node())
  as element(merging:options)
{
  <options xmlns="http://marklogic.com/smart-mastering/merging">
    {
      if (fn:exists($options-json/*:options/*:targetEntity)) then
        element merging:target-entity {
          $options-json/*:options/*:targetEntity
        }
      else (),
      element merging:match-options {
        $options-json/*:options/*:matchOptions
      },
      merge-impl:construct-property-defs-element($options-json),
      merge-impl:construct-algorithms-element($options-json),
      merge-impl:construct-collections-element($options-json),
      merge-impl:construct-merging-element($options-json),
      merge-impl:construct-triple-merge-element($options-json)
    }
  </options>
};

declare private function merge-impl:construct-property-defs-element($options-json as object-node())
  as element()
{
  element merging:property-defs {
    attribute xmlns { "http://marklogic.com/smart-mastering/merging" },
    for $ns in <r>{fn:data($options-json/*:options/*:propertyDefs/*:namespaces)}</r>/json:object/json:entry
    return
      attribute { xs:QName("xmlns:" || $ns/@key) } { $ns/json:value/fn:string() },
    for $prop in $options-json/*:options/*:propertyDefs/*:properties
    return
      element merging:property {
        attribute name { $prop/*:name },
        if (fn:exists($prop/*:namespace)) then attribute namespace { $prop/*:namespace } else (),
        if (fn:exists($prop/*:localname)) then attribute localname { $prop/*:localname } else (),
        if (fn:exists($prop/*:path)) then attribute path { $prop/*:path} else ()
      }
  }
};

declare private function merge-impl:construct-algorithms-element($options-json as object-node())
{
  if (fn:exists($options-json/*:options/*:algorithms)) then
    element merging:algorithms {
      attribute xmlns { "http://marklogic.com/smart-mastering/merging" },
      for $alg in $options-json/*:options/*:algorithms/*:custom
      return
        element merging:algorithm {
          attribute xmlns { "http://marklogic.com/smart-mastering/merging" },
          attribute name { $alg/*:name },
          attribute function { $alg/*:function },
          if (fn:exists($alg/*:namespace)) then attribute namespace { $alg/*:namespace } else (),
          if (fn:exists($alg/*:at)) then attribute at { $alg/*:at } else ()
        },
      if (fn:exists($options-json/*:options/*:algorithms/*:stdAlgorithm)) then
        element merging:std-algorithm {
          if (fn:exists($options-json/*:options/*:algorithms/*:stdAlgorithm/*:timestamp)) then (
            for $ns in <r>{fn:data($options-json/*:options/*:algorithms/*:stdAlgorithm/*:namespaces)}</r>/json:object/json:entry
            return
              attribute { xs:QName("xmlns:" || $ns/@key) } { $ns/json:value/fn:string() },
            element merging:timestamp {
              attribute path {
                $options-json/*:options/*:algorithms/*:stdAlgorithm/*:timestamp/*:path/fn:string()
              }
            }
          )
          else ()
        }
      else (),
      element merging:collections {
        let $empty-object := object-node {}
        let $config := json:config("custom")
                        => map:with("element-namespace", "http://marklogic.com/smart-mastering/merging")
                        => map:with("camel-case", fn:true())
                        => map:with("whitespace", "ignore")
                        => map:with("attribute-names", ("namespace", "at", "function"))
        for $qn in $event-names-json
        let $event :=
            fn:head((
              $options-json/*:options/*:algorithms/*:collections/*[fn:node-name(.) eq $qn],
              $empty-object
            ))
        let $config := map:new($config) => map:with("array-element-names", if (fn:empty($event/*:function)) then "collection" else ())
        return
          json:transform-from-json(object-node{ $qn: $event}, $config)
      }
    }
  else ()
};

declare private function merge-impl:construct-collections-element($options-json as object-node())
{
  if (fn:exists($options-json/*:options/*:collections)) then
    element merging:collections {
      attribute xmlns { "http://marklogic.com/smart-mastering/merging" },
      for $collection-type in $options-json/*:options/*:collections/*
      let $element-name := fn:string(fn:node-name($collection-type))
      return
        if ($collection-type instance of null-node()) then
          element {fn:QName("http://marklogic.com/smart-mastering/merging",$element-name)} { attribute none {"true"}}
        else
          element {fn:QName("http://marklogic.com/smart-mastering/merging",$element-name)} { fn:string($collection-type) }
    }
  else ()
};

declare private function merge-impl:construct-merging-element($options-json as object-node())
{
  element merging:merging {
    attribute xmlns { "http://marklogic.com/smart-mastering/merging" },
    let $all-merge-options := $options-json/*:options/*:merging
    let $all-merge-strategy-options := $options-json/*:options/*:mergeStrategies
    let $array-element-names :=
      fn:distinct-values(
        ($all-merge-options,$all-merge-strategy-options)//array-node() !
          xs:QName("merging:"||fn:lower-case(fn:replace(fn:string(fn:node-name(.)), "([a-z])([A-Z])", "$1-$2")))
      )
    let $config := json:config("custom")
      => map:with("element-namespace", "http://marklogic.com/smart-mastering/merging")
      => map:with("camel-case", fn:true())
      => map:with("whitespace", "ignore")
      => map:with("array-element-names", $array-element-names)
      => map:with("attribute-names", ("default", "name", "weight", "strategy", "propertyName", "algorithmRef", "maxValues", "maxSources", "documentUri"))
    let $all-xml := (
      for $merge in $options-json/*:options/*:merging
      return
        element merging:merge {
          json:transform-from-json($merge, $config)
        },
      for $merge-strategy in $all-merge-strategy-options
      return
        element merging:merge-strategy {
          json:transform-from-json($merge-strategy, $config)
        }
      )
    for $xml in $all-xml
    let $array-elements := $xml//*[fn:node-name(.) = $array-element-names]
    return
      if (fn:exists($array-elements)) then
        mem:execute(
          mem:transform(
            mem:copy($xml),
            $array-elements,
            function($node) {
              let $qn := fn:node-name($node)
              where fn:empty($node/preceding-sibling::*[fn:node-name(.) = $qn])
              return element {$qn} {
                $node/*,
                $node/following-sibling::*[fn:node-name(.) = $qn]/*
              }
            }
          )
        )
      else
        $xml
  }
};

declare private function merge-impl:construct-triple-merge-element($options-json as object-node())
{
  let $triple-merge := $options-json/*:options/*:tripleMerge
  return
    if (fn:exists($triple-merge)) then
      element merging:triple-merge {
        attribute xmlns { "http://marklogic.com/smart-mastering/merging" },
        attribute namespace { $triple-merge/*:namespace },
        attribute function { $triple-merge/*:function },
        attribute at { $triple-merge/*:at },

        let $config := json:config("custom")
          => map:with("camel-case", fn:true())
          => map:with("whitespace", "ignore")
          => map:with("ignore-element-names", ("namespace","function","at"))
        for $merge in $triple-merge
        return
          json:transform-from-json($merge, $config)
      }
    else ()
};

declare function merge-impl:_options-json-config()
{
  let $config := json:config("custom")
  return (
    map:put($config, "array-element-names", ("algorithm","threshold","scoring","property", "reduce", "add", "expand", "merging", "merge-strategy", "mergeStrategy")),
    map:put($config, "element-namespace", "http://marklogic.com/smart-mastering/merging"),
    map:put($config, "element-namespace-prefix", "merging"),
    map:put($config, "attribute-names",
      ("name","localname", "namespace", "function",
        "at", "property-name", "propertyName", "weight", "above", "label","algorithm-ref", "algorithmRef", "strategy", "default")
    ),
    map:put($config, "camel-case", fn:true()),
    map:put($config, "whitespace", "ignore"),
    $config
  )
};

declare function merge-impl:get-option-names($format as xs:string)
{
  if ($format eq $const:FORMAT-XML) then
    let $options := cts:uris('', (), cts:and-query((
        cts:collection-query($const:OPTIONS-COLL),
        (: In future version, remove mdm-merge collection from query
          Currently part of the query to avoid breaking changes.
        :)
        cts:collection-query(('mdm-merge',$const:MERGE-OPTIONS-COLL))
      )))
    let $option-names := $options ! fn:replace(
      fn:replace(., $MERGING-OPTIONS-DIR, ""),
      "\.xml$", ""
    )
    return
      element merging:options {
        for $name in $option-names
        return
          element merging:option { $name }
      }
  else if ($format eq $const:FORMAT-JSON) then
    merge-impl:option-names-to-json(merge-impl:get-option-names($const:FORMAT-XML))
  else
    fn:error(xs:QName("SM-INVALID-FORMAT"), "Attempted to call merge-impl:get-option-names with invalid format: " || $format)
};

declare variable $option-names-json-config := merge-impl:_option-names-json-config();

declare function merge-impl:_option-names-json-config()
{
  json:config("custom")
    => map:with("array-element-names", xs:QName("merging:option"))
};

declare function merge-impl:option-names-to-json($options-xml)
  as array-node()
{
  array-node {
    xdmp:to-json(
      json:transform-to-json-object(
        $options-xml,
        merge-impl:_option-names-json-config()
      )
    )/options/option
  }
};

declare function merge-impl:propertyspec-to-json($property-spec as element()) as object-node()
{
  let $array-element-names := fn:distinct-values((
      xs:QName("merging:source-weights"),
      for $child-element in $property-spec//*
      let $current-qn := fn:node-name($child-element)
      let $siblings-with-same-name := $child-element/(preceding-sibling::*|following-sibling::*)[fn:node-name(.) eq $current-qn]
      where $current-qn ne xs:QName("merging:source") and fn:exists($siblings-with-same-name)
      return $current-qn
    ))
  let $source-weights-to-transform := $property-spec//merging:source-weights
  let $transformed-xml :=
    if (fn:exists($source-weights-to-transform)) then
      mem:execute(mem:transform(
        mem:copy($property-spec),
        $source-weights-to-transform,
        function($node) {
          let $node-name := fn:node-name($node)
          for $child in $node/*
          return
            element {$node-name} {
              $node/@*,
              $child
            }
        }
      ))
    else
      $property-spec
  let $config := json:config("custom")
    => map:with("camel-case", fn:true())
    => map:with("whitespace", "ignore")
    => map:with("array-element-names", $array-element-names)
    => map:with("ignore-element-names", xs:QName("merging:merge"))
  return
    json:transform-to-json($transformed-xml, $config)/*
};

