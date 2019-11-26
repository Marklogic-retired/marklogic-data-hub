xquery version "1.0-ml";

module namespace custom = "http://marklogic.com/mapping-functions/custom";

declare function remove-hyphens($val as xs:string?) as xs:string?
{
  fn:replace($val, "-", "")
};
