package com.marklogic.hub.commands;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.jdom2.Element;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.XMLOutputter;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import com.marklogic.client.admin.ExtensionMetadata;
import com.marklogic.client.admin.ExtensionMetadata.ScriptLanguage;
import com.marklogic.client.admin.MethodType;
import com.marklogic.client.admin.ResourceExtensionsManager.MethodParameters;
import com.marklogic.client.helper.FilenameUtil;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.client.modulesloader.ExtensionMetadataAndParams;

public class JarExtensionMetadataProvider extends LoggingObject {

    private ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

    public ExtensionMetadataAndParams provideExtensionMetadataAndParams(Resource r) throws IOException {
        String filename = getFilenameMinusExtension(r);
        String metadataPath = r.getURL().toString().replace(r.getFilename(), "");
        String metadataFile = metadataPath + "metadata/" + filename + ".xml";

        ExtensionMetadata m = new ExtensionMetadata();
        List<MethodParameters> paramList = new ArrayList<>();

        if (FilenameUtil.isJavascriptFile(r.getFilename())) {
            m.setScriptLanguage(ScriptLanguage.JAVASCRIPT);
            m.setVersion("1.0");
        }

        Resource metadataResource = resolver.getResource(metadataFile);
        if (metadataResource != null) {
            try {
                Element root = new SAXBuilder().build(metadataResource.getInputStream()).getRootElement();
                m.setTitle(root.getChildText("title"));
                Element desc = root.getChild("description");
                if (desc.getChildren() != null && desc.getChildren().size() == 1) {
                    m.setDescription(new XMLOutputter().outputString(desc.getChildren().get(0)));
                } else {
                    m.setDescription(desc.getText());
                }
                for (Element method : root.getChildren("method")) {
                    MethodParameters mp = new MethodParameters(MethodType.valueOf(method.getAttributeValue("name")));
                    paramList.add(mp);
                    for (Element param : method.getChildren("param")) {
                        String name = param.getAttributeValue("name");
                        String type = "xs:string";
                        if (param.getAttribute("type") != null) {
                            type = param.getAttributeValue("type");
                        }
                        mp.add(name, type);
                    }
                }
            } catch (Exception e) {
                setDefaults(m, r);
            }
        } else {
            setDefaults(m, r);
        }

        return new ExtensionMetadataAndParams(m, paramList);
    }

    protected String getFilenameMinusExtension(Resource file) {
        // Would think there's an easier way to do this in Java...
        String[] tokens = file.getFilename().split("\\.");
        tokens = Arrays.copyOfRange(tokens, 0, tokens.length - 1);
        String filename = tokens[0];
        for (int i = 1; i < tokens.length; i++) {
            filename += "." + tokens[i];
        }
        return filename;
    }

    private void setDefaults(ExtensionMetadata metadata, Resource resourceFile) {
        metadata.setTitle(getFilenameMinusExtension(resourceFile));
    }
}
