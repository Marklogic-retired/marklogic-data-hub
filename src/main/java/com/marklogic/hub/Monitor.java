/*
 * Copyright (c)2005-2009 Mark Logic Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * The use of the Apache License does not indicate that this project is
 * affiliated with the Apache Software Foundation.
 */
package com.marklogic.hub;


import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Michael Blakeley, michael.blakeley@marklogic.com
 *
 */
public class Monitor implements Runnable {

    protected static final int SLEEP_MILLIS = 500;

    static final private Logger logger = LoggerFactory.getLogger(Monitor.class);

    private CompletionService<String> cs;

    private long lastProgress = 0;

    private long startMillis;

//    private Manager manager;

    private String lastUri;

    private long taskCount;

    private ThreadPoolExecutor pool;

    private boolean shutdownNow = false;

    /**
     * @param _pool
     * @param _cs
     * @param _manager
     * @param _logger
     */
    public Monitor(ThreadPoolExecutor _pool,
            CompletionService<String> _cs) {
            //Manager _manager
        pool = _pool;
        cs = _cs;
//        manager = _manager;
    }

    /*
     * (non-Javadoc)
     *
     * @see java.lang.Runnable#run()
     */
    public void run() {
        startMillis = System.currentTimeMillis();

        try {
            Thread.yield();
            monitorResults();
        } catch (ExecutionException e) {
            e.printStackTrace();
            // tell the main thread to quit
//            manager.stop(e);
        } catch (InterruptedException e) {
            // reset interrupt status and exit
            Thread.interrupted();
//            logger.logException("interrupted: exiting", e);
        }
    }

    private void monitorResults() throws InterruptedException,
            ExecutionException {
        // fast-fail as soon as we see any exceptions
        logger.info("monitoring " + taskCount + " tasks");
        Future<String> future = null;
        while (!shutdownNow) {
            // try to avoid thread starvation
            Thread.yield();

            future = cs.poll(HubOptions.PROGRESS_INTERVAL_MS,
                    TimeUnit.MILLISECONDS);
            if (null != future) {
                // record result, or throw exception
                lastUri = future.get();
                logger.debug("uri: " + lastUri);
                showProgress();
            }

            if (pool.getCompletedTaskCount() == taskCount) {
                break;
            }
            if (pool.getCompletedTaskCount() > taskCount) {
                logger.warn("expected " + taskCount + " tasks, got "
                        + pool.getCompletedTaskCount());
                logger.warn("check your uri module!");
//                manager.stop();
                return;
            }
        }
        logger.info("waiting for pool to terminate");
        pool.awaitTermination(1, TimeUnit.SECONDS);
        logger.info("completed all tasks " + getProgressMessage());
    }

    private long showProgress() {
        long current = System.currentTimeMillis();
        if (current - lastProgress > HubOptions.PROGRESS_INTERVAL_MS) {
            logger.info("completed " + getProgressMessage());
            lastProgress = current;

            // check for low memory
            long freeMemory = Runtime.getRuntime().freeMemory();
            if (freeMemory < (16 * 1024 * 1024)) {
                logger.warn("free memory: "
                               + (freeMemory / (1024 * 1024))
                               + " MiB");
            }
        }
        return lastProgress;
    }

    /**
     * @param _count
     */
    public void setTaskCount(long _count) {
        taskCount = _count;
    }

    private String getProgressMessage() {
        long completed = pool.getCompletedTaskCount();
        int tps = (int) ((double) completed * (double) 1000 / (System
                .currentTimeMillis() - startMillis));
        return completed + "/" + taskCount + ", " + tps + " tps, "
                + pool.getActiveCount() + " active threads";
    }

    /**
     *
     */
    public void shutdownNow() {
        shutdownNow = true;
    }

}
