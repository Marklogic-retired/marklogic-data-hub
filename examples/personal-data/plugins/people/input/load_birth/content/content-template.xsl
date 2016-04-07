<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fn="http://www.w3.org/2005/xpath-functions"
	xmlns:xdmp="http://marklogic.com/xdmp">

  <xsl:template match="/">
    <xsl:apply-templates select="root" />
  </xsl:template>

	<xsl:template match="root">
		<birth-certificate>
		  <mother>
		    <maiden-name>
            <firstname><xsl:value-of select="bc-mother-mn-firstname"/></firstname>
            <middlename><xsl:value-of select="bc-mother-mn-middlename"/></middlename>
            <lastname><xsl:value-of select="bc-mother-mn-lastname"/></lastname>
        </maiden-name>
        <citizenship><xsl:value-of select="bc-mother-citizenship"/></citizenship>
        <religion><xsl:value-of select="bc-mother-religion"/></religion>
        <occupation><xsl:value-of select="bc-mother-occupation"/></occupation>
        <residence>
              <city-or-municipality>
                  <xsl:value-of select="bc-mother-residence-city-or-municipality"/>
              </city-or-municipality>
              <province>
                  <xsl:value-of select="bc-mother-residence-province"/>
              </province>
        </residence>
		  </mother>
		  <father>
        <firstname><xsl:value-of select="bc-father-firstname"/></firstname>
        <middlename><xsl:value-of select="bc-father-middlename"/></middlename>
        <lastname><xsl:value-of select="bc-father-lastname"/></lastname>
        <citizenship><xsl:value-of select="bc-father-citizenship"/></citizenship>
        <religion><xsl:value-of select="bc-father-religion"/></religion>
        <occupation><xsl:value-of select="bc-father-occupation"/></occupation>
		  </father>
		  <marraige-of-parents>
		    <date><xsl:value-of select="bc-mop-date"/></date>
		    <place><xsl:value-of select="bc-mop-place"/></place>
		  </marraige-of-parents>
		</birth-certificate>
	</xsl:template>
</xsl:stylesheet>
