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
