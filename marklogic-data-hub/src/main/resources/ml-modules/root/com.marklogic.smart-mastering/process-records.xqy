xquery version '1.0-ml';

module namespace process = "http://marklogic.com/smart-mastering/process-records";

import module namespace proc-impl = "http://marklogic.com/smart-mastering/process-records/impl"
  at "impl/process.xqy";

declare option xdmp:mapping "false";

(:
 : Identify matches for a target document using all available merge options.
 : Merge any documents where the match score is above the merge threshold;
 : record notification for matches above that threshold.
 :
 : @param $uri  URI of the target document
 : @return merged docs, if any, otherwise any notification documents
 :)
declare function process:process-match-and-merge($uris as xs:string*)
{
  proc-impl:process-match-and-merge($uris)
};

(:
 : Identify matches for a target document. Merge any documents where the match
 : score is above the merge threshold; record notification for matches above
 : that threshold.
 :
 : @param $uri  URI of the target document
 : @param $option-name  the name of a set of merge options, which include a reference to a set of match options
 : @return merged docs, if any, otherwise any notification documents
 :)
declare function process:process-match-and-merge($uris as xs:string*, $option-name as xs:string)
{
  proc-impl:process-match-and-merge($uris, $option-name, cts:true-query())
};

(:
 : Identify matches for a target document. Merge any documents where the match
 : score is above the merge threshold; record notification for matches above
 : that threshold.
 :
 : @param $uri  URI of the target document
 : @param $option-name  the name of a set of merge options, which include a reference to a set of match options
 : @param $filter-query  a cts:query used to restrict matches to a set, such as a specific entity type or collection
 : @return merged docs, if any, otherwise any notification documents
 :)
declare function process:process-match-and-merge(
  $uris as xs:string*,
  $option-name as xs:string,
  $filter-query as cts:query)
{
  proc-impl:process-match-and-merge($uris, $option-name, $filter-query)
};

(:
 : Identify matches for a target document. Merge any documents where the match
 : score is above the merge threshold; record notification for matches above
 : that threshold.
 :
 : @param $uri  URI of the target document
 : @param $merge-options  the JSON or XML representing the merge options
 : @param $match-options  the JSON or XML representing the match options
 : @param $filter-query  a cts:query used to restrict matches to a set, such as a specific entity type or collection
 : @param $persist-results  a boolean to determine if results should be persisted to the database
 : @return merged docs, if any, otherwise any notification documents
 :)
declare function process:process-match-and-merge-with-options(
  $uris as xs:string*,
  $merge-options as item(),
  $match-options as item(),
  $filter-query as cts:query,
  $persist-results as xs:boolean)
{
  if ($persist-results) then
    proc-impl:process-match-and-merge-with-options-save($uris, $merge-options, $match-options, $filter-query)
  else
    proc-impl:process-match-and-merge-with-options($uris, $merge-options, $match-options, $filter-query)
};
