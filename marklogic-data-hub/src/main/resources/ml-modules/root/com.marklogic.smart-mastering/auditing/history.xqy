xquery version "1.0-ml";

(:
 : This library holds functions related to property history. When documents get
 : merged, Smart Mastering traces where the values for each merged property
 : came from.
 :)

module namespace history = "http://marklogic.com/smart-mastering/auditing/history";

import module namespace auditing = "http://marklogic.com/smart-mastering/auditing"
  at "base.xqy";

declare namespace prov = "http://www.w3.org/ns/prov#";

declare function history:property-history(
  $doc-uri as xs:string
)
{
  history:property-history($doc-uri, (), ())
};

declare function history:property-history(
  $doc-uri as xs:string,
  $properties as xs:string*
)
{
  history:property-history($doc-uri, $properties, ())
};

declare function history:property-history(
  $doc-uri as xs:string,
  $properties as xs:string*,
  $property-values as xs:string*
) as map:map
{
  let $document-auditing := auditing:auditing-receipts-for-doc-uri($doc-uri)
  let $properties :=
    if (fn:exists($properties)) then
      $properties
    else
      fn:distinct-values($document-auditing/prov:hadMember/prov:entity/prov:type)
  return
    map:new(
      for $property in $properties
      return
        map:entry($property,
          map:new((
            let $prop-details := $document-auditing/prov:hadMember/prov:entity[prov:type eq $property]
            let $distinct-prop-values :=
              if (fn:exists($property-values)) then
                $property-values
              else
                fn:distinct-values($prop-details/prov:value)
            for $prop-val in $distinct-prop-values
            let $sources := $prop-details[prov:value eq $prop-val]
            where fn:exists($sources)
            return
              map:entry($prop-val,
                map:new((
                  map:entry("count", fn:count($sources)),
                  map:entry("details", (
                    for $source in $sources
                    let $entity-id := $source/@prov:id
                    let $influencers := $document-auditing
                      /prov:wasInfluencedBy[prov:influencee/@prov:ref = $entity-id]
                      /prov:influencer/@prov:ref
                    return
                      map:new((
                        map:entry("propertyID",fn:string($entity-id)),
                        map:entry("sourceName",fn:substring-before($source/prov:label, ":"||$property)),
                        map:entry("sourceLocation", fn:string($source/prov:location)),
                        map:entry("influencers",
                          for $influencer in $influencers
                          return
                            map:new((
                              for $influencer-part in fn:tokenize($influencer, ";")
                              let $parts := fn:tokenize($influencer-part, ":")
                              return
                                map:entry($parts[1], $parts[2])
                            ))
                        )
                      ))
                  )
                )
              ))
          ))
        )
      )
    )
};

(:
 : Return a structure that shows the merging and unmerging history of this document.
 :)
declare function history:document-history($doc-uri as xs:string)
  as document-node()
{
  xdmp:to-json(
    object-node {
      'activities':
        array-node {
          for $audit in auditing:auditing-receipts-for-doc-history($doc-uri)
          let $time := xs:dateTime($audit/prov:wasGeneratedBy/prov:time)
          (: order most recent to oldest :)
          order by $time descending
          return
            object-node {
              "auditUri": xdmp:node-uri($audit),
              "type": fn:string($audit/prov:activity/prov:type),
              "label": fn:string($audit/prov:activity/prov:label),
              "resultUri": fn:string($audit/auditing:new-uri),
              "wasDerivedFromUris": array-node { $audit/auditing:previous-uri ! fn:string(.) },
              "time": fn:string($time)
            }
        }
    }
  )
};

declare function history:normalize-value-for-tracing($value as node())
{
  let $nodes := $value//(text()|number-node()|boolean-node())
  let $nodes := if (fn:exists($nodes)) then
    $nodes
  else
    $value
  return fn:normalize-space(
    fn:string-join(
      for $node in $nodes
      order by xdmp:key-from-QName(fn:node-name($node)), xdmp:key-from-QName(fn:node-name($node/..))
      return $node/fn:string(),
      " "
    )
  )
};
