xquery version "1.0-ml";

(:
 : Test the merging:rollback-merge function.
 :)
import module namespace blocks-impl = "http://marklogic.com/smart-mastering/blocks-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/blocks-impl.xqy";
import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace merging = "http://marklogic.com/smart-mastering/merging"
  at "/com.marklogic.smart-mastering/merging.xqy";
import module namespace merging-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace test-ext = "http://marklogic.com/test/dh/ext" at "/test/additional-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";
import module namespace tel = "http://marklogic.com/smart-mastering/telemetry"
  at "/com.marklogic.smart-mastering/telemetry.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace sm = "http://marklogic.com/smart-mastering";

declare option xdmp:update "false";

declare option xdmp:mapping "false";

(: Merge a couple documents :)
let $merged-doc :=
  xdmp:invoke-function(
    function() {
      merging:save-merge-models-by-uri(
        map:keys($lib:TEST-DATA),
        merging:get-options($lib:OPTIONS-NAME, $const:FORMAT-XML))
    },
    $lib:INVOKE_OPTIONS
  )

let $assertions := xdmp:eager(
  let $smid := $merged-doc/es:headers/sm:id/fn:string()
  let $s1-dt := $merged-doc//sm:source[sm:name = "SOURCE1"]/sm:dateTime/fn:string()
  let $s2-dt := $merged-doc//sm:source[sm:name = "SOURCE2"]/sm:dateTime/fn:string()
  let $s1-merged-dt := $merged-doc//sm:document-uri[. = "/source/1/doc1.xml"]/@last-merge/fn:string()
  let $s2-merged-dt := $merged-doc//sm:document-uri[. = "/source/2/doc2.xml"]/@last-merge/fn:string()
  let $expected-headers :=
    <es:headers>
      <sm:id xmlns:sm="http://marklogic.com/smart-mastering">{$smid}</sm:id>
      <sm:merges xmlns:sm="http://marklogic.com/smart-mastering">
        <sm:document-uri last-merge="{$s1-merged-dt}">/source/1/doc1.xml</sm:document-uri>
        <sm:document-uri last-merge="{$s2-merged-dt}">/source/2/doc2.xml</sm:document-uri>
      </sm:merges>
      <sm:sources xmlns:sm="http://marklogic.com/smart-mastering">
        <sm:source>
          <sm:name>SOURCE2</sm:name>
          <sm:import-id>mdm-import-b96735af-f7c3-4f95-9ea1-f884bc395e0f</sm:import-id>
          <sm:user>admin</sm:user>
          <sm:dateTime>{$s2-dt}</sm:dateTime>
          <sm:one-first>2017-04-26T16:40:02.1386Z</sm:one-first>
          <sm:two-first>2018-04-26T16:40:02.1386Z</sm:two-first>
        </sm:source>
        <sm:source>
          <sm:name>SOURCE1</sm:name>
          <sm:import-id>mdm-import-8cf89514-fb1d-45f1-b95f-8b69f3126f04</sm:import-id>
          <sm:user>admin</sm:user>
          <sm:dateTime>{$s1-dt}</sm:dateTime>
          <sm:one-first>2018-04-26T16:40:02.1386Z</sm:one-first>
          <sm:one-first>2018-04-26T16:40:02.1386Z</sm:one-first>
          <sm:two-first>2017-04-26T16:40:02.1386Z</sm:two-first>
        </sm:source>
      </sm:sources>
      <sm:merge-options xml:lang="zxx">
        <sm:value>/com.marklogic.smart-mastering/options/merging/{$lib:OPTIONS-NAME}.xml</sm:value>
      </sm:merge-options>
      <shallow>shallow value 1</shallow>
      <shallow>shallow value 2</shallow>
      <es:unconfigured>unconfigured value 1a</es:unconfigured>
      <es:unconfigured>unconfigured value 2a</es:unconfigured>
      <custom xmlns:has="has" xmlns:endswith="endswith">
        <this><has:a><deep><path>deep value 1</path></deep></has:a></this>
        <this><has:a><deep><endswith:ns>endswith value 1</endswith:ns></deep></has:a></this>
        <unconfigured>unconfigured value 1b</unconfigured>
      </custom>
      <custom xmlns:has="has" xmlns:endswith="endswith">
        <this><has:a><deep><path>deep value 2</path></deep></has:a></this>
        <this><has:a><deep><endswith:ns>endswith value 2</endswith:ns></deep></has:a></this>
        <unconfigured>unconfigured value 2b</unconfigured>
      </custom>
    </es:headers>
  let $expected-instance :=
    <es:instance>
      <es:info>
        <es:title>MDM</es:title>
        <es:version>1.0.0</es:version>
      </es:info>
      <MDM>
        <Person>
          <PersonType>
            <PersonName>
              <PersonNameType>
                <PersonSurName>JONES</PersonSurName>
                <PersonGivenName>LINDSEY</PersonGivenName>
              </PersonNameType>
            </PersonName>
            <Address>
              <AddressType>
                <LocationState>PA</LocationState>
                <AddressPrivateMailboxText>45</AddressPrivateMailboxText>
                <AddressSecondaryUnitText>JANA</AddressSecondaryUnitText>
                <LocationPostalCode>18505</LocationPostalCode>
                <LocationCityName>SCRANTON</LocationCityName>
              </AddressType>
            </Address>
            <IncidentCategoryCodeDate/>
            <id>6986792174</id>
            <id>6270654339</id>
            <PersonBirthDate>19801001</PersonBirthDate>
            <CaseAmount>1287.9</CaseAmount>
            <CustomThing>1</CustomThing>
            <CustomThing>2</CustomThing>
            <OnlyOne>1</OnlyOne>
            <OnlyOne>2</OnlyOne>
            <PersonSSNIdentification>
              <PersonSSNIdentificationType>
                <IdentificationID>393225353</IdentificationID>
              </PersonSSNIdentificationType>
            </PersonSSNIdentification>
            <Revenues>
              <RevenuesType><Revenue/></RevenuesType>
            </Revenues>
            <Revenues>
              <RevenuesType><Revenue>4332</Revenue></RevenuesType>
            </Revenues>
            <CaseStartDate>20110406</CaseStartDate>
            <PersonSex>F</PersonSex>
          </PersonType>
        </Person>
      </MDM>
    </es:instance>
  let $expected-triples :=
    <es:triples>
      <sem:triple>
        <sem:subject>http://marklogic.com/sm-core/scranton</sem:subject>
        <sem:predicate>http://marklogic.com/sm-core/is-in</sem:predicate>
        <sem:object datatype="http://www.w3.org/2001/XMLSchema#string">Pennsylvania</sem:object>
      </sem:triple>
      <sem:triple>
        <sem:subject>http://marklogic.com/sm-core/springfield</sem:subject>
        <sem:predicate>http://marklogic.com/sm-core/is-in</sem:predicate>
        <sem:object datatype="http://www.w3.org/2001/XMLSchema#string">Ohio</sem:object>
      </sem:triple>
      <sem:triple>
        <sem:subject>http://marklogic.com/sm-core/lindsey-jones</sem:subject>
        <sem:predicate>http://marklogic.com/sm-core/lives-in</sem:predicate>
        <sem:object>http://dbpedia.org/resource/Scranton,_Pennsylvania</sem:object>
      </sem:triple>
      <sem:triple>
        <sem:subject>http://marklogic.com/sm-core/lindsey-jones</sem:subject>
        <sem:predicate>http://marklogic.com/sm-core/lives-in</sem:predicate>
        <sem:object>http://dbpedia.org/resource/Springfield,_Ohio</sem:object>
      </sem:triple>
      <sem:triple>
        <sem:subject>http://marklogic.com/sm-core/lindsey-jones</sem:subject>
        <sem:predicate>http://marklogic.com/sm-core/ssn</sem:predicate>
        <sem:object datatype="http://www.w3.org/2001/XMLSchema#string">393225353</sem:object>
      </sem:triple>
    </es:triples>
  let $expected := <es:envelope xmlns:es="http://marklogic.com/entity-services">{$expected-headers}{$expected-triples}{$expected-instance}</es:envelope>
  return (
    test-ext:assert-equal-tidy-xml($expected-headers, $merged-doc/es:headers),
    test-ext:assert-equal-tidy-xml($expected-triples, $merged-doc/es:triples),
    test-ext:assert-equal-tidy-xml($expected-instance, $merged-doc/es:instance)
  )
)
let $merged-id := $merged-doc/es:headers/sm:id
let $merged-uri := $merging-impl:MERGED-DIR || $merged-id || ".xml"

(: At this point, there should be no blocks :)
let $assertions := xdmp:eager(
  map:keys($lib:TEST-DATA) ! test:assert-not-exists(matcher:get-blocks(.)/node())
)

let $unmerge :=
  xdmp:invoke-function(
    function() {
      merging:rollback-merge($merged-uri, fn:true())
    },
    $lib:INVOKE_OPTIONS
  )
let $_ := map:clear($blocks-impl:cached-blocks-by-uri)
(: And now there should be blocks :)
let $assertions := (
  $assertions,
  xdmp:invoke-function(
    function() {map:keys($lib:TEST-DATA) ! test:assert-exists(matcher:get-blocks(.)/node())},
    $lib:INVOKE_OPTIONS
  )
)

return $assertions
