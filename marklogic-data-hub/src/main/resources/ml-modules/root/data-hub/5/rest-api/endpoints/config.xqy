xquery version "1.0-ml";

(: Copyright 2011-2019 MarkLogic Corporation.  All Rights Reserved. :)

module namespace conf = "http://marklogic.com/rest-api/endpoints/config_DELETE_IF_UNUSED";

import module namespace rest = "http://marklogic.com/appservices/rest" 
  at "/MarkLogic/appservices/utils/rest.xqy";

import module namespace eput = "http://marklogic.com/rest-api/lib/endpoint-util"
    at "../lib/endpoint-util.xqy";

import module namespace docmodcom = "http://marklogic.com/rest-api/models/document-model-common"
    at "../models/document-model-common.xqy";

declare default function namespace "http://www.w3.org/2005/xpath-functions";
declare option xdmp:mapping "false";

(: APPBUILDER BUILT APP RULE :)
declare function conf:get-default-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/|/content/*"
            uri="^/$|^/content/([^/]+)/?$"
            endpoint="../default.xqy">
        <rest:uri-param name="content">$1</rest:uri-param>
        <rest:http method="GET"/>
    </rest:request>
};

(: Note: provided for MarkLogic client libraries that need to authenticate
   in advance of a non-repeatable put or post. :)
declare function conf:get-ping-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/ping"
            uri="^/([^/]+/)?ping/?$"
            endpoint="../endpoints/ping.xqy">
        <rest:http method="DELETE"/>
        <rest:http method="GET"/>
        <rest:http method="HEAD"/>
        <rest:http method="OPTIONS"/>
        <rest:http method="POST"/>
        <rest:http method="PUT"/>
    </rest:request>
};

declare function conf:get-config-query-list-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/query"
            uri="^/(v1|LATEST)/config/query/?$"
            endpoint="../endpoints/config-query-list.xqy">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:param  name="format" required="false" values="json|xml"/>
        <rest:http method="GET">
        </rest:http>
        <rest:http method="DELETE">
        </rest:http>
    </rest:request>
};

declare function conf:get-config-query-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/query/*"
            uri="^/(v1|LATEST)/config/query/([^/]+)/?$"
            endpoint="../endpoints/config-query.xqy"
            user-params="forbid">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:uri-param name="named-option">$2</rest:uri-param>
        <rest:param  name="format" required="false" values="json|xml"/>
        <rest:http method="GET"/>
        <rest:http method="POST"/>
        <rest:http method="PUT"/>
        <rest:http method="DELETE">
            <rest:param name="check" required="false" values="exists|none"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-config-query-child-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/query/*/*"
            uri="^/(v1|LATEST)/config/query/([^/]+)/([^/]+)/?$"
            endpoint="../endpoints/config-query-child.xqy"
            user-params="forbid">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:uri-param name="named-option">$2</rest:uri-param>
        <rest:uri-param name="child-name">$3</rest:uri-param>
        <rest:param  name="format" required="false" values="json|xml"/>
        <rest:http method="GET">
        </rest:http>
        <rest:http method="POST" user-params="allow-dups">
        </rest:http>
        <rest:http method="PUT" user-params="allow-dups">
        </rest:http>
        <rest:http method="DELETE">
        </rest:http>
    </rest:request>
};

declare function conf:get-config-properties-request-rule() as element(rest:request) { 
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/properties|/*/config/properties/*"
            uri="^/(v1|LATEST)/config/properties/?$|/(v1|LATEST)/config/properties/([^/]+)/?$"
            endpoint="../endpoints/config-properties.xqy">
        <rest:param  name="format" required="false" values="json|xml"/>
        <rest:uri-param name="property">$3</rest:uri-param>
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:http method="GET">
        </rest:http>
        <rest:http method="PUT">
        </rest:http>
        <rest:http method="DELETE">
        </rest:http>
    </rest:request>
};

declare function conf:get-config-namespaces-item-request-rule() as element(rest:request) { 
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/namespaces/*"
            uri="^/(v1|LATEST)/config/namespaces/([^/]+)/?$"
            endpoint="../endpoints/config-namespace-item.xqy">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:param name="format" required="false" values="json|xml"/>
        <rest:uri-param name="prefix">$2</rest:uri-param>
        <rest:http method="GET">
        </rest:http>
        <rest:http method="PUT">
        </rest:http>
        <rest:http method="DELETE">
            <rest:param name="check"  required="false" values="exists|none"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-config-namespaces-request-rule() as element(rest:request) { 
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/namespaces"
            uri="^/(v1|LATEST)/config/namespaces/?$"
            endpoint="../endpoints/config-namespace-list.xqy">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:param name="format" required="false" values="json|xml"/>
        <rest:http method="GET">
        </rest:http>
        <rest:http method="PUT">
        </rest:http>
        <rest:http method="POST">
        </rest:http>
        <rest:http method="DELETE">
        </rest:http>
    </rest:request>
};

declare function conf:get-config-indexes-request-rule() as element(rest:request) { 
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/indexes|/*/config/indexes/*"
            uri="^/(v1|LATEST)/config/indexes/?$|/(v1|LATEST)/config/indexes/([^/]+)/?$"
            endpoint="../endpoints/config-indexes.xqy">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:accept>text/html</rest:accept>
        <rest:param  name="format" as="string" required="false" values="json|xml|html"/>
        <rest:uri-param name="named-option">$3</rest:uri-param>
        <rest:http method="GET"/>
        <rest:http method="POST"/>
    </rest:request>
};

declare function conf:get-document-query-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/documents"
            uri="^/(v1|LATEST)/documents/?$"
            endpoint="../endpoints/document-item-query.xqy">
        <rest:param name="uri"      required="true"  repeatable="true"/>
        <rest:param name="category" required="false" repeatable="true"
            values="content|metadata|{string-join(docmodcom:list-metadata-categories(),"|")}"/>
        <rest:param name="txid"     required="false"/>
        <rest:param name="timestamp" as="unsignedLong" required="false"/>
        <rest:param name="database"     required="false"/>
        <rest:http method="GET" user-params="allow-dups">
            <rest:param name="format"    required="false" values="binary|json|text|xml"/>
            <rest:param name="transform" required="false"/>
        </rest:http>
        <rest:http method="HEAD" user-params="allow-dups">
            <rest:param name="format"    required="false" values="binary|json|text|xml"/>
            <rest:param name="transform" required="false"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-document-update-rule() as element(rest:request) {
    <rest:request
            fast-match="/*/documents"
            uri="^/(v1|LATEST)/documents/?$"
            endpoint="../endpoints/document-item-update.xqy">
        <rest:param name="category" required="false" repeatable="true"
            values="content|metadata|{string-join(docmodcom:list-metadata-categories(),"|")}"/>
        <rest:param name="txid"     required="false"/>
        <rest:param name="database"     required="false"/>
        <rest:param name="temporal-collection" required="false"/>
        <rest:param name="system-time" as="dateTime" required="false"/>
        <rest:http method="PUT" user-params="allow-dups">
            <rest:param name="uri"         required="true"/>
            <rest:param name="temporal-document" required="false"/>
            <rest:param name="format"      required="false" values="binary|json|text|xml"/>
            <rest:param name="transform"   required="false"/>
            <rest:param name="repair"      required="false" values="full|none"/>
            <rest:param name="extract"     required="false" values="document|properties"/>
            <rest:param name="collection"  required="false" repeatable="true"/>
            <rest:param name="quality"     required="false" as="integer"/>
            <rest:param name="forest-name" required="false" repeatable="true"/>
        </rest:http>
        <rest:http method="POST" user-params="allow-dups">
            <rest:param name="uri"         required="false"/>
            <rest:param name="temporal-document" required="false"/>
            <rest:param name="extension"   required="false"/>
            <rest:param name="directory"   required="false"/>
            <rest:param name="format"      required="false" values="binary|json|text|xml"/>
            <rest:param name="transform"   required="false"/>
            <rest:param name="repair"      required="false" values="full|none"/>
            <rest:param name="extract"     required="false" values="document|properties"/>
            <rest:param name="collection"  required="false" repeatable="true"/>
            <rest:param name="quality"     required="false" as="integer"/>
            <rest:param name="forest-name" required="false" repeatable="true"/>
        </rest:http>
        <rest:http method="PATCH">
            <rest:param name="uri"         required="true"/>
            <rest:param name="temporal-document" required="false"/>
            <rest:param name="source-document"    required="false"/>
            <rest:param name="format"      required="false" values="binary|json|text|xml"/>
            <rest:param name="forest-name" required="false" repeatable="true"/>
        </rest:http>
        <rest:http method="DELETE">
            <rest:param name="uri"    required="true" repeatable="true"/>
            <rest:param name="result" required="false" values="wiped"/>
            <rest:param name="check"  required="false" values="exists|none"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-document-protection-rule() as element(rest:request) {
    <rest:request
            fast-match="/*/documents/protection"
            uri="^/(v1|LATEST)/documents/protection/?$"
            endpoint="../endpoints/document-item-protect.xqy">
        <rest:param name="txid"     required="false"/>
        <rest:param name="database"     required="false"/>
        <rest:param name="temporal-collection" required="true"/>
        <rest:param name="system-time" as="dateTime" required="false"/>
        <rest:http method="POST" user-params="allow-dups">
            <rest:param name="uri"         required="true" repeatable="true"/>
            <rest:param name="level"       required="false" values="noDelete|noWipe|noUpdate"/>
            <rest:param name="duration"    required="false"/>
            <rest:param name="expireTime"  required="false"/>
            <rest:param name="archivePath" required="false"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-suggest-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/suggest"
            uri="^/(v1|LATEST)/suggest/?$"
            endpoint="../endpoints/suggest.xqy"
            user-params="forbid">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:param name="txid" as="string" required="false"/>
        <rest:param name="database"     required="false"/>
        <rest:http method="GET">
            <rest:param  name="partial-q" required="false" repeatable="false"/>
            <rest:param  name="q" required="false" repeatable="true"/>
            <rest:param name="format" required="false" values="json|xml"/>
            <rest:param  name="options" as="string"  required="false"/>
            <rest:param  name="limit" as="int"  required="false"/>
            <rest:param  name="cursor-position" as="int"  required="false"/>
            <rest:param  name="focus" as="int"  required="false"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="POST">
            <rest:param  name="partial-q" required="false" repeatable="false"/>
            <rest:param  name="q" required="false" repeatable="true"/>
            <rest:param name="format" required="false" values="json|xml"/>
            <rest:param  name="options" as="string"  required="false"/>
            <rest:param  name="limit" as="int"  required="false"/>
            <rest:param  name="cursor-position" as="int"  required="false"/>
            <rest:param  name="focus" as="int"  required="false"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
    </rest:request>
};

declare function conf:get-rules-list-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
        fast-match="/*/alert/rules"
        uri="^/(v1|LATEST)/alert/rules/?$"
            endpoint="../endpoints/rules-list.xqy">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:param  name="format" required="false" values="json|xml"/>
        <rest:param name="txid" as="string" required="false"/>
        <rest:param name="database"     required="false"/>
        <rest:http method="GET">
        </rest:http>
    </rest:request>
};


declare function conf:get-alert-rules-item-query-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
        fast-match="/*/alert/rules/*"
        uri="^/(v1|LATEST)/alert/rules/([^/]+)$"
        endpoint="../endpoints/rules-item-query.xqy">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:uri-param name="rule-name">$2</rest:uri-param>
        <rest:param name="format" required="false" values="json|xml"/>
        <rest:param name="txid" as="string" required="false"/>
        <rest:param name="database"     required="false"/>
        <rest:http method="HEAD">
            <rest:auth>
                <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
                <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="GET">
            <rest:auth>
                <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
                <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="OPTIONS"/>
    </rest:request>
};

declare function conf:get-alert-rules-item-update-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
        fast-match="/*/alert/rules/*"
        uri="^/(v1|LATEST)/alert/rules/([^/]+)$"
        endpoint="../endpoints/rules-item-update.xqy">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:uri-param name="rule-name">$2</rest:uri-param>
        <rest:param name="txid" as="string" required="false"/>
        <rest:param name="database"     required="false"/>
        <rest:http method="PUT">
            <rest:param name="format" required="false" values="json|xml"/>
            <rest:auth>
                <rest:privilege>http://marklogic.com/xdmp/privileges/rest-writer</rest:privilege>
                <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="DELETE">
            <rest:param name="check" required="false" values="exists|none"/>
            <rest:auth>
                <rest:privilege>http://marklogic.com/xdmp/privileges/rest-writer</rest:privilege>
                <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="OPTIONS"/>
    </rest:request>
};

declare function conf:get-alert-match-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/alert/match"
            uri="^/(v1|LATEST)/alert/match/?$"
            endpoint="../endpoints/rules-match.xqy"
            user-params="allow-dups">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:param name="txid" as="string" required="false"/>
        <rest:param name="database"     required="false"/>
        <rest:auth>
            <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
            <rest:kind>execute</rest:kind>
        </rest:auth>
        <rest:http method="GET">
            <rest:param  name="q" required="false"/>
            <rest:param name="uri" repeatable="true" required="false"/>
            <rest:param name="start"      as="unsignedLong" required="false"/>
            <rest:param name="pageLength" as="unsignedLong" required="false"/>
            <rest:param  name="structuredQuery" required="false"/>
            <rest:param  name="options" as="string"  required="false"/>
            <rest:param name="rule" repeatable="true" required="false"/>
            <rest:param name="format" required="false" values="json|xml"/>
            <rest:param  name="transform" required="false"/>
        </rest:http>
        <rest:http method="POST">
            <rest:param  name="q" required="false"/>
            <rest:param name="start"      as="unsignedLong" required="false"/>
            <rest:param name="pageLength" as="unsignedLong" required="false"/>
            <rest:param name="rule" repeatable="true" required="false"/>
            <rest:param  name="options" as="string"  required="false"/>
            <rest:param name="format" required="false" values="json|xml"/>
            <rest:param  name="transform" required="false"/>
        </rest:http>
        <rest:http method="PUT"/>
        <rest:http method="DELETE"/>
        <rest:http method="OPTIONS"/>
    </rest:request>
};

declare function conf:get-search-query-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/search"
            uri="^/(v1|LATEST)/search(/)?$"
            endpoint="../endpoints/search-list-query.xqy"
            user-params="allow-dups">
        <rest:http method="GET">
            <rest:param  name="q" required="false"/>
            <rest:param name="format" required="false" values="json|xml"/>
            <rest:param  name="start"  as="unsignedLong" required="false"/>
            <rest:param  name="pageLength" as="unsignedLong"  required="false"/>
            <rest:param name="category" required="false" repeatable="true"
                values="content|metadata|{string-join(docmodcom:list-metadata-categories(),"|")}"/>
            <rest:param  name="options" as="string"  required="false"/>
            <rest:param  name="collection" as="string"  required="false" repeatable="true"/>
            <rest:param  name="directory" as="string"  required="false" repeatable="false"/>
            <rest:param  name="view" as="string" values="metadata|results|facets|all|none"/>
            <rest:param  name="txid" as="string" required="false"/>
            <rest:param  name="database"     required="false"/>
            <rest:param  name="forest-name"  required="false" repeatable="true"/>
            <rest:param  name="transform" required="false"/>
            <rest:param  name="structuredQuery" required="false"/>
            <rest:param name="timestamp" as="unsignedLong" required="false"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="POST">
            <rest:param  name="q" required="false"/>
            <rest:param name="format" required="false" values="json|xml"/>
            <rest:param name="category" required="false" repeatable="true"
                values="content|metadata|{string-join(docmodcom:list-metadata-categories(),"|")}"/>
            <rest:param  name="start"  as="unsignedLong" required="false"/>
            <rest:param  name="pageLength" as="unsignedLong"  required="false"/>
            <rest:param  name="options" as="string"  required="false"/>
            <rest:param  name="collection" as="string"  required="false" repeatable="true"/>
            <rest:param  name="directory" as="string"  required="false" repeatable="false"/>
            <rest:param  name="view" as="string" values="metadata|results|facets|all|none"/>
            <rest:param  name="txid" as="string" required="false"/>
            <rest:param  name="database"     required="false"/>
            <rest:param  name="forest-name"  required="false" repeatable="true"/>
            <rest:param  name="transform" required="false"/>
            <rest:param name="timestamp" as="unsignedLong" required="false"/>
            <rest:content-type>text/xml</rest:content-type>
            <rest:content-type>text/json</rest:content-type>
            <rest:content-type>application/xml</rest:content-type>
            <rest:content-type>application/json</rest:content-type>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="HEAD"/>
        <rest:http method="OPTIONS"/>
    </rest:request>
};

declare function conf:get-search-update-request-rule() as element(rest:request) {
    <rest:request
            fast-match="/*/search"
            uri="^/(v1|LATEST)/search(/)?$"
            endpoint="../endpoints/search-list-update.xqy"
            user-params="forbid">
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:http method="DELETE">
            <rest:param name="format" required="false" values="json|xml"/>
            <rest:param  name="collection" as="string"  required="false" repeatable="false"/>
            <rest:param  name="directory" as="string"  required="false" repeatable="false"/>
            <rest:param  name="txid" as="string" required="false"/>
            <rest:param  name="database"     required="false"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-writer</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
    </rest:request>
};


(: this function us used only for @fast-match.  It is ignored in the endpoint module :)
declare function conf:get-extlib-root-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true" 
            fast-match="/*/ext" 
            uri="^/(v1|LATEST)/ext/?$"
            endpoint="../endpoints/extlib.xqy"
            user-params="forbid">
        <rest:http method="GET">
            <rest:param name="format" required="false" values="json|xml"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-admin</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="PUT">
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-admin</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="DELETE">
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-admin</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
    </rest:request>
};

declare function conf:get-extlib-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/ext/**"
            uri="^/(v1|LATEST)/ext/?(.+)$"
            endpoint="../endpoints/extlib.xqy"
            user-params="forbid">
        <rest:uri-param name="path">$2</rest:uri-param>
        <rest:http method="GET">
            <rest:param name="format" required="false" values="json|xml|text|binary"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-admin</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="PUT" user-params="allow-dups">
            <rest:param name="format" required="false" values="xml|text|binary"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-admin</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="DELETE">
            <rest:param name="check" required="false" values="exists|none"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-admin</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
    </rest:request>
};
declare function conf:get-qbe-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/qbe"
            uri="^/(v1|LATEST)/qbe(/)?$"
            endpoint="../endpoints/qbe-list.xqy"
            user-params="allow-dups">
        <rest:http method="GET">
            <rest:param name="category" required="false" repeatable="true"
                values="content|metadata|{string-join(docmodcom:list-metadata-categories(),"|")}"/>
            <rest:param name="query"      as="string"       required="true"/>
            <rest:param name="format"     as="string"       required="false"
                    values="json|xml"/>
            <rest:param name="start"      as="unsignedLong" required="false"/>
            <rest:param name="pageLength" as="unsignedLong" required="false"/>
            <rest:param name="options"    as="string"       required="false"/>
            <rest:param name="collection" as="string"       required="false"
                    repeatable="true"/>
            <rest:param name="directory"  as="string"       required="false"/>
            <rest:param name="view"       as="string"       required="false"
                    repeatable="true" values="none|results|structured|validate"/>
            <rest:param name="txid"       as="string"       required="false"/>
            <rest:param name="database"   as="string"       required="false"/>
            <rest:param name="forest-name" as="string"      required="false" repeatable="true"/>
            <rest:param name="transform"  as="string"       required="false"/>
            <rest:param name="timestamp" as="unsignedLong" required="false"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="POST">
            <rest:param name="category" required="false" repeatable="true"
                values="content|metadata|{string-join(docmodcom:list-metadata-categories(),"|")}"/>
            <rest:param name="format"     as="string"       required="false"
                    values="json|xml"/>
            <rest:param name="start"      as="unsignedLong" required="false"/>
            <rest:param name="pageLength" as="unsignedLong" required="false"/>
            <rest:param name="options"    as="string"       required="false"/>
            <rest:param name="collection" as="string"       required="false"
                    repeatable="true"/>
            <rest:param name="directory"  as="string"       required="false"/>
            <rest:param name="view"       as="string"       required="false"
                    repeatable="true" values="none|results|structured|validate"/>
            <rest:param name="txid"       as="string"       required="false"/>
            <rest:param name="database"   as="string"       required="false"/>
            <rest:param name="forest-name" as="string"      required="false" repeatable="true"/>
            <rest:param name="transform"  as="string"       required="false"/>
            <rest:param name="timestamp" as="unsignedLong" required="false"/>
        </rest:http>
        <rest:http method="GET"/>
        <rest:http method="OPTIONS"/>
    </rest:request>
};

declare function conf:get-uris-request-rule() as element(rest:request) {
    <rest:request allow-post-alias="true">
        <rest:param name="q"                             required="false"/>
        <rest:param name="qbe"                           required="false"/>
        <rest:param name="structuredQuery"               required="false"/>
        <rest:param name="start"       as="unsignedLong" required="false" />
        <rest:param name="pageLength"  as="unsignedLong" required="false" />
        <rest:param name="options"     as="string"       required="false"/>
        <rest:param name="collection"  as="string"       required="false" repeatable="true"/>
        <rest:param name="directory"   as="string"       required="false"/>
        <rest:param name="txid"        as="string"       required="false"/>
        <rest:param name="database"    as="string"       required="false"/>
        <rest:param name="forest-name" as="string"       required="false" repeatable="true"/>
        <rest:param name="timestamp"   as="unsignedLong" required="false"/>
        <rest:http method="GET"></rest:http>
        <rest:http method="POST"></rest:http>
    </rest:request>
};

declare function conf:get-values-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/values|/*/values/*"
            uri="^/(v1|LATEST)/values/?$|^/(v1|LATEST)/values/([^/]+)/?$"
            endpoint="../endpoints/values.xqy"
            user-params="allow-dups">
        <rest:uri-param name="name">$3</rest:uri-param>
        <rest:param name="q" required="false"/>
        <rest:param name="aggregate" required="false" repeatable="true"/>
        <rest:param name="aggregatePath" required="false"/>
        <rest:param name="view" values="values|aggregate|all" required="false"/>
        <rest:param name="direction" required="false" values="ascending|descending"/>
        <rest:param name="frequency" required="false" values="fragment|item"/>
        <rest:param name="format" required="false" values="json|xml"/>
        <rest:param name="limit" required="false" as="unsignedLong"/>
        <rest:param name="start" required="false" as="unsignedLong"/>
        <rest:param name="pageLength" required="false" as="unsignedLong"/>
        <rest:param name="options" as="string"  required="false"/>
        <rest:param name="collection" as="string" required="false" repeatable="true"/>
        <rest:param name="directory"  as="string" required="false"/>
        <rest:param name="txid" as="string" required="false"/>
        <rest:param name="database"     required="false"/>
        <rest:param name="forest-name"  required="false" repeatable="true"/>
        <rest:param name="transform" required="false"/>
        <rest:param name="timestamp" as="unsignedLong" required="false"/>
        <rest:accept>application/json</rest:accept>
        <rest:accept>application/xml</rest:accept>
        <rest:http method="GET">
            <rest:param name="structuredQuery" required="false"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="POST">
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
    </rest:request>
};

declare function conf:get-txn-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/transactions|/*/transactions/*"
            uri="^/(v1|LATEST)/transactions/?$|^/(v1|LATEST)/transactions/(\d+_\d+)/?$"
            endpoint="../endpoints/transaction-item-default.xqy">
        <rest:uri-param name="txid">$3</rest:uri-param>
        <rest:param name="database"     required="false"/>
        <rest:http method="GET">
            <rest:param name="format" required="false" values="json|xml"/>
            <rest:accept>application/json</rest:accept>
            <rest:accept>application/xml</rest:accept>
        </rest:http>
        <rest:http method="POST">
            <rest:param name="name"      required="false"/>
            <rest:param name="timeLimit" required="false"/>
            <rest:param name="result"    required="false" values="commit|rollback"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-rsrc-list-query-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/resources"
            uri="^/(v1|LATEST)/config/resources/?$"
            endpoint="../endpoints/resource-list-query.xqy">
        <rest:http method="GET">
            <rest:param name="format"  required="false" values="json|xml"/>
            <rest:param name="refresh" required="false" as="boolean"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-rsrc-item-query-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/resources/*"
            uri="^/(v1|LATEST)/config/resources/([^/]+)/?$"
            endpoint="../endpoints/resource-item-query.xqy">
        <rest:uri-param name="name">$2</rest:uri-param>
        <rest:http method="GET"/>
    </rest:request>
};

declare function conf:get-rsrc-item-update-rule() as element(rest:request) {
    <rest:request
            fast-match="/*/config/resources/*"
            uri="^/(v1|LATEST)/config/resources/([^/]+)/?$"
            endpoint="../endpoints/resource-item-update.xqy">
        <rest:uri-param name="name">$2</rest:uri-param>
        <rest:http method="PUT" user-params="allow-dups">
            <rest:param name="title"       required="false"/>
            <rest:param name="version"     required="false"/>
            <rest:param name="provider"    required="false"/>
            <rest:param name="description" required="false"/>
        </rest:http>
        <rest:http method="DELETE">
            <rest:param name="check"  required="false" values="exists|none"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-rsrc-exec-query-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/resources/*"
            uri="^/(v1|LATEST)/resources/([^/]+)/?$"
            endpoint="../endpoints/resource-service-query.xqy">
        <rest:uri-param name="name">$2</rest:uri-param>
        <rest:http method="GET" user-params="allow-dups">
            <rest:param name="txid" as="string" required="false"/>
            <rest:param name="database"     required="false"/>
        </rest:http>
        <rest:http method="POST" user-params="allow-dups">
            <rest:param name="txid" as="string" required="false"/>
            <rest:param name="database"     required="false"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-rsrc-exec-update-rule() as element(rest:request) {
    <rest:request
            fast-match="/*/resources/*"
            uri="^/(v1|LATEST)/resources/([^/]+)/?$"
            endpoint="../endpoints/resource-service-update.xqy">
        <rest:uri-param name="name">$2</rest:uri-param>
        <rest:http method="PUT" user-params="allow-dups">
            <rest:param name="txid" as="string" required="false"/>
            <rest:param name="database"     required="false"/>
        </rest:http>
        <rest:http method="DELETE" user-params="allow-dups">
            <rest:param name="txid" as="string" required="false"/>
            <rest:param name="database"     required="false"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-tfm-list-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/transforms"
            uri="^/(v1|LATEST)/config/transforms/?$"
            endpoint="../endpoints/transform-list-default.xqy">
        <rest:http method="GET">
            <rest:param name="format"  required="false" values="json|xml"/>
            <rest:param name="refresh" required="false" as="boolean"/>
        </rest:http>
    </rest:request>
};

declare function conf:get-tfm-item-request-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/config/transforms/*"
            uri="^/(v1|LATEST)/config/transforms/([^/]+)/?$"
            endpoint="../endpoints/transform-item-default.xqy">
        <rest:uri-param name="name">$2</rest:uri-param>
        <rest:http method="GET"/>
        <rest:http method="PUT" user-params="allow-dups">
            <rest:param name="title"       required="false"/>
            <rest:param name="version"     required="false"/>
            <rest:param name="provider"    required="false"/>
            <rest:param name="description" required="false"/>
            <rest:param name="format"      required="false" values="xquery|xslt|javascript"/>
        </rest:http>
        <rest:http method="DELETE">
            <rest:param name="check" required="false" values="exists|none"/>
        </rest:http>
    </rest:request>
};

(: semantics :)
declare function conf:get-sparql-protocol-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="false"
            fast-match="/*/graphs/sparql"
            uri="^/(v1|LATEST)/graphs/sparql(/)?$"
            endpoint="../endpoints/sparql-query.xqy"
            user-params="allow-dups">
        <rest:param name="database"     required="false"/>
        <rest:http method="GET">
            <rest:param name="query" required="true"/>
            <rest:param name="txid" required="false"/>
            <rest:param name="default-graph-uri" required="false" repeatable="true"/>
            <rest:param name="named-graph-uri" required="false" repeatable="true"/>
            <rest:param name="format" required="false" values="json|xml|html|text|turtle|nquad"/>
            <rest:param name="start"      as="unsignedLong" required="false"/>
            <rest:param name="pageLength" as="unsignedLong" required="false"/>
            <rest:param name="optimize" as="unsignedInt" required="false"/>
            <rest:param name="ruleset" required="false" repeatable="true"/>
            <rest:param name="default-rulesets" required="false" values="include|exclude"/>
            <rest:param name="collection" repeatable="true" required="false" />
            <rest:param name="directory" required="false" />
            <rest:param  name="q" required="false"/>
            <rest:param  name="structuredQuery" required="false"/>
            <rest:param  name="options" as="string"  required="false"/>
            <rest:param  name="base" as="string"  required="false"/>
            <rest:param name="timestamp" as="unsignedLong" required="false"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="POST">
            <rest:param name="query" required="false"/>
            <rest:param name="txid" required="false"/>
            <rest:param name="default-graph-uri" required="false" repeatable="true"/>
            <rest:param name="named-graph-uri" required="false" repeatable="true"/>
            <rest:param name="format" required="false" values="json|xml|html|text|turtle|nquad"/>
            <rest:param name="update" required="false"/>
            <rest:param name="using-graph-uri" required="false" repeatable="true"/>
            <rest:param name="using-named-graph-uri" required="false" repeatable="true"/>
            <rest:param name="default-permissions" required="false" repeatable="true"/>
            <rest:param name="start"      as="unsignedLong" required="false"/>
            <rest:param name="pageLength" as="unsignedLong" required="false"/>
            <rest:param name="optimize" as="unsignedInt" required="false"/>
            <rest:param name="ruleset" required="false" repeatable="true"/>
            <rest:param name="default-rulesets" required="false" values="include|exclude"/>
            <rest:param name="collection" repeatable="true" required="false" />
            <rest:param name="directory" required="false" />
            <rest:param  name="q" required="false"/>
            <rest:param  name="structuredQuery" required="false"/>
            <rest:param  name="options" as="string"  required="false"/>
            <rest:param  name="base" as="string"  required="false"/>
            <rest:param name="timestamp" as="unsignedLong" required="false"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
    </rest:request>
};

declare function conf:get-graph-explore-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/graphs/things"
            uri="^/(v1|LATEST)/graphs/things(/)?$"
            endpoint="../endpoints/graph-explore.xqy"
            user-params="allow-dups">
        <rest:param name="txid" as="string" required="false"/>
        <rest:param name="database"     required="false"/>
        <rest:http method="GET">
            <rest:param name="iri" repeatable="true" required="false"/>
            <rest:param name="explore" required="false"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="POST">
            <rest:param name="q" required="false"/>
            <rest:param name="explore" required="false"/>
            <rest:auth>
              <rest:privilege>http://marklogic.com/xdmp/privileges/rest-reader</rest:privilege>
              <rest:kind>execute</rest:kind>
            </rest:auth>
        </rest:http>
        <rest:http method="HEAD"/>
        <rest:http method="OPTIONS"/>
    </rest:request>
};

declare function conf:get-graphstore-protocol-query-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/graphs"
            uri="^/(v1|LATEST)/graphs(/)?$"
            endpoint="../endpoints/graphstore-query.xqy"
            user-params="allow-dups">
        <rest:param name="database" required="false"/>
        <rest:param name="txid" required="false"/>
        <rest:param name="category" required="false"
            values="content|metadata|permissions"/>
        <rest:param name="timestamp" as="unsignedLong" required="false"/>
        <rest:http method="GET">
            <rest:param name="graph" required="false"/>
            <rest:param name="default" required="false"/>
        </rest:http>
        <rest:http method="HEAD">
            <rest:param name="graph" required="false"/>
            <rest:param name="default" required="false"/>
        </rest:http>
        <rest:http method="OPTIONS"/>
    </rest:request>
};

declare function conf:get-graphstore-protocol-update-rule() as element(rest:request) {
    <rest:request
            allow-post-alias="true"
            fast-match="/*/graphs"
            uri="^/(v1|LATEST)/graphs(/)?$"
            endpoint="../endpoints/graphstore-update.xqy"
            user-params="allow-dups">
        <rest:param name="database" required="false"/>
        <rest:param name="txid" required="false"/>
        <rest:param name="category" required="false"
            values="content|metadata|permissions"/>
        <rest:http method="POST">
            <rest:param name="graph" required="false"/>
            <rest:param name="repair" required="false" values="true|false"/>
            <rest:param name="default" required="false"/>
        </rest:http>
        <rest:http method="PUT">
            <rest:param name="graph" required="false"/>
            <rest:param name="repair" required="false" values="true|false"/>
            <rest:param name="default" required="false"/>
        </rest:http>
        <rest:http method="DELETE">
            <rest:param name="graph" required="false"/>
            <rest:param name="default" required="false"/>
        </rest:http>
    </rest:request>
};
