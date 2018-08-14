xquery version "1.0-ml";

(: Your plugin must be in this namespace for the DHF to recognize it:)
module namespace plugin = "http://marklogic.com/data-hub/plugins";

(:
 : This module exposes helper functions to make your life easier
 : See documentation at:
 : https://github.com/marklogic/marklogic-data-hub/wiki/dhf-lib
 :)
import module namespace dhf = "http://marklogic.com/dhf"
  at "/data-hub/4/dhf.xqy";

(: include modules to construct various parts of the envelope :)
import module namespace content = "http://marklogic.com/data-hub/plugins" at "content.xqy";
import module namespace headers = "http://marklogic.com/data-hub/plugins" at "headers.xqy";
import module namespace triples = "http://marklogic.com/data-hub/plugins" at "triples.xqy";

declare option xdmp:mapping "false";

(:~
 : Plugin Entry point
 :
 : @param $id          - the identifier returned by the collector
 : @param $options     - a map containing options. Options are sent from Java
 :
 :)
declare function plugin:main(
  $id as xs:string,
  $raw-content as node()?,
  $options as map:map)
{
  let $content-context := dhf:content-context($raw-content)
  let $content := dhf:run($content-context, function() {
    content:create-content($id, $raw-content, $options)
  })

  let $header-context := dhf:headers-context($content)
  let $headers := dhf:run($header-context, function() {
    headers:create-headers($id, $content, $options)
  })

  let $triple-context := dhf:triples-context($content, $headers)
  let $triples := dhf:run($triple-context, function() {
    plugin:create-triples($id, $content, $headers, $options)
  })

  let $envelope := dhf:make-envelope($content, $headers, $triples, map:get($options, "dataFormat"))
  (:
   : log the final envelope as a trace
   : only fires if tracing is enabled
   :)
  let $_ := dhf:log-trace(dhf:writer-context($envelope))
  return
    $envelope
};
