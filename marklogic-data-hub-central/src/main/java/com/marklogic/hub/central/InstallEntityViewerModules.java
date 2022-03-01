package com.marklogic.hub.central;

import com.amazonaws.util.IOUtils;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.document.DocumentWriteOperation;
import com.marklogic.client.document.DocumentWriteSet;
import com.marklogic.client.document.GenericDocumentManager;
import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.ext.util.DefaultDocumentPermissionsParser;
import com.marklogic.client.ext.util.DocumentPermissionsParser;
import com.marklogic.client.impl.DocumentWriteOperationImpl;
import com.marklogic.client.io.DocumentMetadataHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.hub.HubClientConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;


@Component
public class InstallEntityViewerModules extends LoggingObject implements ApplicationRunner {

    @Autowired
    Environment environment;

    private HubClientConfig hubClientConfig;
    private DatabaseClient modulesClient;
    private GenericDocumentManager modulesDocMgr;
    private DocumentWriteSet modulesWriteSet;
    private String[] defaultModulesDir = {
        "explore-data/data-services/ml-exp-search/",
        "explore-data/ml-search-lib/"
    };

    private String[] configurableModulesDir = {
        "explore-data/options/",
        "explore-data/search-lib/",
        "explore-data/ui-config/"
    };

    @Override
    public void run(ApplicationArguments args) throws Exception {
        String host = environment.getProperty("mlHost");
        String username = environment.getProperty("mlUsername");
        String password = environment.getProperty("mlPassword");
        String modulesDatabase = environment.getProperty("mlContentModulesDatabase");
        int serverPort = Integer.parseInt(environment.getProperty("mlContentServerPort"));
        hubClientConfig = new HubClientConfig(host, username, password);
        loadModules(hubClientConfig, modulesDatabase, serverPort);
    }

    public void loadModules(HubClientConfig hubConfig, String dbName, int serverPort) {
        logger.info("Loading Modules");
        modulesClient = hubConfig.newDatabaseClient(dbName, serverPort);
        modulesDocMgr = modulesClient.newDocumentManager();
        modulesWriteSet = modulesDocMgr.newWriteSet();

        for(String classpathDirectory: defaultModulesDir) {
            logger.info(String.format("Adding modules from %s directory to load into %s database", classpathDirectory, dbName));
            addModulesToWriteSet(classpathDirectory, false);
        }

        for(String classpathDirectory: configurableModulesDir) {
            logger.info(String.format("Adding modules from %s directory to load into %s database", classpathDirectory, dbName));
            addModulesToWriteSet(classpathDirectory, true);
        }
        modulesDocMgr.write(modulesWriteSet);
        logger.info("Loading Modules complete");
    }

    private void addModulesToWriteSet(String classPathDirectory, boolean isConfigurableModulesDir) {
        ClassLoader cl = this.getClass().getClassLoader();
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(cl);
        try {
            Resource resources[] = resolver.getResources("classpath:".concat(classPathDirectory).concat("*.*"));
            for(Resource r: resources) {
                if(r.exists() && r.contentLength() > 0) {
                    StringHandle handle = new StringHandle(IOUtils.toString(r.getInputStream()));
                    String modulePath = "/".concat(classPathDirectory).concat(r.getFilename());
                    String uri = modulePath.startsWith("/") ? modulePath : "/".concat(modulePath);
                    if(isConfigurableModulesDir && modulesDocMgr.exists(uri) != null) {
                        logger.info(String.format("File %s already exists. Not overriding the file", uri));
                        continue;
                    }
                    logger.info(String.format("Adding module %s", uri));
                    DocumentWriteOperation op = new DocumentWriteOperationImpl(DocumentWriteOperation.OperationType.DOCUMENT_WRITE, uri, buildMetadata(), handle);
                    modulesWriteSet.add(op);
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private DocumentMetadataHandle buildMetadata() {
        String permissions = "rest-admin,read,rest-admin,update,rest-admin,execute,rest-reader,read,rest-writer,read,rest-writer,update";
        DocumentPermissionsParser documentPermissionsParser = new DefaultDocumentPermissionsParser();
        DocumentMetadataHandle meta = new DocumentMetadataHandle();
        documentPermissionsParser.parsePermissions(permissions, meta.getPermissions());
        return meta;
    }
}
