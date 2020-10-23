xquery version "1.0-ml";

(:~
 : Merge options can be sent to Smart Mastering Core as XML or JSON, but they
 : are stored and worked with as XML. This library has functions to convert
 : from JSON to XML.
 :)
module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging";

import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace es-helper = "http://marklogic.com/smart-mastering/entity-services"
  at "/com.marklogic.smart-mastering/sm-entity-services.xqy";
import module namespace fun-ext = "http://marklogic.com/smart-mastering/function-extension"
  at "../../function-extension/base.xqy";
import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";
import module namespace mem = "http://maxdewpoint.blogspot.com/memory-operations/functional"
  at "/mlpm_modules/XQuery-XML-Memory-Operations/memory-operations-functional.xqy";
import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at  "standard.xqy";
import module namespace util-impl = "http://marklogic.com/smart-mastering/util-impl"
  at "/com.marklogic.smart-mastering/impl/util.xqy";

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
      config:get-default-data-hub-permissions(),
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
    return (
        merge-impl:propertyspec-to-xml($all-merge-options, xs:QName("merging:merge")),
        merge-impl:propertyspec-to-xml($all-merge-strategy-options, xs:QName("merging:merge-strategy"))
      )
  }
};

declare variable $merge-spec-json-config := json:config("custom")
      => map:with("element-namespace", "http://marklogic.com/smart-mastering/merging")
      => map:with("camel-case", fn:true())
      => map:with("whitespace", "ignore")
      => map:with("attribute-names", ("default", "name", "weight", "strategy", "propertyName", "algorithmRef", "maxValues", "maxSources", "documentUri"));

declare function merge-impl:propertyspec-to-xml($merging-objects as item()*, $type as xs:QName) as element()* {
  let $normalized-merging-objects :=
    for $merging-object in $merging-objects
    return
      if ($merging-object instance of json:object) then
        xdmp:to-json($merging-object)/object-node()
      else
        $merging-object
  let $array-element-names :=
      fn:distinct-values(
        $normalized-merging-objects//array-node() !
          xs:QName("merging:"||fn:lower-case(fn:replace(fn:string(fn:node-name(.)), "([a-z])([A-Z])", "$1-$2")))
      )
  let $all-xml :=
    for $merging-object in $normalized-merging-objects
    return
      element {$type} {
        json:transform-from-json(
          $merging-object,
          $merge-spec-json-config
            => map:with("array-element-names", $array-element-names)
        )
      }
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

(: We are caching the compiled merge options as constructing and organizing the various functions, etc. can be expensive. :)
declare variable $_cached-compiled-merge-options as map:map := map:map();

declare function merge-impl:compile-merge-options(
  $merge-options as item() (: as node()|json:object :)
) {
  merge-impl:compile-merge-options(
    $merge-options,
    fn:false()
  )
};

(:
 : Calculate merge information once per unique merge options in request to reduce repeat logic
 : @param $merge-options  Options specifying how documents will be merged
 : @param $only-warn-on-error  boolean indicating if errors should be returned rather than thrown
 : @return map:map with compiled information about merge options
 :)
declare function merge-impl:compile-merge-options(
  $merge-options as item() (: as node()|json:object :),
  $only-warn-on-error as xs:boolean
) {
  let $merge-options :=
    typeswitch($merge-options)
    case json:object|map:map return
        xdmp:to-json($merge-options)/object-node()
    case node() return
      $merge-options
    default return
      fn:error((), "Shouldn't happen", $merge-options)
  let $merge-options := if (fn:exists($merge-options/(*:options|mergeOptions))) then
      $merge-options/(*:options|mergeOptions)
    else
      $merge-options
  let $cache-id :=
      xdmp:md5(xdmp:describe($merge-options, (), ()))
  return
    if (map:contains($_cached-compiled-merge-options, $cache-id)) then
      map:get($_cached-compiled-merge-options, $cache-id)
    else
      let $_trace := if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
          xdmp:trace($const:TRACE-MERGE-RESULTS, "compiling merge options: " || xdmp:describe($merge-options, (), ()))
        else
          ()
    let $message-output :=
      if ($only-warn-on-error) then
        map:map()
      else ()
    (: Gather target Entity Type information :)
    let $target-entity := $merge-options/(*:target-entity|targetEntity|targetEntityType) ! fn:string(.)
    let $target-entity-type-def := es-helper:get-entity-def($target-entity)
    let $target-entity-type := $target-entity-type-def/entityIRI ! fn:string(.)
    let $target-entity-properties-info := $target-entity-type ! es-helper:get-entity-property-info(.)
    let $target-entity-namespaces := $target-entity-type ! es-helper:get-entity-type-namespaces(.)

    let $merge-rules := $merge-options/(merging:merging/merging:merge|merge|mergeRules)
    let $property-defs := $merge-options/(*:property-defs|propertyDefs)
    let $property-names-to-values :=
      util-impl:properties-to-values-functions(
        $merge-rules,
        $property-defs,
        $target-entity-type-def/entityIRI,
        fn:true(),
        $message-output
      )
  let $merge-algorithms := merge-impl:build-merging-map((
      (: old algorithm format :)
      $merge-options/*:algorithms/(custom|merging:algorithm),
      (: new algorithm format :)
      $merge-rules/(mergeStrategies|mergeRules)[mergeModulePath[fn:normalize-space(.)]]
    ))
  let $namespaces :=
    util-impl:combine-maps(
      if (fn:exists($property-defs/namespaces)) then
        xdmp:from-json($property-defs/namespaces)
      else
        merge-impl:build-prefix-map($property-defs),
      $target-entity-namespaces
    )
  let $merge-options-ref := merge-impl:build-merge-options-reference($merge-options)
  let $last-updated-function := merge-impl:build-last-updated-function($merge-options)
  let $default-merge-rule-info := merge-impl:build-default-merge-info($merge-options, $merge-algorithms, $namespaces)
  let $target-collections := merge-impl:build-target-collections($merge-options)
  let $compiled-merge-options :=
      $target-collections
        => map:with("targetEntityType", $target-entity-type)
        => map:with("targetEntityTypeDefinition", $target-entity-type-def)
        => map:with("mergeOptionsNode", $merge-options)
        => map:with("lastUpdatedFunction", $last-updated-function)
        => map:with("namespaces", $namespaces)
        => map:with("mergeOptionsRef", $merge-options-ref)
        => map:with("defaultMergeRuleInfo", $default-merge-rule-info)
        => map:with("mergeRulesInfo",
          merge-impl:build-merge-rules-info(
            $default-merge-rule-info,
            $merge-rules,
            $property-defs,
            $merge-options,
            $target-entity-type-def,
            $target-entity-properties-info,
            $property-names-to-values,
            $merge-algorithms,
            $namespaces
          )
        )
  return (
    if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
      xdmp:trace($const:TRACE-MERGE-RESULTS, "Compiled merge options: " || xdmp:to-json-string($compiled-merge-options))
    else (),
    $compiled-merge-options,
    if (xdmp:trace-enabled($const:TRACE-MERGE-RESULTS)) then
      xdmp:trace($const:TRACE-MERGE-RESULTS, "Caching compiled merge options with key: " || $cache-id)
    else (),
    map:put($_cached-compiled-merge-options, $cache-id, $compiled-merge-options)
  )
};

declare function merge-impl:build-last-updated-function($merge-options as node()?) {
  let $ts-ns-path := $merge-options/(*:algorithms/(merging:std-algorithm|stdAlgorithm)|lastUpdatedLocation)
  let $ts-path := fn:string($ts-ns-path/(*:timestamp/(@path|path)|documentXPath))
  let $ts-ns-map :=
    if (fn:exists($ts-ns-path/namespaces)) then
      xdmp:from-json($ts-ns-path/namespaces)
    else if (fn:exists($ts-ns-path)) then
      merge-impl:build-prefix-map($ts-ns-path)
    else ()
  return function($document) {
    if (fn:string-length($ts-path) > 0) then
      fn:head(xdmp:unpath($ts-path, $ts-ns-map, $document)[. castable as xs:dateTime] ! xs:dateTime(.))
    else ()
  }
};

declare function merge-impl:options-to-node($merge-options as item()?) {
  let $merge-options :=
    typeswitch($merge-options)
    case json:object|map:map return
        xdmp:to-json($merge-options)/object-node()
    case node() return
      $merge-options
    default return
      fn:error((), "Shouldn't happen", $merge-options)
  return
    if (fn:exists($merge-options/(*:options|mergeOptions))) then
      $merge-options/(*:options|mergeOptions)
    else
      $merge-options

};

declare function merge-impl:build-default-merge-info($merge-options as node()?, $merge-algorithms as map:map, $namespaces as map:map) {
  let $merge-rule := merge-impl:expand-merge-rule($merge-options, ())
  let $algorithm-name := if (fn:exists($merge-rule/mergeFunction[fn:normalize-space(.)])) then
                            fn:string($merge-rule/mergeModulePath) || ":" || fn:string($merge-rule/mergeFunction)
                        else
                            fn:string(fn:head($merge-rule/(@algorithm-ref|algorithmRef)))
  let $merge-algorithm := $merge-algorithms => map:get($algorithm-name)
  return
    map:entry("mergeAlgorithm",
        if (fn:exists($merge-algorithm)) then
          $merge-algorithm
        else
          merge-impl:standard#3)
      => map:with("mergeAlgorithmName", fn:head(($algorithm-name,"standard")[. ne '']))
      => map:with("mergeRule", $merge-rule)
      => map:with("namespaces", $namespaces)
};

declare function merge-impl:build-merge-options-reference($merge-options as node()?) {
  let $merge-options-uri := $merge-options ! xdmp:node-uri(.)
  return
    if (fn:exists($merge-options-uri)) then
      $merge-options-uri
    else if (fn:exists($merge-options)) then
      xdmp:base64-encode(xdmp:describe($merge-options, (), ()))
    else
      null-node{}
};

declare function merge-impl:build-target-collections($merge-options as node()?) {
  let $target-collections := $merge-options/(*:algorithms/*:collections|targetCollections)
  let $on-no-match := $target-collections/(merging:on-no-match|onNoMatch)
  let $on-archive := $target-collections/(merging:on-archive|onArchive)
  let $on-merge := $target-collections/(merging:on-merge|onMerge)
  let $on-notification := $target-collections/(merging:on-notification|onNotification)
  return
    map:entry("onNoMatch", $on-no-match)
        => map:with("onArchive", $on-archive)
        => map:with("onMerge", $on-merge)
        => map:with("onNotification", $on-notification)

};

(:
 : Calculate information for each of the merge rules. Returns
 : @param $default-merge-rule-info  The information for the default merge rule.
 : @param $merge-rules Part of the options specifying the specific merge rules
 : @param $property-defs Part of the options defining properties (legacy options not tied to emtity type)
 : @param $merge-options  Options specifying how documents will be merged
 : @param $target-entity-type-def  The entity type definition
 : @param $target-entity-properties-info  Information about each of the properties in an Entity Type
 : @param $property-names-to-values map:map Functions by property names that given a document will return the properties
 : @param $merge-algorithms map:map of algorithms defined in the merge options
 : @param namespaces map:map of prefixes to namespace URIs
 : @return map:map* of information for each merge rule
 :)
declare function merge-impl:build-merge-rules-info(
  $default-merge-rule-info,
  $merge-rules,
  $property-defs,
  $merge-options,
  $target-entity-type-def,
  $target-entity-properties-info,
  $property-names-to-values,
  $merge-algorithms,
  $namespaces
) {
  let $explicit-merge-rules :=
    for $merge-rule in $merge-rules
    let $merge-rule := merge-impl:expand-merge-rule($merge-options, $merge-rule)
    let $property-name := fn:string(fn:head($merge-rule/(@property-name|propertyName|entityPropertyPath|documentXPath)))
    let $property-def := $property-defs/(merging:property|properties)[(@name|name) = $property-name]
    let $path := fn:head((
        $merge-rule/documentXPath,
        $property-def/(@path|path),
        $target-entity-properties-info ! map:get(., $property-name) ! map:get(., "pathExpression")
      ))
    let $property-qname := fn:head((
        $property-def[localname] ! fn:QName(fn:string(./namespace), fn:string(./localname)),
        $property-def[@localname] ! fn:QName(fn:string(./@namespace), fn:string(./@localname)),
        $target-entity-type-def ! fn:QName(fn:string(./namespaceURI), $property-name)
      ))
    let $to-property-values := $property-names-to-values => map:get($property-name)
    let $algorithm-name := if (fn:exists($merge-rule/mergeFunction[fn:normalize-space(.)])) then
                              fn:string($merge-rule/mergeModulePath) || ":" || fn:string($merge-rule/mergeFunction)
                          else
                              fn:string(fn:head($merge-rule/(@algorithm-ref|algorithmRef)))
    let $merge-algorithm := $merge-algorithms => map:get($algorithm-name)
    return (
      xdmp:trace($const:TRACE-MERGE-RESULTS, "Explicit merge for property: " || $property-name),
      map:entry("propertyName", $property-name)
        => map:with("propertyQName", $property-qname)
        => map:with("documentToValuesFunction", $to-property-values)
        => map:with("mergeAlgorithm", $merge-algorithm)
        => map:with("mergeAlgorithmName", $algorithm-name)
        => map:with("mergeRule", $merge-rule)
        => map:with("path", $path)
        => map:with("namespaces", fn:head(($merge-rule/namespaces ! xdmp:from-json(.), $namespaces)))
    )
  let $implicit-merge-rules :=
    for $top-level-property-name in map:keys($property-names-to-values)[fn:not(fn:contains(.,"."))]
    let $prefix := $top-level-property-name || "."
    where fn:empty($explicit-merge-rules[map:get(., "propertyName")[. = $top-level-property-name or fn:starts-with(., $prefix)]])
    return
      let $path := $target-entity-properties-info ! map:get(., $top-level-property-name) ! map:get(., "pathExpression")
      let $to-property-values := $property-names-to-values => map:get($top-level-property-name)
      let $merge-rule := merge-impl:expand-merge-rule($merge-options, ())
      let $property-qname := fn:QName(fn:string($target-entity-type-def/namespaceURI), $top-level-property-name)
      return (
        xdmp:trace($const:TRACE-MERGE-RESULTS, "Implicit merge for top-level property: " || $top-level-property-name),
        map:new((
          $default-merge-rule-info,
          map:entry("propertyName", $top-level-property-name)
            => map:with("path", $path)
            => map:with("propertyQName", $property-qname)
            => map:with("documentToValuesFunction", $to-property-values)
            => map:with("mergeRule", $merge-rule)
        ))
      )
  return ($explicit-merge-rules, $implicit-merge-rules)
};

declare function merge-impl:build-prefix-map($source)
{
  if ($source instance of element()) then
    map:new(
      for $prefix in ($source ! fn:in-scope-prefixes(.))
      where fn:not($prefix = "")
      return
        map:entry($prefix, fn:namespace-uri-for-prefix($prefix, $source))
    )
  else
    map:map()
};

(:
 : Get a function reference to the default merging function. The function must
 : be in the http://marklogic.com/smart-mastering/survivorship/merging
 : namespace.
 : @param $name  localname of the function to be applied
 : @param $arity  number of parameters the function takes
 : @return function reference if found
 :)
declare function merge-impl:default-function-lookup(
  $name as xs:string?,
  $arity as xs:int
) as function(*)?
{
  fn:function-lookup(
    fn:QName(
      "http://marklogic.com/smart-mastering/survivorship/merging",
      if (fn:exists($name[. ne ""])) then
        $name
      else
        "standard"
    ),
    $arity
  )
};

(:
 : Based on the merging options, this is a map from the algorithm names to the
 : corresponding function references.
 : @param $algorithms nodes with function information in the various formats
 : @return map pointing from name strings to function references
 :)
declare function merge-impl:build-merging-map(
  $algorithms as node()*
) as map:map
{
    map:new((
      for $algorithm as node() in $algorithms
      let $name as xs:string? := $algorithm/(@name|name) ! fn:string(.)
      let $function-name as xs:string := fn:string($algorithm/(@function|function|mergeFunction))
      let $module-namespace as xs:string := fn:string($algorithm/(@namespace|namespace|mergeModuleNamespace))
      let $module-path as xs:string := fn:string($algorithm/(@at|at|mergeModulePath))
      return
        map:entry(
            if (fn:exists($name)) then
              $name
            else
              $module-path || ":" || $function-name,
            fun-ext:function-lookup(
                $function-name,
                $module-namespace,
                $module-path,
                merge-impl:default-function-lookup(?, 3)
            )
        )
    ))
};

(:
 : Take in a merge rule and if doesn't exist search for a default merge from the options.
 : Also, look for any referenced merge strategies and pull in the properties from the strategy.
 :
 : @param $options node() the entire merge options
 : @param $merge-details node the element or object-node describing how a merge should occur
 : @return $merge-details node the element or object-node with details filled in from referenced strategy
 :)
declare function merge-impl:expand-merge-rule(
  $options as node(),
  $merge-details as node()?
) as node()?
{
  let $merge-details :=
    if (fn:exists($merge-details)) then
      $merge-details
    else
      $options/*:merging/(merging:merge|self::object-node())[(@default|default)][fn:head(@default|default) cast as xs:boolean]
  let $strategy-name := $merge-details/(@strategy|strategy|mergeStrategyName)
  return
    if (fn:exists($strategy-name)) then
      let $strategy := $options/(merging:merging/merging:merge-strategy|mergeStrategies)[(@name|name|strategyName) eq $strategy-name]
      return
        if ($merge-details instance of object-node()) then
          xdmp:to-json(
            fn:fold-left(
              function($json-obj, $node-name) {
                $json-obj => map:with(fn:string($node-name), fn:head(($merge-details/*[fn:node-name() eq $node-name],$strategy/*[fn:node-name() eq $node-name])))
              },
              json:object(),
              fn:distinct-values(($strategy/*, $merge-details/*) ! fn:node-name())
            )
          )/object-node()
        else
          element merging:merge {
            for $node-name in fn:distinct-values(($strategy/@*, $merge-details/@*) ! fn:node-name())
            return fn:head(($merge-details/@*[fn:node-name() eq $node-name],$strategy/@*[fn:node-name() eq $node-name])),
            for $node-name in fn:distinct-values(($strategy/*, $merge-details/*) ! fn:node-name())
            return fn:head(($merge-details/*[fn:node-name() eq $node-name],$strategy/*[fn:node-name() eq $node-name]))
          }
    else
      $merge-details
};