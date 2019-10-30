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
import module namespace merge-impl = "http://marklogic.com/smart-mastering/survivorship/merging"
  at "/com.marklogic.smart-mastering/survivorship/merging/base.xqy";
import module namespace matcher = "http://marklogic.com/smart-mastering/matcher"
  at "/com.marklogic.smart-mastering/matcher.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare namespace es = "http://marklogic.com/entity-services";
declare namespace sm = "http://marklogic.com/smart-mastering";

declare option xdmp:update "false";

declare option xdmp:mapping "false";

(: Merge a couple documents :)
let $merged-doc :=
  xdmp:invoke-function(
    function() {
      document {
        merging:save-merge-models-by-uri(
          map:keys($lib:TEST-DATA),
          merging:get-options($lib:OPTIONS-NAME, $const:FORMAT-XML))
      }
    },
    $lib:INVOKE_OPTIONS
  )
let $assertions := (
  let $smid := $merged-doc/*:envelope/*:headers/*:id/fn:string()
  let $s1-merged-dt := $merged-doc//document-uri[. = "/source/1/doc1.json"]/../last-merge/fn:string()
  let $s2-merged-dt := $merged-doc//document-uri[. = "/source/2/doc2.json"]/../last-merge/fn:string()
  let $expected-headers :=
    object-node {
    "custom": array-node {
      object-node {
      "this": object-node {
      "has": object-node {
      "a": object-node {
      "deep": object-node {
      "path": "deep value 2"
      }
      }
      }
      },
      "unconfigured": "unconfigured value 2b"
      },
      object-node {
      "this": object-node {
      "has": object-node {
      "a": object-node {
      "deep": object-node {
      "path": "deep value 1"
      }
      }
      }
      },
      "unconfigured": "unconfigured value 1b"
      }
    },
    "shallow": array-node {
      "shallow value 2",
      "shallow value 1"
    },
    "sources": array-node {
      object-node {
      "name":"SOURCE2",
      "import-id":"mdm-import-b96735af-f7c3-4f95-9ea1-f884bc395e0f",
      "user":"admin",
      "dateTime": $merged-doc//*:sources[*:name = "SOURCE2"]/*:dateTime/fn:string()
      },
      object-node {
      "name":"SOURCE1",
      "import-id":"mdm-import-8cf89514-fb1d-45f1-b95f-8b69f3126f04",
      "user":"admin",
      "dateTime": $merged-doc//*:sources[*:name = "SOURCE1"]/*:dateTime/fn:string()
      }
    },
    "unconfigured": array-node {
      "unconfigured value 2a",
      "unconfigured value 1a"
    },
    "merges": array-node {
      object-node {"document-uri":"/source/1/doc1.json", "last-merge": $s1-merged-dt },
      object-node {"document-uri":"/source/2/doc2.json", "last-merge": $s2-merged-dt }
    },
    "id": $smid,
    "merge-options": object-node {
    "lang": "zxx",
    "value": "/com.marklogic.smart-mastering/options/merging/test-options.xml"
    }
    }
  let $expected-triples :=
    array-node {
      object-node { "triple": object-node {
      "subject": "http://marklogic.com/sm-core/scranton",
      "predicate": "http://marklogic.com/sm-core/is-in",
      "object": object-node { "datatype": "xs:string", "value": "Pennsylvania" }
      }},
      object-node { "triple": object-node {
      "subject": "http://marklogic.com/sm-core/springfield",
      "predicate": "http://marklogic.com/sm-core/is-in",
      "object": object-node { "datatype": "xs:string", "value": "Ohio" }
      }},
      object-node { "triple": object-node {
      "subject": "http://marklogic.com/sm-core/lindsey-jones",
      "predicate": "http://marklogic.com/sm-core/lives-in",
      "object": "http://dbpedia.org/resource/Scranton,_Pennsylvania"
      }},
      object-node { "triple": object-node {
      "subject": "http://marklogic.com/sm-core/lindsey-jones",
      "predicate": "http://marklogic.com/sm-core/lives-in",
      "object": "http://dbpedia.org/resource/Springfield,_Ohio"
      }},
      object-node { "triple": object-node {
      "subject": "http://marklogic.com/sm-core/lindsey-jones",
      "predicate": "http://marklogic.com/sm-core/ssn",
      "object": object-node { "datatype": "xs:string", "value": "393225353" }
      }}
    }
  let $expected-instance :=
    object-node {
    "info": object-node {
    "title": "Example",
    "version": "1.0.0"
    },
    "MDM": object-node {
    "Person": object-node {
    "PersonType": object-node {
    "PersonSSNIdentification": object-node {
    "PersonSSNIdentificationType": object-node {
    "IdentificationID":"393225353"
    }
    },
    "CustomThing": array-node { "1","2" },
    "ArrayOfVariousThings": array-node {
      "string",
      42,
      fn:true()
    },
    "Address": object-node {
    "AddressType": object-node {
    "LocationState":"PA",
    "AddressPrivateMailboxText":"45",
    "AddressSecondaryUnitText":"JANA",
    "LocationPostalCode":"18505",
    "LocationCityName":"SCRANTON"
    }
    },
    "PersonSex":"F",
    "IncidentCategoryCodeDate": null-node{},
    "PersonBirthDate":"19801001",
    "PersonName": object-node {
    "PersonNameType": object-node {
    "PersonSurName":"JONES",
    "PersonGivenName":"LINDSEY"
    }
    },
    "CaseStartDate":"20110406",
    "Revenues": array-node {object-node {
    "RevenuesType": object-node {
    "Revenue":""
    }
    },object-node {
    "RevenuesType": object-node {
    "Revenue":"4332"
    }
    }},
    "CaseAmount": 1287.9,
    "id": array-node {"6986792174","6270654339"}
    }
    }
    }
    }
  let $expected :=
    document {
      object-node {
      "envelope": object-node {
      "headers": $expected-headers,
      "triples": $expected-triples,
      "instance": $expected-instance
      }
      }
    }
  return (
    if (fn:deep-equal($expected, $merged-doc)) then
      test:success()
    else
      fn:error(xs:QName("ASSERT-EQUAL-JSON-FAILED"), "Assert Equal Json failed", ($expected, $merged-doc))
  )
)

let $merged-id := $merged-doc/*:envelope/*:headers/*:id
let $merged-uri := merge-impl:build-merge-uri($merged-id, "json")

(: At this point, there should be no blocks :)
let $assertions := ( $assertions, xdmp:invoke-function(
  function() {xdmp:eager(map:keys($lib:TEST-DATA) ! test:assert-not-exists(matcher:get-blocks(.)/node()))},
  $lib:INVOKE_OPTIONS
))

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
