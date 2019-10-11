xquery version "1.0-ml";

import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

hub-test:load-entities($test:__CALLER_FILE__)
;

xquery version "1.0-ml";

import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace test = "http://marklogic.com/test" at "/test/test-helper.xqy";

hub-test:load-non-entities($test:__CALLER_FILE__),
xdmp:document-insert("/mapTest.json",xdmp:unquote('{"id":1,"transactionDate":"12/7/2019","customer":{"firstName":"Oralia","lastName":"Dinesen","gender":"F"},"items":[{"name":"Voltsillam","price":2.0,"quantity":7},{"name":"Latlux","price":7.17,"quantity":10},{"name":"Biodex","price":5.01,"quantity":2},{"name":"Fixflex","price":8.77,"quantity":6},{"name":"Keylex","price":5.57,"quantity":3}]}'))
