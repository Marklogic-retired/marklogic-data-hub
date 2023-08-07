xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

import module namespace flow = "http://marklogic.com/data-hub/flow-lib"
  at "/data-hub/4/impl/flow-lib.xqy";
import module namespace dhf = "http://marklogic.com/dhf"
  at "/data-hub/4/dhf.xqy";

import module namespace content = "http://marklogic.com/data-hub/plugins" at "content.xqy";
import module namespace headers = "http://marklogic.com/data-hub/plugins" at "headers.xqy";
import module namespace triples = "http://marklogic.com/data-hub/plugins" at "triples.xqy";
import module namespace writer = "http://marklogic.com/data-hub/plugins" at "writer.xqy";

declare option xdmp:mapping "false";

declare function plugin:main(
  $id as xs:string,
  $options as map:map)
{
  let $content-context := dhf:content-context()
  let $content := dhf:run($content-context, function() {
    content:create-content($id, $options)
  })

  let $header-context := dhf:headers-context($content)
  let $headers := dhf:run($header-context, function() {
    headers:create-headers($id, $content, $options)
  })

  let $triple-context := dhf:triples-context($content, $headers)
  let $triples := dhf:run($triple-context, function() {
    triples:create-triples($id, $content, $headers, $options)
  })

  let $data-format := "xml"
  let $clean-content := flow:clean-data($content, "content", $data-format)
  let $clean-headers := flow:clean-data($headers, "headers", $data-format)
  let $clean-triples := flow:clean-data($triples, "triples", $data-format)
  let $envelope :=
    document {
      <envelope xmlns="http://marklogic.com/entity-services">
        <headers>{$clean-headers}</headers>
        <triples>{$clean-triples}</triples>
        <instance>{$clean-content}</instance>
      </envelope>
    }

  return dhf:run-writer(xdmp:function(xs:QName("writer:write")), $id, $envelope, $options)
};
