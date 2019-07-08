xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants" at "/com.marklogic.smart-mastering/constants.xqy";

declare option xdmp:mapping "false";

xdmp:collection-delete($const:OPTIONS-COLL)
