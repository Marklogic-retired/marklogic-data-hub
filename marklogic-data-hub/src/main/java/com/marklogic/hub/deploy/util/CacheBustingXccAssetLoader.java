package com.marklogic.hub.deploy.util;

import com.marklogic.client.helper.FilenameUtil;
import com.marklogic.client.modulesloader.impl.XccAssetLoader;
import com.marklogic.client.modulesloader.tokenreplacer.ModuleTokenReplacer;
import com.marklogic.xcc.Content;
import com.marklogic.xcc.ContentCreateOptions;
import com.marklogic.xcc.ContentFactory;
import org.springframework.util.FileCopyUtils;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

public class CacheBustingXccAssetLoader extends XccAssetLoader {
    protected Content buildContent(String uri, File f, ContentCreateOptions options) {
        Content content = null;
        String comment = "";
        if (FilenameUtil.isJavascriptFile(f.getName())) {
            comment = "// cache buster: " + UUID.randomUUID().toString() + "\n";
        } else if (FilenameUtil.isXqueryFile(f.getName())) {
            comment = "(: cache buster: " + UUID.randomUUID().toString() + " :)\n";
        }
        ModuleTokenReplacer moduleTokenReplacer = getModuleTokenReplacer();
        if (moduleTokenReplacer != null && moduleCanBeReadAsString(options.getFormat())) {
            try {
                String text = new String(FileCopyUtils.copyToByteArray(f));
                text = moduleTokenReplacer.replaceTokensInModule(text);
                content = ContentFactory.newContent(uri, text, options);
            } catch (IOException ie) {
                content = ContentFactory.newContent(uri, f, options);
            }
        } else {
            try {
                String text = new String(FileCopyUtils.copyToByteArray(f));
                content = ContentFactory.newContent(uri, comment + text, options);
            } catch (IOException ie) {
                content = ContentFactory.newContent(uri, f, options);
            }
        }

        return content;
    }
}
