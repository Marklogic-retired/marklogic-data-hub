xquery version "1.0-ml";

(:
 : Test the custom xqy algorithm feature.
 :)

import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace sm = "http://marklogic.com/smart-mastering";
declare namespace has = "has";

declare option xdmp:mapping "false";

let $m :=
  map:new((
    map:entry(
      "custom",
      map:new((
        map:entry(
          "unconfigured",
          (
            <unconfigured xmlns="" xmlns:has="has">unconfigured value 2b</unconfigured>,
            <unconfigured xmlns="" xmlns:has="has">unconfigured value 1b</unconfigured>
          )
        ),
        map:entry(
          "this",
          map:new((
            map:entry(
              "has:a",
              map:new((
                map:entry(
                  "deep",
                  map:new((
                    map:entry(
                      "path",
                      map:new((
                        map:entry(
                          "sources",
                          (
                            object-node{"name":"SOURCE2", "dateTime":"2018-04-26T16:40:16.760311Z", "documentUri":"/source/2/doc2.xml"},
                            object-node{"name":"SOURCE1", "dateTime":"2018-04-26T16:40:02.1386Z", "documentUri":"/source/1/doc1.xml"}
                          )
                        ),
                        map:entry("values", <path xmlns="" xmlns:has="has">deep value 21</path>)
                      ))
                    )
                  ))
                )
              ))
            )
          ))
        )
      ))
    ),
    map:entry(
      "shallow",
      map:new((
        map:entry(
          "sources",
          object-node { "name":"SOURCE1", "dateTime":"2018-04-26T16:40:02.1386Z", "documentUri":"/source/1/doc1.xml" }
        ),
        map:entry("values", <shallow xmlns="">shallow value 1</shallow>),
        map:entry("name", "shallow")
      ))
    ),
    map:entry(
      "{http://marklogic.com/entity-services}unconfigured",
      (
        <unconfigured xmlns="http://marklogic.com/entity-services">unconfigured value 2a</unconfigured>,
        <unconfigured xmlns="http://marklogic.com/entity-services">unconfigured value 1a</unconfigured>
      )
    )
  ))
let $ns-map :=
  map:new((
    map:entry("has", "has")
  ))
let $actual := merge-impl:map-to-xml($ns-map, $m)
(:
 : Expecting:
 (
    <unconfigured xmlns="http://marklogic.com/entity-services">unconfigured value 2a</unconfigured>,
    <unconfigured xmlns="http://marklogic.com/entity-services">unconfigured value 1a</unconfigured>,
    <shallow>shallow value 1</shallow>,
    <custom>
      <unconfigured xmlns:has="has">unconfigured value 2b</unconfigured>
      <unconfigured xmlns:has="has">unconfigured value 1b</unconfigured>
      <this><has:a xmlns:has="has"><deep><path><path>deep value 21</path></path></deep></has:a></this>
    </custom>
 )
 :)
let $unconfigured := $actual[fn:node-name(.) eq xs:QName("es:unconfigured")]
let $shallow := $actual[fn:node-name(.) eq xs:QName("shallow")]
return (
  test:assert-equal(2, fn:count($unconfigured)),
  test:assert-same-values(
    ("unconfigured value 1a", "unconfigured value 2a"),
    $unconfigured/fn:string()
  ),
  test:assert-equal(1, fn:count($shallow)),
  test:assert-equal(text { "shallow value 1" }, $shallow/text())
)
