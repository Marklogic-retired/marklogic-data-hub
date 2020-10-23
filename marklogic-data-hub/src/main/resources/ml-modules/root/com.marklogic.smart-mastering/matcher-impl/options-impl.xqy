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
  at  "/com.marklogic.smart-mastering/algorithms/base.xqy",
    "/com.marklogic.smart-mastering/algorithms/standard-reduction.xqy";
import module namespace coll = "http://marklogic.com/smart-mastering/collections"
  at "/com.marklogic.smart-mastering/impl/collections.xqy";
import module namespace config = "http://marklogic.com/data-hub/config"
  at "/com.marklogic.hub/config.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace es-helper = "http://marklogic.com/smart-mastering/entity-services"
  at "/com.marklogic.smart-mastering/sm-entity-services.xqy";
import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";
import module namespace json="http://marklogic.com/xdmp/json"
  at "/MarkLogic/json/json.xqy";
import module namespace util-impl = "http://marklogic.com/smart-mastering/util-impl"
  at "/com.marklogic.smart-mastering/impl/util.xqy";

declare namespace es = "http://marklogic.com/entity-services";
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
      config:get-default-data-hub-permissions(),
      ($const:OPTIONS-COLL, $const:MATCH-OPTIONS-COLL, $const:ALGORITHM-COLL)
    )
  )
};

(: Convert JSON match options to XML :)
declare function opt-impl:options-from-json($options-json)
{
  let $options-root := $options-json/options
  return
    element matcher:options {
      if (fn:exists($options-root/targetEntity)) then
        element matcher:target-entity {fn:string($options-root/targetEntity)}
      else (),
      if (fn:exists($options-root/dataFormat)) then
        element matcher:data-format {fn:string($options-root/dataFormat)}
      else (),
      element matcher:property-defs {
        for $property in $options-root/propertyDefs/(properties|property)
        return
          element matcher:property {
            attribute {"namespace"} {fn:string($property/namespace)},
            attribute localname {fn:string($property/localname)},
            attribute name {fn:string($property/name)},
            $property/indexReferences ! cts:reference-parse(.)
          }
      },
      element matcher:collections {
        if (fn:exists($options-root/collections/content[. instance of null-node()])) then
          element matcher:content {attribute none {"true"}}
        else
          for $content in $options-root/collections/content
          return
            element matcher:content {fn:string($content)}
      },
      element matcher:algorithms {
        for $algorithm in $options-root/(array-node("algorithms")/object-node()|algorithms/algorithm)
        return
          element matcher:algorithm {
            attribute name { fn:string($algorithm/name) },
            if (fn:exists($algorithm/function)) then
              attribute function {fn:string($algorithm/function) }
            else (),
            if (fn:exists($algorithm/namespace)) then
              attribute {"namespace"} { fn:string($algorithm/namespace) }
            else (),
            if (fn:exists($algorithm/at)) then
              attribute at { fn:string($algorithm/at) }
            else ()
          }
      },
      element matcher:scoring {
        json:transform-from-json(object-node { "scoring": $options-root/scoring }, $opt-impl:options-json-config)/*
      },
      element matcher:actions {
        for $action in $options-root/(array-node("actions")/object-node()|actions/action)
        return
          element matcher:action {
            attribute name { fn:string($action/name) },
            if (fn:exists($action/function)) then
              attribute function {fn:string($action/function) }
            else (),
            if (fn:exists($action/namespace)) then
              attribute namespace { fn:string($action/namespace) }
            else (),
            if (fn:exists($action/at)) then
              attribute at { fn:string($action/at) }
            else (),
            for $node in ($action/* except $action/(name|function|namespace|at))
            return
              json:transform-from-json(object-node { fn:node-name($node): $node }, $opt-impl:options-json-config)
          }
      },
      element matcher:thresholds {
        for $threshold in $options-root/(array-node("thresholds")/object-node()|thresholds/threshold)
        return
          element matcher:threshold {
            attribute label { fn:string($threshold/label) },
            attribute above {fn:string($threshold/above) },
            if (fn:exists($threshold/action)) then
              attribute action { fn:string($threshold/action) }
            else (),
            for $node in ($threshold/* except $threshold/(label|above|action))
            return
              json:transform-from-json(object-node { fn:node-name($node): $node }, $opt-impl:options-json-config)
          }
      },
      if (fn:exists($options-root/tuning/maxScan)) then
        element matcher:tuning {
          element matcher:max-scan {fn:string($options-root/tuning/maxScan)}
        }
      else ()
    }
};

declare function opt-impl:options-to-json($options-xml as element(matcher:options)?)
  as object-node()?
{
  if (fn:exists($options-xml)) then
    xdmp:to-json(
      map:entry(
      "options", map:new((
        if (fn:exists($options-xml/matcher:target-entity)) then
          map:entry("targetEntity", fn:string($options-xml/matcher:target-entity))
        else (),
        if (fn:exists($options-xml/matcher:data-format)) then
          map:entry("dataFormat", fn:string($options-xml/matcher:data-format))
        else (),
        map:entry(
          "propertyDefs",
          map:entry("properties",
            array-node {
              for $property in $options-xml/matcher:property-defs/matcher:property
              return
                xdmp:to-json(map:new((
                  map:entry("namespace", fn:string($property/@namespace)),
                  map:entry("localname", fn:string($property/@localname)),
                  map:entry("name", fn:string($property/@name)),
                  if (fn:exists($property/(cts:json-property-reference|cts:element-reference|cts:path-reference|cts:field-reference))) then
                    map:entry("indexReferences",
                      array-node {
                        $property/(cts:json-property-reference|cts:element-reference|cts:path-reference|cts:field-reference) ! cts:reference-parse(.)
                      }
                    )
                  else ()
                )))/object-node()
            }
          )
        ),
        map:entry("algorithms",
          array-node {
            for $algorithm in $options-xml/matcher:algorithms/matcher:algorithm
            return
              xdmp:to-json(map:new((
                map:entry("name", fn:string($algorithm/@name)),
                if (fn:exists($algorithm/@function)) then
                  map:entry("function", fn:string($algorithm/@function))
                else (),
                if (fn:exists($algorithm/@namespace)) then
                  map:entry("namespace", fn:string($algorithm/@namespace))
                else (),
                if (fn:exists($algorithm/@at)) then
                  map:entry("at", fn:string($algorithm/@at))
                else ()
              )))/object-node()
          }
        ),
        if (fn:exists($options-xml/matcher:collections/matcher:content)) then
          map:entry("collections",
            map:entry("content",
              if ($options-xml/matcher:collections/matcher:content/@none = "true") then
                null-node {}
              else
                array-node {
                  $options-xml/matcher:collections/matcher:content ! fn:string(.)
                }
            )
          )
        else (),
        map:entry("scoring",
          xdmp:to-json(
              json:transform-to-json-object($options-xml/matcher:scoring, $opt-impl:options-json-config)
          )/scoring
        ),
        map:entry("actions",
          array-node {
            if (fn:exists($options-xml/matcher:actions)) then
              xdmp:to-json(
                json:transform-to-json-object($options-xml/matcher:actions, $opt-impl:options-json-config)
              )/actions/action
            else ()
          }
        ),
        map:entry("thresholds",
          array-node {
            if (fn:exists($options-xml/matcher:thresholds)) then
              xdmp:to-json(
                json:transform-to-json-object($options-xml/matcher:thresholds, $opt-impl:options-json-config)
              )/thresholds/threshold
            else ()
          }
        ),
        if (fn:exists($options-xml/matcher:tuning)) then
          map:entry("tuning",
            xdmp:to-json(
                json:transform-to-json-object($options-xml/matcher:tuning, $opt-impl:options-json-config)
            )/tuning
          )
        else ()
      ))
      )
    )/object-node()
  else ()
};

declare variable $_cached-compiled-match-options as map:map := map:map();

declare function opt-impl:compile-match-options(
  $match-options as item() (: as node()|json:object :),
  $original-minimum-threshold as xs:double?
) {
  opt-impl:compile-match-options(
    $match-options,
    $original-minimum-threshold,
    fn:false()
  )
};

(:
 : Calculate queries once per unique match options in request to reduce repeat logic
 : @param $match-options  Options specifying how documents will be matched
 : @param $minimum-threshold  Minimum threshold for search results to meet
 : @param $only-warn-on-error  boolean indicating if errors should be returned rather than thrown
 : @return map:map with compiled information about match options
 :)
declare function opt-impl:compile-match-options(
  $match-options as item() (: as node()|json:object :),
  $original-minimum-threshold as xs:double?,
  $only-warn-on-error as xs:boolean
) {
  let $match-options := if ($match-options instance of json:object) then
      xdmp:to-json($match-options)/object-node()
    else
      $match-options
  let $match-options := if (fn:exists($match-options/(*:options|matchOptions))) then
      $match-options/(*:options|matchOptions)
    else
      $match-options
  let $cache-id :=
      xdmp:md5(xdmp:describe($match-options, (), ())) || "|min-threshold:" || $original-minimum-threshold
  return
  if (map:contains($_cached-compiled-match-options, $cache-id)) then
    map:get($_cached-compiled-match-options, $cache-id)
  else
    let $_trace := if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
        xdmp:trace($const:TRACE-MATCH-RESULTS, "compiling match options: " || xdmp:to-json-string($match-options))
      else
        ()
    let $message-output :=
      if ($only-warn-on-error) then
        map:map()
      else ()
    let $ordered-thresholds :=
      for $threshold in opt-impl:normalize-thresholds($match-options/*:thresholds, $match-options)
      order by $threshold/score cast as xs:decimal descending
      return $threshold
    let $lowest-threshold-score := fn:head(fn:reverse($ordered-thresholds))/score
    let $minimum-threshold as xs:double :=
      if (fn:empty($original-minimum-threshold)) then
        $lowest-threshold-score
      else
        $original-minimum-threshold
    let $target-entity := $match-options/(*:target-entity|targetEntity|targetEntityType) ! fn:string(.)
    let $target-entity-def := es-helper:get-entity-def($target-entity)
    let $match-rulesets := $match-options/(*:scoring|matchRulesets)/(*:add|*:expand|*:reduce[fn:empty(parent::matchRulesets)]|self::matchRulesets)
    let $max-property-score := fn:max(($match-rulesets/(@weight|weight) ! fn:number(.)))
    let $algorithms := algorithms:build-algorithms-map((
      (: old algorithm format :)
      $match-options/*:algorithms/*:algorithm,
      (: new algorithm format :)
      $match-rulesets/matchRules[matchType eq "custom"]
    ))
    let $score-ratio :=
      if ($max-property-score le 64) then
        1.0
      else
        64.0 div $max-property-score
    let $property-names-to-values :=
      util-impl:properties-to-values-functions(
        ($match-rulesets[@property-name|propertyName],$match-rulesets/matchRules),
        $match-options/(*:property-defs|propertyDefs),
        $target-entity-def/entityIRI,
        (: Don't need all property value queries :) fn:false(),
        $message-output
      )
    let $queries :=
      for $rule-set in $match-rulesets
      let $local-name := fn:local-name-from-QName(fn:node-name($rule-set))
      let $is-complex-rule := $local-name eq "matchRulesets"
      let $match-rules :=
        if ($is-complex-rule) then
          $rule-set/matchRules
        else
          $rule-set
      let $is-reduce :=  ($is-complex-rule and $rule-set/reduce = fn:true()) or $local-name eq "reduce"
      let $abs-weight := fn:abs(fn:number($rule-set/(@weight|weight)))
      let $weight := if ($is-reduce) then -$abs-weight else $abs-weight
      let $rules-count := fn:count($match-rules)
      let $match-queries :=
            for $match-rule in $match-rules
            let $weight := $weight div $rules-count
            let $type := if ($is-complex-rule) then
                fn:string($match-rule/matchType)
              else
                $local-name
            let $full-property-node :=
                if ($is-complex-rule) then
                  $match-rule/(entityPropertyPath|documentXPath)
                else
                  $match-rule/(@property-name|propertyName|((*:all-match|allMatch)/*:property))
            let $full-property-name := fn:normalize-space(fn:string-join($full-property-node, ", "))
            let $algorithm-ref := if ($is-complex-rule) then
                if ($type eq "custom") then
                  $match-rule/algorithmModulePath || ":" || $match-rule/algorithmFunction
                else
                  $type
              else
                $match-rule/(@algorithm-ref|algorithmRef)
            let $base-values-query :=
              if ($type = ("add","exact")) then
                function ($values) {
                  helper-impl:property-name-to-query($match-options, $full-property-name)($values, $weight)
                }
              else if ($type = ("expand","custom",$algorithm-ref)) then
                let $custom-algorithm := map:get($algorithms, $algorithm-ref)
                let $algorithm := if (fn:empty($custom-algorithm)) then
                    algorithms:default-function-lookup($type, 3)
                  else
                    $custom-algorithm
                return
                  if (fn:exists($algorithm)) then
                    algorithms:execute-algorithm($algorithm, ?, $match-rule, $match-options)
                  else
                    util-impl:handle-option-messages("error", "Function for the match query not found:" || fn:string($algorithm-ref), $message-output)
              else if ($type eq "reduce") then
                let $algorithm := $algorithm-ref ! map:get($algorithms, .)
                return
                  if (fn:exists($algorithm)) then
                      algorithms:execute-algorithm($algorithm, ?, $match-rule, $match-options)
                  else
                      algorithms:standard-reduction-query(?, $match-rule, $match-options)
              else
                util-impl:handle-option-messages("error", "An invalid match type was specified: "|| xdmp:describe($match-rule, (), ()), $message-output)
            return map:new((
              map:entry("propertyName",$full-property-name),
              map:entry("type",$type),
              map:entry("algorithm", $algorithm-ref),
              map:entry("weight",$weight),
              map:entry(
                "valuesToQueryFunction",
                $base-values-query
              )
            ))
      order by $weight descending
      return
        map:new((
          map:entry("matchRulesetId", sem:uuid-string()),
          map:entry("weight",$weight),
          map:entry("isReduce",$is-reduce),
          map:entry("name",
            if ($is-complex-rule and fn:exists($rule-set/name)) then
              fn:string($rule-set/name)
            else
              let $first-match-query := fn:head($match-queries)
              return
                map:get($first-match-query, "propertyName") || " - " || map:get($first-match-query, "type")
          ),
          map:entry("matchQueries", $match-queries)
        ))
    let $positive-queries := $queries[fn:not(map:get(., "isReduce"))]
    let $negative-queries := $queries[map:get(., "isReduce")]
    let $minimum-threshold-positive-combinations := opt-impl:minimum-threshold-combinations($positive-queries, $minimum-threshold)
    let $minimum-threshold-combinations :=
      if (fn:empty($negative-queries)) then
        $minimum-threshold-positive-combinations
      else
        for $minimum-threshold-positive-combination in $minimum-threshold-positive-combinations
        let $combo-weight := $minimum-threshold-positive-combination => map:get("weight")
        (: get the combinations of reduce weights that would push the document below minimum threshold  :)
        let $negative-combinations := opt-impl:minimum-threshold-combinations($negative-queries, $combo-weight - $minimum-threshold)
        return
          $minimum-threshold-positive-combination
            => map:with("notQueries", $negative-combinations)

    let $compiled-match-options := map:new((
        map:entry("normalizedOptions", $match-options),
        map:entry("minimumThreshold", $minimum-threshold),
        (: Ensure we're using the full IRI in the compiled options :)
        map:entry("targetEntityType", $target-entity-def/entityIRI ! fn:string(.)),
        map:entry("scoreRatio", $score-ratio),
        map:entry("algorithms", $algorithms),
        map:entry("queries", $queries),
        map:entry("orderedThresholds", $ordered-thresholds),
        map:entry("minimumThresholdCombinations", $minimum-threshold-combinations),
        map:entry("propertyNamesToValues", $property-names-to-values),
        map:entry("baseContentQuery",
          if (fn:exists($target-entity)) then
            cts:or-query((
              cts:json-property-scope-query(
                "info",
                cts:json-property-value-query("title", fn:string($target-entity-def/entityTitle), (), 0)
              ),
              cts:element-query(
                xs:QName("es:info"),
                cts:element-value-query(xs:QName("es:title"), fn:string($target-entity-def/entityTitle), (), 0)
              )
            ))
          else
            opt-impl:build-collection-query(coll:content-collections($match-options))
        )
      ))
    let $cache-ids := (
      $cache-id,
      if (fn:empty($original-minimum-threshold)) then
        $cache-id || $minimum-threshold
      else if ($original-minimum-threshold = $lowest-threshold-score) then
        fn:replace($cache-id, fn:replace(fn:string($original-minimum-threshold), "\.", "\\.") || "$", "")
      else ()
    )
    return (
      if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
        xdmp:trace($const:TRACE-MATCH-RESULTS, "Compiled match options: " || xdmp:to-json-string($compiled-match-options))
      else (),
      $compiled-match-options,
      for $cache-id in $cache-ids
      return (
        if (xdmp:trace-enabled($const:TRACE-MATCH-RESULTS)) then
          xdmp:trace($const:TRACE-MATCH-RESULTS, "Caching match options with key: " || $cache-id)
        else (),
        map:put($_cached-compiled-match-options, $cache-id, $compiled-match-options)
      )
    )
};

declare function opt-impl:normalize-thresholds($thresholds as node()*, $match-options as node()) {
  if (fn:exists($thresholds[thresholdName])) then
    $thresholds
  else
    for $threshold in $thresholds/*:threshold
    let $action := fn:string($threshold/(@action|*:action))
    let $action-details :=
      if ($action = ("notify", "merge")) then
        ()
      else
        $match-options/*:actions/*:action[(@name|name) = $action]
    return xdmp:to-json(
        map:new((
          map:entry("thresholdName", fn:string($threshold/(@label|*:label))),
          map:entry("score", fn:number($threshold/(@above|*:above))),
          if (fn:exists($action-details)) then (
            map:entry("action", "custom"),
            map:entry("actionModulePath", fn:string($action-details/(@at|at))),
            map:entry("actionModuleNamespace", fn:string($action-details/(@namespace|namespace))),
            map:entry("actionModuleFunction", fn:string($action-details/(@function|function)))
          ) else (
            map:entry("action", $action)
          )
        ))
      )/object-node()
};

declare function opt-impl:build-collection-query($collections as xs:string*)
{
  if (fn:empty($collections)) then
    ()
  else if (fn:count($collections) > 1) then
    cts:and-query($collections ! cts:collection-query(.))
  else
    cts:collection-query($collections)
};
(:
 : Identify a sequence of queries whose scores add up to the $threshold. A document must match at least one of these
 : queries in order to be returned as a potential match.
 :
 : @param $query-results  a sequence of queries with weights
 : @param $threshold  minimum weighted-score for a match to be relevant
 : @return a sequence of queries; a document that matches any of these will have at least $threshold as a score
 :)
declare function opt-impl:minimum-threshold-combinations($query-results, $threshold as xs:double)
  as map:map*
{
  (: Each of $queries-ge-threshold has a weight high enough to hit the $threshold :)
  let $queries-ge-threshold := $query-results[(. => map:get("weight")) ge $threshold]
  let $queries-lt-threshold := $query-results[(. => map:get("weight")) lt $threshold]
  return (
    $queries-ge-threshold ! (map:entry("queries", .) => map:with("weight", map:get(., "weight"))),
    opt-impl:filter-for-required-queries($queries-lt-threshold, 0, $threshold, ())
  )
};

(:
 : Find combinations of queries whose weights are individually below the threshold, but combined are above it.
 :
 : @param $remaining-queries  sequence of queries ordered by their weights, descending
 : @param $combined-weight
 : @param $threshold  the target value
 : @param $accumulated-queries  accumlated sequence, building up to see whether it can hit the $threshold.
 : @return a sequence of cts:and-queries, one for each required filter
 : note: return type left off to allow for tail recursion optimization.
 :)
declare function opt-impl:filter-for-required-queries(
  $remaining-queries as map:map*,
  $combined-weight,
  $threshold,
  $accumulated-queries as map:map*
)
{
  if ($threshold eq 0 or $combined-weight ge $threshold) then (
    if (fn:exists($accumulated-queries)) then
      map:entry(
        "queries",
        $accumulated-queries
      ) =>
        map:with("weight", fn:sum($accumulated-queries ! map:get(., "weight")))
    else
      ()
  )
  else
    for $query at $pos in $remaining-queries
    let $query-weight := fn:head(($query => map:get("weight"), 1))
    let $new-combined-weight := $combined-weight + $query-weight
    return (
      opt-impl:filter-for-required-queries(
        fn:subsequence($remaining-queries, $pos + 1),
        $new-combined-weight,
        $threshold,
        ($accumulated-queries, $query)
      )
    )
};