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

declare function expsearch:get-search-results() {
(:  let $options := xdmp:eval("doc('/Default/data-hub-FINAL/rest-api/options/exp-final-entity-options.xml')",  (),:)
(:    <options xmlns="xdmp:eval">:)
(:      <database>{xdmp:database("data-hub-MODULES")}</database>:)
(:    </options>):)
  let $options := <search:options xml:lang="zxx" xmlns:search="http://marklogic.com/appservices/search">
    <search:constraint name="Collection">
      <search:collection>
        <search:facet-option>limit=25</search:facet-option>
        <search:facet-option>frequency-order</search:facet-option>
        <search:facet-option>descending</search:facet-option>
      </search:collection>
    </search:constraint>
    <search:constraint name="entityType">
      <search:custom facet="false">
        <search:parse apply="parse" ns="http://marklogic.com/data-hub/entities/constraint/entityType" at="/data-hub/5/entities/constraint/entityType.xqy">
        </search:parse>
      </search:custom>
    </search:constraint>
    <search:constraint name="hideHubArtifacts">
      <search:custom facet="false">
        <search:parse apply="parse" ns="http://marklogic.com/data-hub/entities/constraint/hideHubArtifacts" at="/data-hub/5/entities/constraint/hideHubArtifacts.xqy">
        </search:parse>
      </search:custom>
    </search:constraint>
    <search:constraint name="createdByJob">
      <search:range facet="false">
        <search:field name="datahubCreatedByJob">
        </search:field>
      </search:range>
    </search:constraint>
    <search:constraint name="createdByStep">
      <search:range>
        <search:field name="datahubCreatedByStep">
        </search:field>
        <search:facet-option>limit=25</search:facet-option>
        <search:facet-option>frequency-order</search:facet-option>
        <search:facet-option>descending</search:facet-option>
      </search:range>
    </search:constraint>
    <search:constraint name="createdByJobWord">
      <search:word>
        <search:field name="datahubCreatedByJob">
        </search:field>
      </search:word>
    </search:constraint>
    <search:constraint name="createdOnRange">
      <search:range facet="false">
        <search:field name="datahubCreatedOn">
        </search:field>
      </search:range>
    </search:constraint>
    <search:constraint name="createdInFlowRange">
      <search:range>
        <search:field name="datahubCreatedInFlow">
        </search:field>
        <search:facet-option>limit=25</search:facet-option>
        <search:facet-option>frequency-order</search:facet-option>
        <search:facet-option>descending</search:facet-option>
      </search:range>
    </search:constraint>
    <search:constraint name="sourceName">
      <search:range>
        <search:field name="datahubSourceName">
        </search:field>
        <search:facet-option>limit=25</search:facet-option>
        <search:facet-option>frequency-order</search:facet-option>
        <search:facet-option>descending</search:facet-option>
      </search:range>
    </search:constraint>
    <search:constraint name="sourceType">
      <search:range>
        <search:field name="datahubSourceType">
        </search:field>
        <search:facet-option>limit=25</search:facet-option>
        <search:facet-option>frequency-order</search:facet-option>
        <search:facet-option>descending</search:facet-option>
      </search:range>
    </search:constraint>
    <search:operator name="sort">
      <search:state name="Customer_birthDateAscending">
        <search:sort-order type="xs:date" direction="ascending">
          <search:path-index xmlns:es="http://marklogic.com/entity-services" xmlns:oex="http://example.org/">/(es:envelope|envelope)/(es:instance|instance)/Customer/birthDate</search:path-index>
        </search:sort-order>
      </search:state>
      <search:state name="Customer_birthDateDescending">
        <search:sort-order type="xs:date" direction="descending">
          <search:path-index xmlns:es="http://marklogic.com/entity-services" xmlns:oex="http://example.org/">/(es:envelope|envelope)/(es:instance|instance)/Customer/birthDate</search:path-index>
        </search:sort-order>
      </search:state>
      <search:state name="Customer_customerIdAscending">
        <search:sort-order type="xs:decimal" direction="ascending">
          <search:path-index xmlns:es="http://marklogic.com/entity-services" xmlns:oex="http://example.org/">/(es:envelope|envelope)/(es:instance|instance)/Customer/customerId</search:path-index>
        </search:sort-order>
      </search:state>
      <search:state name="Customer_customerIdDescending">
        <search:sort-order type="xs:decimal" direction="descending">
          <search:path-index xmlns:es="http://marklogic.com/entity-services" xmlns:oex="http://example.org/">/(es:envelope|envelope)/(es:instance|instance)/Customer/customerId</search:path-index>
        </search:sort-order>
      </search:state>
      <search:state name="NamespacedCustomer_customerIdentifierAscending">
        <search:sort-order type="xs:decimal" direction="ascending">
          <search:path-index xmlns:es="http://marklogic.com/entity-services" xmlns:oex="http://example.org/">/es:envelope/es:instance/oex:NamespacedCustomer/oex:customerIdentifier</search:path-index>
        </search:sort-order>
      </search:state>
      <search:state name="NamespacedCustomer_customerIdentifierDescending">
        <search:sort-order type="xs:decimal" direction="descending">
          <search:path-index xmlns:es="http://marklogic.com/entity-services" xmlns:oex="http://example.org/">/es:envelope/es:instance/oex:NamespacedCustomer/oex:customerIdentifier</search:path-index>
        </search:sort-order>
      </search:state>
    </search:operator>
    <search:constraint name="entity-type">
      <search:value>
        <search:element ns="http://marklogic.com/entity-services" name="title">
        </search:element>
      </search:value>
    </search:constraint>
    <search:constraint name="productId">
      <search:value>
        <search:element ns="" name="productId">
        </search:element>
      </search:value>
    </search:constraint>
    <search:constraint name="customerId">
      <search:value>
        <search:element ns="" name="customerId">
        </search:element>
      </search:value>
    </search:constraint>
    <search:constraint name="Customer.customerId">
      <search:range type="xs:decimal" facet="false">
        <search:path-index xmlns:es="http://marklogic.com/entity-services">/(es:envelope|envelope)/(es:instance|instance)/Customer/customerId</search:path-index>
        <search:facet-option>limit=25</search:facet-option>
        <search:facet-option>frequency-order</search:facet-option>
        <search:facet-option>descending</search:facet-option>
      </search:range>
    </search:constraint>
    <search:constraint name="Customer.birthDate">
      <search:range type="xs:date" facet="true">
        <search:path-index xmlns:es="http://marklogic.com/entity-services">/(es:envelope|envelope)/(es:instance|instance)/Customer/birthDate</search:path-index>
        <search:facet-option>limit=25</search:facet-option>
        <search:facet-option>frequency-order</search:facet-option>
        <search:facet-option>descending</search:facet-option>
      </search:range>
    </search:constraint>
    <search:constraint name="Customer.status">
      <search:range type="xs:string" facet="true" collation="http://marklogic.com/collation/">
        <search:path-index xmlns:es="http://marklogic.com/entity-services">/(es:envelope|envelope)/(es:instance|instance)/Customer/status</search:path-index>
        <search:facet-option>limit=25</search:facet-option>
        <search:facet-option>frequency-order</search:facet-option>
        <search:facet-option>descending</search:facet-option>
      </search:range>
    </search:constraint>
    <search:constraint name="orderId">
      <search:value>
        <search:element ns="" name="orderId">
        </search:element>
      </search:value>
    </search:constraint>
    <search:constraint name="customerIdentifier">
      <search:value>
        <search:element ns="" name="customerIdentifier">
        </search:element>
      </search:value>
    </search:constraint>
    <search:constraint name="NamespacedCustomer.customerIdentifier">
      <search:range type="xs:decimal" facet="false">
        <search:path-index xmlns:es="http://marklogic.com/entity-services" xmlns:oex="http://example.org/">/es:envelope/es:instance/oex:NamespacedCustomer/oex:customerIdentifier</search:path-index>
        <search:facet-option>limit=25</search:facet-option>
        <search:facet-option>frequency-order</search:facet-option>
        <search:facet-option>descending</search:facet-option>
      </search:range>
    </search:constraint>
    <search:constraint name="NamespacedCustomer.status">
      <search:range type="xs:string" facet="true" collation="http://marklogic.com/collation/">
        <search:path-index xmlns:es="http://marklogic.com/entity-services" xmlns:oex="http://example.org/">/es:envelope/es:instance/oex:NamespacedCustomer/oex:status</search:path-index>
        <search:facet-option>limit=25</search:facet-option>
        <search:facet-option>frequency-order</search:facet-option>
        <search:facet-option>descending</search:facet-option>
      </search:range>
    </search:constraint>
    <search:constraint name="babyRegistryId">
      <search:value>
        <search:element ns="" name="babyRegistryId">
        </search:element>
      </search:value>
    </search:constraint>
    <search:tuples name="Customer">
      <search:range type="xs:decimal" facet="true">
        <search:path-index xmlns:es="http://marklogic.com/entity-services">/(es:envelope|envelope)/(es:instance|instance)/Customer/customerId</search:path-index>
      </search:range>
      <search:range type="xs:date" facet="true">
        <search:path-index xmlns:es="http://marklogic.com/entity-services">/(es:envelope|envelope)/(es:instance|instance)/Customer/birthDate</search:path-index>
      </search:range>
      <search:range type="xs:string" facet="true" collation="http://marklogic.com/collation/">
        <search:path-index xmlns:es="http://marklogic.com/entity-services">/(es:envelope|envelope)/(es:instance|instance)/Customer/status</search:path-index>
      </search:range>
    </search:tuples>
    <search:tuples name="NamespacedCustomer">
      <search:range type="xs:decimal" facet="true">
        <search:path-index xmlns:es="http://marklogic.com/entity-services" xmlns:oex="http://example.org/">/es:envelope/es:instance/oex:NamespacedCustomer/oex:customerIdentifier</search:path-index>
      </search:range>
      <search:range type="xs:string" facet="true" collation="http://marklogic.com/collation/">
        <search:path-index xmlns:es="http://marklogic.com/entity-services" xmlns:oex="http://example.org/">/es:envelope/es:instance/oex:NamespacedCustomer/oex:status</search:path-index>
      </search:range>
    </search:tuples>
    <!--
Uncomment to return no results for a blank search, rather than the default of all results
 <search:term xmlns:search="http://marklogic.com/appservices/search">
  <search:empty apply="no-results"/>
</search:term>
-->
    <search:values name="uris">
      <search:uri>
      </search:uri>
    </search:values>
    <!--
Change to 'filtered' to exclude false-positives in certain searches
-->
    <search:search-option>unfiltered</search:search-option>
    <!--
Modify document extraction to change results returned
-->
    <!--
Change or remove this additional-query to broaden search beyond entity instance documents
-->
    <!--
To return facets, change this option to 'true' and edit constraints
-->
    <search:return-facets>true</search:return-facets>
    <!--
To return snippets, comment out or remove this option
-->
    <!--
<search:transform-results apply="empty-snippet"></search:transform-results>
-->
    <search:transform-results apply="snippet">
      <per-match-tokens>30</per-match-tokens>
      <max-matches>4</max-matches>
      <max-snippet-chars>200</max-snippet-chars>
    </search:transform-results>
  </search:options>

  let $result := search:search("Carmella", $options)

  let $custom :=
    let $config := json:config("custom")
    let $_ := map:put( $config, "whitespace", "ignore" )
    let $_ := map:put( $config, "array-element-names", (xs:QName("search:result"), xs:QName("search:facet"), xs:QName("search:facet-value")) )
    return $config

  let $json-response := json:transform-to-json( $result , $custom )
  return $json-response
};

