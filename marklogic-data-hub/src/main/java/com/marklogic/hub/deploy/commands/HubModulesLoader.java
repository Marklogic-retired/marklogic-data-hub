package com.marklogic.hub.deploy.commands;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.admin.ExtensionMetadata;
import com.marklogic.client.admin.ResourceExtensionsManager;
import com.marklogic.client.admin.TransformExtensionsManager;
import com.marklogic.client.ext.helper.FilenameUtil;
import com.marklogic.client.ext.modulesloader.*;
import com.marklogic.client.ext.modulesloader.impl.AssetFileLoader;
import com.marklogic.client.ext.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.ext.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.io.StringHandle;
import org.springframework.core.io.Resource;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.Set;

public class HubModulesLoader extends DefaultModulesLoader implements ModulesLoader {
    private DatabaseClient client;
    private ModulesManager modulesManager;

    /**
     * Use this when you need to load REST modules and asset modules as well (non-REST modules).
     *
     * @param assetFileLoader
     */
    public HubModulesLoader(AssetFileLoader assetFileLoader) {
        super(assetFileLoader);
        init();
    }

    public HubModulesLoader() {
        super();
        init();
    }

    public void init() {
        this.modulesManager = new PropertiesModuleManager();
    }


    /**
     * Load modules from the given base directory, selecting modules via the given ModulesFinder, and loading them via
     * the given DatabaseClient. Note that asset modules will not be loaded by the DatabaseClient that's passed in here,
     * because the /v1/ext endpoint is too slow when there are e.g. hundreds of modules or more - asset modules are
     * instead loaded via AssetFileLoader.
     */
    @Override
    public Set<Resource> loadModules(DatabaseClient client, ModulesFinder modulesFinder, String... paths) {
        this.client = client;
        return super.loadModules(client, modulesFinder, paths);
    }
    /**
     * @param r
     * @param metadata
     * @param methodParams
     * @return
     */
    public Resource installService(Resource r, final ExtensionMetadata metadata, final ResourceExtensionsManager.MethodParameters... methodParams) {
        if (!hasFileBeenModified(r) || ignoreResource(r)) {
            return null;
        }
        final ResourceExtensionsManager extMgr = client.newServerConfigManager().newResourceExtensionsManager();
        String resourceName = getExtensionNameFromFile(r);
        if (metadata.getTitle() == null && metadata.getTitle().startsWith("ml:")) {
            metadata.setTitle(resourceName + " resource extension");
        } else {
            // TODO Come up with better way to enable "ml:" prefix for Data Hub resource extensions in the future.
            resourceName = metadata.getTitle();
        }
        final String finalResourceName = resourceName;
        logger.info(String.format("Loading %s resource extension from file %s", finalResourceName, r.getFilename()));

        StringHandle h = new StringHandle(readAndReplaceTokens(r));
        executeTask(() -> {
            if (logger.isInfoEnabled()) {
                logger.info(format("Writing %s resource extension to MarkLogic; %s", finalResourceName, getDatabaseClientInfo(client)));
            }
            extMgr.writeServices(finalResourceName, h, metadata, methodParams);
        });

        updateTimestamp(r);
        return r;
    }

    /**
     * @param r
     * @param metadata
     * @return
     */
    public Resource installTransform(Resource r, final ExtensionMetadata metadata) {
        if (!hasFileBeenModified(r) || ignoreResource(r)) {
            return null;
        }
        final String filename = r.getFilename();
        final TransformExtensionsManager mgr = client.newServerConfigManager().newTransformExtensionsManager();
        String transformName = getExtensionNameFromFile(r);
        if (metadata.getTitle() != null && metadata.getTitle().startsWith("ml:")) {
            // TODO Come up with better way to enable "ml:" prefix for Data Hub transforms in the future.
            transformName = metadata.getTitle();
        }
        final String finalTransformName = transformName;
        logger.info(format("Loading %s transform from resource %s", transformName, filename));

        StringHandle h = new StringHandle(readAndReplaceTokens(r));
        executeTask(() -> {
            if (logger.isInfoEnabled()) {
                logger.info(format("Writing %s transform to MarkLogic; %s", finalTransformName, getDatabaseClientInfo(client)));
            }
            if (FilenameUtil.isXslFile(filename)) {
                mgr.writeXSLTransform(finalTransformName, h, metadata);
            } else if (FilenameUtil.isJavascriptFile(filename)) {
                mgr.writeJavascriptTransform(finalTransformName, h, metadata);
            } else {
                mgr.writeXQueryTransform(finalTransformName, h, metadata);
            }
        });
        updateTimestamp(r);

        return r;
    }

    private boolean hasFileBeenModified(Resource resource) {
        boolean modified = true;
        if (modulesManager != null) {
            try {
                File file = resource.getFile();
                modified = modulesManager.hasFileBeenModifiedSinceLastLoaded(file);
            } catch (IOException e) {
            }
        }
        return modified;
    }

    private void updateTimestamp(Resource resource) {
        if (modulesManager != null) {
            try {
                File file = resource.getFile();
                modulesManager.saveLastLoadedTimestamp(file, new Date());
            } catch (IOException e) {
            }
        }
    }
}
