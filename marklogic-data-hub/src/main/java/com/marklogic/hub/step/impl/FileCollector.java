package com.marklogic.hub.step.impl;

import com.marklogic.client.ext.helper.LoggingObject;
import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

public class FileCollector extends LoggingObject {

    private String inputFormat;
    private Set<String> textExts = new HashSet<>(Arrays.asList("txt"));
    private Set<String> jsonExts = new HashSet<>(Arrays.asList("json"));
    private Set<String> csvExts = new HashSet<>(Arrays.asList("txt", "csv", "tsv", "psv"));
    private Set<String> xmlExts = new HashSet<>(Arrays.asList("xml", "xhtml", "html"));
    private Map<String, Set<String>> fileFormats;

    public FileCollector(String inputFormat) {
        this.inputFormat = inputFormat.toLowerCase();

        fileFormats = new HashMap<>();
        fileFormats.put("text", textExts);
        fileFormats.put("json", jsonExts);
        fileFormats.put("csv", csvExts);
        fileFormats.put("xml", xmlExts);
    }

    public Iterator<String> run(Path dirPath) {
        if (!(Files.exists(dirPath)) || !(Files.isDirectory(dirPath))) {
            throw new RuntimeException("The path doesn't exist or is not a directory: " + dirPath);
        }

        try {
            if (logger.isInfoEnabled()) {
                logger.info("Finding files in directory: " + dirPath);
            }

            try (Stream<Path> files = Files.find(dirPath,
                Integer.MAX_VALUE,
                (filePath, fileAttr) -> fileAttr.isRegularFile())) {
                return files.map(path -> {
                    File file = path.toFile();
                    if (acceptFile(file.getName())) {
                        return file.getAbsolutePath();
                    }
                    return null;
                }).filter(s -> s != null).iterator();
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
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
