xquery version "1.0-ml";

import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare option xdmp:mapping "false";

(:
 : Example result (from first test, with just 2 results).
 : Note: matching is expected to run with either XML or JSON documents, not a
 : mix. This test's data has a mix so that we can play with both. In this
 : example response, no <match> elements under the JSON documents is due to the
 : format mismatch.

  <results total="5" page-length="6" start="1">
    <boost-query>
      <cts:or-query xmlns:cts="http://marklogic.com/cts">
        <cts:element-value-query weight="50">
          <cts:element>IdentificationID</cts:element>
          <cts:text xml:lang="en">393225353</cts:text>
          <cts:option>case-insensitive</cts:option>
        </cts:element-value-query>
        <cts:element-value-query weight="8">
          <cts:element>PersonSurName</cts:element>
          <cts:text xml:lang="en">JONES</cts:text>
          <cts:option>case-insensitive</cts:option>
        </cts:element-value-query>
        <cts:element-value-query weight="12">
          <cts:element>PersonGivenName</cts:element>
          <cts:text xml:lang="en">LINDSEY</cts:text>
          <cts:option>case-insensitive</cts:option>
        </cts:element-value-query>
        <cts:element-value-query weight="5">
          <cts:element>AddressPrivateMailboxText</cts:element>
          <cts:text xml:lang="en">45</cts:text>
          <cts:option>case-insensitive</cts:option>
        </cts:element-value-query>
        <cts:element-value-query>
          <cts:element>LocationState</cts:element>
          <cts:text xml:lang="en">PA</cts:text>
          <cts:option>case-insensitive</cts:option>
        </cts:element-value-query>
        <cts:element-value-query weight="3">
          <cts:element>LocationPostalCode</cts:element>
          <cts:text xml:lang="en">18505</cts:text>
          <cts:option>case-insensitive</cts:option>
        </cts:element-value-query>
      </cts:or-query>
    </boost-query>
    <match-query>
      <cts:and-query xmlns:cts="http://marklogic.com/cts">
        <cts:collection-query>
          <cts:uri>mdm-content</cts:uri>
        </cts:collection-query>
        <cts:not-query>
          <cts:document-query>
            <cts:uri>/source/2/namespaced-doc2.xml</cts:uri>
          </cts:document-query>
        </cts:not-query>
        <cts:or-query>
          <cts:element-value-query weight="0">
            <cts:element>IdentificationID</cts:element>
            <cts:text xml:lang="en">393225353</cts:text>
            <cts:option>case-insensitive</cts:option>
          </cts:element-value-query>
        </cts:or-query>
      </cts:and-query>
    </match-query>
    <result uri="/source/3/namespaced-doc3.xml" index="1" score="79" threshold="Definitive Match" action="merge">
      <matches>
        <match>fn:doc("/source/3/namespaced-doc3.xml")/es:envelope/es:instance/*:MDM/*:Person/*:PersonType/*:PersonName/*:PersonNameType/*:PersonSurName/text()</match>
        <match>fn:doc("/source/3/namespaced-doc3.xml")/es:envelope/es:instance/*:MDM/*:Person/*:PersonType/*:PersonName/*:PersonNameType/*:PersonGivenName/text()</match>
        <match>fn:doc("/source/3/namespaced-doc3.xml")/es:envelope/es:instance/*:MDM/*:Person/*:PersonType/*:Address/*:AddressType/*:LocationState/text()</match>
        <match>fn:doc("/source/3/namespaced-doc3.xml")/es:envelope/es:instance/*:MDM/*:Person/*:PersonType/*:Address/*:AddressType/*:AddressPrivateMailboxText/text()</match>
        <match>fn:doc("/source/3/namespaced-doc3.xml")/es:envelope/es:instance/*:MDM/*:Person/*:PersonType/*:Address/*:AddressType/*:LocationPostalCode/text()</match>
        <match>fn:doc("/source/3/namespaced-doc3.xml")/es:envelope/es:instance/*:MDM/*:Person/*:PersonType/*:PersonSSNIdentification/*:PersonSSNIdentificationType/*:IdentificationID/text()</match>
      </matches>
    </result>
    <result uri="/source/1/namespaced-doc1.xml" index="2" score="70" threshold="Likely Match" action="notify">
      <matches>
        <match>fn:doc("/source/1/namespaced-doc1.xml")/es:envelope/es:instance/*:MDM/*:Person/*:PersonType/*:PersonName/*:PersonNameType/*:PersonSurName/text()</match>
        <match>fn:doc("/source/1/namespaced-doc1.xml")/es:envelope/es:instance/*:MDM/*:Person/*:PersonType/*:PersonName/*:PersonNameType/*:PersonGivenName/text()</match>
        <match>fn:doc("/source/1/namespaced-doc1.xml")/es:envelope/es:instance/*:MDM/*:Person/*:PersonType/*:PersonSSNIdentification/*:PersonSSNIdentificationType/*:IdentificationID/text()</match>
      </matches>
    </result>
  </results>
 :)

let $doc := fn:doc($lib:NAMESPACED-URI2)
let $options := matcher:get-options($lib:NAMESPACED-MATCH-OPTIONS-NAME, $const:FORMAT-XML)
return (
  (: test page length gt # of results :)
  let $actual := matcher:find-document-matches-by-options($doc, $options, 1, 6, fn:true(), cts:true-query())
  return (
    test:assert-true($actual instance of element(results)),
    test:assert-equal(6, $actual/@page-length/xs:int(.)),
    test:assert-equal(2, fn:count($actual/result)),
    test:assert-equal(1, $actual/@start/xs:int(.)),
    test:assert-equal(2, $actual/@total/xs:int(.)),
    test:assert-not-exists($actual/result/@total),
    for $r at $i in $actual/result
    order by $r/@index/xs:int(.) ascending
    return
      test:assert-equal($i, $r/@index/xs:int(.))
  ),

  (: test page length < # of results :)
  let $actual := matcher:find-document-matches-by-options($doc, $options, 1, 1, fn:true(), cts:true-query())
  return (
    test:assert-true($actual instance of element(results)),
    test:assert-equal(1, $actual/@page-length/xs:int(.)),
    test:assert-equal(1, fn:count($actual/result)),
    test:assert-equal(1, $actual/@start/xs:int(.)),
    test:assert-equal(2, $actual/@total/xs:int(.)),
    test:assert-not-exists($actual/result/@total),
    for $r at $i in $actual/result
    order by $r/@index/xs:int(.) ascending
    return
      test:assert-equal($i, $r/@index/xs:int(.))
  ),

  (: test last page :)
  let $actual := matcher:find-document-matches-by-options($doc, $options, 2, 2, fn:true(), cts:true-query())
  return (
    test:assert-true($actual instance of element(results)),
    test:assert-equal(2, $actual/@page-length/xs:int(.)),
    test:assert-equal(1, fn:count($actual/result)),
    test:assert-equal(2, $actual/@start/xs:int(.)),
    test:assert-equal(2, $actual/@total/xs:int(.)),
    test:assert-not-exists($actual/result/@total),
    for $r at $i in $actual/result
    order by $r/@index/xs:int(.) ascending
    return
      test:assert-equal($i + 1, $r/@index/xs:int(.))
  ),

  (: test no results :)
  let $doc := fn:doc($lib:URI7)
  let $actual := matcher:find-document-matches-by-options($doc, $options, 5, 2, fn:true(), cts:true-query())
  return (
    test:assert-true($actual instance of element(results)),
    test:assert-equal(2, $actual/@page-length/xs:int(.)),
    test:assert-equal(0, fn:count($actual/result)),
    test:assert-equal(5, $actual/@start/xs:int(.)),
    test:assert-equal(0, $actual/@total/xs:int(.)),
    test:assert-not-exists($actual/result/@total)
  )
)
