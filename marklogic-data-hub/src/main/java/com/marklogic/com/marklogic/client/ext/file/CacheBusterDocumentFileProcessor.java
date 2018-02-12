/*
 * Copyright 2012-2018 MarkLogic Corporation
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
