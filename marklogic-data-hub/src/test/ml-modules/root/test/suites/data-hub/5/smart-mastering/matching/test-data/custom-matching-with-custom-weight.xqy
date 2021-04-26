xquery version "1.0-ml";

module namespace algorithms = "http://marklogic.com/smart-mastering/algorithms";

import module namespace helper-impl = "http://marklogic.com/smart-mastering/helper-impl"
at "/com.marklogic.smart-mastering/matcher-impl/helper-impl.xqy";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";

declare option xdmp:mapping "false";



(:
Example of custom weights
:)
declare function algorithms:custom-id(
    $expand-values as xs:string*,
    $expand-xml as element(matcher:expand),
    $options-xml as element(matcher:options)
) as cts:query*
{
  cts:or-query((
    cts:word-query("6986792174", (), 5),
    (: different scores for the different documents to ensure weight isn't cached :)
    cts:word-query($expand-values, (), 10)
  ))
};
