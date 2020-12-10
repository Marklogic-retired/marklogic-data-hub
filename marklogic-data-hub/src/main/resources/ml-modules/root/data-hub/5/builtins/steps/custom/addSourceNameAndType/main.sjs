function main(content, options) {
  if(options["sourceNameToAdd"] || options["sourceTypeToAdd"]) {
    // See https://docs.marklogic.com/Node.nodeType
    if(content.value.root && 1 === content.value.root.nodeType) {
      addSourceToXmlDocuments(content, options["sourceNameToAdd"], options["sourceTypeToAdd"]);
    }

    if(content && content.value && 9 == content.value.nodeType && content.value.toObject().envelope) {
      addSourceToJsonDocuments(content, options["sourceNameToAdd"], options["sourceTypeToAdd"]);
    }
  }
  return content;
}

function addSourceToXmlDocuments(content, sourceName, sourceType) {
  const builder = new NodeBuilder();
  builder.startElement("sources");
  if(sourceName) {
    builder.addElement('datahubSourceName', sourceName);
  }
  if(sourceType) {
    builder.addElement('datahubSourceType', sourceType);
  }
  builder.endElement();

  const sourcesToAdd = builder.toNode();
  const xslt = `
        <xsl:stylesheet 
          xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="2.0">
          <xsl:template match="/*:envelope/*:headers">
            <xsl:copy>
              <xsl:apply-templates select="node()|@*"/>
              ${xdmp.quote(sourcesToAdd)}
            </xsl:copy>
          </xsl:template>
          <xsl:template match="node()|@*">
            <xsl:copy>
              <xsl:apply-templates select="node()|@*"/>
            </xsl:copy>
          </xsl:template>
        </xsl:stylesheet>`;
  content.value = xdmp.xsltEval(xdmp.unquote(xslt), content.value.root);
}

function addSourceToJsonDocuments(content, sourceName, sourceType) {
  content.value = content.value.toObject();
  const headers = content.value.envelope.headers;

  if(headers["sources"] && !Array.isArray(headers["sources"])) {
    headers.sources = [headers.sources];
  }

  if(!headers["sources"] || headers["sources"].length == 0) {
    headers["sources"] = [];
  }

  headers["sources"].push({
    "datahubSourceName": sourceName ? sourceName : undefined,
    "datahubSourceType": sourceType ? sourceType : undefined
  });
}

module.exports = {
  main: main
};
