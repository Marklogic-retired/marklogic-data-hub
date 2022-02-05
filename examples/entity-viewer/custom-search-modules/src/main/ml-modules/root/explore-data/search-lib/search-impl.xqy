(:
  Copyright (c) 2021 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
:)

xquery version "1.0-ml";

module namespace expsearch = "http://marklogic.com/explorer/search";

import module namespace search = "http://marklogic.com/appservices/search"
at "/MarkLogic/appservices/search/search.xqy";

import module namespace json="http://marklogic.com/xdmp/json"
at "/MarkLogic/json/json.xqy";

declare function expsearch:get-search-results($search-constraints as xs:string) {
  let $options := xdmp:eval("doc('/options/search-options.xml')",  (),
    <options xmlns="xdmp:eval">
      <database>{xdmp:modules-database()}</database>
    </options>)

  let $result := search:search($search-constraints, $options/*)

  let $custom :=
    let $config := json:config("custom")
    let $_ := map:put( $config, "whitespace", "ignore" )
    let $_ := map:put( $config, "array-element-names", (xs:QName("search:result"), xs:QName("search:facet"), xs:QName("search:facet-value"), $result/search:result/search:extracted/person/*/name(.)))
    return $config

  let $json-response := json:transform-to-json( $result , $custom )
  return $json-response
};

