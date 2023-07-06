(:
 Copyright (c) 2020 MarkLogic Corporation
:)
xquery version "1.0-ml";

module namespace esi = "http://marklogic.com/entity-services-impl";
declare namespace es = "http://marklogic.com/entity-services";
declare namespace tde = "http://marklogic.com/xdmp/tde";
declare namespace xq = "http://www.w3.org/2012/xquery";
declare namespace svrl="http://purl.oclc.org/dsdl/svrl";
declare namespace m="http://marklogic.com/entity-services/mapping";

import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";

import module namespace sch = "http://marklogic.com/xdmp/schematron"
       at "/MarkLogic/schematron/schematron.xqy";

import module namespace search = "http://marklogic.com/appservices/search" at "/MarkLogic/appservices/search/search.xqy";

import module namespace functx = "http://www.functx.com" at "/MarkLogic/functx/functx-1.0.1-nodoc.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";

(: declare option xdmp:mapping "false"; :)
declare option xq:require-feature "xdmp:three-one";


declare %private variable $esi:DEFAULT_BASE_URI := "http://example.org/";
declare %private variable $esi:MAX_TEST_INSTANCE_DEPTH := 2;
declare %private variable $esi:ENTITY_TYPE_COLLECTION := "http://marklogic.com/entity-services/models";

declare %private variable $esi:keys-to-element-names as map:map :=
    let $m := map:map()
    let $_ := map:put($m, "primaryKey", xs:QName("es:primary-key"))
    let $_ := map:put($m, "rangeIndex", xs:QName("es:range-index"))
    let $_ := map:put($m, "pathRangeIndex", xs:QName("es:path-range-index"))
    let $_ := map:put($m, "elementRangeIndex", xs:QName("es:element-range-index"))
    let $_ := map:put($m, "wordLexicon", xs:QName("es:word-lexicon"))
    let $_ := map:put($m, "namespacePrefix", xs:QName("es:namespace-prefix"))
    let $_ := map:put($m, "baseUri", xs:QName("es:base-uri"))
    let $_ := map:put($m, "$ref", xs:QName("es:ref"))
    let $_ := map:put($m, "$id", xs:QName("es:id"))
    let $_ := map:put($m, "$schema", xs:QName("es:schema"))
    return $m;

declare %private variable $esi:entity-services-prefix := "http://marklogic.com/entity-services#";

(: Note: the real schematron is in entity-services.sch
 : This is here as a fallback only.
 :)
declare %private variable $esi:model-schematron :=
    <iso:schema xmlns:iso="http://purl.oclc.org/dsdl/schematron" xml:lang="zxx">
      <iso:ns prefix="es" uri="http://marklogic.com/entity-services"/>
      <iso:pattern>
        <iso:rule context="es:model|/object-node()">
          <iso:assert test="count(es:info|info) eq 1" id="ES-INFOKEY">Model descriptor must contain exactly one info section.</iso:assert>
          <iso:assert test="count(es:definitions|definitions) eq 1" id="ES-DEFINITIONSKEY">Model descriptor must contain exactly one definitions section.</iso:assert>
        </iso:rule>
        <iso:rule context="es:info|info">
          <iso:assert test="count(es:title|title) eq 1" id="ES-TITLEKEY">"info" section must be an object and contain exactly one title declaration.</iso:assert>
          <iso:assert test="count(es:version|version) eq 1" id="ES-VERSIONKEY">"info" section must be an object and contain exactly one version declaration.</iso:assert>
          <iso:assert test="empty(es:base-uri|baseUri) or matches(es:base-uri|baseUri, '^[a-z]+:')" id="ES-BASEURI">If present, baseUri (es:base-uri) must be an absolute URI.</iso:assert>
          <iso:assert test="(title|es:title) castable as xs:NCName">Title must have no whitespace and must start with a letter.</iso:assert>
        </iso:rule>
        <iso:rule context="definitions|es:definitions"><iso:assert test="count(./*) ge 1" id="ES-DEFINITIONS">There must be at least one entity type in a model descriptor.</iso:assert>
        </iso:rule>
        <!-- XML version of primary key rule -->
        <iso:rule context="es:definitions/node()[es:primary-key]">
          <iso:assert test="count(./es:primary-key) eq 1" id="ES-PRIMARYKEY">For each Entity Type ('<iso:value-of select="xs:string(node-name(.))"/>'), only one primary key allowed.</iso:assert>
        </iso:rule>
        <!-- JSON version of primary key rule -->
        <iso:rule context="object-node()/*[primaryKey]">
          <iso:assert test="count(./primaryKey) eq 1" id="ES-PRIMARYKEY">For each Entity Type ('<iso:value-of select="xs:string(node-name(.))"/>'), only one primary key allowed.</iso:assert>
        </iso:rule>
        <iso:rule context="properties/*">
          <iso:assert test="if (./*[local-name(.) eq '$ref']) then count(./* except description) eq 1 else true()" id="ES-REF-ONLY">Property '<iso:value-of select="xs:string(node-name(.))"/>' has $ref as a child, so it cannot have a datatype.</iso:assert>
          <iso:assert test="if (not(./*[local-name(.) eq '$ref'])) then ./datatype else true()" id="ES-DATATYPE-REQUIRED">Property '<iso:value-of select="xs:string(node-name(.))"/>' is not a reference, so it must have a datatype.</iso:assert>
          <iso:assert test="if (exists(./node('$ref'))) then not(xs:string(node-name(.)) = xs:string(../../primaryKey)) else true()" id="ES-REF-NOT-PK">Property <iso:value-of select="xs:string(node-name(.))"/>: A reference cannot be primary key.</iso:assert>
<!--        </iso:rule>
        <iso:rule context="properties/*"> -->
          <iso:assert test="datatype|node('$ref')" id="ES-PROPERTY-IS-OBJECT">Property '<iso:value-of select="xs:string(node-name(.))"/>' must be an object with either "datatype" or "$ref" as a key.</iso:assert>
          <iso:assert test="not(xs:string(node-name(.)) = root(.)/definitions/*/node-name(.) ! xs:string(.))" id="ES-PROPERTY-TYPE-CONFLICT">Type names and property names must be distinct ('<iso:value-of select="xs:string(node-name(.))"/>').</iso:assert>
        </iso:rule>
        <!-- xml version of properties -->
        <iso:rule context="es:properties/*">
          <iso:assert test="if (empty(./es:ref)) then true() else not(local-name(.) = xs:string(../../es:primary-key))" id="ES-REF-NOT-PK">Property <iso:value-of select="local-name(.)"/>:  A reference cannot be primary key.</iso:assert>
          <iso:assert test="if (exists(./es:ref)) then count(./* except es:description) eq 1 else true()" id="ES-REF-ONLY">Property '<iso:value-of select="xs:string(node-name(.))"/>' has es:ref as a child, so it cannot have a datatype.</iso:assert>
          <iso:assert test="if (not(./*[local-name(.) eq 'ref'])) then ./es:datatype else true()" id="ES-DATATYPE-REQUIRED">Property '<iso:value-of select="xs:string(node-name(.))"/>' is not a reference, so it must have a datatype.</iso:assert>
          <iso:assert test="not(local-name(.) = root(.)/es:model/es:definitions/*/local-name(.))" id="ES-PROPERTY-TYPE-CONFLICT">Type names and property names must be distinct ('<iso:value-of select="xs:string(node-name(.))"/>')</iso:assert>
        </iso:rule>
        <iso:rule context="es:ref|text('$ref')">
          <iso:assert test="starts-with(xs:string(.),'#/definitions/') or matches(xs:string(.), '^[a-z]+:')" id="ES-REF-VALUE">es:ref (property '<iso:value-of select="xs:string(node-name(.))"/>') must start with "#/definitions/" or be an absolute IRI.</iso:assert>
          <iso:assert test="replace(xs:string(.), '.*/', '') castable as xs:NCName" id="ES-REF-VALUE"><iso:value-of select="."/>: ref value must end with a simple name (xs:NCName).</iso:assert>
          <iso:assert test="if (starts-with(xs:string(.), '#/definitions/')) then replace(xs:string(.), '#/definitions/', '') = (root(.)/definitions/*/node-name(.) ! xs:string(.), root(.)/es:model/es:definitions/*/local-name(.)) else true()" id="ES-LOCAL-REF">Local reference <iso:value-of select="."/> must resolve to local entity type.</iso:assert>
          <iso:assert test="if (not(contains(xs:string(.), '#/definitions/'))) then matches(xs:string(.), '^[a-z]+:') else true()" id="ES-ABSOLUTE-REF">Non-local reference <iso:value-of select="."/> must be a valid URI.</iso:assert>
        </iso:rule>
        <iso:rule context="es:datatype">
         <iso:assert test=". = ('anyURI', 'base64Binary' , 'boolean' , 'byte', 'date', 'dateTime', 'dayTimeDuration', 'decimal', 'double', 'duration', 'float', 'gDay', 'gMonth', 'gMonthDay', 'gYear', 'gYearMonth', 'hexBinary', 'int', 'integer', 'long', 'negativeInteger', 'nonNegativeInteger', 'nonPositiveInteger', 'positiveInteger', 'short', 'string', 'time', 'unsignedByte', 'unsignedInt', 'unsignedLong', 'unsignedShort', 'yearMonthDuration', 'iri', 'array')" id="ES-UNSUPPORTED-DATATYPE">Property '<iso:value-of select="xs:string(node-name(..))"/>' has unsupported datatype: <iso:value-of select='.'/>.</iso:assert>
         <iso:assert test="if (. eq 'array') then exists(../es:items/(es:datatype|es:ref)) else true()">Property <iso:value-of select="local-name(..)" /> is of type "array" and must contain a valid "items" declaration.</iso:assert>
         <iso:assert test="if (. eq 'array') then not(../es:items/es:datatype = 'array') else true()">Property <iso:value-of select="local-name(..)" /> cannot both be an "array" and have items of type "array".</iso:assert>
         <iso:assert test="not( . = ('base64Binary', 'hexBinary', 'duration', 'gMonthDay') and local-name(..) = ../../../(es:range-index|es:path-range-index|es:element-range-index)/text())"><iso:value-of select="."/> in property <iso:value-of select="local-name(..)" /> is unsupported for a range index.</iso:assert>
        </iso:rule>
        <iso:rule context="datatype">
         <iso:assert test=". = ('anyURI', 'base64Binary' , 'boolean' , 'byte', 'date', 'dateTime', 'dayTimeDuration', 'decimal', 'double', 'duration', 'float', 'gDay', 'gMonth', 'gMonthDay', 'gYear', 'gYearMonth', 'hexBinary', 'int', 'integer', 'long', 'negativeInteger', 'nonNegativeInteger', 'nonPositiveInteger', 'positiveInteger', 'short', 'string', 'time', 'unsignedByte', 'unsignedInt', 'unsignedLong', 'unsignedShort', 'yearMonthDuration', 'iri', 'array')" id="ES-UNSUPPORTED-DATATYPE">Property '<iso:value-of select="xs:string(node-name(.))"/>' has unsupported datatype: <iso:value-of select='.'/>.</iso:assert>
         <iso:assert test="if (. eq 'array') then exists(../items/*[string(node-name(.)) = ('$ref', 'datatype')]) else true()">Property <iso:value-of select="node-name(.)" /> is of type "array" and must contain a valid "items" declaration.</iso:assert>
         <iso:assert test="if (. eq 'array') then not(../items/datatype = 'array') else true()">Property <iso:value-of select="node-name(.)" /> cannot both be an "array" and have items of type "array".</iso:assert>
         <iso:assert test="not( . = ('base64Binary', 'hexBinary', 'duration', 'gMonthDay') and string(node-name(..)) = ../../../(pathRangeIndex|elementRangeIndex|rangeIndex))"><iso:value-of select="."/> in property <iso:value-of select="node-name(..)" /> is unsupported for a range index.</iso:assert>
        </iso:rule>
        <iso:rule context="es:collation|collation">
         <!-- this function throws an error for invalid collations, so must be caught in alidate function -->
         <iso:assert test="xdmp:collation-canonical-uri(.)">Collation <iso:value-of select="." /> is not valid.</iso:assert>
        </iso:rule>
        <iso:rule context="primaryKey">
         <iso:assert test="xs:string(.) = (../properties/*/node-name() ! xs:string(.))">Primary Key <iso:value-of select="." /> doesn't exist.</iso:assert>
        </iso:rule>
        <iso:rule context="primary-key">
         <iso:assert test="xs:string(.) = (../es:properties/*/local-name())">Primary Key <iso:value-of select="." /> doesn't exist.</iso:assert>
        </iso:rule>
        <iso:rule context="required">
         <iso:assert test="../../array-node()">value of property 'required' must be an array.</iso:assert>
         <iso:assert test="(.) = (../../properties/*/name())">"Required" property <iso:value-of select="." /> doesn't exist.</iso:assert>
        </iso:rule>
        <iso:rule context="pii">
         <iso:assert test="../../array-node()">value of property 'pii' must be an array.</iso:assert>
         <iso:assert test="(.) = (../../properties/*/name())">"pii" property <iso:value-of select="." /> doesn't exist.</iso:assert>
        </iso:rule>
        <iso:rule context="es:required">
         <iso:assert test="string(.) = (../es:properties/*/local-name())">"Required" property <iso:value-of select="." /> doesn't exist.</iso:assert>
        </iso:rule>
        <iso:rule context="es:pii">
         <iso:assert test="string(.) = (../es:properties/*/local-name())">"Pii" property <iso:value-of select="." /> doesn't exist.</iso:assert>
        </iso:rule>
        <iso:rule context="pathRangeIndex|elementRangeIndex|rangeIndex">
         <iso:assert test="(.) = (../../properties/*/name(.))">Range index property <iso:value-of select="." /> doesn't exist.</iso:assert>
        </iso:rule>
        <iso:rule context="es:range-index|es:path-range-index|es:element-range-index">
         <iso:assert test="string(.) = (../es:properties/*/local-name(.))">Range index property <iso:value-of select="." /> doesn't exist.</iso:assert>
        </iso:rule>
        <iso:rule context="wordLexicon">
         <iso:assert test="(.) = (../../properties/*/name(.))">Word lexicon property <iso:value-of select="." /> doesn't exist.</iso:assert>
        </iso:rule>
        <iso:rule context="es:word-lexicon">
         <iso:assert test="string(.) = (../es:properties/*/local-name(.))">Word lexicon property <iso:value-of select="." /> doesn't exist.</iso:assert>
        </iso:rule>
        <iso:rule context="namespace">
         <iso:assert test="matches(., '^[a-z]+:')">Namespace property must be a valid absolute URI.  Value is <iso:value-of select="." />.</iso:assert>
         <iso:assert test="../namespacePrefix">namespace <iso:value-of select="."/> has no namespacePrefix property.</iso:assert>
        </iso:rule>

        <iso:rule context="es:namespace">
         <iso:assert test="matches(., '^[a-z]+:')">Namespace property must be a valid absolute URI.  Value is <iso:value-of select="." />.</iso:assert>
         <iso:assert test="../es:namespace-prefix">namespace <iso:value-of select="."/> has no namespace-prefix property.</iso:assert>
        </iso:rule>

        <iso:rule context="namespacePrefix">
         <iso:assert test="../namespace">namespacePrefix <iso:value-of select="."/> has no namespace property.</iso:assert>
         <iso:assert test="not( matches( string(.), '^(es|json|xsi|xs|xsd|[xX][mM][lL])$' ) )">Namespace prefix <iso:value-of select="." /> is not valid.  It is a reserved pattern.</iso:assert>
        </iso:rule>

        <iso:rule context="es:namespace-prefix">
         <iso:assert test="../es:namespace">namespace-prefix  <iso:value-of select="."/> has no namespace property.</iso:assert>
         <iso:assert test="not( matches( string(.), '^(es|json|xsi|xs|xsd|[xX][mM][lL])$' ) )">Namespace prefix <iso:value-of select="." /> is not valid.  It is a reserved pattern.</iso:assert>
        </iso:rule>

        <iso:rule context="/">
         <iso:assert test="count(distinct-values( .//(namespace|es:namespace)
                                                    ! concat(../(namespacePrefix|es:namespace-prefix), .))) eq
                           count(distinct-values( .//(namespace|es:namespace ))) and
                           count(distinct-values( .//(namespace|es:namespace ))) eq
                           count(distinct-values( .//(namespacePrefix|es:namespace-prefix )))">Each prefix and namespace pair must be unique.</iso:assert>
        </iso:rule>
      </iso:pattern>
    </iso:schema>
;

declare %private function esi:model-validate-document(
    $model as document-node()
) as xs:string*
{
    try {
      try {
        sch:validate-precompiled($model, "/MarkLogic/entity-services/entity-services.sch")//svrl:text
      } catch ($e1) {
        if ($e1/error:code = ("XDMP-MODNOTFOUND","SVC-FILOPN")) then (
          (: This really shouldn't happen :)
          sch:validate($model, sch:compile($esi:model-schematron,map:map()=>map:with("diagnose",true())))//svrl:text
        ) else if ($e1/error:code eq "XDMP-COLLATION")
        then "There is an invalid collation in the model."
        else xdmp:rethrow()
      }
    }
    catch ($e) {
        if ($e/error:code eq "XDMP-COLLATION")
        then "There is an invalid collation in the model."
        else xdmp:rethrow()
    }
};

declare %private function esi:model-create(
    $model-descriptor
) as map:map
{
  let $tentative-result :=
    typeswitch ($model-descriptor)
    case document-node() return
        if ($model-descriptor/object-node())
        then xdmp:from-json($model-descriptor)
        else esi:model-from-xml($model-descriptor/node())
    case element() return
        esi:model-from-xml($model-descriptor)
    case object-node() return
        xdmp:from-json($model-descriptor)
    case map:map return $model-descriptor
    default return fn:error((), "ES-MODEL-INVALID")
  return
    if (esi:is-modern-model($tentative-result))
    then $tentative-result
    else esi:modernize($tentative-result)
};

declare function esi:model-validate(
    $model-descriptor
) as map:map
{
  let $errors :=
    typeswitch ($model-descriptor)
      case document-node() return
        esi:model-validate-document($model-descriptor)
      case element() return
        esi:model-validate-document(document { $model-descriptor } )
      case object-node() return
        esi:model-validate-document(document { $model-descriptor } )
      case map:map return
        esi:model-validate-document(xdmp:to-json($model-descriptor))
      default return fn:error((), "ES-MODEL-BADFORMAT")
  return
    if ($errors)
    then fn:error((), "ES-MODEL-INVALID", string-join($errors," "))
    else esi:model-create($model-descriptor)
};


declare function esi:model-graph-iri(
    $model as map:map
) as sem:iri
{
    let $info := map:get($model, "info")
    let $base-uri-prefix := esi:resolve-base-uri($info)
    return
    sem:iri(
        concat( $base-uri-prefix,
               map:get($info, "title"),
               "-" ,
               map:get($info, "version")))
};

declare function esi:model-graph-prefix(
    $model as map:map
) as sem:iri
{
    let $info := map:get($model, "info")
    let $base-uri-prefix := esi:resolve-base-prefix($info)
    return
    sem:iri(
        concat( $base-uri-prefix,
               map:get($info, "title"),
               "-" ,
               map:get($info, "version")))
};


declare %private function esi:key-convert-to-xml(
    $map as map:map?,
    $key as item()
) as element()*
{
    if (map:contains($map, $key))
    then
        let $element-qname :=
            if (map:contains($esi:keys-to-element-names, $key))
            then map:get($esi:keys-to-element-names, $key)
            else xs:QName("es:" || $key)
        return
            if (map:get($map, $key) instance of json:array)
            then
                json:array-values(map:get($map, $key)) ! element { $element-qname } { . }
            else
                if (map:get($map, $key) instance of map:map)
                then
                    element { $element-qname } {
                        let $submap := map:get($map,$key)
                        return
                        map:keys($submap) ! esi:key-convert-to-xml($submap, map:get($submap,.))
                    }
                else element { $element-qname } { map:get($map, $key) }
    else ()
};

declare %private function esi:with-if-exists(
    $map as map:map,
    $key-name as xs:string,
    $value as item()?
) as map:map
{
    typeswitch($value)
    case json:array return
        if (json:array-size($value) gt 0)
        then map:put($map, $key-name, $value)
        else ()
    default return
        if (exists($value))
        then map:put($map, $key-name, $value)
        else (),
    $map
};

declare function esi:model-to-xml(
    $model as map:map
) as element(es:model)
{
    let $info := map:get($model, "info")
    return
      element es:model {
        namespace { "es" } { "http://marklogic.com/entity-services" },
        attribute xml:lang { "zxx" },
        esi:key-convert-to-xml($model, "$schema"),
        esi:key-convert-to-xml($model, "$id"),
        element es:info {
          element es:title { map:get($info, "title") },
          element es:version { map:get($info, "version") },
          esi:key-convert-to-xml($info, "baseUri"),
          esi:key-convert-to-xml($info, "description")
        },
        element es:definitions {
          for $entity-type-name in $model=>map:get("definitions")=>map:keys()
          let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
          return
            element { $entity-type-name } {
              element es:properties {
                let $properties := map:get($entity-type, "properties")
                for $property-name in map:keys($properties)
                let $property := map:get($properties, $property-name)
                return
                  element { $property-name } {
                    esi:key-convert-to-xml($property, "datatype"),
                    esi:key-convert-to-xml($property, "collation"),
                    esi:key-convert-to-xml($property, "$ref"),
                    esi:key-convert-to-xml($property, "description"),
                    esi:key-convert-to-xml($property, "type"),
                    esi:key-convert-to-xml($property, "format"),
                    esi:key-convert-to-xml($property, "$id"),
                    if (map:contains($property, "items")) then (
                      let $items-map := map:get($property, "items")
                      return
                        element es:items {
                          esi:key-convert-to-xml($items-map, "datatype"),
                          esi:key-convert-to-xml($items-map, "collation"),
                          esi:key-convert-to-xml($items-map, "$ref"),
                          esi:key-convert-to-xml($items-map, "description"),
                          esi:key-convert-to-xml($items-map, "type"),
                          esi:key-convert-to-xml($items-map, "format"),
                          esi:key-convert-to-xml($items-map, "$id")
                      }
                    ) else ()
                  }
              },
              esi:key-convert-to-xml($entity-type, "description"),
              esi:key-convert-to-xml($entity-type, "primaryKey"),
              esi:key-convert-to-xml($entity-type, "required"),
              esi:key-convert-to-xml($entity-type, "pii"),
              esi:key-convert-to-xml($entity-type, "namespace"),
              esi:key-convert-to-xml($entity-type, "namespacePrefix"),
              esi:key-convert-to-xml($entity-type, "rangeIndex"),
              esi:key-convert-to-xml($entity-type, "pathRangeIndex"),
              esi:key-convert-to-xml($entity-type, "elementRangeIndex"),
              esi:key-convert-to-xml($entity-type, "wordLexicon")
            }
        },
        if (exists(map:get($model, "properties"))) then (
          element es:properties {
            let $properties := map:get($model, "properties")
            for $property-name in map:keys($properties)
            let $property := map:get($properties, $property-name)
            return
              element { $property-name } {
                esi:key-convert-to-xml($property, "datatype"),
                esi:key-convert-to-xml($property, "collation"),
                esi:key-convert-to-xml($property, "$ref"),
                esi:key-convert-to-xml($property, "description"),
                esi:key-convert-to-xml($property, "type"),
                esi:key-convert-to-xml($property, "format"),
                esi:key-convert-to-xml($property, "$id"),
                if (map:contains($property, "items")) then (
                  let $items-map := map:get($property, "items")
                  return
                    element es:items {
                      esi:key-convert-to-xml($items-map, "datatype"),
                      esi:key-convert-to-xml($items-map, "collation"),
                      esi:key-convert-to-xml($items-map, "$ref"),
                      esi:key-convert-to-xml($items-map, "description"),
                      esi:key-convert-to-xml($items-map, "type"),
                      esi:key-convert-to-xml($items-map, "format"),
                      esi:key-convert-to-xml($items-map, "$id")
                  }
                ) else ()
            }
          }
        ) else (),
        esi:key-convert-to-xml($model, "required")
     }
};

declare function esi:model-from-xml(
    $model as element(es:model)
) as map:map
{
    let $info := json:object()
        =>map:with("title", data($model/es:info/es:title))
        =>map:with("version", data($model/es:info/es:version))
        =>esi:with-if-exists("baseUri", data($model/es:info/es:base-uri))
        =>esi:with-if-exists("description", data($model/es:info/es:description))
    let $definitions :=
        let $d := json:object()
        let $_ :=
            for $entity-type-node in $model/es:definitions/*
            let $entity-type := json:object()
            let $properties := json:object()
            let $_ :=
                for $property-node in $entity-type-node/es:properties/*
                let $property-attributes := json:object()
                    =>esi:with-if-exists("datatype", data($property-node/es:datatype))
                    =>esi:with-if-exists("$ref", data($property-node/es:ref))
                    =>esi:with-if-exists("description", data($property-node/es:description))
                    =>esi:with-if-exists("collation", data($property-node/es:collation))
                    =>esi:with-if-exists("$id", data($property-node/es:id))
                    =>esi:with-if-exists("type", data($property-node/es:type))
                    =>esi:with-if-exists("format", data($property-node/es:format))

                let $items-map := json:object()
                    =>esi:with-if-exists("datatype", data($property-node/es:items/es:datatype))
                    =>esi:with-if-exists("$ref", data($property-node/es:items/es:ref))
                    =>esi:with-if-exists("description", data($property-node/es:items/es:description))
                    =>esi:with-if-exists("collation", data($property-node/es:items/es:collation))
                    =>esi:with-if-exists("$id", data($property-node/es:items/es:id))
                    =>esi:with-if-exists("type", data($property-node/es:items/es:type))
                    =>esi:with-if-exists("format", data($property-node/es:items/es:format))
                let $_ := if (count(map:keys($items-map)) gt 0)
                        then map:put($property-attributes, "items", $items-map)
                        else ()
                return map:put($properties, fn:local-name($property-node), $property-attributes)
            let $_ :=
                $entity-type
                  =>map:with("properties", $properties)
                  =>esi:with-if-exists("primaryKey", data($entity-type-node/es:primary-key))
                  =>esi:with-if-exists("required", json:to-array($entity-type-node/es:required/xs:string(.)))
                  =>esi:with-if-exists("pii", json:to-array($entity-type-node/es:pii/xs:string(.)))
                  =>esi:with-if-exists("namespace", $entity-type-node/es:namespace/xs:string(.))
                  =>esi:with-if-exists("namespacePrefix", $entity-type-node/es:namespace-prefix/xs:string(.))
                  =>esi:with-if-exists("rangeIndex", json:to-array($entity-type-node/es:range-index/xs:string(.)))
                  =>esi:with-if-exists("pathRangeIndex", json:to-array($entity-type-node/es:path-range-index/xs:string(.)))
                  =>esi:with-if-exists("elementRangeIndex", json:to-array($entity-type-node/es:element-range-index/xs:string(.)))
                  =>esi:with-if-exists("wordLexicon", json:to-array($entity-type-node/es:word-lexicon/xs:string(.)))
                  =>esi:with-if-exists("description", data($entity-type-node/es:description))
                  =>esi:with-if-exists("$id", data($entity-type-node/es:id))
            return map:put($d, fn:local-name($entity-type-node), $entity-type)
        return $d

    let $properties :=
      let $top-entity := json:object()
      let $property-node := ($model/es:properties/*)[1] (: There can be only 1 :)
      return (
        (: {entity: { "$ref": "whatever" } } :)
        if (empty($property-node)) then () else (
          let $ref :=
            json:object()=>esi:with-if-exists("$ref", data($property-node/es:ref))
          return json:object()=>map:with( fn:local-name($property-node), $ref )
        )
      )
    return json:object()
        =>map:with("lang","zxx")
        =>map:with("info", $info)
        =>map:with("definitions", $definitions)
        =>esi:with-if-exists("$schema", data($model/es:schema))
        =>esi:with-if-exists("$id", data($model/es:id))
        =>esi:with-if-exists("required", json:to-array($model/es:required))
        =>esi:with-if-exists("properties", $properties)
};

declare function esi:model-to-json-schema(
    $model as map:map,
    $entity-name as xs:string?
) as map:map
{
  if (esi:is-modern-model($model)) then (
    $model
  ) else if (empty($entity-name)) then (
    esi:model-to-json-schema($model)
  ) else (
    (:
       Take the model and add
       "$schema": "http://json-schema.org/draft-07/schema#" (if no $schema)
       "properties": { <$entity-name> : {"$ref": "#/definitions/<$entity-name>"} },
       "required": [<$entity-name>]

       If there is no definition with that name, error.

       If there is a info/baseUri property, add equivalent $id (if no $id)

       Fix external references.

       [53510] put primaryKey into required array if it is not there already
    :)
    let $new-model := esi:fix-primary-keys(esi:fix-references($model))
    return (
      if (empty($new-model=>map:get("definitions")=>map:get($entity-name))) then (
        fn:error((), "ES-ENTITY-NOTFOUND", $entity-name)
      ) else (
        if (empty($new-model=>map:get("$schema")))
        then map:put($new-model, "$schema", "http://json-schema.org/draft-07/schema#")
        else (),
        map:put($new-model,"lang","zxx"),
        map:put($new-model, "properties",
          map:map()=>map:with($entity-name,
            map:map()=>map:with("$ref", "#/definitions/"||$entity-name))),
        map:put($new-model, "required", json:to-array($entity-name)),
        let $baseUri := $new-model=>map:get("info")=>map:get("baseUri")
        where not(empty($baseUri)) and empty($new-model=>map:get("$id"))
        return map:put($new-model, "$id", $baseUri),
        $new-model
      )
    )
  )
};

declare function esi:model-to-json-schema(
    $model as map:map
) as map:map
{
  if (esi:is-modern-model($model)) then (
    $model
  ) else (
    (:
       Take the model and add
       "$schema": "http://json-schema.org/draft-07/schema#" (if no $schema)
       "oneOf": [
         {"properties": { <$entity-name1> : {"$ref": "#/definitions/<$entity-name1>"} },
          "required": [<$entity-name1>]
         },
         {"properties": { <$entity-name2> : {"$ref": "#/definitions/<$entity-name2">} },
         "required": [<$entity-name2>]
         },
         ...
       ]

       If there are no definitions, error.

       If there is only one definition, just add it directly instead of the
       "oneOf"

       If there is a info/baseUri property, add equivalent $id (if no $id)
       [53510] put primaryKey into required array if it is not there already
    :)
    let $new-model := esi:fix-primary-keys(esi:fix-references($model))
    return (
      if (empty($new-model=>map:get("definitions")=>map:keys())) then (
        fn:error((), "ES-DEFINITIONS")
      ) else (
        if (empty($new-model=>map:get("$schema")))
        then map:put($new-model, "$schema", "http://json-schema.org/draft-07/schema#")
        else (),
        map:put($new-model,"lang","zxx"),
        let $alts :=
          for $entity-name in $new-model=>map:get("definitions")=>map:keys()
          return
            map:map()=>
              map:with("properties",
                map:map()=>map:with($entity-name,
                  map:map()=>map:with("$ref", "#/definitions/"||$entity-name)))=>
              map:with("required",
                json:to-array($entity-name))
        return (
          if (count($alts)=1) then (
            map:put($new-model, "properties", $alts=>map:get("properties")),
            map:put($new-model, "required", $alts=>map:get("required"))
          ) else (
            map:put($new-model, "oneOf", json:to-array($alts))
          )
        ),
        let $baseUri := $new-model=>map:get("info")=>map:get("baseUri")
        where not(empty($baseUri)) and empty($new-model=>map:get("$id"))
        return map:put($new-model, "$id", $baseUri),
        $new-model
      )
    )
  )
};

(: experiment :)
declare function esi:model-to-triples(
    $model as map:map
)
{
    tde:node-data-extract(xdmp:to-json($model))
};



(:
 : Returns a constant value for each data type
 : -- TODO make other value generator method
 :)
declare function esi:create-test-value-from-datatype(
    $datatype as xs:string
) as item()
{
    switch ($datatype)
    case "anyURI"             return xs:anyURI( "http://example.org/some-uri" )
    case "base64Binary"       return xs:base64Binary( "TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0aGlz
IHNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1c3Qgb2Yg
dGhlIG1pbmQsIHRoYXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0aGUgY29udGlu
dWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdlbmVyYXRpb24gb2Yga25vd2xlZGdlLCBleGNlZWRzIHRo
ZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4=" )
    case "boolean"            return true()
    case "byte"               return xs:byte( 123 )
    case "date"               return xs:date( "2000-01-23" )
    case "dateTime"           return xs:dateTime( "2000-01-23T17:00:26.789186-08:00" )
    case "dayTimeDuration"    return xs:dayTimeDuration( "P1D" )
    case "decimal"            return xs:decimal( 113 )
    case "double"             return xs:double( 123 )
    case "duration"           return xs:duration( "P1D" )
    case "float"              return xs:float( 123 )
    case "gDay"               return xs:gDay( "---22" )
    case "gMonth"             return xs:gMonth("--03")
    case "gMonthDay"          return xs:gMonthDay("--02-01")
    case "gYear"              return xs:gYear("-2001")
    case "gYearMonth"         return xs:gYearMonth("2001-01")
    case "hexBinary"          return xs:hexBinary("3f3c6d78206c657673726f693d6e3122302e20226e656f636964676e223d54552d4622383e3f")
    case "int"                return xs:int( 123 )
    case "integer"            return xs:integer( 123 )
    case "long"               return xs:long( 1355 )
    case "negativeInteger"    return xs:integer( -123 )
    case "nonNegativeInteger" return xs:integer( 123 )
    case "positiveInteger"    return xs:integer( 123 )
    case "nonPositiveInteger" return xs:integer( -123 )
    case "short"              return xs:short( 343 )
    case "string"             return xs:string( "some string" )
    case "time"               return xs:time( "09:00:15" )
    case "unsignedByte"       return xs:unsignedByte( 2  )
    case "unsignedInt"        return xs:unsignedInt( 5555  )
    case "unsignedLong"       return xs:unsignedLong( 999999999 )
    case "unsignedShort"      return xs:unsignedShort( 324 )
    case "yearMonthDuration"  return xs:yearMonthDuration( "P1Y" )
    case "iri"                return sem:iri( "http://example.org/some-iri" )
    default return xs:string( " ")
};

declare %private function esi:resolve-test-reference(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string,
    $depth as xs:int)
{
    let $property-definition := $model
            =>map:get("definitions")
            =>map:get($entity-type-name)
            =>map:get("properties")
            =>map:get($property-name)
    let $top-id := map:get($model, "$id")
    let $id :=
      head( ($property-definition=>map:get("$id"),
             $property-definition=>map:get("items")=>map:get("$id") ) )
    let $id :=
      if (empty($id) or (exists($top-id) and $id=$top-id)) then ()
      else $id
    let $reference-value :=
        head( ($property-definition=>map:get("$ref"),
               $property-definition=>map:get("items")=>map:get("$ref") ) )
    let $ref-name := functx:substring-after-last($reference-value, "/")
    let $ref-doc :=
      if (starts-with($reference-value,"#") and empty($id))
      then ()
      else if (exists($id)) then fn:doc($id)
      else if (contains($reference-value,"#"))
      then fn:doc(substring-before($reference-value,"#"))
      else fn:doc(functx:substring-before-last($reference-value,"/"))
    let $ref-model :=
      if (starts-with($reference-value,"#") and empty($id))
      then $model
      else if (empty($ref-doc)) then $model
      else esi:model-create($ref-doc)
    let $namespace-prefix :=
        $ref-model=>map:get("definitions")=>map:get($ref-name)=>map:get("namespacePrefix")
    let $prefix-value :=
        if ($namespace-prefix)
        then $namespace-prefix || ":"
        else ""
    let $namespace-uri :=
        $ref-model=>map:get("definitions")=>map:get($ref-name)=>map:get("namespace")
    let $nsdecl :=
        if ($namespace-prefix)
        then element { "X" } { namespace { $namespace-prefix } { $namespace-uri } }
        else <x/>
    let $qname := fn:resolve-QName($prefix-value || $ref-name, $nsdecl)
    (: is the reference value in this model or a model we can reach? :)
    let $referenced-type :=
      if ((starts-with($reference-value,"#") and empty($id)) or exists($ref-doc))
      then (
        if ($depth eq $esi:MAX_TEST_INSTANCE_DEPTH - 1) then
          element {$qname} {
            esi:ref-datatype($ref-model, $entity-type-name, $property-name)
              =>esi:create-test-value-from-datatype()
            }
        else esi:create-test-instance($model, $ref-name, $depth + 1)
      ) else (
        element { $ref-name } { "externally-referenced-instance" }
      )
    return $referenced-type
};


declare function esi:create-test-value(
    $model as map:map,
    $entity-name as xs:string,
    $property-name as xs:string,
    $property as map:map,
    $depth as xs:int,
    $parent-type as xs:string,
    $nsdecl as element()
) as element()+
{
    let $datatype := map:get($property,"datatype")
    let $type := map:get($property,"type")
    let $items := map:get($property, "items")
    let $ref := map:get($property,"$ref")
    let $top-id := map:get($model,"$id")
    let $id := map:get($property,"$id")
    let $id :=
      if (empty($id) or (exists($top-id) and $top-id=$id)) then ()
      else $id
    let $namespace-prefix :=
        $model=>map:get("definitions")=>map:get($entity-name)=>map:get("namespacePrefix")
    let $prefix-value :=
        if ($namespace-prefix)
        then $namespace-prefix || ":"
        else ""
    let $qname := fn:resolve-QName($prefix-value || $property-name, $nsdecl)
    return
        if (exists($datatype))
        then
            if ($datatype eq "array" or $type="array")
            then
                esi:create-test-value($model, $entity-name, $property-name, $items, $depth, "array", $nsdecl)
            else
                element { $qname } {
                    if ($parent-type eq "array")
                    then attribute datatype { "array" }
                    else (),
                    esi:create-test-value-from-datatype($datatype)
                }
        else if (exists($ref))
        then
            element { $qname } {
                if ($parent-type eq "array")
                then attribute datatype { "array" }
                else (),
                esi:resolve-test-reference($model, $entity-name, $property-name, $depth)
            }
        else
            element { $property-name } { "This should not be here" }
};

declare function esi:create-test-instance(
    $model as map:map,
    $entity-type-name as xs:string,
    $depth as xs:int
)
{
    if ($depth lt $esi:MAX_TEST_INSTANCE_DEPTH)
    then
        let $entity-type := $model
                    =>map:get("definitions")
                    =>map:get($entity-type-name)
        let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
        let $prefix-value :=
            if ($namespace-prefix)
            then $namespace-prefix || ":"
            else ""
        let $nsdecl :=
            if ($namespace-prefix)
            then element { "X" } { namespace { $namespace-prefix } { $entity-type=>map:get("namespace") } }
            else element { "X" } { }
        let $qname := fn:resolve-QName($prefix-value || $entity-type-name, $nsdecl)
        return
            element { $qname } {
                let $properties := $entity-type=>map:get("properties")
                for $property in map:keys($properties)
                return
                    esi:create-test-value($model, $entity-type-name, $property, map:get($properties, $property), $depth, "none", $nsdecl)
            }
    else ()
};


declare function esi:model-get-test-instances(
    $model as map:map
) as element()*
{
    let $entity-type-names := $model=>map:get("definitions")=>map:keys()
    for $entity-type-name in $entity-type-names
    return esi:create-test-instance($model, $entity-type-name, 0)
};


declare function esi:indexable-datatype(
    $datatype as xs:string
) as xs:string
{
    switch ($datatype)
    case "boolean" return "string"
    case "anyURI" return "anyURI"
    case "iri" return "string"
    case "byte" return "int"
    case "short" return "int"
    case "unsignedShort" return "unsignedInt"
    case "unsignedByte" return "unsignedInt"
    case "integer" return "decimal"
    case "negativeInteger" return "decimal"
    case "nonNegativeInteger" return "decimal"
    case "positiveInteger" return "decimal"
    case "nonPositiveInteger" return "decimal"
    default return $datatype
};

declare function esi:database-properties-generate(
    $model as map:map
) as document-node()
{
    let $entity-type-names := $model=>map:get("definitions")=>map:keys()
    let $path-range-indexes := json:array()
    let $element-range-indexes := json:array()
    let $word-lexicons := json:array()
    let $path-namespaces := json:object()
    let $_ :=
        for $entity-type-name in $entity-type-names
        let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
        return
        (
        let $range-index-properties := (map:get($entity-type, "rangeIndex"), map:get($entity-type, "pathRangeIndex"))
        for $range-index-property in json:array-values($range-index-properties)
        let $property := $entity-type=>map:get("properties")=>map:get($range-index-property)
        let $specified-datatype := esi:resolve-datatype($model, $entity-type-name, $range-index-property)

        let $datatype := esi:indexable-datatype($specified-datatype)
        let $collation :=
          head( (
            map:get($property, "collation"),
            if ($datatype="anyURI")
            then "http://marklogic.com/collation/codepoint"
            else "http://marklogic.com/collation/")
          )
        let $invalid-values := "reject"
        let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
        let $namespace-uri := $entity-type=>map:get("namespace")
        let $namespace-prefix-value :=
            if ($namespace-uri)
            then
                (
                map:put($path-namespaces,
                        $namespace-prefix,
                        json:object()
                        =>map:with("prefix",$namespace-prefix)
                        =>map:with("namespace-uri", $namespace-uri)),
                $namespace-prefix || ":"
                )
            else ""
        let $ri-map := json:object()
            =>map:with("invalid-values", $invalid-values)
            =>map:with("path-expression", "//es:instance/" || $namespace-prefix-value || $entity-type-name || "/" || $namespace-prefix-value || $range-index-property)
            =>map:with("range-value-positions", false())
            =>map:with("scalar-type", $datatype)
        let $_add_collation :=
          if ($datatype=("string","anyURI"))
          then map:put($ri-map, "collation", $collation)
          else ()
        return json:array-push($path-range-indexes, $ri-map)
        ,
        let $element-range-index-properties := (map:get($entity-type, "elementRangeIndex"))
        for $element-range-index-property in json:array-values($element-range-index-properties)
        let $property := $entity-type=>map:get("properties")=>map:get($element-range-index-property)
        let $specified-datatype := esi:resolve-datatype($model, $entity-type-name, $element-range-index-property)

        let $datatype := esi:indexable-datatype($specified-datatype)
        let $collation := esi:resolve-collation($model, $entity-type-name, $element-range-index-property, $datatype)
        let $invalid-values := "reject"
        let $ri-map := json:object()
            =>map:with("invalid-values", $invalid-values)
            =>map:with("localname",  $element-range-index-property)
            =>map:with("namespace-uri",  $entity-type=>map:get("namespace"))
            =>map:with("range-value-positions", false())
            =>map:with("scalar-type", $datatype)
        let $_add_collation :=
          if ($datatype=("string","anyURI"))
          then map:put($ri-map, "collation", $collation)
          else ()
        return json:array-push($element-range-indexes, $ri-map)
        ,

        let $word-lexicon-properties := $entity-type=>map:get("wordLexicon")
        for $word-lexicon-property in json:array-values($word-lexicon-properties)
        let $property := $entity-type=>map:get("properties")=>map:get($word-lexicon-property)
        let $collation := head( (map:get($property, "collation"), "http://marklogic.com/collation/") )
        let $namespace-uri := head( ($entity-type=>map:get("namespace"), "") )
        let $wl-map := json:object()
            =>map:with("collation", $collation)
            =>map:with("localname", $word-lexicon-property)
            =>map:with("namespace-uri", $namespace-uri)
        return json:array-push($word-lexicons, $wl-map)
        )
    let $pn := json:object()
        =>map:with("prefix", "es")
        =>map:with("namespace-uri", "http://marklogic.com/entity-services")
    let $_ := map:put($path-namespaces, "es", $pn)
    let $values := function($map) { json:to-array( for $k in $map=>map:keys() return map:get($map, $k)) }
    let $database-properties :=
        json:object()
        =>map:with("lang","zxx")
        =>map:with("database-name", "%%DATABASE%%")
        =>map:with("schema-database", "%%SCHEMAS_DATABASE%%")
        =>map:with("path-namespace", $values($path-namespaces))
        =>esi:with-if-exists("element-word-lexicon", $word-lexicons)
        =>esi:with-if-exists("range-path-index", $path-range-indexes)
        =>esi:with-if-exists("range-element-index", $element-range-indexes)
        =>map:with("triple-index", true())
        =>map:with("collection-lexicon", true())
    return xdmp:to-json($database-properties)
};





(: used to switch on datatype to provide the right XSD element for
 : (scalar) arrays, IRIs and scalars
 :)
declare %private function esi:element-for-datatype(
    $property-name as xs:string,
    $datatype as xs:string
) as element(xs:element)
{
    if ($datatype eq "iri")
    then <xs:element name="{ $property-name }" type="sem:{ $datatype }"/>
    else <xs:element name="{ $property-name }" type="xs:{ $datatype }"/>
};


declare %private function esi:array-element-for-datatype(
    $reference-declarations as map:map,
    $property-name as xs:string,
    $datatype as xs:string
)
{
    (map:put($reference-declarations, $property-name || "ARRAY",
        (
        <xs:complexType name="{ $property-name }ArrayType">
            <xs:simpleContent>
                <xs:extension base="{ $property-name }SimpleType">
                    <xs:attribute name="datatype" />
                </xs:extension>
            </xs:simpleContent>
        </xs:complexType>,
        <xs:simpleType name="{ $property-name }SimpleType">
            {
            if ($datatype eq "iri")
            then <xs:restriction base="sem:iri" />
            else <xs:restriction base="xs:{ $datatype }" />
            }
        </xs:simpleType>
        )),
    <xs:element name="{ $property-name }" type="{ $property-name }ArrayType"/>
    )
};


declare %private function esi:element-for-reference(
    $reference-declarations as map:map,
    $imports-accumulator as map:map,
    $model as map:map,
    $property-name as xs:string,
    $ref-value as xs:string,
    $id-value as xs:string?
) as element(xs:element)
{
    let $top-id := map:get($model,"$id")
    let $id-value :=
      if (empty($id-value) or (exists($top-id) and $id-value=$top-id)) then ()
      else $id-value
    let $ref-name := functx:substring-after-last($ref-value, "/")
    return
    if (starts-with($ref-value, "#/definitions/") and empty($id-value))
    then
        let $namespace := $model=>map:get("definitions")=>map:get($ref-name)=>map:get("namespace")
        let $version := $model=>map:get("info")=>map:get("version")
        let $namespace-prefix := $model=>map:get("definitions")=>map:get($ref-name)=>map:get("namespacePrefix")
        let $prefix-value :=
            if ($namespace-prefix)
            then $namespace-prefix || ":"
            else ""
        let $nsdecl :=
            if ($namespace-prefix)
            then namespace { $namespace-prefix } { $namespace }
            else ()
        return
        (map:put($reference-declarations, $ref-name || "CONTAINER",
            <xs:complexType name="{ $ref-name }ContainerType">
                <xs:sequence>
                    <xs:element ref="{ $prefix-value }{ $ref-name }" >
                    {$nsdecl}
                    </xs:element>
                </xs:sequence>
                <xs:attribute name="datatype" />
            </xs:complexType>),
         map:put($imports-accumulator,
            fn:head( ($namespace, "") ),
            if ($namespace) then
            <xs:import namespace="{$namespace}" schemaLocation="{$ref-name}-{$version}.xsd"/>
            else ()),
         <xs:element name="{ $property-name }" type="{ $ref-name }ContainerType"/>)
    else
        (map:put($reference-declarations, $ref-name || "REFERENCE",
             <xs:complexType name="{ $ref-name }ReferenceType">
                <xs:sequence>
                    <xs:element name="{ $ref-name }" type="xs:anyURI" />
                </xs:sequence>
                <xs:attribute name="datatype" />
             </xs:complexType>),
         <xs:element name="{ $property-name }" type="{ $ref-name }ReferenceType"/>)
};


declare function esi:schema-generate(
    $model as map:map
) as element()*
{
    let $entity-type-names := $model=>map:get("definitions")=>map:keys()
    let $seen-keys := map:map()
    let $reference-declarations := map:map()
    let $element-declarations := map:map()
    let $entity-type-declarations := map:map()
    let $schemas := json:array()
    let $imports := map:map()
    (: construct all the element declarations :)
    let $_ :=
        for $entity-type-name in $entity-type-names
        let $properties-accumulator := json:array()
        let $reference-accumulator := map:map()
        let $types-accumulator := json:array()
        let $imports-accumulator := map:map()
        let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
        let $namespace := $entity-type=>map:get("namespace")
        let $properties := map:get($entity-type, "properties")
        let $primary-key-name := map:get($entity-type, "primaryKey")
        let $required-properties := ( json:array-values(map:get($entity-type, "required")), $primary-key-name)
        let $_accumulate :=
                for $property-name in map:keys($properties)
                let $property := map:get($properties, $property-name)
                return
                json:array-push($properties-accumulator,
                    esi:wrap-duplicates($seen-keys, "{" || $namespace || "}" || $property-name,
                        if (map:contains($property, "$ref"))
                        then
                            esi:element-for-reference(
                                $reference-accumulator,
                                $imports-accumulator,
                                $model,
                                $property-name,
                                map:get($property, "$ref"),
                                map:get($property, "$id"))
                        else if (map:contains($property, "datatype"))
                        then
                            let $datatype := map:get($property, "datatype")
                            let $items-map := map:get($property, "items")
                            return
                                if ($datatype eq "array")
                                then
                                    if (map:contains($items-map, "$ref"))
                                    then esi:element-for-reference(
                                        $reference-accumulator,
                                        $imports-accumulator,
                                        $model,
                                        $property-name,
                                        map:get($items-map, "$ref"),
                                        map:get($items-map, "$id"))
                                    else
                                        esi:array-element-for-datatype(
                                            $reference-accumulator,
                                            $property-name,
                                            map:get($items-map, "datatype"))
                                else esi:element-for-datatype($property-name, $datatype)
                        else (),
                        "schema"))
        let $_accumulate :=
                (json:array-push($types-accumulator,
                    <xs:complexType name="{ $entity-type-name }Type" mixed="true">
                        <xs:sequence minOccurs="0">
                        {
                            (: construct xs:element element for each property :)
                            for $property-name in map:keys($properties)
                            let $property := map:get($properties, $property-name)
                            let $datatype := map:get($property, "datatype")
                            let $additional-attributes := fn:head(json:array-values($properties-accumulator)[@name = $property-name])/@*
                            return
                                    element xs:element {
                                    (
                                    if ($datatype eq "array")
                                    then
                                       ( attribute minOccurs { "0" },
                                         attribute maxOccurs { "unbounded" }
                                        )
                                    else if ($property-name = $required-properties )
                                    then ()
                                    else attribute minOccurs { "0" },
                                    $additional-attributes
                                    )
                                }
                        }
                        </xs:sequence>
                    </xs:complexType>),
                    json:array-push($types-accumulator,
                    <xs:element name="{ $entity-type-name }" type="{ $entity-type-name }Type"/>
                    )
                )
        return (
            map:put($element-declarations, $entity-type-name, $properties-accumulator),
            map:put($reference-declarations, $entity-type-name, $reference-accumulator),
            map:put($entity-type-declarations, $entity-type-name, $types-accumulator),
            map:put($imports, head( ($namespace, "") ), (map:keys($imports-accumulator) ! map:get($imports-accumulator, .)))
        )
    let $names-by-namespace := map:map()
    let $_ :=
        for $entity-type-name in $entity-type-names
        let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
        let $namespace := $entity-type=>map:get("namespace")
        let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
        let $extend := function($m, $ns, $et) {
            if (map:contains($m, $ns))
            then $m=>map:get($ns)=>json:array-push($et)
            else map:put($m, $ns, json:to-array( $et ))
        }
        return
            if (empty($namespace))
            then $extend($names-by-namespace, "", $entity-type-name)
            else $extend($names-by-namespace, $namespace, $entity-type-name)
    let $_ :=
        for $namespace in map:keys($names-by-namespace)
        let $target-attribute :=
            if ($namespace ne "")
            then attribute { "targetNamespace" } { $namespace }
            else ()
        return
            json:array-push($schemas,
            <xs:schema
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:sem="http://marklogic.com/semantics"
                elementFormDefault="qualified"
                xmlns:es="http://marklogic.com/entity-services"
                xml:lang="zxx">
            {$target-attribute}
            {$imports=>map:get($namespace)}
            {
                functx:distinct-deep(
                (: Removing root elements. All the elements should be in the complexType :)
                for $entity-type-name in json:array-values($names-by-namespace=>map:get($namespace))
                let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
                let $namespace := $entity-type=>map:get("namespace")
                let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
                return
                (
                    let $m := $reference-declarations=>map:get($entity-type-name)
                    let $keys := $m=>map:keys()
                    for $k in $keys
                    return map:get($m, $k),
                    json:array-values($entity-type-declarations=>map:get($entity-type-name))
                )
                )
            }
            </xs:schema>)
    return json:array-values($schemas)
};


declare function esi:resolve-datatype(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as xs:string
{
    let $property := $model=>map:get("definitions")
        =>map:get($entity-type-name)
        =>map:get("properties")
        =>map:get($property-name)
    return
    if (map:contains($property, "datatype"))
    then
        if (map:get($property, "datatype") eq "array")
        then
            if (map:contains(map:get($property, "items"), "datatype"))
            then $property=>map:get("items")=>map:get("datatype")
            else esi:ref-datatype($model, $entity-type-name, $property-name)
        else map:get($property, "datatype")
    else esi:ref-datatype($model, $entity-type-name, $property-name)
};


declare function esi:resolve-collation(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string,
    $datatype as xs:string
) as xs:string
{
    let $property := $model=>map:get("definitions")
        =>map:get($entity-type-name)
        =>map:get("properties")
        =>map:get($property-name)
    return
    if (map:contains($property, "datatype")) then (
      if (map:get($property, "datatype") eq "array") then (
        if (map:contains(map:get($property, "items"), "collation"))
        then $property=>map:get("items")=>map:get("collation")
        else esi:ref-collation($model, $entity-type-name, $property-name, $datatype)
      ) else (
        head((
          map:get($property, "collation"),
          if ($datatype="anyURI")
          then "http://marklogic.com/collation/codepoint"
          else "http://marklogic.com/collation/"
       ))
      )
    ) else (
      esi:ref-collation($model, $entity-type-name, $property-name, $datatype)
    )
};

(:
 : Resolves a reference and returns its collation
 : If the reference is external, return root collation
 :)
declare %private function esi:ref-collation(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string,
    $datatype as xs:string
) as xs:string
{
  let $ref-type := esi:ref-type($model, $entity-type-name, $property-name)
  return (
    if (esi:is-local-reference($model, $entity-type-name, $property-name))
    then (
      (: if the referent type has a primary key, use that type :)
      let $primary-key-property := map:get($ref-type, "primaryKey")
      return (
        if (empty($primary-key-property)) then (
          if ($datatype="anyURI")
          then "http://marklogic.com/collation/codepoint"
          else "http://marklogic.com/collation/"
        ) else (
          head((
            $ref-type=>map:get("properties")
                     =>map:get($primary-key-property)
                     =>map:get("collation"),
            if ($datatype="anyURI")
            then "http://marklogic.com/collation/codepoint"
            else "http://marklogic.com/collation/"
          ))
        )
      )
    ) else (
      if ($datatype="anyURI")
      then "http://marklogic.com/collation/codepoint"
      else "http://marklogic.com/collation/"
    )
  )
};

(:
 : Resolves a reference and returns its datatype
 : If the reference is external, return 'string'
 :)
declare %private function esi:ref-datatype(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as xs:string
{
    let $ref-type := esi:ref-type($model, $entity-type-name, $property-name)
    return
        if (esi:is-local-reference($model, $entity-type-name, $property-name))
        then
            (: if the referent type has a primary key, use that type :)
            let $primary-key-property := map:get($ref-type, "primaryKey")
            return
                if (empty($primary-key-property))
                then "string"
                else map:get(
                        map:get(
                            map:get($ref-type, "properties"),
                            $primary-key-property),
                        "datatype")
        else "string"
};


declare %private function esi:ref-prefixed-name(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as xs:string
{
    let $ref-type := esi:ref-type( $model, $entity-type-name, $property-name )
    let $ref-name := esi:ref-type-name($model, $entity-type-name, $property-name)
    let $namespace-prefix := $ref-type=>map:get("namespacePrefix")
    let $is-local-ref := esi:is-local-reference($model, $entity-type-name, $property-name)
    return
        if ($namespace-prefix and $is-local-ref)
        then $namespace-prefix || ":" || $ref-name
        else $ref-name
};


declare %private function esi:is-local-reference(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
)
{
    let $top-id := map:get($model,"$id")
    let $property := $model
        =>map:get("definitions")
        =>map:get($entity-type-name)
        =>map:get("properties")
        =>map:get($property-name)
    let $id-target :=
      head( ($property=>map:get("$id"),
             $property=>map:get("items")=>map:get("$id") ) )
    let $id-target :=
      if (empty($id-target) or (exists($top-id) and $top-id=$id-target)) then ()
      else $id-target
    let $ref-target := head( ($property=>map:get("$ref"),
                              $property=>map:get("items")=>map:get("$ref") ) )
    return starts-with($ref-target, "#/definitions") and empty($id-target)
};

(:
 : Given a model, an entity type name and a reference property,
 : return a reference's type name
 :)
declare function esi:ref-type-name(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as xs:string
{
    let $property := $model
        =>map:get("definitions")
        =>map:get($entity-type-name)
        =>map:get("properties")
        =>map:get($property-name)
    let $ref-target := head( ($property=>map:get("$ref"),
                  $property=>map:get("items")=>map:get("$ref") ) )
    return functx:substring-after-last($ref-target, "/")
};


declare %private function esi:ref-type(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as map:map?
{
    $model
        =>map:get("definitions")
        =>map:get( esi:ref-type-name($model, $entity-type-name, $property-name) )
};

(: returns empty-sequence if no primary key :)
declare %private function esi:ref-primary-key-name(
    $model as map:map,
    $entity-type-name as xs:string,
    $property-name as xs:string
) as xs:string?
{
    let $ref-type-name := esi:ref-type-name($model, $entity-type-name, $property-name)
    let $ref-target := $model=>map:get("definitions")=>map:get($ref-type-name)
    return
        if (esi:is-local-reference($model, $entity-type-name, $property-name)) then (
          if (map:contains($ref-target, "primaryKey"))
          then map:get($ref-target, "primaryKey")
          else ()
        ) else ()
};

declare function esi:extraction-template-generate(
    $model as map:map
) as element(tde:template)
{
    let $top-id := map:get($model,"$id")
    let $schema-name := $model=>map:get("info")=>map:get("title")
    let $entity-type-names := $model=>map:get("definitions")=>map:keys()
    let $scalar-rows := map:map()
    let $secure-tde-name := fn:replace(?, "-", "_")
    let $path-namespaces := map:map()
    let $local-references :=
      if (count($entity-type-names)=1) then ()
      else esi:local-references($model)
    let $top-entity := esi:top-entity($model, false())
    let $maybe-local-refs :=
      if (exists($top-entity)) then () else esi:local-references($model)
    let $_ :=
        for $entity-type-name in $entity-type-names
        let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
        let $primary-key-name := map:get($entity-type, "primaryKey")
        let $required-properties := ( json:array-values(map:get($entity-type, "required")), $primary-key-name)
        let $properties := map:get($entity-type, "properties")
        let $primary-key-type := map:get( map:get($properties, $primary-key-name), "datatype" )
        let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
        let $namespace-uri := $entity-type=>map:get("namespace")
        let $prefix-value :=
            (
            map:put($path-namespaces,
                    $namespace-prefix,
                    <tde:path-namespace>
                        <tde:prefix>{$namespace-prefix}</tde:prefix>
                        <tde:namespace-uri>{$namespace-uri}</tde:namespace-uri>
                    </tde:path-namespace>),
            if ($namespace-prefix)
            then $namespace-prefix || ":"
            else ""
            )
        return
        map:put($scalar-rows, $entity-type-name,
            <tde:rows>
                <tde:row>
                    <tde:schema-name>{ $schema-name=>$secure-tde-name() }</tde:schema-name>
                    <tde:view-name>{ $entity-type-name=>$secure-tde-name() }</tde:view-name>
                    <tde:view-layout>sparse</tde:view-layout>
                    <tde:columns>
                    {
                    for $property-name in map:keys($properties)
                    let $property-definition := map:get($properties, $property-name)
                    let $items-map := map:get($property-definition, "items")
                    let $datatype :=
                        if (map:get($property-definition, "datatype") eq "iri")
                        then "IRI"
                        else map:get($property-definition, "datatype")
                    let $is-nullable :=
                        if ($property-name = $required-properties)
                        then ()
                        else <tde:nullable>true</tde:nullable>
                    return
                        (: if the column is an array, skip it in scalar row :)
                        if (exists($items-map)) then ()
                        else
                            if ( map:contains($property-definition, "$ref") )
                            then
                            <tde:column>
                                <tde:name>{ $property-name=>$secure-tde-name() }</tde:name>
                                <tde:scalar-type>{ let $dt := esi:ref-datatype($model, $entity-type-name, $property-name) return if ($dt="iri") then "IRI" else $dt} </tde:scalar-type>
                                <tde:val>{ $prefix-value }{ $property-name }/{ esi:ref-prefixed-name($model, $entity-type-name, $property-name) }{ let $pk := esi:ref-primary-key-name($model, $entity-type-name, $property-name) return if (empty($pk)) then () else "/"||$pk}</tde:val>
                                {$is-nullable}
                            </tde:column>
                            else
                            <tde:column>
                                <tde:name>{ $property-name=>$secure-tde-name() }</tde:name>
                                <tde:scalar-type>{ if ($datatype="iri") then "IRI" else $datatype }</tde:scalar-type>
                                <tde:val>{ $prefix-value }{$property-name }</tde:val>
                                {$is-nullable}
                            </tde:column>
                    }
                    </tde:columns>
                </tde:row>
            </tde:rows>)
    let $array-rows := map:map()
    let $triples-templates := map:map()
    let $_ :=
        (: this is a long loop.  It creates row-based templates for each
         :  entity-type name, as well as two triples that tie an entity
         :  instance document to its type and document IRI :)
        for $entity-type-name in $entity-type-names
        let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
        let $primary-key-name := map:get($entity-type, "primaryKey")
        let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
        let $prefix-value :=
            if ($namespace-prefix)
            then $namespace-prefix || ":"
            else ""
        let $prefix-path :=
          if ((exists($top-entity) and ($top-entity=$entity-type-name)) or
              (empty($top-entity) and empty($maybe-local-refs)))
          then "./"
          else ".//"
        let $required-properties := ($primary-key-name, json:array-values(map:get($entity-type, "required")))
        let $properties := map:get($entity-type, "properties")
        let $primary-key-type := map:get( map:get($properties, $primary-key-name), "datatype" )
        let $column-map := map:map()
        let $_ :=
            for $property-name in map:keys($properties)
            let $property-definition := map:get($properties, $property-name)
            let $items-map := map:get($property-definition, "items")
            let $is-ref := map:contains($items-map, "$ref")
            let $id-for-ref := map:get($items-map, "$id")
            let $id-for-ref :=
               if (empty($id-for-ref) or (exists($top-id) and $id-for-ref=$top-id))
               then ()
               else $id-for-ref
            let $is-local-ref := map:contains($items-map, "$ref") and starts-with( map:get($items-map, "$ref"), "#/definitions/") and empty($id-for-ref)
            let $is-external-ref := $is-ref and not($is-local-ref)
            let $ref-model :=
              if ($is-external-ref)
              then (
                let $ref := map:get($items-map, "$ref")
                let $ref := if (empty($ref) or contains($ref,"#")) then $ref else $ref||"#"
                let $ref-node :=
                  if (empty($id-for-ref))
                  then fn:doc(substring-before($ref,"#"))
                  else fn:doc($id-for-ref)
                return
                  if (empty($ref-node)) then $model else esi:model-create($ref-node)
              ) else $model
            let $reference-value :=
              $property-definition=>map:get("items")=>map:get("$ref")
            let $ref-name := functx:substring-after-last($reference-value, "/")
            let $is-nullable :=
                if ($property-name = $required-properties)
                then ()
                else <tde:nullable>true</tde:nullable>
            let $items-datatype :=
                if (map:get($items-map, "datatype") eq "iri")
                then "string"
                else map:get($items-map, "datatype")
            let $ref-primary-key := esi:ref-primary-key-name($ref-model, $entity-type-name, $property-name)
            let $ref-type-name := esi:ref-type-name($model, $entity-type-name, $property-name)
            where exists($items-map)
            return
            map:put($column-map, $property-name,
                <tde:template>
                    <tde:context>./{ $prefix-value }{ $property-name }{if ($is-ref) then concat("/",$ref-name) else ()}</tde:context>
                    <tde:rows>
                      <tde:row>
                        <tde:schema-name>{ $schema-name=>$secure-tde-name() }</tde:schema-name>
                        <tde:view-name>{ $entity-type-name=>$secure-tde-name() }_{ $property-name=>$secure-tde-name() }</tde:view-name>
                        <tde:view-layout>sparse</tde:view-layout>
                        <tde:columns>
                            { if (empty($primary-key-name))
                              then comment { "Warning, no primary key in enclosing type",
                                             $entity-type-name }
                              else
                                <tde:column>
                                    { comment { "This column joins to property",
                                                $primary-key-name, "of",
                                                $entity-type-name } }
                                    <tde:name>{ $primary-key-name=>$secure-tde-name() }</tde:name>
                                    <tde:scalar-type>{ if ($primary-key-type="iri") then "IRI" else $primary-key-type }</tde:scalar-type>
                                    <tde:val>ancestor::{$entity-type-name}/{ $prefix-value }{ $primary-key-name }</tde:val>
                                </tde:column>,
                            if ($is-local-ref and empty($ref-primary-key))
                            then
                                (
                                map:get($scalar-rows, $ref-type-name)/tde:row[tde:view-name eq $ref-type-name ]/tde:columns/tde:column,
                                map:put($scalar-rows, $ref-type-name,
                                    comment { "No extraction template emitted for" ||
                                               $ref-type-name ||
                                               "as it was incorporated into another view. "
                                            }
                                        )
                                )
                            else if ($is-local-ref)
                            then
                                <tde:column>
                                    { comment { "This column joins to primary key of",
                                                $ref-type-name } }
                                    <tde:name>{ $property-name=>$secure-tde-name() || "_" || $ref-primary-key=>$secure-tde-name() }</tde:name>
                                    <tde:scalar-type>{ let $dt := esi:ref-datatype($model, $entity-type-name, $property-name) return if ($dt="iri") then "IRI" else $dt }</tde:scalar-type>
                                    <tde:val>{ $prefix-value }{ $ref-primary-key }</tde:val>
                                </tde:column>
                            else
                            if ($is-external-ref)
                            then
                                <tde:column>
                                    { comment { "This column joins to primary key of an external reference" } }
                                    <tde:name>{ $property-name=>$secure-tde-name() }</tde:name>
                                    <tde:scalar-type>string</tde:scalar-type>
                                    <tde:val>.</tde:val>
                                    {$is-nullable}
                                </tde:column>
                            else
                                <tde:column>
                                    { comment { "This column holds array values from property",
                                                $primary-key-name, "of",
                                                $entity-type-name } }
                                    <tde:name>{ $property-name=>$secure-tde-name() }</tde:name>
                                    <tde:scalar-type>{ if ($items-datatype="iri") then "IRI" else $items-datatype }</tde:scalar-type>
                                    <tde:val>.</tde:val>
                                    {$is-nullable}
                                </tde:column>
                            }
                        </tde:columns>
                      </tde:row>
                    </tde:rows>
                </tde:template>
            )
        return
        (
        if (exists($primary-key-name))
        then
        map:put($triples-templates, $entity-type-name,
            <tde:template>
                <tde:context>{ $prefix-path }{ $prefix-value }{ $entity-type-name }</tde:context>
                <tde:vars>
                    {
                        if ($primary-key-type eq "string")
                        then (
                          <tde:var><tde:name>subject-iri</tde:name><tde:val>sem:iri(concat("{ esi:model-graph-prefix($model) }/{ $entity-type-name }/", fn:encode-for-uri(./{ $prefix-value }{ $primary-key-name })))</tde:val></tde:var>
                        ) else (
                            <tde:var><tde:name>subject-iri</tde:name><tde:val>sem:iri(concat("{ esi:model-graph-prefix($model) }/{ $entity-type-name }/", fn:encode-for-uri(xs:string(./{ $prefix-value }{ $primary-key-name }))))</tde:val></tde:var>
                       )
                    }
                </tde:vars>
                <tde:triples>
                    <tde:triple>
                        <tde:subject><tde:val>$subject-iri</tde:val></tde:subject>
                        <tde:predicate><tde:val>$RDF_TYPE</tde:val></tde:predicate>
                        <tde:object><tde:val>sem:iri("{ esi:model-graph-prefix($model) }/{ $entity-type-name }")</tde:val></tde:object>
                    </tde:triple>
                    <tde:triple>
                        <tde:subject><tde:val>$subject-iri</tde:val></tde:subject>
                        <tde:predicate><tde:val>sem:iri("http://www.w3.org/2000/01/rdf-schema#isDefinedBy")</tde:val></tde:predicate>
                        <tde:object><tde:val>fn:base-uri(.)</tde:val></tde:object>
                    </tde:triple>
                </tde:triples>
            </tde:template>)
        else (),
        if (exists(map:keys($column-map)))
        then map:put($array-rows, $entity-type-name, $column-map)
        else ()
        )

    let $entity-type-templates :=
        let $scalar-row-keys := map:keys($scalar-rows)
        for $entity-type-name in $scalar-row-keys
        let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
        let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
        let $namespace-uri := $entity-type=>map:get("namespace")
        let $prefix-value :=
            if ($namespace-uri)
            then
                $namespace-prefix || ":"
            else ""
        let $prefix-path :=
          if ((exists($top-entity) and ($top-entity=$entity-type-name)) or
              (empty($top-entity) and empty($maybe-local-refs)))
          then "./"
          else ".//"
        return
        if (empty ( ( json:array-values(
                        $entity-type=>map:get("required")),
                        $entity-type=>map:get("primaryKey"))
                    ))
        then comment { "The standalone template for " || $entity-type-name ||
                       " cannot be generated.  Each template row requires " ||
                       "a primary key or at least one required property." }
        else

        (
        map:get($triples-templates, $entity-type-name),
        <tde:template>
            <tde:context>{ $prefix-path }{ $prefix-value }{ $entity-type-name }</tde:context>
            {
            map:get($scalar-rows, $entity-type-name),
            if (map:contains($array-rows, $entity-type-name))
            then
                let $m := map:get($array-rows, $entity-type-name)
                return
                <tde:templates>{ for $k in map:keys($m) return map:get($m, $k) }</tde:templates>
            else ()
            }
        </tde:template>
        )
    return
    <tde:template xmlns:tde="http://marklogic.com/xdmp/tde" xml:lang="zxx">
        <tde:description>
Extraction Template Generated from Entity Type Document
graph uri: {esi:model-graph-iri($model)}
        </tde:description>
        <!-- The following line matches JSON and XML instances, but may be slower to index documents. -->
        <tde:context>//*:instance[*:info/*:version = "{$model=>map:get("info")=>map:get("version")}"]</tde:context>
        {comment{
        " Replace the above with the following line to match XML instances only.  This may speed up indexing
        <tde:context>//es:instance[es:info/es:version =",concat('"',$model=>map:get("info")=>map:get("version"),'"]</tde:context>
')
        },
        comment{
        " Replace the above with the following line to match JSON instances only.  This may speed up indexing
        <tde:context>//instance[info/version =",concat('"',$model=>map:get("info")=>map:get("version"),'"]</tde:context>
')
        }}
        <tde:vars>
            <tde:var><tde:name>RDF</tde:name><tde:val>"http://www.w3.org/1999/02/22-rdf-syntax-ns#"</tde:val></tde:var>
            <tde:var><tde:name>RDF_TYPE</tde:name><tde:val>sem:iri(concat($RDF, "type"))</tde:val></tde:var>
        </tde:vars>
        <tde:path-namespaces>
            <tde:path-namespace>
                <tde:prefix>es</tde:prefix>
                <tde:namespace-uri>http://marklogic.com/entity-services</tde:namespace-uri>
            </tde:path-namespace>
            { ($path-namespaces=>map:keys()) ! ($path-namespaces=>map:get(.)) }
        </tde:path-namespaces>
        {
        if ( $entity-type-templates/element() )
        then
            <tde:templates>
            { $entity-type-templates }
            </tde:templates>
        else
            comment { "An entity type must have at least one required column or a primary key to generate an extraction template." }
        }
    </tde:template>
};


(: Function made public for us by MarkLogic DataHub framework,
 : to expose internal workings of envelopes  :)
declare function esi:wrap-duplicates(
    $duplicate-map as map:map,
    $property-name as xs:string,
    $item as element(),
    $section as xs:string
) as item()
{
    let $comment :=
        if ($section eq "options")
        then "The name of this constraint is a duplicate in the generated XML. It is within a comment so that the XML may be valid, but you may need to edit for your use case.&#10;"
        else if ($section eq "schema")
        (: Not really true: the right answer is to define these as local elements :)
        then "XSD schemas prohibit duplicate element names. This element is commented out because it conflicts with another of the same name.&#10;"
        else "This item is a duplicate and is commented out so as to create a valid artifact.&#10;"
    return
    if (map:contains($duplicate-map, $property-name))
    then
        comment { $comment,
            xdmp:quote($item),
            "&#10;"
        }
    else (
        map:put($duplicate-map, $property-name, true()),
        $item)
};


(:
 : Generates a configuration node for use with the MarkLogic Search API.
 : The resulting node can be used to configure a search application over
 : a corpus of entity types.
 :)
declare function esi:search-options-generate(
    $model as map:map
)
{
    let $info := map:get($model, "info")
    let $schema-name := map:get($info, "title")
    let $entity-type-names := $model=>map:get("definitions")=>map:keys()
    let $seen-keys := map:map()
    let $all-constraints := json:array()
    let $all-tuples-definitions := json:array()
    let $prefixed-type-names := json:array()
    let $nsdecls := json:array()
    let $_ :=
        for $entity-type-name in $entity-type-names
        let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
        let $namespace-prefix := $entity-type=>map:get("namespacePrefix")
        let $namespace-uri := $entity-type=>map:get("namespace")
        let $prefix-value :=
            if ($namespace-uri)
            then
                $namespace-prefix || ":"
            else ""
        let $nsdecl :=
            if ($namespace-uri)
            then
                (
                json:array-push($nsdecls, namespace { $namespace-prefix } { $namespace-uri }),
                namespace { $namespace-prefix } { $namespace-uri }
                )
            else ()
        let $_ := json:array-push($prefixed-type-names, ($prefix-value || $entity-type-name))
        let $_scope-constraints := (
          json:array-push($all-constraints,
            esi:wrap-duplicates($seen-keys, $entity-type-name,
              <search:constraint name="{$entity-type-name}">
                <search:container>
                  <search:json-property>{$entity-type-name}</search:json-property>
                </search:container>
              </search:constraint>,
              "options")),
          json:array-push($all-constraints,
            esi:wrap-duplicates($seen-keys, $entity-type-name||'-xml',
              <search:constraint name="{$entity-type-name||'-xml'}">
                <search:container>
                  <search:element ns="{$namespace-uri}" name="{$entity-type-name}"/>
                </search:container>
              </search:constraint>,
              "options"))
        )
        let $primary-key-name := map:get($entity-type, "primaryKey")
        let $properties := map:get($entity-type, "properties")
        let $tuples-range-definitions := json:array()
        let $_pk-constraint :=
            if (exists($primary-key-name))
            then
            json:array-push($all-constraints, esi:wrap-duplicates($seen-keys, $primary-key-name,
                <search:constraint name="{ $primary-key-name } ">
                    <search:value>
                        <search:element ns="" name="{ $primary-key-name }"/>
                    </search:value>
                </search:constraint>,
                "options"))
            else ()
        let $_path-range-constraints :=
            for $property-name in json:array-values( (map:get($entity-type, "rangeIndex"), map:get($entity-type, "pathRangeIndex") ) )
            let $specified-datatype := esi:resolve-datatype($model,$entity-type-name,$property-name)
            let $property := map:get($properties, $property-name)
            let $datatype := esi:indexable-datatype($specified-datatype)
            let $collation :=
              if ($datatype eq "string") then
                attribute collation {
                  head( (map:get($property, "collation"), "http://marklogic.com/collation/") )
                }
              else if ($datatype eq "anyURI") then
                attribute collation {
                  head( (map:get($property, "collation"), "http://marklogic.com/collation/codepoint") )
                }
              else ()
            let $range-definition :=
                <search:range type="xs:{ $datatype }" facet="true">
                    { $collation }
                    <search:path-index
                        xmlns:es="http://marklogic.com/entity-services">{
                        $nsdecl
                    }//es:instance/{$prefix-value}{$entity-type-name}/{$prefix-value}{$property-name}</search:path-index>
                </search:range>
            let $constraint-template :=
                <search:constraint name="{$entity-type-name}.{$property-name}">
                    {$range-definition}
                </search:constraint>
            (: the collecting array will be added once after accumulation :)
            let $_ := json:array-push($tuples-range-definitions, $range-definition)
            return
                json:array-push($all-constraints, esi:wrap-duplicates($seen-keys, $entity-type-name||"."||$property-name, $constraint-template, "options"))
        let $_element-range-constraints :=
            for $property-name in json:array-values( map:get($entity-type, "elementRangeIndex"))
            let $specified-datatype := esi:resolve-datatype($model,$entity-type-name,$property-name)
            let $property := map:get($properties, $property-name)
            let $datatype := esi:indexable-datatype($specified-datatype)
            let $collation :=
              if ($datatype eq "string") then
                attribute collation {
                  head( (map:get($property, "collation"), "http://marklogic.com/collation/") )
                }
              else if ($datatype eq "anyURI") then
                attribute collation {
                  head( (map:get($property, "collation"), "http://marklogic.com/collation/codepoint") )
                }
              else ()
            let $element-range-attributes :=
                if ($namespace-uri)
                then (
                    attribute { "ns" }  { $namespace-uri },
                    attribute { "name" } { $property-name }
                    )
                else (
                    attribute { "ns" }  { "" },
                    attribute { "name" } { $property-name }
                    )
            let $range-definition :=
                <search:range type="xs:{ $datatype }" facet="true">
                    { $collation }
                    <search:element xmlns:es="http://marklogic.com/entity-services">{
                        $element-range-attributes
                    }</search:element>
                </search:range>
            let $constraint-template :=
                <search:constraint name="{ $property-name } ">
                    {$range-definition}
                </search:constraint>
            (: the collecting array will be added once after accumulation :)
            let $_ := json:array-push($tuples-range-definitions, $range-definition)
            return
                json:array-push($all-constraints, esi:wrap-duplicates($seen-keys, $property-name, $constraint-template, "options"))
        let $_ :=
            if (json:array-size($tuples-range-definitions) gt 1)
            then
                json:array-push($all-tuples-definitions,
                    <search:tuples name="{ $entity-type-name }">
                        {json:array-values($tuples-range-definitions)}
                    </search:tuples>)
            else if (json:array-size($tuples-range-definitions) eq 1)
            then
                json:array-push($all-tuples-definitions,
                    <search:values name="{ $entity-type-name }">
                        {json:array-values($tuples-range-definitions)}
                    </search:values>)
            else ()
        let $_word-constraints :=
            for $property-name in json:array-values(map:get($entity-type, "wordLexicon"))
            return
            json:array-push($all-constraints, esi:wrap-duplicates($seen-keys, $property-name,
                <search:constraint name="{ $property-name } ">
                    <search:word>
                        <search:element ns="" name="{ $property-name }"/>
                    </search:word>
                </search:constraint>, "options"))
        return ()
    let $types-expr := string-join( json:array-values($prefixed-type-names), "|" )
    let $type-constraint :=
        <search:constraint name="entity-type">
            <search:value>
                <search:element ns="http://marklogic.com/entity-services" name="title"/>
            </search:value>
        </search:constraint>
    return
    <search:options xmlns:search="http://marklogic.com/appservices/search" xml:lang="zxx">
        {
        $type-constraint,
        json:array-values($all-constraints),
        json:array-values($all-tuples-definitions),
        comment {
            "Uncomment to return no results for a blank search, rather than the default of all results&#10;",           xdmp:quote(
        <search:term>
            <search:empty apply="no-results"/>
        </search:term>),
            "&#10;"
        },
        <search:values name="uris">
            <search:uri/>
        </search:values>,
        comment { "Change to 'filtered' to exclude false-positives in certain searches" },
        <search:search-option>unfiltered</search:search-option>,
        comment { "Modify document extraction to change results returned" },
        <search:extract-document-data selected="include">
            <search:extract-path xmlns:es="http://marklogic.com/entity-services">{
                for $nsdecl in json:array-values($nsdecls) return $nsdecl
            }//es:instance/({ $types-expr })</search:extract-path>
        </search:extract-document-data>,

        comment { "Change or remove this additional-query to broaden search beyond entity instance documents" },
        <search:additional-query>
            <cts:or-query xmlns:cts="http://marklogic.com/cts">
                <cts:json-property-scope-query>
                    <cts:property>instance</cts:property>
                    <cts:true-query/>
                </cts:json-property-scope-query>
                <cts:element-query>
                    <cts:element xmlns:es="http://marklogic.com/entity-services">es:instance</cts:element>
                    <cts:true-query/>
                </cts:element-query>
            </cts:or-query>
        </search:additional-query>,
        comment { "To return facets, change this option to 'true' and edit constraints" },
        <search:return-facets>false</search:return-facets>,
        comment { "To return snippets, comment out or remove this option" },
        <search:transform-results apply="empty-snippet" />
        }
    </search:options>
};



(: resolves the default URI from a model's info section :)
declare function esi:resolve-base-uri(
    $info as map:map
) as xs:string
{
    let $base-uri := fn:head((map:get($info, "baseUri"), $esi:DEFAULT_BASE_URI))
    return
        if (fn:matches($base-uri, "[#/]$"))
        then $base-uri
        else concat($base-uri, "#")
};

declare %private function esi:resolve-base-prefix(
    $info as map:map
) as xs:string
{
    replace(esi:resolve-base-uri($info), "#", "/")
};


declare function esi:pii-generate(
    $model as map:map
) as object-node()
{
    (: to generate a pii security config I need all types/namespaces + properties. :)
    (: and I need to putput a namespace section, and several protected paths. :)
    (: each type has its own set of paths/namespaces, so we'll iterate by type. :)

    let $policy-name := $model=>map:get("info")=>map:get("title") || "-" || $model=>map:get("info")=>map:get("version")
    let $entity-type-labels := json:array()
    let $entity-type-names := $model=>map:get("definitions")=>map:keys()
    let $protected-paths :=
        for $entity-type-name in $entity-type-names
        let $entity-type := $model=>map:get("definitions")=>map:get($entity-type-name)
        let $property-labels := json:array()
        let $perms :=
                    object-node {
                        "role-name" : "pii-reader",
                        "capability" : "read"
                    }
        return
            if (empty($entity-type=>map:get("pii")))
            then ()
            else
                (
                for $pii-property in $entity-type=>map:get("pii")=>json:array-values()
                return
                    (
                    json:array-push($property-labels, $pii-property),
                    if ($entity-type=>map:get("namespace"))
                    then
                      object-node {
                        "path-expression" : "/es:envelope//es:instance//"
                                            || $entity-type=>map:get("namespacePrefix")
                                            || ":" || $entity-type-name || "/"
                                            || $entity-type=>map:get("namespacePrefix")
                                            || ":" || $pii-property,
                        "path-namespace" : array-node {
                            object-node { "prefix" : "es",
                                "namespace-uri" : "http://marklogic.com/entity-services"
                            },
                            object-node { "prefix" : $entity-type=>map:get("namespacePrefix"),
                                "namespace-uri" : $entity-type=>map:get("namespace")
                            }
                         },
                        "permission" : $perms
                    }
                    else
                      object-node {
                        "path-expression" : "/envelope//instance//" || $entity-type-name || "/" || $pii-property,
                        "path-namespace" : array-node { },
                        "permission" : $perms
                    }
                    ),
                json:array-push($entity-type-labels,
                        string-join(json:array-values($property-labels), ",") ||
                        " of type " || $entity-type-name
                        )
                )
    return
    object-node {
        "lang" : "zxx",
        "name" : $policy-name,
        "desc" : "A policy that secures " || string-join(json:array-values($entity-type-labels), ", "),
        "config" : object-node {
            "protected-path" :  array-node { $protected-paths },
            "query-roleset" : object-node { "role-name" : array-node { "pii-reader" } }
        }
    }
};

(:
   A well-constructed modern model looks like:
  {
    $schema: ...,
    info: {
      ...
    },
    definitions: {
      E1: {...},
      E2: {...},
    },
    properties: {"E1": {"$ref":"#definitions/properties/E1"}},
    required: ["E1"]
  }

  With one required top level entity
 :)
declare function
esi:is-modern-model($model as map:map) as xs:boolean
{
  exists($model=>map:get("$schema")) and
  exists($model=>map:get("properties")) and
  count($model=>map:get("properties")=>map:keys())=1 and
  exists($model=>map:get("properties")=>map:get(($model=>map:get("properties")=>map:keys())[1])=>map:get("$ref")) and
  exists($model=>map:get("required")) and
  count(json:array-values($model=>map:get("required")))=1
};

declare %private function
esi:walk-for-ref($top-id as xs:string?, $model as map:map) as xs:string*
{
  (: Only consider $ref if there is not a $id that makes it non-local :)
  let $id := map:get($model,"$id")
  let $id :=
    if (exists($top-id)) then (
      if (exists($id) and $id!=$top-id) then $id else ()
    ) else (
      $id
    )
  let $ref := map:get($model,"$ref")
  where (exists($ref) and starts-with($ref,"#"))
  return tokenize($ref,"/")[last()]
  ,
  for $property in map:get($model, "properties")=>map:keys()
  let $propspec := map:get($model, "properties")=>map:get($property)
  return (
    esi:walk-for-ref($top-id, $propspec),
    if (exists($propspec=>map:get("items")))
    then esi:walk-for-ref($top-id, $propspec=>map:get("items"))
    else ()
  )
};

declare %private function
esi:local-references($model as map:map) as xs:string*
{
  let $top-id := map:get($model,"$id")
  for $entity-type in $model=>map:get("definitions")=>map:keys()
  let $entity := $model=>map:get("definitions")=>map:get($entity-type)
  return esi:walk-for-ref($top-id, $entity)
};

(:
   Pick a top entity. If this is a modern model, we know already.
   If this is a legacy model, if there is only one entity, that's it.
   If there is only one entity that is NOT the target of a local reference,
   that must be it. Otherwise, we don't know, and we have to fall-back to
   lousy JSON Schemas, and lousy TDE template paths.
 :)
declare function
esi:top-entity($model as map:map, $force as xs:boolean) as xs:string?
{
  let $entity-type-names := $model=>map:get("definitions")=>map:keys()
  return (
    if (esi:is-modern-model($model)) then json:array-values($model=>map:get("required"))
    else if (count($entity-type-names)=1) then $entity-type-names
    else (
      let $local-refs := esi:local-references($model)
      (: All the entities that are not the target of a local reference :)
      let $non-child-entities := $entity-type-names[not(. = $local-refs)]
      return (
        if (count($non-child-entities)=1) then (
          $non-child-entities
        ) else if ($force) then (
          (: No good reason for picking, but pick anyway :)
          $non-child-entities[1]
        ) else () (: No basis for picking :)
      )
    )
  )
};

(:
   Old style external references are not consistent with $ref
   e.g. { "$ref": "http://example.com/base/OrderDetails" } should be
   { "$id": "http://example.com/base", "$ref": "#/definitions/OrderDetails" }
 :)
declare %private function
esi:walk-to-fix-references($top-id as xs:string?, $model as map:map) as empty-sequence()
{
  (: Only consider $ref if it is non-absolute and doesn't already have the # :)
  let $ref := $model=>map:get("$ref")
  where (not(empty($ref)) and
         not(starts-with($ref,"#")) and
         not(contains($ref,"#")))
  return (
    let $ref-name := functx:substring-after-last($ref, "/")
    let $new-ref := "#/definitions/"||$ref-name
    let $new-id := functx:substring-before-last($ref, "/")
    return (
      map:put($model, "$ref", $new-ref),
      map:put($model, "$id", $new-id)
    )
  )
  ,
  for $property in map:get($model, "properties")=>map:keys()
  let $propspec := map:get($model, "properties")=>map:get($property)
  return (
    esi:walk-to-fix-references($top-id, $propspec),
    if (exists($propspec=>map:get("items")))
    then esi:walk-to-fix-references($top-id, $propspec=>map:get("items"))
    else ()
  )
};

declare function
esi:fix-references($model as map:map) as map:map
{
  let $_ :=
    let $top-id := map:get($model,"$id")
    for $entity-type in $model=>map:get("definitions")=>map:keys()
    let $entity := $model=>map:get("definitions")=>map:get($entity-type)
    return esi:walk-to-fix-references($top-id, $entity)
  return $model
};

(:
    primary keys should be required
 :)
declare %private function
esi:walk-to-fix-primary-keys($model as map:map) as empty-sequence()
{
  let $required := $model=>map:get("required")
  let $primaryKey := $model=>map:get("primaryKey")
  where (not(empty($primaryKey)) and
         (empty($required) or not($primaryKey = json:array-values($required)))
        )
  return (
    map:put($model, "required", json:to-array((json:array-values($required), $primaryKey)))
  )
  ,
  for $property in map:get($model, "properties")=>map:keys()
  let $propspec := map:get($model, "properties")=>map:get($property)
  return (
    esi:walk-to-fix-primary-keys($propspec),
    if (exists($propspec=>map:get("items")))
    then esi:walk-to-fix-primary-keys($propspec=>map:get("items"))
    else ()
  )
};

declare function
esi:fix-primary-keys($model as map:map) as map:map
{
  let $_ :=
    for $entity-type in $model=>map:get("definitions")=>map:keys()
    let $entity := $model=>map:get("definitions")=>map:get($entity-type)
    return esi:walk-to-fix-primary-keys($entity)
  return $model
};

declare function
esi:modernize($model as map:map) as map:map
{
  let $new-model := esi:fix-references($model)
  let $top-entity := esi:top-entity($new-model, true())
  return esi:model-to-json-schema($new-model, $top-entity)
};

(:
   Old style external references are not consistent with $ref
   e.g. { "$ref": "http://example.com/base/OrderDetails" } should be
   { "$id": "http://example.com/base", "$ref": "#/definitions/OrderDetails" }
 :)
declare %private function
esi:walk-to-unfix-references($top-id as xs:string?, $model as map:map) as empty-sequence()
{
  let $id := map:get($model, "$id")
  where exists($id)
  return (
    let $ref := map:get($model, "$ref")
    let $extref := $id||"/"||functx:substring-after-last($ref,"/")
    return (
      map:put($model, "$ref", $extref),
      map:delete($model, "$id")
    )
  )
  ,
  for $property in map:get($model, "properties")=>map:keys()
  let $propspec := map:get($model, "properties")=>map:get($property)
  return (
    esi:walk-to-unfix-references($top-id, $propspec),
    if (exists($propspec=>map:get("items")))
    then esi:walk-to-unfix-references($top-id, $propspec=>map:get("items"))
    else ()
  )
};

declare function
esi:unfix-references($model as map:map) as map:map
{
  let $_ :=
    let $top-id := map:get($model,"$id")
    for $entity-type in $model=>map:get("definitions")=>map:keys()
    let $entity := $model=>map:get("definitions")=>map:get($entity-type)
    return esi:walk-to-unfix-references($top-id, $entity)
  return $model
};

declare function
esi:demodernize($model as map:map) as map:map
{
  let $_ := (
    esi:unfix-references($model),
    map:delete($model, "$id"),
    map:delete($model, "$schema"),
    map:delete($model, "properties"),
    map:delete($model, "required"),
    map:delete($model, "oneOf")
  )
  return $model
};

declare function
esi:demodernize-xml($model as node()) as node()
{
  xdmp:xslt-eval(
    <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                    xmlns:xdmp="http://marklogic.com/xdmp"
                    xmlns:es="http://marklogic.com/entity-services"
                    extension-element-prefixes="xdmp"
                    version="2.0">
      <xsl:output xdmp:default-attributes="no"/>

      <xsl:template match="es:model">
        <xsl:copy>
          <xsl:apply-templates select="@* except xml:lang"/>
          <xsl:for-each select="node() except (es:id|es:ref|es:schema|es:properties|es:required|es:oneOf)">
            <xsl:apply-templates select="."/>
          </xsl:for-each>
        </xsl:copy>
      </xsl:template>

      <xsl:template match="*[es:id and es:ref]">
        <xsl:variable name="refname" select="tokenize(es:ref,'/')[last()]"/>
        <xsl:copy>
          <xsl:apply-templates select="@*"/>
          <es:ref><xsl:value-of select="concat(es:id,'/',$refname)"/></es:ref>
          <xsl:for-each select="node() except (es:id|es:ref|es:schema)">
            <xsl:apply-templates select="."/>
          </xsl:for-each>
        </xsl:copy>
      </xsl:template>

      <xsl:template match="*">
        <xsl:copy>
          <xsl:apply-templates select="@*"/>
          <xsl:for-each select="node()">
            <xsl:apply-templates select="."/>
          </xsl:for-each>
        </xsl:copy>
      </xsl:template>

      <xsl:template match="@*">
        <xsl:copy-of select="."/>
      </xsl:template>
    </xsl:stylesheet>,
    document { $model }
  )
};

declare function esi:mapping-validate(
  $mapping as node()
)
{
  (: TODO: higher level errors :)
  let $input :=
    typeswitch ($mapping)
    case document-node() return
      if ($mapping/m:mapping) then $mapping
      else fn:error((),"ES-MAPPING-BADFORMAT")
    case element(m:mapping) return document {$mapping}
    default return fn:error((),"ES-MAPPING-BADFORMAT")
  let $xslt :=
    <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                    xdmp:dialect="1.0-ml"
                    xmlns:xdmp="http://marklogic.com/xdmp"
                    extension-element-prefixes="xdmp"
                    version="2.0">
      {
        (: Slam in empty schemas for every non-mapping namespace
         : so that validation doesn't pick up the schema for instances
         : of the entities we're mapping and complain if there are mapping
         : elements inside.
         : We could use processContents=skip, but then we'd lose all
         : validation inside mapped entity constructs. IWBNI there
         : were a validation API that gave us more control here without
         : this dark magic.
         :)
        for $prefix in in-scope-prefixes($input/*)[. ne 'xml']
        let $ns := namespace-uri-for-prefix($prefix, $input/*)
        where not($ns="http://marklogic.com/entity-services/mapping")
        return (
            <xsl:import-schema namespace="{$ns}"><xs:schema elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema" targetNamespace="{$ns}"/></xsl:import-schema>
        )
        ,
        <xsl:import-schema><xs:schema elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema"/></xsl:import-schema>
      }
      <xsl:template match="/">
        <xsl:copy-of select="validate {{.}}"/>
      </xsl:template>
    </xsl:stylesheet>
  return
    xdmp:xslt-eval($xslt, $input)
};

declare function esi:instance-validate(
     $node as node(),
     $model as map:map
) as node()
{
  typeswitch ($node)
  case document-node() return (
    if ($node//es:instance) then (
      esi:validate-xml-instance( $node, $model, true() )
    ) else if ($node/element()) then (
      esi:validate-xml-instance( $node, $model, false() )
    ) else if ($node//instance) then (
      let $root := $node//instance/(* except info)
      return
        esi:validate-json-instance(
          document {
            object-node {
              (name($root)) : $root
            }
          }, $model )
    ) else (
      esi:validate-json-instance( $node, $model )
    )
  )
  case element() return (
    if ($node//es:instance) then (
      esi:validate-xml-instance( document { $node }, $model, true() )
    ) else (
      esi:validate-xml-instance( document { $node }, $model, false() )
    )
  )
  default return (
    if ($node//instance) then (
      let $root := $node//instance/(* except info)
      return
        esi:validate-json-instance(
          document {
            object-node {
              (name($root)) : $root
            }
          }, $model )
    ) else (
      esi:validate-json-instance( document{ $node }, $model )
    )
  )
};

declare %private function esi:validate-xml-instance(
     $doc as document-node(),
     $model as map:map,
     $enveloped as xs:boolean
) as node()
{
  (: We need a base URI for the schema resolution to work properly :)
  if (empty(base-uri($doc/*))) then (
    if ($enveloped) then (
      esi:validate-xml-instance(
        document { <es:envelope xml:base="/"><es:instance>{$doc//es:instance/*}</es:instance></es:envelope> },
        $model,
        true()
      )
    ) else (
      esi:validate-xml-instance(
        document { <es:envelope xml:base="/"><es:instance>{$doc}</es:instance></es:envelope> },
        $model,
        true()
      )
    )
  ) else (
    try {
      let $xsds := esi:schema-generate($model)
      (: XSLT allows for ad hoc schema imports, so we'll use that.
       : This allows us to avoid loading anything into a database
       : Add empty schema for Entity Services namespace so that schema
       : doesn't interfere
       :)
      let $empty-base := empty(base-uri($doc/*))
      let $xslt :=
        <xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                        xdmp:dialect="1.0-ml"
                        xmlns:xdmp="http://marklogic.com/xdmp"
                        xmlns:es="http://marklogic.com/entity-services"
                        extension-element-prefixes="xdmp"
                        version="2.0">
          {
            for $xsd in $xsds return (
              if (exists($xsd/@targetNamespace))
              then <xsl:import-schema namespace="{$xsd/@targetNamespace}">{$xsd}</xsl:import-schema>
              else <xsl:import-schema>{$xsd}</xsl:import-schema>
            )
          }
          <xsl:import-schema namespace="http://marklogic.com/entity-services"><xs:schema elementFormDefault="qualified" xmlns:xs="http://www.w3.org/2001/XMLSchema" targetNamespace="http://marklogic.com/entity-services"/></xsl:import-schema>
          <xsl:template match="/">
            <xsl:copy-of select="xdmp:validate(.)"/>
          </xsl:template>
        </xsl:stylesheet>
      return (
        xdmp:xslt-eval($xslt,
          if ($enveloped) then
            document { $doc/es:envelope/es:instance/*[not(self::es:info)] }
          else $doc
        )
      )
    } catch ($e) {
      <xdmp:validation-errors xmlns:xdmp="http://marklogic.com/xdmp">
        {$e}
      </xdmp:validation-errors>
    }
  )
};

declare function esi:validate-json-instance(
     $doc as document-node(),
     $model as map:map
) as node()
{
  try {
    xdmp:json-validate-report-node(
      $doc,
      xdmp:to-json(esi:model-to-json-schema($model))
    )
  } catch ($e) {
    <xdmp:validation-errors xmlns:xdmp="http://marklogic.com/xdmp">
    {$e}
    </xdmp:validation-errors>
  }
};

(:
   Instance type may be indicated by:
     $type key
     top level singleton key
     root element
    (Matching /es:model/es:definitions/*)
   Instance model may be indicated by:
     /es:envelope/es:instance/es:info/es:title and
     /es:envelope/es:instance/es:info/es:version
     (Matching /es:model/es:info/es:title and /es:model/es:info/es:version)

   We will consider models that have the instance type
   If we have title+version we will prefer models for that
   For shallow processing we will not do any validation, just name checking
     The scoring is intentioned to give these broad preferences:
       same instance type, same title, same version
       same instance type, same title, model has higher version
       same instance type, same title, model has lower version
       same instance type, no title or version
       greater differences in versions => lower preference
   For deep processing we will do validation of candidate models and prefer
   models that validate where more errors => lower preference
 :)
declare function esi:identify-instance-model(
     $node as node(),
     $deep as xs:boolean,
     $debug as xs:boolean
) as map:map*
{
  (: For XML it is helpful to pass the full envelope so we can do validation
   : with proper base-uri handling
   :)
  typeswitch ($node)
  case document-node() return (
    if ($node//es:instance) then (
      let $instance := $node//es:instance/(* except es:info)
      let $_ := $debug and xdmp:log("DOC ENV ELT INSTANCE="||xdmp:quote($node))
      let $info := $node//es:instance/es:info
      return
        esi:identify-instance-model(
          $node, $deep,
          $info/es:title, $info/es:version,
          local-name($instance), namespace-uri($instance),
          true(),
          $debug
        )
    ) else if ($node/element()) then (
      let $_ := $debug and xdmp:log("DOC ELT INSTANCE="||xdmp:quote($node))
      return
        esi:identify-instance-model(
          $node, $deep,
          (), (),
          local-name($node/element()), namespace-uri($node/element()),
          false(),
          $debug
        )
    ) else if ($node//instance) then (
      let $instance := $node//instance/(* except info)
      let $_ := $debug and xdmp:log("DOC ENV INSTANCE="||xdmp:quote($node))
      let $info := $node//instance/info
      let $type := (
        $instance/*[name(.)="$type"],
        $instance/name(.)
      )[1]
      return
        esi:identify-instance-model(
          document { $instance }, $deep,
          $info/title, $info/version,
          $type, $instance/*[local-name(.)="$namespace"],
          false(),
          $debug
        )
    ) else (
      let $type := (
        $node/*[name(.)="$type"],
        name($node)
      )[1]
      let $_ := $debug and xdmp:log("DOC OBJ INSTANCE="||xdmp:quote($node))
      return
        esi:identify-instance-model(
          $node, $deep,
          (), (),
          $type, $node/*[name(.)="$namespace"],
          false(),
          $debug
        )
    )
  )
  case element() return (
    if ($node//es:instance) then (
      let $instance := $node//es:instance/(* except es:info)
      let $_ := $debug and xdmp:log("ENV ELT INSTANCE="||xdmp:quote($node))
      let $info := $node//es:instance/es:info
      return
        esi:identify-instance-model(
          document { $node }, $deep,
          $info/es:title, $info/es:version,
          local-name($instance), namespace-uri($instance),
          true(),
          $debug
        )
    ) else (
      let $_ := $debug and xdmp:log("ELT INSTANCE="||xdmp:quote($node))
      return
        esi:identify-instance-model(
          document {$node}, $deep,
          (), (),
          local-name($node), namespace-uri($node),
          false(),
          $debug
        )
    )
  )
  default return (
    if ($node//instance) then (
      let $instance := $node//instance/(* except info)
      let $info := $node//instance/info
      let $type := (
        $instance/*[name(.)="$type"],
        $instance/name(.)
      )[1]
      let $_ := $debug and xdmp:log("ENV OBJ INSTANCE="||xdmp:quote($instance))
      return
        esi:identify-instance-model(
          document { $instance }, $deep,
          $info/title, $info/version,
          $type, $instance/*[name(.)="$namespace"],
          false(),
          $debug
        )
    ) else (
      let $type := (
        $node/*[name(.)="$type"],
        local-name($node)
      )[1]
      let $_ := $debug and xdmp:log("OBJ INSTANCE="||xdmp:quote($node))
      return
        esi:identify-instance-model(
          document { $node }, $deep,
          (), (),
          $type, $node/*[name(.)="$namespace"],
          false(),
          $debug
        )
    )
  )
};

declare %private function esi:identify-instance-model(
     $instance as document-node(),
     $deep as xs:boolean,
     $title as xs:string?,
     $version as xs:string?,
     $entityType as xs:string,
     $entityNamespace as xs:string?,
     $enveloped as xs:boolean,
     $debug as xs:boolean
) as map:map*
{
  let $isXML := $instance/* instance of element()
  let $assert :=
    if ($isXML) then ()
    else if ($enveloped) then fn:error((), "XDMP-BAD", "Enveloped JSON")
    else ()
  let $sparql := '
    PREFIX es: <http://marklogic.com/entity-services#>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    SELECT ?s
    WHERE {
      ?s <rdf:type> <es:EntityType> .
    '||
    (if (empty($title)) then '' else '
      ?s <es:title> ?title .
    ')||
    (if (empty($version)) then '' else '
      ?s <es:version> ?version .
    ')||
    (if (empty($entityNamespace)) then '' else '
      ?s <es:namespace> ?namespace .
    ')||
    (if (empty($title) and empty($version)) then '
      FILTER (strafter(strafter(?s, "-"),"/")=?type)
    '
    else if (empty($title)) then '
      FILTER (strafter(?s, concat("-",?version,"/"))=?type)
    '
    else if (empty($version)) then '
      FILTER (strafter(strafter(?s, concat($title,"-")),"/")=?type)
    '
    else '
      FILTER (strafter(?s, concat(?title,"-",?version,"/"))=?type)
    ')||
    '}'
  let $candidates :=
    sem:sparql($sparql,
      map:map()=>
        map:with("type",$entityType)=>
        map:with("namespace",$entityNamespace)
    )
  let $model-docs :=
    cts:search(
      collection("http://marklogic.com/entity-services/models"),
      cts:triple-range-query(
        $candidates!map:get(.,"s"),
        sem:iri("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
        sem:iri("http://marklogic.com/entity-services#EntityType"),
        "="),
      "unfiltered"
    )
  let $top-properties :=
    if ($isXML) then (
       if ($enveloped)
       then $instance//es:instance/*[not(self::es:info)]/*/local-name(.)
       else $instance/*/*/local-name(.)
    ) else if (exists($instance/*[local-name(.)="$type"])) then (
      $instance/*/name(.)
    ) else (
      $instance/*/*/name(.)
    )
  let $_ := $debug and xdmp:log("INSTANCE TOP="||xdmp:quote($top-properties))
  let $models :=
    for $model-doc in $model-docs
    let $model := try { esi:model-validate($model-doc) } catch ($e) { () }
    where (exists($model))
    return $model=>map:with("modelURI", xdmp:node-uri($model-doc))
  let $results :=
    for $model in $models
    let $model-title := $model=>map:get("info")=>map:get("title")
    let $model-version := $model=>map:get("info")=>map:get("version")
    let $definition := $model=>map:get("definitions")=>map:get($entityType)
    let $model-top-properties :=
      if (empty($definition)) then ()
      else $definition=>map:get("properties")=>map:keys()
    let $_ := $debug and xdmp:log($model=>map:get("modelURI")||" MODEL TOP="||xdmp:quote($model-top-properties))
    let $model-required-properties :=
      if (empty($definition)) then ()
      else $definition=>map:get("required")=>json:array-values()
    let $_ := $debug and xdmp:log($model=>map:get("modelURI")||" MODEL REQ="||xdmp:quote($model-required-properties))
    let $report :=
      if ($deep) then (
        if (empty($definition)) then ()
        else if ($isXML)
        then esi:validate-xml-instance($instance, $model, $enveloped)
        else esi:validate-json-instance($instance, $model)
      ) else (
        ()
      )
    let $score :=
      (
        let $sub :=
          if (empty($definition)) then -10
          else if ($deep) then (
            if ($report//es:error)
            then -5 * count($report//es:error)
            else 10
          ) else 5
        let $_ := $debug and xdmp:log($model=>map:get("modelURI")||" "||$entityType||" validation="||$sub)
        let $_ := $debug and
          (if ($deep and $sub < 0) then xdmp:log(xdmp:quote($report)) else ())
        return $sub
      ) +
      (
        let $sub :=
          sum(
            for $prop in $top-properties return (
              if ($prop=$model-top-properties) then (
                if ($prop=$model-required-properties)
                then 2
                else 1
              )
              else -1
            )
          )
        let $_ := $debug and xdmp:log($model=>map:get("modelURI")||" "||$entityType||" top-props="||$sub)
        return $sub
      ) +
      (
        let $sub :=
          -2 * count($model-required-properties[not(.=$top-properties)])
        let $_ := $debug and xdmp:log($model=>map:get("modelURI")||" "||$entityType||" req-props="||$sub)
        return $sub
      ) +
      (
        let $sub :=
          if (exists($model-title) and exists($title)) then (
            if ($model-title eq $title) then 2 else -2
          ) else 0
        let $_ := $debug and xdmp:log($model=>map:get("modelURI")||" "||$entityType||" title="||$sub)
        return $sub
      ) +
      (
        let $sub := xs:integer(
          if (exists($model-version) and exists($version)) then (
            let $model-version-num := esi:version-num($model-version)
            let $version-num := esi:version-num($version)
            return (
              if (($model-version eq $version) or
                  ($model-version-num eq $version-num)
              ) then 5
              else if ($model-version-num gt $version-num)
              then 5 - ($model-version-num - $version-num)
              else if ($model-version-num lt $version-num)
              then round($model-version-num - $version-num)
              else 0
            )
          ) else 0
        )
        let $_ := $debug and xdmp:log($model=>map:get("modelURI")||" "||$entityType||" version="||$sub)
        return $sub
      )
    let $uri := map:get($model, "modelURI")
    let $_ := map:delete($model, "modelURI")
    return (
      map:map()=>
        map:with("uri", $uri)=>
        map:with("model", $model)=>
        map:with("score", $score)=>
        map:with("validation", $report)
    )
  let $best-five :=
    (for $result in $results
     order by xs:integer($result=>map:get("score")) descending
     return $result)[1 to 5]
  return (
    if ($best-five=>map:get("score") gt 0)
    then $best-five[map:get(.,"score") ge 0]
    else $best-five
  )
};

declare %private function esi:version-num(
     $version as xs:string
) as xs:double
{
  let $bits := tokenize(normalize-space($version),"[.]")[. ne ""]
  let $max := 2
  let $out :=
    $bits[1] || "." ||
    fold-left(
      function ($s, $z) {
        $s ||
        string-join((for $i in string-length($z) to $max return "0"),"") ||
        $z
      },
      "",
      $bits[2 to last()]
    )
  return
    try { xs:double($out) } catch ($e) { 0.0 }
};
