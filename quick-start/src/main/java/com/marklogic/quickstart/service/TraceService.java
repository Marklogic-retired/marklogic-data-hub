package com.marklogic.quickstart.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.document.ServerTransform;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.query.QueryManager;
import com.marklogic.client.query.RawCombinedQueryDefinition;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.marklogic.client.query.StructuredQueryDefinition;

import javax.xml.XMLConstants;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamWriter;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;

public class TraceService extends LoggingObject {

    private static final String SEARCH_OPTIONS_NAME = "traces";
    private static final String SEARCH_API_NS = "http://marklogic.com/appservices/search";

    private DatabaseClient databaseClient;
    private QueryManager queryMgr;
    private GenericDocumentManager docMgr;

    public TraceService(DatabaseClient client) {
        this.databaseClient = client;
        this.queryMgr = databaseClient.newQueryManager();
        this.docMgr = databaseClient.newDocumentManager();
    }

    private XMLStreamWriter makeSerializer(OutputStream out) {
        XMLOutputFactory factory = XMLOutputFactory.newInstance();
        factory.setProperty(XMLOutputFactory.IS_REPAIRING_NAMESPACES, true);

        try {
            XMLStreamWriter serializer = factory.createXMLStreamWriter(out, "UTF-8");

            serializer.setDefaultNamespace(SEARCH_API_NS);
            serializer.setPrefix("xs",  XMLConstants.W3C_XML_SCHEMA_NS_URI);

            return serializer;
        } catch (Exception e) {
            throw new MarkLogicIOException(e);
        }
    }

    private String serializeQuery(StructuredQueryBuilder sb, StructuredQueryBuilder.AndQuery query, String sortOrder) {
        String result;
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            XMLStreamWriter serializer = makeSerializer(baos);

            serializer.writeStartElement(SEARCH_API_NS, "search");
            serializer.writeStartElement(SEARCH_API_NS, "query");


            for (String prefix : sb.getNamespaces().getAllPrefixes()) {
                serializer.writeNamespace(prefix, sb.getNamespaces().getNamespaceURI(prefix));
            }

            query.innerSerialize(serializer);

            serializer.writeStartElement("operator-state");
            serializer.writeStartElement("operator-name");
            serializer.writeCharacters("sort");
            serializer.writeEndElement();

            serializer.writeStartElement("state-name");
            serializer.writeCharacters(sortOrder);
            serializer.writeEndElement();

            serializer.writeEndElement();

            serializer.writeEndElement();
            serializer.writeEndElement();
            result = baos.toString("UTF-8");
        } catch (Exception e) {
            throw new MarkLogicIOException(e);
        }
        return result;
    }

    public StringHandle getTraces(String query, long start, long count) {
        queryMgr.setPageLength(count);

        StructuredQueryBuilder sb = queryMgr.newStructuredQueryBuilder(SEARCH_OPTIONS_NAME);

        ArrayList<StructuredQueryDefinition> queries = new ArrayList<>();
        if (query != null && !query.equals("")) {
            queries.add(sb.term(query));
        }

        StructuredQueryBuilder.AndQuery sqd = sb.and(queries.toArray(new StructuredQueryDefinition[0]));

        String sort = "date-desc";
        String searchXml = serializeQuery(sb, sqd, sort);

        RawCombinedQueryDefinition querydef = queryMgr.newRawCombinedQueryDefinition(new StringHandle(searchXml), SEARCH_OPTIONS_NAME);
        querydef.setResponseTransform(new ServerTransform("trace-search"));
        StringHandle sh = new StringHandle();
        sh.setFormat(Format.JSON);
        StringHandle results = queryMgr.search(querydef, sh, start);
        return results;
    }

    public JsonNode getTrace(String traceId) {
        return docMgr.readAs("/" + traceId, JsonNode.class, new ServerTransform("trace-json"));
    }
}
