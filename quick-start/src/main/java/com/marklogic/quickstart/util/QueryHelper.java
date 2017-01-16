/*
 * Copyright 2012-2016 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.quickstart.util;

import com.marklogic.client.MarkLogicIOException;
import com.marklogic.client.query.StructuredQueryBuilder;
import com.sun.xml.internal.ws.util.DOMUtil;
import org.w3c.dom.Element;

import javax.xml.XMLConstants;
import javax.xml.stream.XMLOutputFactory;
import javax.xml.stream.XMLStreamWriter;
import java.io.ByteArrayOutputStream;
import java.io.OutputStream;

public class QueryHelper {

    private static final String SEARCH_API_NS = "http://marklogic.com/appservices/search";

    private static XMLStreamWriter makeSerializer(OutputStream out) {
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


    public static String serializeQuery(StructuredQueryBuilder sb, StructuredQueryBuilder.AndQuery query, String sortOrder) {
        return serializeQuery(sb, query, sortOrder, null);
    }

    public static String serializeQuery(StructuredQueryBuilder sb, StructuredQueryBuilder.AndQuery query, String sortOrder, Element options) {
        String result;
        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            XMLStreamWriter serializer = makeSerializer(baos);

            serializer.writeStartElement(SEARCH_API_NS, "search");

            if (options != null) {
                DOMUtil.serializeNode(options, serializer);
            }

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
}
