package com.marklogic.hub.collector.impl;

import com.marklogic.hub.HubConfig;
import com.marklogic.hub.collector.DiskQueue;
import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Stream;

public class FileCollector {
    private String filePath;
    private String inputFormat;
    private HubConfig hubConfig;
    private Set<String> textExts = new HashSet<>(Arrays.asList("txt"));
    private Set<String> jsonExts = new HashSet<>(Arrays.asList("json"));
    private Set<String> csvExts = new HashSet<>(Arrays.asList("txt", "csv", "tsv", "psv"));
    private Set<String> xmlExts = new HashSet<>(Arrays.asList("xml", "xhtml", "html"));
    private Map<String, Set<String>> fileFormats;

    public FileCollector(String filePath, String inputFormat) {
        this.filePath = filePath;
        this.inputFormat = inputFormat.toLowerCase();

        fileFormats = new HashMap<>();
        fileFormats.put("text", textExts);
        fileFormats.put("json", jsonExts);
        fileFormats.put("csv", csvExts);
        fileFormats.put("xml", xmlExts);
    }

    public void setHubConfig(HubConfig config) {
        this.hubConfig = config;
    }

    public HubConfig getHubConfig() {
        return hubConfig;
    }

    public DiskQueue<String> run() {
        DiskQueue<String> results;

        try {
            results = new DiskQueue<>(10000);
            Path dirPath = Paths.get(filePath);
            if (!dirPath.isAbsolute()) {
                File file = new File(hubConfig.getProjectDir(), dirPath.toString());
                dirPath = file.toPath().toAbsolutePath();
            }

            if (!(Files.exists(dirPath)) || !(Files.isDirectory(dirPath))) {
                throw new RuntimeException("The path doesn't exist or is not a directory");
            }
            try (Stream<Path> files = Files.find(dirPath,
                Integer.MAX_VALUE,
                (filePath, fileAttr) -> fileAttr.isRegularFile())) {
                files.forEach(path -> {
                    File file = path.toFile();
                    if (acceptFile(file.getName())) {
                        results.add(file.getAbsolutePath());
                    }
                });
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return results;
    }

    protected boolean acceptFile(String filename) {
        if (filename == null) {
            return false;
        }

        final String fileExtension = FilenameUtils.getExtension(filename).toLowerCase();

        if (fileExtension.trim().length() == 0 && ("json".equals(inputFormat) || "xml".equals(inputFormat))) {
            return true;
        }

        if (fileFormats.containsKey(inputFormat) && fileFormats.get(inputFormat).contains(fileExtension)) {
            return true;
        }

        return "binary".equals(inputFormat)
            && !csvExts.contains(fileExtension)
            && !jsonExts.contains(fileExtension)
            && !xmlExts.contains(fileExtension);
    }
}
