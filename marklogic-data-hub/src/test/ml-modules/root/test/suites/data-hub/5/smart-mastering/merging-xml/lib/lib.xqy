xquery version "1.0-ml";

module namespace lib = "http://marklogic.com/smart-mastering/test";

declare variable $INVOKE_OPTIONS :=
  <options xmlns="xdmp:eval">
    <isolation>different-transaction</isolation>
    <update>true</update>
  </options>;

declare variable $TEST-DATA :=
  map:new((
    map:entry("/source/1/doc1.xml", "doc1.xml"),
    map:entry("/source/2/doc2.xml", "doc2.xml")
  ));

declare variable $NESTED-DATA :=
  map:new((
    map:entry("/nested/doc1.xml", "nested1.xml"),
    map:entry("/nested/doc2.xml", "nested2.xml")
  ));

declare variable $OPTIONS-NAME := "test-options";

declare variable $ONE-FIRST-OPTIONS := "one-first-options";
declare variable $TWO-FIRST-OPTIONS := "two-first-options";

declare variable $NESTED-OPTIONS := "nested-options";

declare variable $OPTIONS-NAME-CUST-XQY := "cust-xqy-test-options";
declare variable $OPTIONS-NAME-CUST-SJS := "cust-sjs-test-options";
declare variable $OPTIONS-NAME-CUST-TRIPS-XQY := "cust-trips-xqy-test-options";
declare variable $OPTIONS-NAME-CUST-TRIPS-SJS := "cust-trips-sjs-test-options";
declare variable $OPTIONS-NAME-PATH := "path-test-options";
declare variable $OPTIONS-NAME-WITH-DEFAULT-1 := "default-test-options-1";
declare variable $OPTIONS-NAME-WITH-DEFAULT-2 := "default-test-options-2";

declare variable $OPTIONS-NAME-CUST-ACTION-XQY-MATCH := "custom-xqy-action-match-options";
declare variable $OPTIONS-NAME-CUST-ACTION-XQY-MERGE := "custom-xqy-action-merge-options";
declare variable $OPTIONS-NAME-CUST-ACTION-SJS-MATCH := "custom-sjs-action-match-options";
declare variable $OPTIONS-NAME-CUST-ACTION-SJS-MERGE := "custom-sjs-action-merge-options";
