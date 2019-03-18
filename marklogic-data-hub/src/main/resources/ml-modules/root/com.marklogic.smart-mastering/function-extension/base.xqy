xquery version "1.0-ml";

module namespace fun-ext = "http://marklogic.com/smart-mastering/function-extension";

import module namespace functional = "http://snelson.org.uk/functions/functional"
  at "functional.xqy";

declare function fun-ext:function-lookup(
  $function-name as xs:string,
  $function-namespace as xs:string?,
  $function-at-location as xs:string?,
  $default-function-lookup as function(*)?
)
{
  if (fn:exists($function-at-location[. ne ""])) then
    xdmp:function(
      fn:QName(fn:string($function-namespace), $function-name), 
      $function-at-location
    )
  else if (fn:exists($default-function-lookup)) then
    $default-function-lookup($function-name)
  else ()
};


declare function fun-ext:execute-function(
  $fun as item(), (: xdmp:function or function(*) :)
  $arguments as map:map
)
{
  let $is-fun-star := $fun instance of function(*)
  let $arity := 
    if ($is-fun-star) then
      fn:function-arity($fun)
    else
      map:count($arguments)
  let $apply-fun := fn:function-lookup(xs:QName("xdmp:apply"), $arity + 1)
  let $curried-apply := functional:curry($apply-fun)
  let $param-positions :=
    map:new(
      if ($is-fun-star) then
        for $pos in 1 to $arity
        return
          map:entry(
            fn:string(xdmp:function-parameter-name($fun, $pos)),
            $pos
          )
      else
        ()
    )
  return
    fun-ext:_execute-apply(
      $curried-apply,
      map:new((
        map:entry(xdmp:key-from-QName(xs:QName("fun-ext:function")), $fun),
        $arguments
      )),
      (
        xdmp:key-from-QName(xs:QName("fun-ext:function")),
        fn:subsequence(
          for $key in map:keys($arguments)
          order by map:get($param-positions, $key) ascending, 
                $key ascending collation "http://marklogic.com/collation//MO"
          return
            $key,
          1,
          $arity
        )
      )
    )
};

declare function fun-ext:_execute-apply(
  $apply as item()*,
  $arguments as map:map,
  $keys as xs:string*
)
{
  if (fn:exists($keys)) then
    fun-ext:_execute-apply(
      $apply(map:get($arguments, fn:head($keys))),
      $arguments,
      fn:tail($keys)
    )
  else
    $apply
};

declare function fun-ext:get-function-annotation($funct, $annotation-name)
{
  if ($funct instance of function(*)*) then
    xdmp:annotation($funct, $annotation-name)
  else if ($funct instance of xdmp:function) then
    let $module := xdmp:function-module($funct)
    let $qname := xdmp:function-name($funct)
    return
      if (xdmp:uri-content-type($module) = "application/vnd.marklogic-javascript") then
        xdmp:javascript-eval(
          "var importModule = require(modulePath);
           var funct = importModule[functionName];
           var annotations = importModule[functionName] ? importModule[functionName].$annotations : {};
           annotations ? annotations['mdm:' + annotationName] : null;", 
          map:new((
            map:entry("modulePath", $module),
            map:entry("functionName", fn:string($qname)),
            map:entry("annotationName", fn:local-name-from-QName($annotation-name))
          ))
        )
      else 
        xdmp:eval(
          "xquery version '1.0-ml';
          import module namespace import = '" || fn:namespace-uri-from-QName($qname) || "' at '" ||
          $module|| "';

          declare variable $funct-qname as xs:QName external;
          declare variable $annotation-name as xs:QName external;

          xdmp:annotation(fn:function-lookup($funct-qname, 3), $annotation-name)", 
          map:new((
            map:entry("funct-qname", $qname),
            map:entry("annotation-name", $annotation-name)
          ))
        )
  else ()
};



