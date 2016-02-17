/*
 * Copyright 2012-2016 MarkLogic Corporation
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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.slf4j.Logger;

public class IOUtil {

    public static Thread createInputStreamSink(InputStream inputStream) {
        return IOUtil.createInputStreamSink(inputStream, null, LogLevel.DEBUG);
    }
    
    public static Thread createInputStreamSink(InputStream inputStream, Logger logger, LogLevel logLevel) {
        return new InputStreamSinkThread(inputStream, logger, logLevel);
    }
    
    public static enum LogLevel {
        WARN
        ,INFO
        ,DEBUG
        ,ERROR
    }
    
    private static class InputStreamSinkThread extends Thread {
        
        private InputStream inputStream;
        private Logger logger;
        private LogLevel logLevel;

        public InputStreamSinkThread(InputStream inputStream, Logger logger, LogLevel logLevel) {
            super("InputStreamSinkThread(" + inputStream + ")");
            
            this.inputStream = inputStream;
            this.logger = logger;
            this.logLevel = logLevel;
        }
        
        @Override
        public void run() {
            BufferedReader br = new BufferedReader(new InputStreamReader(inputStream));
            String line = null;
            try {
                while ((line = br.readLine()) != null) {
                    if (logger != null) {
                        if (logLevel == LogLevel.DEBUG) {
                            logger.debug(line);
                        }
                        else if (logLevel == LogLevel.ERROR) {
                            logger.error(line);
                        }
                        else if (logLevel == LogLevel.WARN) {
                            logger.error(line);
                        }
                        else if (logLevel == LogLevel.INFO) {
                            logger.info(line);
                        }
                    }
                }
            } catch (IOException e) {
                if (logger != null) {
                    logger.error("Error encountered while reading stream", e);
                }
            }
        }
    }
}
