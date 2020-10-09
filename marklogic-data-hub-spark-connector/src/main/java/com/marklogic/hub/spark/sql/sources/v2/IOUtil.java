/*
 * Copyright 2019 MarkLogic Corporation
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
package com.marklogic.hub.spark.sql.sources.v2;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.TextDocumentManager;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.JacksonHandle;
import com.marklogic.client.io.StringHandle;
import java.io.*;

public class IOUtil {
    public final static String DIR = "ml-modules/root/data-hub/5/data-services/ingestion";

    public static DatabaseClient modDb;
    public static DocumentMetadataHandle scriptMeta;
    public static DocumentMetadataHandle docMeta ;
    public static TextDocumentManager modMgr;

    public final static ObjectMapper mapper = new ObjectMapper();

    public IOUtil(DatabaseClient modDb) {
            this.modDb = modDb;
            scriptMeta = initDocumentMetadata(true);
            docMeta = initDocumentMetadata(false);
            modMgr = modDb.newTextDocumentManager();
    }

    public static DocumentMetadataHandle initDocumentMetadata(boolean isScript) {
        DocumentMetadataHandle docMeta = new DocumentMetadataHandle();
        addRestDocPerms(docMeta, isScript);
        return docMeta;
    }
    public static void addRestDocPerms(DocumentMetadataHandle docMeta, boolean isScript) {
        addRestDocPerms(docMeta, "rest-reader", isScript);
        addRestDocPerms(docMeta, "rest-writer", isScript);
    }
    public static void addRestDocPerms(DocumentMetadataHandle docMeta, String role, boolean isScript) {
        boolean readOnly = role.endsWith("-reader");
        int max = readOnly ? 1 : 2;
        if (isScript)
            max++;
        DocumentMetadataHandle.Capability[] capabilities = new DocumentMetadataHandle.Capability[max];
        capabilities[0] = DocumentMetadataHandle.Capability.READ;
        if (!readOnly)
            capabilities[1] = DocumentMetadataHandle.Capability.UPDATE;
        if (isScript)
            capabilities[capabilities.length - 1] = DocumentMetadataHandle.Capability.EXECUTE;
        docMeta.getPermissions().add(role, capabilities);
    }
    public static ObjectNode readApi(String apiName) throws IOException {
        String apiBody = testFileToString(DIR+ File.separator+apiName);
        return mapper.readValue(apiBody, ObjectNode.class);
    }
    public static String getScriptPath(JsonNode apiObj) {
        return apiObj.get("endpoint").asText();
    }
    public static String getApiPath(String endpointPath) {
        return endpointPath.substring(0, endpointPath.length() - 3)+"api";
    }
    public void load(String apiName) throws IOException {
        ObjectNode apiObj = readApi(apiName);
        String scriptPath = getScriptPath(apiObj);
        String apiPath = getApiPath(scriptPath);
        String scriptName = scriptPath.substring(scriptPath.length() - apiName.length());
        String scriptBody = testFileToString(DIR+ File.separator+scriptName);
        DocumentWriteSet writeSet = modMgr.newWriteSet();
        writeSet.add(apiPath,    docMeta,    new JacksonHandle(apiObj));
        writeSet.add(scriptPath, scriptMeta, new StringHandle(scriptBody));
        modMgr.write(writeSet);
    }

    public static String testFileToString(String filename) throws IOException {
        return testFileToString(filename, null);
    }
    public static String testFileToString(String filename, String encoding) throws IOException {
        return readerToString(testFileToReader(filename, encoding));
    }
    public static String readerToString(Reader r) throws IOException {
        StringWriter w = new StringWriter();
        char[] cbuf = new char[1000];
        int len = 0;
        while (((len=r.read(cbuf)) != -1)) {
            w.write(cbuf, 0, len);
        }
        r.close();
        String result = w.toString();
        w.close();
        return result;
    }

    public static Reader testFileToReader(String filename, String encoding) {
        try {
            return (encoding != null) ?
                new InputStreamReader(testFileToStream(filename), encoding) :
                new InputStreamReader(testFileToStream(filename));
        } catch (UnsupportedEncodingException e) {
            throw new RuntimeException(e);
        }
    }
    public static InputStream testFileToStream(String filename) {
        try {
        } catch(Exception ex) {
            ex.printStackTrace();
        }
        return IOUtil.class.getClassLoader().getResourceAsStream(filename);
    }
}
