xquery version "1.0-ml";

module namespace plugin = "http://marklogic.com/data-hub/plugins";

declare option xdmp:mapping "false";

(:~
 : Collect IDs plugin
 :
 : @param $options - a map containing options. Options are sent from Java
 :
 : @return - a sequence of ids or uris
 :)
declare function plugin:collect(
  $options as map:map) as xs:string*
{
  (: cheat and test options passing by ensuring this value is true :)
  if (fn:true() = map:get($options, "returnStuff")) then
    cts:element-values(xs:QName("id"), (), ("concurrent"))
  else ()
};

