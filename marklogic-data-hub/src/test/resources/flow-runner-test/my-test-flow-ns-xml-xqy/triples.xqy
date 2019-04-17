xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Create Triples Plugin
 :
 : @param id       - the identifier returned by the collector
 : @param content  - your final content
 : @param headers  - a sequence of header elements
 : @param triples  - a sequence of triples
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - zero or more triple elements
 :)
declare function plugin:create-triples(
  $id as xs:string,
  $content as item()?,
  $headers as node()*,
  $options as map:map) as sem:triple*
{
  sem:triple(sem:iri("subject"), sem:iri("predicate"), sem:iri("object"))
};
