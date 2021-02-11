(: set up temporal fields, range indexes, axes and collection for validateMatchingStep test :)

xquery version "1.0-ml";
import module namespace admin = "http://marklogic.com/xdmp/admin" at "/MarkLogic/admin.xqy";
let $config := admin:get-configuration()
let $dbid := xdmp:database()
let $fieldspec1 := admin:database-metadata-field("validStart")
let $fieldspec2 := admin:database-metadata-field("validEnd")
let $fieldspec3 := admin:database-metadata-field("systemStart")
let $fieldspec4 := admin:database-metadata-field("systemEnd")
for $fieldspec in ($fieldspec1, $fieldspec2, $fieldspec3, $fieldspec4)
let $new-config := admin:database-add-field($config, $dbid, $fieldspec)
return admin:save-configuration($new-config)

;

xquery version "1.0-ml";
import module namespace admin = "http://marklogic.com/xdmp/admin" at "/MarkLogic/admin.xqy";
let $config := admin:get-configuration()
let $dbid := xdmp:database()
let $rangespec1 := admin:database-range-field-index("dateTime", "validStart", "", fn:true())
let $rangespec2 := admin:database-range-field-index("dateTime", "validEnd", "", fn:true())
let $rangespec3 := admin:database-range-field-index("dateTime", "systemStart", "", fn:true())
let $rangespec4 := admin:database-range-field-index("dateTime", "systemEnd", "", fn:true())
for $rangespec in ($rangespec1, $rangespec2, $rangespec3, $rangespec4)
let $new-config := admin:database-add-range-field-index($config, $dbid, $rangespec)
return admin:save-configuration($new-config)

;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace temporal = "http://marklogic.com/xdmp/temporal" at "/MarkLogic/temporal.xqy";

hub-test:run-with-roles-and-privileges("temporal-admin", (),
  function () {
    temporal:axis-create(
      "valid",
      cts:field-reference("validStart", "type=dateTime"),
      cts:field-reference("validEnd", "type=dateTime")
    )
  },
  ()
)
;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace temporal = "http://marklogic.com/xdmp/temporal" at "/MarkLogic/temporal.xqy";
hub-test:run-with-roles-and-privileges("temporal-admin", (),
  function () {
    temporal:axis-create(
      "system",
      cts:field-reference("systemStart", "type=dateTime"),
      cts:field-reference("systemEnd", "type=dateTime")
    )
  },
  ()
)

;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace temporal = "http://marklogic.com/xdmp/temporal" at "/MarkLogic/temporal.xqy";
hub-test:run-with-roles-and-privileges("temporal-admin", (),
  function () { temporal:collection-create("myTemporalCollection", "system", "valid") },())
