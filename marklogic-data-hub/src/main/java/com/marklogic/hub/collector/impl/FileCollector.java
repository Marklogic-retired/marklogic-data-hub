package com.marklogic.hub.collector.impl;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.collector.DiskQueue;
import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class FileCollector {
    private String filePath;
    private String inputFormat;
    private HubConfig hubConfig;

    public FileCollector(String filePath, String inputFormat) {
        this.filePath = filePath;
        this.inputFormat = inputFormat;
    }


    public void setHubConfig(HubConfig config) { this.hubConfig = config; }

    public HubConfig getHubConfig() {
        return hubConfig;
    }

    public DiskQueue<String> run() {
        DiskQueue<String> results;
        //Currently the map has inputFormat => file-extension. We can in future use something like Tika to detect format, then
        // it would map to application/xml etc
        Map<String, String> fileFormat = new HashMap<>();
        fileFormat.put("text", "txt");
        fileFormat.put("json", "json");
        fileFormat.put("csv", "csv");
        fileFormat.put("xml", "xml");


        try {
            results = new DiskQueue<>(10000);
            Path dirPath = Paths.get(filePath);
            if(! dirPath.isAbsolute()) {
                File file = new File(hubConfig.getProjectDir(), dirPath.toString());
                dirPath = file.toPath().toAbsolutePath();
            }

            if(!(Files.exists(dirPath)) || !(Files.isDirectory(dirPath))) {
                throw new RuntimeException("The path doesn't exist or is not a directory");
            }
            Files.find(dirPath,
                Integer.MAX_VALUE,
                (filePath, fileAttr) -> fileAttr.isRegularFile())
                .forEach(path -> {
                    File file = path.toFile();
                    if (FilenameUtils.getExtension(file.getName()).equalsIgnoreCase(fileFormat.get(inputFormat.toLowerCase()))) {
                        results.add(path.toFile().getAbsolutePath());
                    }
                    else if("binary".equalsIgnoreCase(inputFormat) && !fileFormat.values().contains(FilenameUtils.getExtension(file.getName().toLowerCase()))){
                        results.add(path.toFile().getAbsolutePath());
                    }
                });
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return results;
    }
}
