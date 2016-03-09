package com.marklogic.hub.util;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.util.FileCopyUtils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marklogic.client.DatabaseClient;
import com.marklogic.client.admin.ExtensionMetadata;
import com.marklogic.client.admin.NamespacesManager;
import com.marklogic.client.admin.QueryOptionsManager;
import com.marklogic.client.admin.ResourceExtensionsManager;
import com.marklogic.client.admin.ResourceExtensionsManager.MethodParameters;
import com.marklogic.client.admin.ServerConfigurationManager;
import com.marklogic.client.admin.ServerConfigurationManager.UpdatePolicy;
import com.marklogic.client.admin.TransformExtensionsManager;
import com.marklogic.client.helper.FilenameUtil;
import com.marklogic.client.helper.LoggingObject;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.InputStreamHandle;
import com.marklogic.client.modulesloader.ExtensionMetadataAndParams;
import com.marklogic.client.modulesloader.ExtensionMetadataProvider;
import com.marklogic.client.modulesloader.Modules;
import com.marklogic.client.modulesloader.ModulesFinder;
import com.marklogic.client.modulesloader.ModulesManager;
import com.marklogic.client.modulesloader.impl.DefaultExtensionMetadataProvider;
import com.marklogic.client.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.modulesloader.impl.XccAssetLoader;

/**
 * Uses the REST API for loading all modules except "assets", which are loaded via XCC for speed reasons. Note that this
 * class will not be threadsafe since XccAssetLoader is not currently threadsafe either.
 */
public class HubModulesLoader extends LoggingObject implements com.marklogic.client.modulesloader.ModulesLoader {

    private DatabaseClient client;

    private XccAssetLoader xccAssetLoader;
    private ExtensionMetadataProvider extensionMetadataProvider;
    private ModulesManager modulesManager;

    /**
     * When set to true, exceptions thrown while loading transforms and resources will be caught and logged, and the
     * module will be updated as having been loaded. This is useful when running a program like ModulesWatcher, as it
     * prevents the program from crashing and also from trying to load the module over and over.
     */
    private boolean catchExceptions = false;

    public HubModulesLoader(XccAssetLoader xccAssetLoader, PropertiesModuleManager modulesManager) {
        this.extensionMetadataProvider = new DefaultExtensionMetadataProvider();

        this.modulesManager = modulesManager;
        this.xccAssetLoader = xccAssetLoader;
    }

    public Set<File> loadModules(File baseDir, ModulesFinder modulesFinder, DatabaseClient client) {
        setDatabaseClient(client);

        if (modulesManager != null) {
            modulesManager.initialize();
        }

        Modules modules = modulesFinder.findModules(baseDir);

        Set<File> loadedModules = new HashSet<>();

        loadProperties(modules, loadedModules);
        loadNamespaces(modules, loadedModules);
        loadAssets(modules, loadedModules);
        loadQueryOptions(modules, loadedModules);
        loadTransforms(modules, loadedModules);
        loadResources(modules, loadedModules);

        return loadedModules;
    }

    /**
     * Only supports a JSON file.
     *
     * @param modules
     * @param loadedModules
     */
    protected void loadProperties(Modules modules, Set<File> loadedModules) {
        Resource r = modules.getPropertiesFile();
        if (r != null && r.exists()) {
            File f = getFileFromResource(r);
            if (modulesManager != null && !modulesManager.hasFileBeenModifiedSinceLastInstalled(f)) {
                return;
            }

            ServerConfigurationManager mgr = client.newServerConfigManager();
            ObjectMapper m = new ObjectMapper();
            try {
                JsonNode node = m.readTree(f);
                if (node.has("document-transform-all")) {
                    mgr.setDefaultDocumentReadTransformAll(node.get("document-transform-all").asBoolean());
                }
                if (node.has("document-transform-out")) {
                    mgr.setDefaultDocumentReadTransform(node.get("document-transform-out").asText());
                }
                if (node.has("update-policy")) {
                    mgr.setUpdatePolicy(UpdatePolicy.valueOf(node.get("update-policy").asText()));
                }
                if (node.has("validate-options")) {
                    mgr.setQueryValidation(node.get("validate-options").asBoolean());
                }
                if (node.has("validate-queries")) {
                    mgr.setQueryOptionValidation(node.get("validate-queries").asBoolean());
                }
                if (node.has("debug")) {
                    mgr.setServerRequestLogging(node.get("debug").asBoolean());
                }
                if (logger.isInfoEnabled()) {
                    logger.info("Writing REST server configuration");
                    logger.info("Default document read transform: " + mgr.getDefaultDocumentReadTransform());
                    logger.info("Transform all documents on read: " + mgr.getDefaultDocumentReadTransformAll());
                    logger.info("Validate query options: " + mgr.getQueryOptionValidation());
                    logger.info("Validate queries: " + mgr.getQueryValidation());
                    logger.info("Output debugging: " + mgr.getServerRequestLogging());
                    if (mgr.getUpdatePolicy() != null) {
                        logger.info("Update policy: " + mgr.getUpdatePolicy().name());
                    }
                }
                mgr.writeConfiguration();
            } catch (Exception e) {
                throw new RuntimeException("Unable to read REST configuration from file: " + f.getAbsolutePath(), e);
            }

            if (modulesManager != null) {
                modulesManager.saveLastInstalledTimestamp(f, new Date());
            }

            loadedModules.add(f);
        }
    }

    protected File getFileFromResource(Resource r) {
        try {
            return r.getFile();
        } catch (IOException ex) {
            throw new RuntimeException(ex);
        }
    }

    protected void loadAssets(Modules modules, Set<File> loadedModules) {
        List<Resource> dirs = modules.getAssetDirectories();
        if (dirs == null || dirs.isEmpty()) {
            return;
        }

        if (xccAssetLoader != null) {
            xccAssetLoader.setModulesManager(modulesManager);
        }

        String[] paths = new String[dirs.size()];
        for (int i = 0; i < dirs.size(); i++) {
            paths[i] = getFileFromResource(dirs.get(i)).getAbsolutePath();
        }
        Set<File> files = xccAssetLoader.loadAssetsViaXcc(paths);

        if (files != null) {
            loadedModules.addAll(files);
        }
    }

    protected void loadQueryOptions(Modules modules, Set<File> loadedModules) {
        if (modules.getOptions() == null) {
            return;
        }

        for (Resource r : modules.getOptions()) {
            File f = installQueryOptions(getFileFromResource(r));
            if (f != null) {
                loadedModules.add(f);
            }
        }
    }

    protected void loadTransforms(Modules modules, Set<File> loadedModules) {
        if (modules.getTransforms() == null) {
            return;
        }

        for (Resource r : modules.getTransforms()) {
            File f = getFileFromResource(r);

            try {
                ExtensionMetadataAndParams emap = extensionMetadataProvider.provideExtensionMetadataAndParams(r);
                f = installTransform(f, emap.metadata);
                if (f != null) {
                    loadedModules.add(f);
                }
            } catch (RuntimeException e) {
                if (catchExceptions) {
                    logger.warn(
                            "Unable to load module from file: " + f.getAbsolutePath() + "; cause: " + e.getMessage(),
                            e);
                    loadedModules.add(f);
                    if (modulesManager != null) {
                        modulesManager.saveLastInstalledTimestamp(f, new Date());
                    }
                } else {
                    throw e;
                }
            }
        }
    }

    protected void loadResources(Modules modules, Set<File> loadedModules) {
        if (modules.getServices() == null) {
            return;
        }

        for (Resource r : modules.getServices()) {
            File f = getFileFromResource(r);
            try {
                ExtensionMetadataAndParams emap = extensionMetadataProvider.provideExtensionMetadataAndParams(r);
                f = installService(f, emap.metadata, emap.methods.toArray(new MethodParameters[] {}));
            } catch (RuntimeException e) {
                if (catchExceptions) {
                    logger.warn(
                            "Unable to load module from file: " + f.getAbsolutePath() + "; cause: " + e.getMessage(),
                            e);
                    loadedModules.add(f);
                    if (modulesManager != null) {
                        modulesManager.saveLastInstalledTimestamp(f, new Date());
                    }
                } else {
                    throw e;
                }
            }
            if (f != null) {
                loadedModules.add(f);
            }
        }
    }

    protected void loadNamespaces(Modules modules, Set<File> loadedModules) {
        if (modules.getNamespaces() == null) {
            return;
        }

        for (Resource r : modules.getNamespaces()) {
            File f = getFileFromResource(r);
            f = installNamespace(f);
            if (f != null) {
                loadedModules.add(f);
            }
        }
    }

    public File installService(File file, ExtensionMetadata metadata, MethodParameters... methodParams) {
        if (modulesManager != null && !modulesManager.hasFileBeenModifiedSinceLastInstalled(file)) {
            return null;
        }

        installService(new FileSystemResource(file), metadata, methodParams);

        if (modulesManager != null) {
            modulesManager.saveLastInstalledTimestamp(file, new Date());
        }
        return file;
    }

    public void installService(Resource r, ExtensionMetadata metadata, MethodParameters... methodParams) {
        ResourceExtensionsManager extMgr = client.newServerConfigManager().newResourceExtensionsManager();
        String resourceName = getExtensionNameFromFile(r);
        if (metadata.getTitle() == null) {
            metadata.setTitle(resourceName + " resource extension");
        }

        logger.info(String.format("Loading %s resource extension from file %s", resourceName, r.getFilename()));
        try {
            extMgr.writeServices(resourceName, new InputStreamHandle(r.getInputStream()), metadata, methodParams);
        } catch (IOException ie) {
            throw new RuntimeException("Unable to write service: " + ie.getMessage(), ie);
        }
    }

    public File installTransform(File file, ExtensionMetadata metadata) {
        if (modulesManager != null && !modulesManager.hasFileBeenModifiedSinceLastInstalled(file)) {
            return null;
        }

        installTransform(new FileSystemResource(file), metadata);

        if (modulesManager != null) {
            modulesManager.saveLastInstalledTimestamp(file, new Date());
        }
        return file;
    }

    public void installTransform(Resource r, ExtensionMetadata metadata) {
        String filename = r.getFilename();
        TransformExtensionsManager mgr = client.newServerConfigManager().newTransformExtensionsManager();
        String transformName = getExtensionNameFromFile(r);
        logger.info(String.format("Loading %s transform from resource %s", transformName, filename));
        InputStreamHandle h = null;
        try {
            h = new InputStreamHandle(r.getInputStream());
        } catch (IOException ie) {
            throw new RuntimeException("Unable to read transform resource: " + ie.getMessage(), ie);
        }
        if (FilenameUtil.isXslFile(filename)) {
            mgr.writeXSLTransform(transformName, h, metadata);
        } else if (FilenameUtil.isJavascriptFile(filename)) {
            mgr.writeJavascriptTransform(transformName, h, metadata);
        } else {
            mgr.writeXQueryTransform(transformName, h, metadata);
        }
    }

    public File installQueryOptions(File f) {
        if (modulesManager != null && !modulesManager.hasFileBeenModifiedSinceLastInstalled(f)) {
            return null;
        }
        installQueryOptions(new FileSystemResource(f));
        if (modulesManager != null) {
            modulesManager.saveLastInstalledTimestamp(f, new Date());
        }
        return f;
    }

    public void installQueryOptions(Resource r) {
        String filename = r.getFilename();
        String name = getExtensionNameFromFile(r);
        logger.info(String.format("Loading %s query options from file %s", name, filename));
        QueryOptionsManager mgr = client.newServerConfigManager().newQueryOptionsManager();
        InputStreamHandle h = null;
        try {
            h = new InputStreamHandle(r.getInputStream());
        } catch (IOException ie) {
            throw new RuntimeException("Unable to read transform resource: " + ie.getMessage(), ie);
        }
        if (filename.endsWith(".json")) {
            mgr.writeOptions(name, h.withFormat(Format.JSON));
        } else {
            mgr.writeOptions(name, h);
        }
    }

    public File installNamespace(File f) {
        if (modulesManager != null && !modulesManager.hasFileBeenModifiedSinceLastInstalled(f)) {
            return null;
        }
        installNamespace(new FileSystemResource(f));
        if (modulesManager != null) {
            modulesManager.saveLastInstalledTimestamp(f, new Date());
        }
        return f;
    }

    public void installNamespace(Resource r) {
        String prefix = getExtensionNameFromFile(r);
        String namespaceUri = null;
        try {
            namespaceUri = new String(FileCopyUtils.copyToByteArray(r.getInputStream()));
        } catch (IOException ie) {
            logger.error("Unable to install namespace from file: " + r.getFilename(), ie);
            return;
        }
        NamespacesManager mgr = client.newServerConfigManager().newNamespacesManager();
        String existingUri = mgr.readPrefix(prefix);
        if (existingUri != null) {
            logger.info(String.format("Deleting namespace with prefix of %s and URI of %s", prefix, existingUri));
            mgr.deletePrefix(prefix);
        }
        logger.info(String.format("Adding namespace with prefix of %s and URI of %s", prefix, namespaceUri));
        mgr.addPrefix(prefix, namespaceUri);
    }

    protected String getExtensionNameFromFile(Resource r) {
        String name = r.getFilename();
        int pos = name.lastIndexOf('.');
        if (pos < 0)
            return name;
        return name.substring(0, pos);
    }

    public void setDatabaseClient(DatabaseClient client) {
        this.client = client;
    }

    public void setExtensionMetadataProvider(ExtensionMetadataProvider extensionMetadataProvider) {
        this.extensionMetadataProvider = extensionMetadataProvider;
    }

    public void setModulesManager(ModulesManager configurationFilesManager) {
        this.modulesManager = configurationFilesManager;
    }

    public boolean isCatchExceptions() {
        return catchExceptions;
    }

    public void setCatchExceptions(boolean catchExceptions) {
        this.catchExceptions = catchExceptions;
    }

    public void setXccAssetLoader(XccAssetLoader xccAssetLoader) {
        this.xccAssetLoader = xccAssetLoader;
    }

    public XccAssetLoader getXccAssetLoader() {
        return xccAssetLoader;
    }

    public ExtensionMetadataProvider getExtensionMetadataProvider() {
        return extensionMetadataProvider;
    }

    public ModulesManager getModulesManager() {
        return modulesManager;
    }
}
