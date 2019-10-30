xquery version "1.0-ml";

module namespace  cust-add = "http://marklogic.com/mapping-functions/custom";
declare function cust-add:add-function(
  $num1 as xs:integer,
  $num2 as xs:integer
) as xs:integer
{
  $num1 + $num2
};
