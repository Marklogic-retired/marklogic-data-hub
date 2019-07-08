xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

(: Currently, there isn't a function to delete options. :)
xdmp:collection-delete($const:OPTIONS-COLL),

xdmp:collection-delete($const:ALGORITHM-COLL)
