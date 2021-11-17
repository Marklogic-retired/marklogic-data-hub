<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xdmp="http://marklogic.com/xdmp"
                extension-element-prefixes="xdmp"
                xdmp:dialect="tde"
                version="2.0">
    <xsl:param name="functions" />
    <xsl:param name="function-signature" />
    <xsl:param name="function-name" />
    <xsl:param name="function-available" />
    <xsl:param name="function-arity" />
    <xsl:param name="local-name-from-QName" />
    <xsl:template match="/">
        <root>
            <xsl:variable name="all-available-functions" select="$functions()[$function-available($local-name-from-QName($function-name(.)))]"/>
            <xsl:for-each select="$all-available-functions">
                <function>
                    <xsl:variable name="function-local-name" select="$local-name-from-QName($function-name(.))"/>
                    <xsl:attribute name="name" select="$function-local-name"  />
                    <xsl:attribute name="arity" select="$function-arity(.)"  />
                    <xsl:value-of select="replace($function-signature(.), '^function', $function-local-name)"/>
                </function>
            </xsl:for-each>
        </root>
    </xsl:template>
</xsl:stylesheet>