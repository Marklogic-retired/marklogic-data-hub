xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";
import module namespace lib = "http://marklogic.com/smart-mastering/test" at "lib/lib.xqy";

declare option xdmp:mapping "false";

xdmp:collection-delete($const:OPTIONS-COLL),

map:keys($lib:TEST-DATA) ! xdmp:document-delete(.)
