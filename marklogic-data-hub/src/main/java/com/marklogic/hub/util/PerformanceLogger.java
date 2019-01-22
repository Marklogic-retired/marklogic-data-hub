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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PerformanceLogger {

    private final static Logger LOGGER = LoggerFactory.getLogger(PerformanceLogger.class);

    public static long monitorTimeInsideMethod() {
        return System.nanoTime();
    }

    public static void logTimeInsideMethod(long startTime, String location) {
        long endTime = System.nanoTime();
        double duration = ((double)endTime - (double)startTime) / 1000000000.0;

        StringBuilder logMessage = new StringBuilder();
        logMessage.append("PERFORMANCE: ");
        logMessage.append(location);
        logMessage.append(" took ");
        logMessage.append(duration);
        logMessage.append("s");
        LOGGER.info(logMessage.toString());
    }
}
