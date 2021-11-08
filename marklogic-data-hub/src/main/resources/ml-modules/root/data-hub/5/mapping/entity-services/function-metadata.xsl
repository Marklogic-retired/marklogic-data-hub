<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:mapping="http://marklogic.com/entity-services/mapping"
                xmlns:xdmp="http://marklogic.com/xdmp"
                xmlns:sem="http://marklogic.com/semantics"
                xmlns:axsl="uri:namespace-alias-xsl"
                xmlns:axdmp="uri:namespace-alias-xdmp"
                xmlns:this="uri:this"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                version="2.0"
                xdmp:dialect="1.0-ml"
                exclude-result-prefixes="mapping this"
>

  <!--
      function-defs := @type?, @location, @namespace?, function-def*
      function-def := @name, parameters, return
      parameters := parameter*
      parameter := @name, @type
      return := @type
    -->
  <xsl:namespace-alias stylesheet-prefix="axsl" result-prefix="xsl"/>
  <xsl:namespace-alias stylesheet-prefix="axdmp" result-prefix="xdmp"/>

  <xsl:variable name="location" select="/mapping:function-defs/@location"/>

  <xsl:function name="this:mapTypeName">
    <xsl:param name="in"/>
    <xsl:choose>
      <xsl:when test="$in='Node'">node()</xsl:when>
      <xsl:when test="$in='Number'">xs:numeric</xsl:when>
      <xsl:when test="$in='Integer'">xs:integer</xsl:when>
      <xsl:when test="$in='String'">xs:string</xsl:when>
      <xsl:when test="$in='Boolean'">xs:boolean</xsl:when>
      <xsl:when test="$in='Array'">array-node()</xsl:when>
      <xsl:when test="$in='Object'">object-node()</xsl:when>
      <xsl:when test="$in='Sequence'">item()*</xsl:when>
      <xsl:when test="$in='null'">empty-sequence()</xsl:when>
      <xsl:when test="matches($in,':')"><xsl:value-of select="$in"/></xsl:when>
      <xsl:when test="matches($in,'.')"><xsl:value-of select="replace($in,'.',':')"/></xsl:when>
      <xsl:otherwise><xsl:value-of select="concat('xs:',$in)"/></xsl:otherwise>
    </xsl:choose>
  </xsl:function>


  <xsl:template match="/">
    <xsl:apply-templates/>
  </xsl:template>

  <xsl:template match="mapping:function-defs">
    <axsl:stylesheet version="2.0"
                     extension-element-prefixes="xdmp"
                     axdmp:dialect="1.0-ml"
                     >
      <xsl:choose>
        <xsl:when test="@type='xquery'">
          <axdmp:import-module href="{@location}" namespace="{@namespace}"/>
          <axdmp:using namespace="{@namespace}"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:namespace name="ext">http://marklogic.com/entity-services/extra-functions</xsl:namespace>
          <xsl:namespace name="map">http://marklogic.com/xdmp/map</xsl:namespace>
          <xsl:copy-of select="namespace::*[string(.)!='http://marklogic.com/entity-services/mapping']"/>
          <xsl:apply-templates select="mapping:function-def"/>
        </xsl:otherwise>
      </xsl:choose>
    </axsl:stylesheet>
  </xsl:template>

  <xsl:template match="mapping:function-def">
    <axsl:function name="{concat('ext:',@name)}">
      <xsl:if test="mapping:return/@type and mapping:return/@type!='' and not(matches(mapping:return/@type,' '))">
        <xsl:attribute name="as">
          <xsl:value-of select="this:mapTypeName(mapping:return/@type)"/>
        </xsl:attribute>
      </xsl:if>
      <xsl:for-each select="mapping:parameters/mapping:parameter">
        <axsl:param>
          <xsl:attribute name="name">
            <xsl:value-of select="@name"/>
          </xsl:attribute>
          <xsl:if test="@type and @type!='' and not(matches(@type,' '))">
            <xsl:attribute name="as">
              <xsl:value-of select="this:mapTypeName(@type)"/>
            </xsl:attribute>
          </xsl:if>
        </axsl:param>
      </xsl:for-each>
      <axdmp:javascript-call>
        <xsl:attribute name="name">
          <xsl:value-of select="@name"/>
        </xsl:attribute>
        <xsl:attribute name="href">
          <xsl:value-of select="$location"/>
        </xsl:attribute>
        <xsl:for-each select="mapping:parameters/mapping:parameter">
          <axsl:with-param axdmp:dialect="1.0-ml">
            <xsl:attribute name="name">
              <xsl:value-of select="@name"/>
            </xsl:attribute>
            <xsl:attribute name="select">
                <xsl:value-of select="concat('if (empty($', @name ,')) then null-node{} else $', @name)"/>
            </xsl:attribute>
          </axsl:with-param>
        </xsl:for-each>
        <axsl:fallback>
          <xsl:variable name="isJSModule" as="xs:boolean">
            <xsl:value-of select='xdmp:uri-content-type($location)="application/vnd.marklogic-js-module"'/>
          </xsl:variable>
          <xsl:variable name="externals" as="xs:string*">
            <xsl:if test="number(substring-before(xdmp:version(),'.')) gt 9 and $isJSModule">
              <xsl:for-each select="mapping:parameters/mapping:parameter">
                <xsl:value-of select="concat('external.',@name)"/>
              </xsl:for-each>
            </xsl:if>
          </xsl:variable>
          <xsl:variable name="parms">
            <xsl:choose>
              <xsl:when test="number(substring-before(xdmp:version(),'.')) le 9 or not($isJSModule)">
                <xsl:value-of select='string-join(mapping:parameters/mapping:parameter/@name,",")'/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select='string-join($externals,",")'/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:variable name="js">
            <xsl:choose>
              <xsl:when test="number(substring-before(xdmp:version(),'.')) le 9 or not($isJSModule)">
                <xsl:value-of select='concat("&apos;use strict&apos;; var ext=require(&apos;",$location,"&apos;); ext.",@name,"(",$parms,");")'/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select='concat("&apos;use strict&apos;; import {",@name,"} from &apos;",$location,"&apos;; ",@name,"(",$parms,");")'/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:variable name="mapparms">
            <xsl:for-each select="mapping:parameters/mapping:parameter">
              <xsl:value-of select="'=&gt;map:with(&quot;'"/>
              <xsl:value-of select="@name"/>
              <xsl:value-of select="'&quot;,'"/>
              <xsl:value-of select="concat('$',@name)"/>
              <xsl:value-of select="')'"/>
            </xsl:for-each>
          </xsl:variable>
          <xsl:variable name="map">
            <xsl:value-of select="concat('map:map()',string-join($mapparms,''))"/>
          </xsl:variable>
          <axsl:value-of axdmp:dialect="1.0-ml" select='xdmp:javascript-eval("{$js}", {$map})'/>
        </axsl:fallback>
      </axdmp:javascript-call>
    </axsl:function>
  </xsl:template>
</xsl:stylesheet>
