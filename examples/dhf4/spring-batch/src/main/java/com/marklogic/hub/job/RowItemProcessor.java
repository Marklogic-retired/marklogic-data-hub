package com.marklogic.hub.job;

import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.impl.DocumentWriteOperationImpl;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.spring.batch.columnmap.ColumnMapSerializer;
import org.springframework.batch.item.ItemProcessor;

import java.util.Map;
import java.util.UUID;

/**
 * This is a very basic processor for taking a column map (a Map<String, Object>) and serializing it via a
 * ColumnMapSerializer, and then providing very basic support for setting permissions and collections.
 * marklogic-spring-batch provides other options for e.g. customizing the URI. Feel free to customize any way you'd like.
 */
public class RowItemProcessor implements ItemProcessor<Map<String, Object>, DocumentWriteOperation> {

    private ColumnMapSerializer columnMapSerializer;
    private String tableNameKey = "_tableName";
    private String rootLocalName = "CHANGEME";

    // Expected to be role,capability,role,capability,etc.
    private String[] permissions;

    private String[] collections;

    public RowItemProcessor(ColumnMapSerializer columnMapSerializer) {
        this.columnMapSerializer = columnMapSerializer;
    }

    @Override
    public DocumentWriteOperation process(Map<String, Object> item) throws Exception {
        String tableName = null;
        if (item.containsKey(tableNameKey)) {
            tableName = (String)item.get(tableNameKey);
            item.remove(tableNameKey);
        }

        String thisRootLocalName = tableName != null ? tableName : rootLocalName;
        String content = columnMapSerializer.serializeColumnMap(item, thisRootLocalName);

        String uuid = UUID.randomUUID().toString();
        String uri = "/" + thisRootLocalName + "/" + uuid + ".xml";

        DocumentMetadataHandle metadata = new DocumentMetadataHandle();
        if (collections != null) {
            metadata.withCollections(collections);
        }
        if (tableName != null) {
            metadata.withCollections(tableName);
        }

        if (permissions != null) {
            for (int i = 0; i < permissions.length; i += 2) {
                String role = permissions[i];
                DocumentMetadataHandle.Capability c = DocumentMetadataHandle.Capability.valueOf(permissions[i + 1].toUpperCase());
                metadata.withPermission(role, c);
            }
        }

        return new DocumentWriteOperationImpl(DocumentWriteOperation.OperationType.DOCUMENT_WRITE,
            uri, metadata, new StringHandle(content));
    }

    public void setRootLocalName(String rootLocalName) {
        this.rootLocalName = rootLocalName;
    }

    public void setCollections(String[] collections) {
        this.collections = collections;
    }

    public void setPermissions(String[] permissions) {
        this.permissions = permissions;
    }

    public void setTableNameKey(String tableNameKey) {
        this.tableNameKey = tableNameKey;
    }
}
