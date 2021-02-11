xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace temporal = "http://marklogic.com/xdmp/temporal" at "/MarkLogic/temporal.xqy";
hub-test:run-with-roles-and-privileges("temporal-admin", (), function () { temporal:collection-remove("myTemporalCollection") }, ())
;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace temporal = "http://marklogic.com/xdmp/temporal" at "/MarkLogic/temporal.xqy";
hub-test:run-with-roles-and-privileges("temporal-admin", (), function () { temporal:axis-remove("valid") }, ())

;

xquery version "1.0-ml";
import module namespace hub-test = "http://marklogic.com/data-hub/test" at "/test/data-hub-test-helper.xqy";
import module namespace temporal = "http://marklogic.com/xdmp/temporal" at "/MarkLogic/temporal.xqy";
hub-test:run-with-roles-and-privileges("temporal-admin", (), function () { temporal:axis-remove("system") }, ())

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
let $new-config := admin:database-delete-range-field-index($config, $dbid, $rangespec)
return admin:save-configuration($new-config)

;

xquery version "1.0-ml";
import module namespace admin = "http://marklogic.com/xdmp/admin" at "/MarkLogic/admin.xqy";
let $config := admin:get-configuration()
let $dbid := xdmp:database()
let $field-names := ("validStart", "validEnd", "systemStart", "systemEnd")
let $new-config := admin:database-delete-field($config, $dbid, $field-names)
return admin:save-configuration($new-config)
