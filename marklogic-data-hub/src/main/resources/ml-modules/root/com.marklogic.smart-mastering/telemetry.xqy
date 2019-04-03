xquery version "1.0-ml";

module namespace tel = "http://marklogic.com/smart-mastering/telemetry";

declare namespace um = "http://marklogic.com/xdmp/usage-meters";

declare option xdmp:mapping "false";

declare variable $incremented := fn:false();
declare variable $usage-count := "smartmastering.usage.count";

(:~
 : Increment the usage count for telemetry
 :)
declare function tel:increment()
{
  if (fn:not($incremented)) then (
    xdmp:feature-metric-increment(xdmp:feature-metric-register($usage-count)),
    xdmp:set($incremented, fn:true())
  )
  else ()
};

declare function tel:get-usage-count() as xs:int
{
  fn:head((xdmp:feature-metric-status()/um:feature-metrics/um:features/um:feature[@name=$usage-count]/data(), 0))
};
