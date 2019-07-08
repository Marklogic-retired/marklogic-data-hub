xquery version "1.0-ml";

module namespace lib = "http://marklogic.com/smart-mastering/test";

declare variable $URI1 := "/source/1/doc1.xml";
declare variable $URI2 := "/source/2/doc2.xml";

declare variable $TEST-DATA :=
  map:new((
    map:entry($URI1, "doc1.xml"),
    map:entry($URI2, "doc2.xml")
  ));

declare variable $MATCH-OPTIONS-NAME := "match-options";
declare variable $MERGE-OPTIONS-NAME := "merge-test";

declare variable $INVOKE_OPTIONS :=
  <options xmlns="xdmp:eval">
    <isolation>different-transaction</isolation>
  </options>;
