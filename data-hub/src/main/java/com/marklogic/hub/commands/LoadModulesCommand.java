package com.marklogic.hub.commands;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;

import com.marklogic.appdeployer.AppConfig;
import com.marklogic.appdeployer.command.AbstractCommand;
import com.marklogic.appdeployer.command.CommandContext;
import com.marklogic.appdeployer.command.SortOrderConstants;
import com.marklogic.client.admin.ResourceExtensionsManager.MethodParameters;
import com.marklogic.client.modulesloader.ExtensionMetadataAndParams;
import com.marklogic.client.modulesloader.impl.DefaultModulesLoader;
import com.marklogic.client.modulesloader.xcc.CommaDelimitedPermissionsParser;
import com.marklogic.client.modulesloader.xcc.PermissionsParser;
import com.marklogic.xcc.Content;
import com.marklogic.xcc.ContentCreateOptions;
import com.marklogic.xcc.ContentFactory;
import com.marklogic.xcc.ContentSource;
import com.marklogic.xcc.ContentSourceFactory;
import com.marklogic.xcc.DocumentFormat;
import com.marklogic.xcc.SecurityOptions;
import com.marklogic.xcc.Session;
import com.marklogic.xcc.exceptions.RequestException;

public class LoadModulesCommand extends AbstractCommand {
    private Integer port = 8000;
    private SecurityOptions securityOptions;
    private Session activeSession;

    private DefaultModulesLoader modulesLoader;
    private ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
    private PermissionsParser permissionsParser = new CommaDelimitedPermissionsParser();

    private String permissions = "rest-admin,read,rest-admin,update,rest-extension-user,execute";
    private String[] collections;

    private JarExtensionMetadataProvider extensionMetadataProvider;

    public LoadModulesCommand() {
        setExecuteSortOrder(SortOrderConstants.LOAD_MODULES);
        this.extensionMetadataProvider = new JarExtensionMetadataProvider();
    }

    /**
     * Public so that a client can initialize the ModulesLoader and then access it via the getter; this is useful for a
     * tool like ml-gradle, where the ModulesLoader can be reused by multiple tasks.
     *
     * @param context
     */
    public void initializeDefaultModulesLoader(CommandContext context) {
        logger.info("Initializing instance of DefaultModulesLoader");
    }

    private List<Resource> findResources(String basePath, String... paths) throws IOException {
        List<Resource> list = new ArrayList<>();
        for (String path : paths) {
            Resource[] r = resolver.getResources(basePath + path);
            list.addAll(Arrays.asList(r));
        }
        return list;
    }

    protected void loadFile(String uri, InputStream inputStream) throws IOException {
        ContentCreateOptions options = new ContentCreateOptions();
        options.setFormat(DocumentFormat.TEXT);
        options.setPermissions(permissionsParser.parsePermissions(this.permissions));
        if (this.collections != null) {
            options.setCollections(collections);
        }

        if (logger.isInfoEnabled()) {
            logger.info(format("Inserting module with URI: %s", uri));
        }

        Content content = ContentFactory.newContent(uri, inputStream, options);
        try {
            activeSession.insertContent(content);
        } catch (RequestException re) {
            throw new RuntimeException("Unable to insert content at URI: " + uri + "; cause: " + re.getMessage(), re);
        }
    }

    protected void initializeActiveSession(CommandContext context) {
        AppConfig config = context.getAppConfig();
        this.modulesLoader = new DefaultModulesLoader(context.getAppConfig().newXccAssetLoader());
        this.modulesLoader.setDatabaseClient(config.newDatabaseClient());
        ContentSource cs = ContentSourceFactory.newContentSource(config.getHost(), port, config.getRestAdminUsername(), config.getRestAdminPassword(), config.getModulesDatabaseName(),
                securityOptions);
        activeSession = cs.newSession();
    }

    @Override
    public void execute(CommandContext context) {
        initializeActiveSession(context);

        try {
            String rootPath = "/ml-modules/root";

            List<Resource> resources = findResources("classpath:" + rootPath, "/**/*.xqy");
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

                loadFile(path, r.getInputStream());
            }

            resources = findResources("classpath:/ml-modules/services", "/**/*.xq*");
            for (Resource r : resources) {
                ExtensionMetadataAndParams emap = extensionMetadataProvider.provideExtensionMetadataAndParams(r);
                this.modulesLoader.installService(r, emap.metadata, emap.methods.toArray(new MethodParameters[] {}));
            }
        }
        catch (IOException e) {
            e.printStackTrace();
        }
    }
}
