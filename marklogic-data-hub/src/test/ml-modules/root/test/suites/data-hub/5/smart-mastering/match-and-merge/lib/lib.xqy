xquery version "1.0-ml";

module namespace lib = "http://marklogic.com/smart-mastering/test";

declare variable $URI1 := "/source/1/doc1.xml";
declare variable $URI2 := "/source/2/doc2.xml";
declare variable $URI3 := "/source/3/doc3.xml";
declare variable $URI4 := "/source/4/doc4.xml";

declare variable $TEST-DATA :=
  map:new((
    map:entry($URI1, "doc1.xml"),
    map:entry($URI2, "doc2.xml"),
    map:entry($URI3, "doc3.xml"),
    map:entry($URI4, "doc4.xml")
  ));

declare variable $MATCH-SUMMARY-URI-1 := "match-summary-docs/match-summary-doc1.json";
declare variable $MATCH-SUMMARY-URI-2 := "match-summary-docs/match-summary-doc2.json";

declare variable $MERGE-URI-1 := "/com.marklogic.smart-mastering/merged/5a3c45efc09cf74d0b4289d33487b0c0.json";
declare variable $MERGE-URI-2 := "/com.marklogic.smart-mastering/merged/76595a4e4815fce65fc8fee52dd843bc.json";

declare variable $MATCH-OPTIONS-NAME := "match-options";
declare variable $MERGE-OPTIONS-NAME := "merge-test";

declare variable $INVOKE_OPTIONS :=
  <options xmlns="xdmp:eval">
    <isolation>different-transaction</isolation>
    <update>true</update>
  </options>;
