package com.marklogic.hub.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.FileVisitResult;
import java.nio.file.FileVisitor;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.BasicFileAttributes;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import org.springframework.web.context.WebApplicationContext;

import com.google.gson.Gson;
import com.marklogic.hub.config.EnvironmentConfiguration;
import com.marklogic.hub.model.FlowType;
import com.marklogic.hub.util.GsonUtil;
import com.marklogic.hub.util.UserPluginFileInfo;
import com.marklogic.hub.util.UserPluginService;

@Service
@Scope(scopeName=WebApplicationContext.SCOPE_SESSION) 
public class SyncStatusService  implements InitializingBean {
    
    @Autowired
    private EnvironmentConfiguration environmentConfiguration;
    
    @Autowired
    private UserPluginService userPluginService;
    
    /**
     * A Map that contains the last install time of a file.
     */
    private Map<File, Date> lastInstallMap = new HashMap<>();
    
    /**
     * A map that contains the sync status of a entity.
     */
    private Map<String, Boolean> entityStatusMap = new LinkedHashMap<>();
    
    /**
     * A map that contains the sync status of a flow.
     */
    private Map<String, Map<FlowType, Map<String, Boolean>>> flowStatusMap = new HashMap<>();
    
    @Override
    public void afterPropertiesSet() throws Exception {
        loadAssetInstallTimeFile();
        refreshSyncStatus();
    }
    
    public void loadAssetInstallTimeFile() throws IOException, ParseException {
        File assetInstallTimeFile = new File(environmentConfiguration.getAssetInstallTimeFilePath());
        if (!assetInstallTimeFile.exists() || !assetInstallTimeFile.isFile()) {
            return;
        }
        
        loadAssetInstallTimeFile(assetInstallTimeFile);
    }
    /**
     * Load the contents of the Asset Install Time file.
     * 
     * @param assetInstallTimeFile
     * @throws IOException
     * @throws ParseException
     */
    public void loadAssetInstallTimeFile(File assetInstallTimeFile) throws IOException, ParseException {
        String json = FileUtils.readFileToString(assetInstallTimeFile);
        
        // parse the string as a json
        Gson gson = GsonUtil.createGson();
        @SuppressWarnings("unchecked")
        Map<String, String> jsonData = gson.fromJson(json, Map.class);
        
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
        
        Map<File, Date> installedFiles = new LinkedHashMap<>();
        for (String filePath : jsonData.keySet()) {
            Date lastInstallTime = sdf.parse(jsonData.get(filePath));
            installedFiles.put(new File(filePath), lastInstallTime);
        }
        
        setInstalledFiles(installedFiles);
    }
    
    /**
     * Refresh the sync status of all entities and flows. This method will read
     * the user plugin directory and update the sync status of all entities and
     * flows based on the last modified time of files found.
     * 
     * @throws IOException
     */
    public void refreshSyncStatus() throws IOException {
        String pluginDir = environmentConfiguration.getUserPluginDir();
        
        Files.walkFileTree(new File(pluginDir).toPath(), new PluginDirectoryVisitor());
        
        for (File file : lastInstallMap.keySet()) {
            if (!file.exists()) {
                updateSyncStatus(file);
            }
        }
    }
    
    /**
     * Update the entity/flow sync status of the entity/flow where this file
     * belongs to. This will overwrite any existing entity/flow sync status for
     * the file.
     * 
     * @param file
     * @throws IOException
     */
    public void updateSyncStatus(File file) throws IOException {
        updateSyncStatus(file, false);
    }
    
    public void updateSyncStatus(File file, boolean install) throws IOException {
        String canonicalPath = file.getCanonicalPath();
        UserPluginFileInfo fileInfo = userPluginService.getUserPluginFileInfo(canonicalPath);
        
        boolean synched = isSynched(file);
        
        if (fileInfo.getEntityName() != null) {
            boolean entitySynched = synched;
            if (!install) {
                entitySynched = entitySynched
                        && isEntitySynched(fileInfo.getEntityName());
            }
            setEntitySynched(fileInfo.getEntityName(), entitySynched);
            
            if (fileInfo.getFlowName() != null && fileInfo.getFlowType() != null) {
                boolean flowSynched = synched;
                if (!install) {
                    flowSynched = flowSynched
                            && isFlowSynched(fileInfo.getEntityName(),
                                    fileInfo.getFlowType(),
                                    fileInfo.getFlowName());
                }
                setFlowSynched(fileInfo.getEntityName(),
                        fileInfo.getFlowType(), fileInfo.getFlowName(),
                        flowSynched && synched);
            }
        }
    }
    
    public void setInstalledFiles(Map<File, Date> files) throws IOException {
        lastInstallMap.clear();
        entityStatusMap.clear();
        flowStatusMap.clear();
        
        for (File file : files.keySet()) {
            lastInstallMap.put(file, files.get(file));
            
            updateSyncStatus(file, true);
        }
    }
    
    /**
     * A file is synched if it has been previously installed, still exists and
     * the file's last modified timestamp is not past the last install time.
     * 
     * @param file
     * @return
     * @throws IOException
     */
    public boolean isSynched(File file) throws IOException {
        Date lastInstalledTime = lastInstallMap.get(file);
        
        if (lastInstalledTime == null) {
            return false;
        }
        if (!file.exists()) {
            return false;
        }
        return file.lastModified() <= lastInstalledTime.getTime();
    }
    
    public boolean isEntitySynched(String entityName) {
        Boolean synched = entityStatusMap.get(entityName);
        return synched == null ? false : synched;
    }
    
    protected void setEntitySynched(String entityName, boolean synched) {
        if (!synched) {
            System.out.println("not synched");
        }
        entityStatusMap.put(entityName, synched);
    }
    
    public boolean isFlowSynched(String entityName, FlowType flowType,
            String flowName) {
        Map<FlowType, Map<String, Boolean>> flowTypeMap = flowStatusMap
                .get(entityName);
        if (flowTypeMap == null) {
            return false;
        }
        
        Map<String, Boolean> statusMap = flowTypeMap.get(flowType);
        if (statusMap == null) {
            return false;
        }
        
        Boolean synched = statusMap.get(flowName);
        return synched == null ? false : synched;
    }
    
    protected void setFlowSynched(String entityName, FlowType flowType,
            String flowName, boolean synched) {
        if (!synched) {
            System.out.println("not synched");
        }
        
        Map<FlowType, Map<String, Boolean>> flowTypeMap = flowStatusMap
                .get(entityName);
        if (flowTypeMap == null) {
            flowTypeMap = new HashMap<>();
            flowStatusMap.put(entityName, flowTypeMap);
        }
        
        Map<String, Boolean> statusMap = flowTypeMap.get(flowType);
        if (statusMap == null) {
            statusMap = new HashMap<>();
            flowTypeMap.put(flowType, statusMap);
        }
        
        statusMap.put(flowName, synched);
    }
    
    private class PluginDirectoryVisitor implements FileVisitor<Path> {

        @Override
        public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) throws IOException {
            return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
            updateSyncStatus(file.toFile().getCanonicalFile());
            
            return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult visitFileFailed(Path file, IOException exc) throws IOException {
            return FileVisitResult.CONTINUE;
        }

        @Override
        public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
            return FileVisitResult.CONTINUE;
        }
        
    }
}
