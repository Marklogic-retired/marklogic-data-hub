/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.marklogic.hub.util;

import com.marklogic.client.ext.helper.LoggingObject;
import com.marklogic.client.ext.modulesloader.ModulesManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.util.Date;
import java.util.Properties;

public class HubModuleManager extends LoggingObject implements ModulesManager {
    public static final String DEFAULT_FILE_PATH = "build/ml-javaclient-util/module-timestamps.properties";

    private Properties props;
    private String propertiesFilePath;
    private long minimumFileTimestampToLoad;

    public HubModuleManager(String propertiesFilePath) {
        props = new Properties();
        this.propertiesFilePath = propertiesFilePath;
        initialize();
    }

    @Override
    public void initialize() {
        File propertiesFile = new File(propertiesFilePath);
        propertiesFile.getParentFile().mkdirs();
        if (propertiesFile.exists()) {
            FileInputStream fis = null;
            try {
                fis = new FileInputStream(propertiesFile);
                if (logger.isDebugEnabled()) {
                    logger.debug("Loading properties from: " + propertiesFile.getAbsolutePath());
                }
                props.load(fis);
            } catch (Exception e) {
                logger.warn("Unable to load properties, cause: " + e.getMessage());
            } finally {
                try {
                    fis.close();
                } catch (Exception e) {
                    logger.warn(e.getMessage());
                }
            }
        }
    }

    public void deletePropertiesFile() {
        File propertiesFile = new File(propertiesFilePath);
        if (propertiesFile.exists()) {
            propertiesFile.delete();
            props.clear();
        }
    }

    public boolean hasFileBeenModifiedSinceLastLoaded(File file) {
        if (minimumFileTimestampToLoad > 0 && file.lastModified() <= minimumFileTimestampToLoad) {
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("lastModified for file '%s' is %d, which is before the minimumFileTimestampToLoad of %d",
                    file.getAbsolutePath(), file.lastModified(), minimumFileTimestampToLoad));
            }
            return false;
        }

        String key = buildKey(file);
        return hasKeyBeenModified(key, file.lastModified());
    }

    public boolean hasKeyBeenModified(String key, long lastModified) {
        String value = props.getProperty(key);
        if (value != null) {
            long lastLoaded = Long.parseLong(value);
            return lastModified > lastLoaded;
        }
        return true;
    }

    public void saveLastLoadedTimestamp(File file, Date date) {
        String key = buildKey(file);
        saveLastLoadedTimestamp(key, date);
    }

    public void saveLastLoadedTimestamp(String key, Date date) {
        props.setProperty(key, date.getTime() + "");
        FileWriter fw = null;
        try {
            fw = new FileWriter(new File(propertiesFilePath));
            props.store(fw, "");
        } catch (Exception e) {
            logger.warn("Unable to store properties, cause: " + e.getMessage());
        } finally {
            try {
                fw.close();
            } catch (Exception e) {
                logger.warn(e.getMessage());
            }
        }
    }

    /**
     * Lower-casing avoids some annoying issues on Windows where sometimes you get "C:" at the start, and other times
     * you get "c:". This of course will be a problem if you for some reason have modules with the same names but
     * differing in some cases, but I'm not sure why anyone would do that.
     *
     * @param file - the file to build a key for
     * @return a key
     */
    protected String buildKey(File file) {
        return file.getAbsolutePath().toLowerCase();
    }

    public void setMinimumFileTimestampToLoad(long minimumFileTimestampToLoad) {
        this.minimumFileTimestampToLoad = minimumFileTimestampToLoad;
    }
}
