xquery version '1.0-ml';

import module namespace trgr = 'http://marklogic.com/xdmp/triggers' at '/MarkLogic/triggers.xqy';
import module namespace process = "http://marklogic.com/smart-mastering/process-records"
  at "process-records.xqy";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

declare option xdmp:mapping "false";

declare variable $trgr:uri as xs:string external;

if (xdmp:document-get-collections($trgr:uri) = $const:MERGED-COLL) then
  xdmp:trace($const:TRACE-MATCH-RESULTS, "Document at " || $trgr:uri || " is already in the " || $const:MERGED-COLL || " collection; skipping")
else (
  xdmp:trace($const:TRACE-MATCH-RESULTS, "Triggered call to process-match-and-merge with URI=" || $trgr:uri),
  process:process-match-and-merge($trgr:uri)
)
