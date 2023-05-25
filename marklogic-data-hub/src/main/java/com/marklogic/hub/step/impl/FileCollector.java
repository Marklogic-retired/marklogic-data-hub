package com.marklogic.hub.step.impl;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.hub.util.DiskQueue;
import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

public class FileCollector extends LoggingObject {

    private final String inputFormat;
    private final Set<String> textExts = new HashSet<>(Collections.singletonList("txt"));
    private final Set<String> jsonExts = new HashSet<>(Collections.singletonList("json"));
    private final Set<String> csvExts = new HashSet<>(Arrays.asList("txt", "csv", "tsv", "psv"));
    private final Set<String> xmlExts = new HashSet<>(Arrays.asList("xml", "xhtml", "html"));
    private final Map<String, Set<String>> fileFormats;

    public FileCollector(String inputFormat) {
        this.inputFormat = inputFormat.toLowerCase();

        fileFormats = new HashMap<>();
        fileFormats.put("text", textExts);
        fileFormats.put("json", jsonExts);
        fileFormats.put("csv", csvExts);
        fileFormats.put("xml", xmlExts);
    }

    public DiskQueue<String> run(Path dirPath) {
        if (!(Files.exists(dirPath)) || !(Files.isDirectory(dirPath))) {
            throw new RuntimeException("The path doesn't exist or is not a directory: " + dirPath);
        }

        DiskQueue<String> results;
        try {
            results = new DiskQueue<>();

            if (logger.isInfoEnabled()) {
                logger.info("Finding files in directory: " + dirPath);
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

        if (fileExtension.trim().isEmpty() && ("json".equals(inputFormat) || "xml".equals(inputFormat))) {
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
