package com.marklogic.hub.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.StopWatch;

public class PerformanceLogger {

    private final static Logger LOGGER = LoggerFactory.getLogger(PerformanceLogger.class);
    
    public static StopWatch monitorTimeInsideMethod() {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        return stopWatch;
    }
    
    public static void logTimeInsideMethod(StopWatch stopWatch, String className, String methodName, Object... args) {
        stopWatch.stop();
        StringBuilder logMessage = new StringBuilder();
        logMessage.append(className);
        logMessage.append(".");
        logMessage.append(methodName);
        logMessage.append("(");
        // append args
        if(args!=null) {
            for (int i = 0; i < args.length; i++) {
                logMessage.append(args[i]).append(",");
            }
            if (args.length > 0) {
                logMessage.deleteCharAt(logMessage.length() - 1);
            }
        }
        logMessage.append(")");
        logMessage.append(" took ");
        logMessage.append(stopWatch.getTotalTimeMillis());
        logMessage.append(" ms");
        LOGGER.info(logMessage.toString());
    }
}
