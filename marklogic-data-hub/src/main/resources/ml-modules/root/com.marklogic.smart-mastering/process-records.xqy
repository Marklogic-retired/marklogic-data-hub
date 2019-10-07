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
 : @param $input  URIs of the target documents or map:map objects that contain the document in the value entry
 : @param $merge-options  the JSON or XML representing the merge options
 : @param $match-options  the JSON or XML representing the match options
 : @param $filter-query  a cts:query used to restrict matches to a set, such as a specific entity type or collection
 : @param $persist-results  a boolean to determine if results should be persisted to the database
 : @return merged docs, if any, otherwise any notification documents
 :)
declare function process:process-match-and-merge-with-options(
  $input as item()*,
  $merge-options as item(),
  $match-options as item(),
  $filter-query as cts:query,
  $persist-results as xs:boolean
)
{
  process:process-match-and-merge-with-options(
    $input,
    $merge-options,
    $match-options,
    $filter-query,
    $persist-results,
    fn:false()
  )
};

(:
 : Identify matches for a target document. Merge any documents where the match
 : score is above the merge threshold; record notification for matches above
 : that threshold.
 :
 : @param $input  URIs of the target documents or map:map objects that contain the document in the value entry
 : @param $merge-options  the JSON or XML representing the merge options
 : @param $match-options  the JSON or XML representing the match options
 : @param $filter-query  a cts:query used to restrict matches to a set, such as a specific entity type or collection
 : @param $persist-results  a boolean to determine if results should be persisted to the database
 : @param $fine-grain-provenance a boolean to determine if fine grain provenance should be tracked
 : @return merged docs, if any, otherwise any notification documents
 :)
declare function process:process-match-and-merge-with-options(
  $input as item()*,
  $merge-options as item(),
  $match-options as item(),
  $filter-query as cts:query,
  $persist-results as xs:boolean,
  $fine-grain-provenance as xs:boolean
)
{
  if ($persist-results) then
    proc-impl:process-match-and-merge-with-options-save($input, $merge-options, $match-options, $filter-query, $fine-grain-provenance)
  else
    proc-impl:process-match-and-merge-with-options($input, $merge-options, $match-options, $filter-query, $fine-grain-provenance)
};

(:
 : Build out summary documents that will describe the actions that mastering will take
 :
 : @param $input  URIs of the target documents or map:map objects that contain the document in the value entry
 : @param $match-options  the JSON or XML representing the match options
 : @param $filter-query  a cts:query used to restrict matches to a set, such as a specific entity type or collection
 : @param $fine-grain-provenance a boolean to determine if fine grain provenance should be tracked
 : @return merged docs, if any, otherwise any notification documents
 :)
declare function process:build-match-summary(
  $input as item()*,
  $match-options as item(),
  $filter-query as cts:query,
  $fine-grain-provenance as xs:boolean
) as json:object {
  proc-impl:build-match-summary(
    $input,
    $match-options,
    $filter-query,
    $fine-grain-provenance,
    (: Don't lock for update when called via the external function :)
    fn:false()
  )
};

(:
 : Take the information from a match summary document and create the content objects necessary to
 : perform the actions.
 :)
declare function process:build-content-objects-from-match-summary(
  $uris-to-act-on as xs:string*,
  $match-summary as json:object,
  $write-objects-by-uri as map:map,
  $merge-options as item(),
  $fine-grain-provenance as xs:boolean
) as json:array
{
  proc-impl:build-content-objects-from-match-summary(
    $uris-to-act-on,
    $match-summary,
    $write-objects-by-uri,
    $merge-options,
    $fine-grain-provenance
  )
};
