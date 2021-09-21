xquery version "1.0-ml";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

declare option xdmp:mapping "false";

for $notificationCollection in cts:collection-match($const:NOTIFICATION-COLL)
return xdmp:collection-delete($notificationCollection),

xdmp:collection-delete($const:OPTIONS-COLL),
xdmp:collection-delete($const:AUDITING-COLL),
xdmp:collection-delete($const:MERGED-COLL),
xdmp:collection-delete($const:CONTENT-COLL),
xdmp:collection-delete($const:ARCHIVED-COLL),
xdmp:collection-delete("datahubMasteringMatchSummary")

