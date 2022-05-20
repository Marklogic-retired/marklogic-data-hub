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

declare function expsearch:get-search-results($search-constraints as xs:string, $start, $page-length) {
    let $options := xdmp:eval("doc('/explore-data/options/search-options.xml')",  (),
      <options xmlns="xdmp:eval">
        <database>{xdmp:modules-database()}</database>
      </options>)

    return
      if (fn:empty($options)) then
        let $options :=
        <search:options xmlns:search="http://marklogic.com/appservices/search" xml:lang="zxx">
          <search:constraint name="Collection">
            <search:collection />
          </search:constraint>
          <search:values name="uris">
            <search:uri />
          </search:values>
          <search:search-option>unfiltered</search:search-option>
          <search:extract-document-data selected="include">
            <search:extract-path xmlns:oex="http://example.org/">//*</search:extract-path>
          </search:extract-document-data>
          <search:return-facets>true</search:return-facets>
          <search:return-query>true</search:return-query>
          <search:transform-results apply="snippet">
            <per-match-tokens>30</per-match-tokens>
            <max-matches>4</max-matches>
            <max-snippet-chars>200</max-snippet-chars>
          </search:transform-results>
        </search:options>
        return search:search($search-constraints, $options, $start, $page-length)
      else
        search:search($search-constraints, $options/*, $start, $page-length)
};

