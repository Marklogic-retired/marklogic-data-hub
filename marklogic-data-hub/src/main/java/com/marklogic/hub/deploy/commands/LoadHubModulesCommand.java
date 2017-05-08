package com.marklogic.hub.deploy.commands;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.admin.ResourceExtensionsManager.MethodParameters;
import com.marklogic.client.modulesloader.ExtensionMetadataAndParams;
import com.marklogic.client.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.modulesloader.impl.PropertiesModuleManager;
import com.marklogic.client.modulesloader.impl.XccAssetLoader;
import com.marklogic.client.modulesloader.xcc.CommaDelimitedPermissionsParser;
import com.marklogic.client.modulesloader.xcc.DefaultDocumentFormatGetter;
import com.marklogic.client.modulesloader.xcc.DocumentFormatGetter;
import com.marklogic.client.modulesloader.xcc.PermissionsParser;
import com.marklogic.hub.DataHub;
import com.marklogic.hub.HubConfig;
import com.marklogic.xcc.*;
import com.marklogic.xcc.exceptions.RequestException;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.DisposableBean;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.scheduling.concurrent.ExecutorConfigurationSupport;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

public class LoadHubModulesCommand extends AbstractCommand {
    private Integer port = 8000;
    private SecurityOptions securityOptions = null;
    private Session activeSession;

    private DefaultModulesLoader modulesLoader;
    private ThreadPoolTaskExecutor threadPoolTaskExecutor;
    private ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver(DataHub.class.getClassLoader());
    private DocumentFormatGetter documentFormatGetter = new DefaultDocumentFormatGetter();
    private PermissionsParser permissionsParser = new CommaDelimitedPermissionsParser();

    private String permissions = "rest-admin,read,rest-admin,update,rest-extension-user,execute";

    private JarExtensionMetadataProvider extensionMetadataProvider;

    private HubConfig hubConfig;

    public LoadHubModulesCommand(HubConfig hubConfig) {
        setExecuteSortOrder(SortOrderConstants.LOAD_MODULES);
        this.extensionMetadataProvider = new JarExtensionMetadataProvider();
        this.hubConfig = hubConfig;
    }

    private List<Resource> findResources(String basePath, String... paths) throws IOException {
        List<Resource> list = new ArrayList<>();
        for (String path : paths) {
            Resource[] r = resolver.getResources(basePath + path);
            list.addAll(Arrays.asList(r));
        }
        return list;
    }

    private Content prepContent(String uri, InputStream inputStream, AppConfig config) throws IOException {
        ContentCreateOptions options = new ContentCreateOptions();
        options.setFormat(documentFormatGetter.getDocumentFormat(new File(uri)));
        options.setPermissions(permissionsParser.parsePermissions(this.permissions));
        options.setCollections(new String[]{"hub-core-module"});

        if (logger.isInfoEnabled()) {
            logger.info(format("Inserting module with URI: %s", uri));
        }

        if (uri.endsWith(".xqy")) {
            String fileContents = IOUtils.toString(inputStream);
            Map<String, String> customTokens = config.getCustomTokens();
            if (customTokens != null) {
                for (String key : customTokens.keySet()) {
                    fileContents = fileContents.replace(key, customTokens.get(key));
                }
            }

            return ContentFactory.newContent(uri, fileContents, options);
        }

        return ContentFactory.newContent(uri, inputStream, options);
    }

    private void initializeActiveSession(CommandContext context) {
        AppConfig config = context.getAppConfig();
        XccAssetLoader xccAssetLoader = config.newXccAssetLoader();

        this.modulesLoader = new DefaultModulesLoader(xccAssetLoader);
        this.threadPoolTaskExecutor = new ThreadPoolTaskExecutor();
        this.threadPoolTaskExecutor.setCorePoolSize(16);

        // 10 minutes should be plenty of time to wait for REST API modules to be loaded
        this.threadPoolTaskExecutor.setAwaitTerminationSeconds(60 * 10);
        this.threadPoolTaskExecutor.setWaitForTasksToCompleteOnShutdown(true);

        this.threadPoolTaskExecutor.afterPropertiesSet();
        this.modulesLoader.setTaskExecutor(this.threadPoolTaskExecutor);

        File timestampFile = Paths.get(hubConfig.projectDir, ".tmp", "hub-modules-deploy-timestamps.properties").toFile();
        PropertiesModuleManager propsManager = new PropertiesModuleManager(timestampFile);
        propsManager.deletePropertiesFile();
        this.modulesLoader.setModulesManager(propsManager);
        this.modulesLoader.setDatabaseClient(config.newDatabaseClient());
        this.modulesLoader.setShutdownTaskExecutorAfterLoadingModules(false);
        ContentSource cs = ContentSourceFactory.newContentSource(config.getHost(), port, config.getRestAdminUsername(), config.getRestAdminPassword(), config.getModulesDatabaseName(),
                securityOptions);
        activeSession = cs.newSession();
    }

    @Override
    public void execute(CommandContext context) {
        initializeActiveSession(context);

        try {
            String rootPath = "/ml-modules/root";

            AppConfig appConfig = context.getAppConfig();
            ArrayList<String> classpaths = new ArrayList<>();
            classpaths.add("/com.marklogic.hub/**/*.x??");
            classpaths.add("/trace-ui/**/*.*");

            ArrayList<Content> content = new ArrayList<>();
            for (String classpath : classpaths) {
                List<Resource> resources = findResources("classpath*:" + rootPath, classpath);
                for (Resource r : resources) {
                    String path = r.getURL().getPath();
                    if (path.contains("!")) {
                        String[] splits = path.split("!");
                        path = splits[splits.length - 1];
                    }

                    String rootPathAbs = resolver.getResource(rootPath).getURL().getPath();
                    if (rootPathAbs.contains("!")) {
                        String[] splits = rootPathAbs.split("!");
                        rootPathAbs = splits[splits.length - 1];
                    }
                    if (path.startsWith(rootPathAbs)) {
                        path = path.substring(rootPathAbs.length());
                        if (logger.isDebugEnabled()) {
                            logger.debug("Path without root path: " + path);
                        }
                    }

                    content.add(prepContent(path, r.getInputStream(), appConfig));
                }
            }

            if (content.size() > 0) {
                activeSession.insertContent(content.toArray(new Content[0]));
            }

            logger.info("Loading Service Extensions");
            long startTime = System.nanoTime();
            List<Resource> resources = findResources("classpath*:/ml-modules/services", "/**/*.xq*");
            for (Resource r : resources) {
                ExtensionMetadataAndParams emap = extensionMetadataProvider.provideExtensionMetadataAndParams(r);
                this.modulesLoader.installService(r, emap.metadata, emap.methods.toArray(new MethodParameters[] {}));
            }

            long endTime = System.nanoTime();
            long duration = (endTime - startTime);
            logger.info("Service Extensions took: " + (duration / 1000000000) + " seconds");

            logger.info("Loading Rest Transforms");
            startTime = System.nanoTime();
            resources = findResources("classpath*:/ml-modules/transforms", "/**/*.xq*");
            for (Resource r : resources) {
                ExtensionMetadataAndParams emap = extensionMetadataProvider.provideExtensionMetadataAndParams(r);
                this.modulesLoader.installTransform(r, emap.metadata);
            }
            resources = findResources("classpath*:/ml-modules/transforms", "/**/*.sjs");
            for (Resource r : resources) {
                ExtensionMetadataAndParams emap = extensionMetadataProvider.provideExtensionMetadataAndParams(r);
                this.modulesLoader.installTransform(r, emap.metadata);
            }
            endTime = System.nanoTime();
            duration = (endTime - startTime);
            logger.info("Rest Transforms took: " + (duration / 1000000000) + " seconds");

            logger.info("Loading Trace Rest Options");
            // switch to job db to do this:
            this.modulesLoader.setDatabaseClient(hubConfig.newTraceDbClient());
            startTime = System.nanoTime();
            resources = findResources("classpath*:/ml-modules/options", "/**/traces.xml");
            for (Resource r : resources) {
                this.modulesLoader.installQueryOptions(r);
            }
            endTime = System.nanoTime();
            duration = (endTime - startTime);
            logger.info("Trace Rest Options took: " + (duration / 1000000000) + " seconds");

            logger.info("Loading Job Rest Options");
            // switch to job db to do this:
            this.modulesLoader.setDatabaseClient(hubConfig.newJobDbClient());
            startTime = System.nanoTime();
            resources = findResources("classpath*:/ml-modules/options", "/**/jobs.xml");
            for (Resource r : resources) {
                this.modulesLoader.installQueryOptions(r);
            }
            endTime = System.nanoTime();
            duration = (endTime - startTime);
            logger.info("Job Rest Options took: " + (duration / 1000000000) + " seconds");

            logger.info("Loading Default Search Options to Staging");
            // switch to job db to do this:
            this.modulesLoader.setDatabaseClient(hubConfig.newStagingClient());
            startTime = System.nanoTime();
            resources = findResources("classpath*:/ml-modules/options", "/**/default.xml");
            for (Resource r : resources) {
                this.modulesLoader.installQueryOptions(r);
            }
            endTime = System.nanoTime();
            duration = (endTime - startTime);
            logger.info("Default Search Options took: " + (duration / 1000000000) + " seconds");

            logger.info("Loading Default Search Options to Final");
            // switch to job db to do this:
            this.modulesLoader.setDatabaseClient(hubConfig.newFinalClient());
            startTime = System.nanoTime();
            resources = findResources("classpath*:/ml-modules/options", "/**/default.xml");
            for (Resource r : resources) {
                this.modulesLoader.installQueryOptions(r);
            }
            endTime = System.nanoTime();
            duration = (endTime - startTime);
            logger.info("Default Search Options took: " + (duration / 1000000000) + " seconds");

            waitForTaskExecutorToFinish();
            logger.info("Finished Loading Modules");
        }
        catch (IOException | RequestException e) {
            e.printStackTrace();
        }
    }

    protected void waitForTaskExecutorToFinish() {
        if (this.threadPoolTaskExecutor instanceof ExecutorConfigurationSupport) {
            this.threadPoolTaskExecutor.shutdown();
        } else if (this.threadPoolTaskExecutor instanceof DisposableBean) {
            try {
                this.threadPoolTaskExecutor.destroy();
            } catch (Exception ex) {
                logger.warn("Unexpected exception while calling destroy() on taskExecutor: " + ex.getMessage(), ex);
            }
        }
    }
}
