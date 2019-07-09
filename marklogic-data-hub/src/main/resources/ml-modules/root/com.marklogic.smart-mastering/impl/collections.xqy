xquery version "1.0-ml";

module namespace coll = "http://marklogic.com/smart-mastering/collections";

import module namespace const = "http://marklogic.com/smart-mastering/constants"
  at "/com.marklogic.smart-mastering/constants.xqy";

declare namespace matcher = "http://marklogic.com/smart-mastering/matcher";
declare namespace merging = "http://marklogic.com/smart-mastering/merging";

declare function coll:get-collections($spec as element()*, $default as xs:string?)
  as xs:string*
{
  let $coll-names := $spec ! fn:string()[. ne '']
  return
    if (fn:exists($spec/@none)) then
      ()
    else if (fn:exists($coll-names)) then
      $coll-names
    else
      $default
};

declare function coll:content-collections($options as element()?)
  as xs:string*
{
  coll:get-collections($options/*:collections/*:content, $const:CONTENT-COLL)
};

declare function coll:merged-collections($options as element(merging:options)?)
  as xs:string*
{
  coll:get-collections($options/merging:collections/merging:merged, $const:MERGED-COLL)
};

declare function coll:archived-collections($options as element(merging:options)?)
  as xs:string*
{
  coll:get-collections($options/merging:collections/merging:archived, $const:ARCHIVED-COLL)
};

declare function coll:notification-collections($options as element(merging:options)?)
  as xs:string*
{
  coll:get-collections($options/merging:collections/merging:notification, $const:NOTIFICATION-COLL)
};

declare function coll:auditing-collections($options as element(merging:options)?)
  as xs:string*
{
  coll:get-collections($options/merging:collections/merging:auditing, $const:AUDITING-COLL)
};
