package com.marklogic.hub.impl;

import com.marklogic.rest.util.Fragment;
import org.jdom2.Element;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.FileCopyUtils;

import java.util.List;
import java.util.stream.Stream;

/**
 * When DHF is upgraded, the ml-config/database-fields/final-database.xml must be carefully updated (if the new DHF
 * version has made changes to it) since a user may have made their own changes to it. This class has the knowledge of
 * how to do that.
 */
class FinalDatabaseXmlFileUpgrader {

    final static String ES_PATH_NAMESPACE_PATH = "/m:database-properties/m:path-namespaces/m:path-namespace" +
        "[m:prefix = 'es' and m:namespace-uri = 'http://marklogic.com/entity-services']";

    final static String SOURCE_NAME_FIELD_PATH = "/m:database-properties/m:fields/m:field[m:field-name = 'datahubSourceName']";
    final static String SOURCE_TYPE_FIELD_PATH = "/m:database-properties/m:fields/m:field[m:field-name = 'datahubSourceType']";
    final static String SOURCE_NAME_INDEX_PATH = "/m:database-properties/m:range-field-indexes/m:range-field-index[m:field-name = 'datahubSourceName']";
    final static String SOURCE_TYPE_INDEX_PATH = "/m:database-properties/m:range-field-indexes/m:range-field-index[m:field-name = 'datahubSourceType']";
    final static String OLD_ACTION_DETAILS_INDEX_PATH = "/m:database-properties/m:range-path-indexes/m:range-path-index[m:path-expression = '//actionDetails/*/uris']";
    final static String NEW_ACTION_DETAILS_INDEX_PATH = "/m:database-properties/m:range-path-indexes/m:range-path-index[m:path-expression = '/matchSummary/actionDetails/*/uris']";

    /**
     * Given the contents of an existing final-database.xml file, apply updates to it based on each version of DHF
     * since 5.2.0 that has made changes to the final.
     *
     * @param fileContents
     * @return
     */
    String updateFinalDatabaseXmlFile(String fileContents) {
        Fragment existingProps = new Fragment(fileContents);
        Fragment officialProps = readOfficialFileFromClasspath();

        apply540Changes(existingProps, officialProps);

        return existingProps.getPrettyXml();
    }

    /**
     * Applies changes to the final made in the DHF 5.4.0 release.
     *
     * @param existingProps
     * @param officialProps
     */
    private void apply540Changes(Fragment existingProps, Fragment officialProps) {
        if (elementMissing(existingProps, ES_PATH_NAMESPACE_PATH)) {
            addEsPathNamespace(existingProps, officialProps);
        }

        Stream.of(SOURCE_NAME_FIELD_PATH, SOURCE_TYPE_FIELD_PATH).forEach(path -> {
            if (elementMissing(existingProps, path)) {
                addField(existingProps, officialProps.getElements(path).get(0).detach());
            }
        });

        Stream.of(SOURCE_NAME_INDEX_PATH, SOURCE_TYPE_INDEX_PATH).forEach(path -> {
            if (elementMissing(existingProps, path)) {
                addRangeFieldIndex(existingProps, officialProps.getElements(path).get(0).detach());
            }
        });

        Element oldActionDetailsIndex = getElement(existingProps, OLD_ACTION_DETAILS_INDEX_PATH);
        if (oldActionDetailsIndex != null) {
            oldActionDetailsIndex.detach();
        }

        if (elementMissing(existingProps, NEW_ACTION_DETAILS_INDEX_PATH)) {
            addRangePathIndex(existingProps, officialProps.getElements(NEW_ACTION_DETAILS_INDEX_PATH).get(0).detach());
        }
    }

    /**
     * The DHF jar is known to include the "official" copy of the file, and thus it can be retrieved from the classpath.
     * In this context, "official" = the file associated with the version of the DHF jar being used.
     *
     * @return
     */
    private Fragment readOfficialFileFromClasspath() {
        String path = "ml-config/database-fields/final-database.xml";
        try {
            String xml = new String(FileCopyUtils.copyToByteArray(new ClassPathResource(path).getInputStream()));
            return new Fragment(xml);
        } catch (Exception ex) {
            throw new RuntimeException("Unable to read from classpath file: " + path + "; cause: " + ex.getMessage(), ex);
        }
    }

    private boolean elementMissing(Fragment props, String xpath) {
        return props.getElements(xpath).isEmpty();
    }

    private void addEsPathNamespace(Fragment props, Fragment officialProps) {
        String namespacesPath = "/m:database-properties/m:path-namespaces";
        Element pathNamespaces = getElement(props, namespacesPath);
        if (pathNamespaces == null) {
            pathNamespaces = getElement(officialProps, namespacesPath).detach();
            props.getInternalDoc().getRootElement().getChildren().add(pathNamespaces);
        } else {
            Element esPathNamespace = getElement(officialProps, ES_PATH_NAMESPACE_PATH).detach();
            pathNamespaces.getChildren().add(esPathNamespace);
        }
    }

    private void addField(Fragment props, Element field) {
        // fields is known to exist since the file was first added to the project in 5.2.0
        getElement(props, "/m:database-properties/m:fields").getChildren().add(field);
    }

    private void addRangeFieldIndex(Fragment props, Element index) {
        // range-field-indexes is known to exist since the file was first added to the project in 5.2.0
        getElement(props, "/m:database-properties/m:range-field-indexes").getChildren().add(index);
    }

    private void addRangePathIndex(Fragment props, Element index) {
        // range-path-indexes is known to exist since the file was first added to the project in 5.2.0
        getElement(props, "/m:database-properties/m:range-path-indexes").getChildren().add(index);
    }

    private Element getElement(Fragment xml, String xpath) {
        List<Element> list = xml.getElements(xpath);
        return list.size() > 0 ? list.get(0) : null;
    }
}
