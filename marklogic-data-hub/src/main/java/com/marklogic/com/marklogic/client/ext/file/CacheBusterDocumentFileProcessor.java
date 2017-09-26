package com.marklogic.com.marklogic.client.ext.file;

import com.marklogic.client.ext.file.DocumentFile;
import com.marklogic.client.ext.file.DocumentFileProcessor;
import com.marklogic.client.ext.helper.FilenameUtil;
import com.marklogic.client.ext.helper.LoggingObject;
import org.springframework.core.io.Resource;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.util.UUID;

public class CacheBusterDocumentFileProcessor extends LoggingObject implements DocumentFileProcessor {

    @Override
    public DocumentFile processDocumentFile(DocumentFile documentFile) {
        String text = documentFile.getModifiedContent();
        if (text == null) {
            Resource resource = documentFile.getResource();
            if (resource != null) {
                try {
                    text = new String(FileCopyUtils.copyToByteArray(resource.getInputStream()));
                } catch (IOException ie) {
                    logger.warn("Unable to replace tokens in file: " + documentFile.getUri() + "; cause: " + ie.getMessage());
                }
            }
        }
        if (text != null) {
            Resource resource = documentFile.getResource();
            String comment = "";
            if (FilenameUtil.isJavascriptFile(resource.getFilename())) {
                comment = "// cache buster: " + UUID.randomUUID().toString() + "\n";
            } else if (FilenameUtil.isXqueryFile(resource.getFilename())) {
                comment = "(: cache buster: " + UUID.randomUUID().toString() + " :)\n";
            }

            text = comment + text;
            documentFile.setModifiedContent(text);
        }
        return documentFile;
    }
}
