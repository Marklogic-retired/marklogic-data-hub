xquery version "1.0-ml";

module namespace lib = "http://marklogic.com/smart-mastering/test";

declare variable $INVOKE_OPTIONS :=
  <options xmlns="xdmp:eval">
    <isolation>different-transaction</isolation>
  </options>;

declare variable $TEST-DATA :=
  map:new((
    map:entry("/source/1/doc1.json", "doc1.json"),
    map:entry("/source/2/doc2.json", "doc2.json")
  ));

declare variable $NESTED-DATA :=
  map:new((
    map:entry("/nested/doc1.json", "nested1.json"),
    map:entry("/nested/doc2.json", "nested2.json")
  ));

declare variable $UNSOURCED-DATA :=
  map:new((
    map:entry("/unsourced/doc1.json", "unsourced-doc-1.json"),
    map:entry("/unsourced/doc2.json", "unsourced-doc-2.json")
  ));

declare variable $OPTIONS-NAME := "test-options";
declare variable $OPTIONS-NAME-STRATEGIES := "test-options-with-strategies";
declare variable $OPTIONS-NAME-COMPLETE := "test-options-stock";
declare variable $OPTIONS-NAME-CUST-XQY := "cust-xqy-test-options";
declare variable $OPTIONS-NAME-CUST-SJS := "cust-sjs-test-options";
declare variable $OPTIONS-NAME-PATH := "path-test-options";
declare variable $NESTED-OPTIONS := "nested-options";

declare function lib:take-strings($uris as xs:string*)
{
  $uris
};
