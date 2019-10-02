xquery version "1.0-ml";

module namespace lib = "http://marklogic.com/smart-mastering/test";

declare variable $URI1 := "/source/1/doc1.xml";
declare variable $URI2 := "/source/2/doc2.xml";
declare variable $URI3 := "/source/3/doc3.xml";
declare variable $URI4 := "/source/1/doc1.json";
declare variable $URI5 := "/source/2/doc2.json";
declare variable $URI6 := "/source/3/doc3.json";
declare variable $URI7 := "/source/3/doc4.xml";
declare variable $URI8 := "/source/3/no-match.xml";

declare variable $NAMESPACED-URI1 := "/source/1/namespaced-doc1.xml";
declare variable $NAMESPACED-URI2 := "/source/2/namespaced-doc2.xml";
declare variable $NAMESPACED-URI3 := "/source/3/namespaced-doc3.xml";
declare variable $NAMESPACED-URI7 := "/source/3/namespaced-doc4.xml";

declare variable $TEST-DATA :=
  map:new((
    map:entry($URI1, "doc1.xml"),
    map:entry($URI2, "doc2.xml"),
    map:entry($URI3, "doc3.xml"),
    map:entry($URI7, "doc4.xml"),
    map:entry($NAMESPACED-URI1, "namespaced-doc1.xml"),
    map:entry($NAMESPACED-URI2, "namespaced-doc2.xml"),
    map:entry($NAMESPACED-URI3, "namespaced-doc3.xml"),
    map:entry($NAMESPACED-URI7, "namespaced-doc4.xml"),
    map:entry($URI4, "doc1.json"),
    map:entry($URI5, "doc2.json"),
    map:entry($URI6, "doc3.json"),
    map:entry($URI7, "no-match.xml")
  ));

declare variable $MATCH-OPTIONS-NAME := "match-test";
declare variable $SCORE-OPTIONS-NAME := "score-options";
declare variable $SCORE-OPTIONS-NAME2 := "score-options2";

declare variable $NAMESPACED-MATCH-OPTIONS-NAME := "namespaced-match-test";
