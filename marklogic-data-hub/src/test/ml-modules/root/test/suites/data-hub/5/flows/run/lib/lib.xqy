xquery version "1.0-ml";


module namespace lib = "http://marklogic.com/datahub/test";

declare variable $URI1 := "/customer1.json";

declare variable $TEST-DATA :=
  map:new((
    map:entry($URI1, "customer.json")
  ));
