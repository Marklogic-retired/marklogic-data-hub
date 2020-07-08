xquery version "1.0-ml";

import module namespace match-impl = "http://marklogic.com/smart-mastering/matcher-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/matcher-impl.xqy";
import module namespace opt-impl = "http://marklogic.com/smart-mastering/options-impl"
  at "/com.marklogic.smart-mastering/matcher-impl/options-impl.xqy";

import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

declare variable $DOCUMENT := document{
  xdmp:unquote(
    '{
    "envelope": {
      "instance":{
          "Object": {
            "intProperty": 12,
            "strProperty": "Hello",
            "boolProperty": true,
            "dateProperty": "1987-03-17",
            "dateTimeProperty": "1956-12-09T03:55:14",
            "decimalProperty": 123.456
          }
        }
      }
    }'
  )
};

declare variable $COMPILED-OPTIONS := opt-impl:compile-match-options(
    xdmp:unquote('
    {
      "matchRulesets": [
        {
          "matchRules": [
            {
              "entityPropertyPath": "intProperty",
              "matchType": "exact"
            },
            {
              "entityPropertyPath": "strProperty",
              "matchType": "exact"
            },
            {
              "entityPropertyPath": "boolProperty",
              "matchType": "exact"
            },
            {
              "entityPropertyPath": "dateProperty",
              "matchType": "exact"
            },
            {
              "entityPropertyPath": "dateTimeProperty",
              "matchType": "exact"
            },
            {
              "entityPropertyPath": "decimalProperty",
              "matchType": "exact"
            }
          ]
        }
      ]
    }
    '),
    1
);

declare variable $EXPECTED-VALUES := map:new((
  map:entry(
    "boolProperty",
    fn:true()
  ),
  map:entry(
    "decimalProperty",
    xs:decimal(123.456)
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
    xs:integer(12)
  ),
  map:entry(
    "strProperty",
    "Hello"
  )
));

test:assert-true(
  fn:deep-equal(
    xdmp:to-json(match-impl:values-by-property-name(
      $DOCUMENT,
      $COMPILED-OPTIONS
    )),
    xdmp:to-json($EXPECTED-VALUES)
  )
)
