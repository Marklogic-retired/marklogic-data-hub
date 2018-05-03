xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Writer Plugin
 :
 : @param $id       - the identifier returned by the collector
 : @param $envelope - the final envelope
 : @param $options  - a map containing options. Options are sent from Java
 :
 : @return - nothing
 :)
declare function plugin:write(
  $id as xs:string,
  $envelope as node(),
  $options as map:map) as empty-sequence()
{
  let $_ :=
    if (map:get($options, "writerGoBoom") eq fn:true() and $id = ("/input-2.json", "/input-2.xml")) then
      fn:error(xs:QName("WRITER-BOOM"), "I BLEW UP")
    else ()
  return (
    xdmp:document-insert("/options-test" || fn:replace(fn:replace($id, "/input", ""), ".(json|xml)", "") || ".xml",
      <doc>
        <collector>{map:get($options, "collectorTest")}</collector>
        <content>{map:get($options, "contentTest")}</content>
        <headers>{map:get($options, "headersTest")}</headers>
        <triples>{map:get($options, "triplesTest")}</triples>
        <extra>{map:get($options, "extraTest")}</extra>
      </doc>),
    xdmp:document-insert($id, $envelope, xdmp:default-permissions(), map:get($options, "flow"))
  )
};

function stuf() {

};
