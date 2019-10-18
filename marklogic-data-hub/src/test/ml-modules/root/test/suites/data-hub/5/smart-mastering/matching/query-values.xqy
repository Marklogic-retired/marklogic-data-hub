xquery version "1.0-ml";

import module namespace match-impl = "http://marklogic.com/smart-mastering/matcher-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/matcher-impl.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare variable $DOCUMENT := document{
  xdmp:unquote(
    '{
      "Object": {
        "intProperty": 12,
        "strProperty": "Hello",
        "boolProperty": true,
        "dateProperty": "1987-03-17",
        "dateTimeProperty": "1956-12-09T03:55:14",
        "decimalProperty": 123.456
      }
    }'
  )
};

declare variable $COMPILED-OPTIONS := map:new((
  map:entry(
    "queries",
    (
      map:new((
        map:entry(
          "qname",
          xs:QName("intProperty")
        )
      )),
      map:new((
        map:entry(
          "qname",
          xs:QName("strProperty")
        )
      )),
      map:new((
        map:entry(
          "qname",
          xs:QName("boolProperty")
        )
      )),
      map:new((
        map:entry(
          "qname",
          xs:QName("dateProperty")
        )
      )),
      map:new((
        map:entry(
          "qname",
          xs:QName("dateTimeProperty")
        )
      )),
      map:new((
        map:entry(
          "qname",
          xs:QName("decimalProperty")
        )
      ))
    )
  )
));

declare variable $EXPECTED-VALUES := map:new((
  map:entry(
    "boolProperty",
    fn:true()
  ),
  map:entry(
    "decimalProperty",
    xs:double(123.456)
  ),
  map:entry(
    "dateProperty",
    "1987-03-17"
  ),
  map:entry(
    "dateTimeProperty",
    "1956-12-09T03:55:14"
  ),
  map:entry(
    "intProperty",
    xs:double(12)
  ),
  map:entry(
    "strProperty",
    "Hello"
  )
));

test:assert-true(
  fn:deep-equal(
    <x>{match-impl:values-by-qname(
      $DOCUMENT,
      $COMPILED-OPTIONS
    )}</x>,
    <x>{$EXPECTED-VALUES}</x>
  )
)
