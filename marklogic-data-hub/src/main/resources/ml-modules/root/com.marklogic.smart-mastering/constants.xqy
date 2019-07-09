xquery version "1.0-ml";

(:~
 : This module provides a set of defined constants that are intended to be used
 : both within the smart-mastering-core libraries as well as in application code
 : that uses Smart Mastering.
 :)
module namespace constants = "http://marklogic.com/smart-mastering/constants";

(: Collections :)
declare variable $ALGORITHM-COLL as xs:string := "mdm-algorithm";

(:~ Contains entity documents that have been merged with other entity documents.
 : Applications should avoid searching this collection.
 :)
declare variable $ARCHIVED-COLL as xs:string := "mdm-archived";

(:~ Contains documents that track the history of the entity documents. :)
declare variable $AUDITING-COLL as xs:string := "mdm-auditing";

(:~ Contains master entity documents. Applications should limit search to this collection. :)
declare variable $CONTENT-COLL as xs:string := "mdm-content";
declare variable $DICTIONARY-COLL as xs:string := "mdm-dictionary";
declare variable $MATCH-OPTIONS-COLL as xs:string := "mdm-match-options";
declare variable $MERGE-OPTIONS-COLL as xs:string := "mdm-merge-options";
declare variable $MERGED-COLL as xs:string := "mdm-merged";
declare variable $MODEL-MAPPER-COLL as xs:string := "mdm-model-mapper";
declare variable $NOTIFICATION-COLL as xs:string := "mdm-notification";
declare variable $OPTIONS-COLL as xs:string := "mdm-options";

(: Actions :)
declare variable $MERGE-ACTION as xs:string := "merge";
declare variable $NOTIFY-ACTION as xs:string := "notify";

(: Events :)
declare variable $ON-MERGE-EVENT as xs:string := "on-merge";
declare variable $ON-NO-MATCH as xs:string := "on-no-match";
declare variable $ON-NOTIFICATION-EVENT as xs:string := "on-notification";
declare variable $ON-ARCHIVE-EVENT as xs:string := "on-archive";

(: Notification statuses :)
declare variable $STATUS-READ as xs:string := "read";
declare variable $STATUS-UNREAD as xs:string := "unread";

(: Predicate for recording match blocks between two documents :)
declare variable $PRED-MATCH-BLOCK := sem:iri("http://marklogic.com/smart-mastering/match-block");

(: Formats for functions that accept a format parameter :)
declare variable $FORMAT-JSON as xs:string := "json";
declare variable $FORMAT-XML  as xs:string := "xml";

(: Trace Events :)
declare variable $TRACE-MATCH-RESULTS := "SM-MATCH";
declare variable $TRACE-MERGE-RESULTS := "SM-MERGE";
declare variable $TRACE-PERFORMANCE := "SM-PERFORMANCE";

(: ERRORS :)
declare variable $NO-MERGE-OPTIONS-ERROR := xs:QName("SM-NO-MERGING-OPTIONS");
declare variable $ENTITY-NOT-FOUND-ERROR := xs:QName("SM-ENTITY-NOT-FOUND");
declare variable $ENTITY-PROPERTY-NOT-FOUND-ERROR := xs:QName("SM-ENTITY-PROPERTY-NOT-FOUND");
declare variable $NO-THRESHOLD-ACTION-FOUND := xs:QName("SM-NO-THRESHOLD-ACTION-FOUND");

(: Scope for instance bodies :)
declare variable $JSON-INSTANCE as xs:string? := "instance";
declare variable $XML-INSTANCE as xs:QName? := fn:QName("http://marklogic.com/entity-services", "instance");
