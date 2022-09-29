xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:reset-hub()

;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
hub-test:load-artifacts($test:__CALLER_FILE__)
;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
hub-test:load-entities($test:__CALLER_FILE__)
;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";
hub-test:load-concepts($test:__CALLER_FILE__)
;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
hub-test:wait-for-indexes();

xquery version "1.0-ml";

xdmp:document-insert("/config/hubCentral.json", xdmp:unquote('{
                       "modeling": {
                         "entities": {
                           "BabyRegistry": { "x": 10, "y": 15, "label":"arrivalDate","propertiesOnHover": ["ownedBy", "babyRegistryId"] },
                           "Office": { "x": 12, "y": 16, "label":"name"},
                           "Product": {
                             "graphX": 63,
                             "graphY": -57,
                             "label": "productName",
                             "propertiesOnHover": [
                               "productId"
                             ]
                           },
                           "Customer": {
                              "graphX": 63,
                              "graphY": -57,
                              "propertiesOnHover": [
                                "shipping",
                                "shipping.city",
                                "billing.city"
                              ]
                           }
                         }
                       }
                     }'),
                     (xdmp:permission("data-hub-common", "read"),xdmp:permission("data-hub-common-writer", "update"))
)
