<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:map="http://marklogic.com/xdmp/map">
  <xsl:param name="context" as="map:map"/>
  <xsl:param name="params"  as="map:map"/>
  <xsl:template match="/*">
    <xsl:copy-of select="."/>
  </xsl:template>
</xsl:stylesheet>
