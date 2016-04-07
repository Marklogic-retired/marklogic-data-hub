<?xml version="1.0" encoding="utf-8"?>

<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fn="http://www.w3.org/2005/xpath-functions"
	xmlns:xdmp="http://marklogic.com/xdmp">

	<xsl:template match="/">
		<xsl:apply-templates select="root" />
	</xsl:template>


	<xsl:template match="root">
		<birth-certificate>
			<firstname>
				<xsl:value-of select="bc-child-firstname" />
			</firstname>
			<middlename>
				<xsl:value-of select="bc-child-middlename" />
			</middlename>
			<lastname>
				<xsl:value-of select="bc-child-lastname" />
			</lastname>
			<gender>
				<xsl:value-of select="bc-child-sex" />
			</gender>
			<dob>
				<xsl:value-of select="bc-child-dob" />
			</dob>
			<birth-place>
				<city-or-municipality>
					<xsl:value-of select="bc-child-bp-city-or-municipality" />
				</city-or-municipality>
				<province>
					<xsl:value-of select="bc-child-bp-province" />
				</province>
			</birth-place>
			<attending-physician>
				<xsl:value-of select="bc-attendant" />
			</attending-physician>
			<registry>
				<registry-number>
					<xsl:value-of select="bc-registry-number" />
				</registry-number>
				<city-or-municipality>
					<xsl:value-of select="bc-city-or-municipality" />
				</city-or-municipality>
				<province>
					<xsl:value-of select="bc-province" />
				</province>
			</registry>
		</birth-certificate>
	</xsl:template>

</xsl:stylesheet>
