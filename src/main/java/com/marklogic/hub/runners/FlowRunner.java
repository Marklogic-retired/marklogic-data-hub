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
package com.marklogic.hub.runners;

import com.marklogic.client.DatabaseClient;
import com.marklogic.client.extensions.ResourceManager;
import com.marklogic.client.extensions.ResourceServices.ServiceResult;
import com.marklogic.client.extensions.ResourceServices.ServiceResultIterator;
import com.marklogic.client.io.Format;
import com.marklogic.client.io.JacksonDatabindHandle;
import com.marklogic.client.io.StringHandle;
import com.marklogic.client.util.RequestParameters;
import com.marklogic.hub.Flow;

public class FlowRunner extends ResourceManager {

//    static final private Logger logger = LoggerFactory.getLogger(FlowRunner.class);
    static final public String NAME = "flow";

//    private HubOptions options = new HubOptions();
//    private ThreadPoolExecutor pool = null;
//    private Monitor monitor;
//    private Thread monitorThread;
//    private ExecutorCompletionService<String> completionService;

    public FlowRunner(DatabaseClient client) {
        super();
        client.init(NAME, this);
    }

    public String runServerTransformers(Flow flow, String identifier) {
        RequestParameters params = new RequestParameters();
        params.add("id", identifier);

        JacksonDatabindHandle<Object> flowHandle = new JacksonDatabindHandle<Object>(flow);
        flowHandle.getMapper().disableDefaultTyping();
        flowHandle.setFormat(Format.JSON);
        ServiceResultIterator resultItr = this.getServices().post(params, flowHandle);

        if (resultItr == null || ! resultItr.hasNext()) {
            return null;
        }

        ServiceResult res = resultItr.next();
        return res.getContent(new StringHandle()).get();
    }

//    public void run() {
//        monitorThread = preparePool();
//
//        Collector collector = client.newCollector("");
//        CollectorOutput output = collector.run(flowName);
//
//        populateQueue(flowName, output);
//
//        while (monitorThread.isAlive()) {
//            try {
//                monitorThread.join();
//            }
//            catch (InterruptedException e) {
//                logger.error("interrupted while waiting for monitor", e);
//                // reset interrupt status and continue
//                Thread.interrupted();
//            }
//        }
//    }
//
//    public void finish(String identifier) {
//        RequestParameters params = new RequestParameters();
//        if (null != flowName) {
//            params.add("flow-name", flowName);
//        }
//        params.add("id", identifier);
//
//        this.getServices().get(params);
//    }
//
//    private Thread preparePool() {
//        RejectedExecutionHandler policy = new CallerBlocksPolicy();
//        int threads = options.threadCount;
//        // an array queue should be somewhat lighter-weight
//        BlockingQueue<Runnable> workQueue = new ArrayBlockingQueue<Runnable>(
//                options.getQueueSize());
//        pool = new ThreadPoolExecutor(threads, threads, 16,
//                TimeUnit.SECONDS, workQueue, policy);
//        pool.prestartAllCoreThreads();
//        completionService = new ExecutorCompletionService<String>(pool);
//        monitor = new Monitor(pool, completionService);
//        Thread monitorThread = new Thread(monitor);
//        return monitorThread;
//    }
//
//    private void populateQueue(String flowName, CollectorOutput output) {
//        logger.info("populating queue");
//
//        int total = -1;
//
//        // like a Pascal string, the first item will be the count
//        total = output.count;
//        logger.info("expecting total " + total);
//        if (0 == total) {
//            logger.info("nothing to process");
//            stop();
//            return;
//        }
//
//        monitor.setTaskCount(total);
//        monitorThread.start();
//
//        // this may return millions of items:
//        // try to be memory-efficient
//        long freeMemory;
//
//        int i = 0;
//        for (String item : output.items) {
//            // check pool occasionally, for fast-fail
//            if (null == pool) {
//                break;
//            }
//
//            completionService.submit(new FlowRunner(this, item));
//
//            String msg = "queued " + i + "/" + total + ": " + item;
//            if (0 == i % 50000) {
//                logger.info(msg);
//                freeMemory = Runtime.getRuntime().freeMemory();
//                if (freeMemory < (16 * 1024 * 1024)) {
//                    logger.warn("free memory: "
//                                   + (freeMemory / (1024 * 1024))
//                                   + " MiB");
//                }
//            } else {
//                logger.debug(msg);
//            }
//            if (i > total) {
//                logger.warn("expected " + total + ", got " + i);
//                logger.warn("check your uri module!");
//            }
//        }
//        logger.info("queued " + output.count + "/" + total);
//        pool.shutdown();
//
//        logger.debug("queue is populated with " + total + " tasks");
//    }
//
//    public void stop() {
//        logger.info("cleaning up");
//        if (null != pool) {
//            List<Runnable> remaining = pool.shutdownNow();
//            if (remaining.size() > 0) {
//                logger.warn("thread pool was shut down with "
//                        + remaining.size() + " pending tasks");
//            }
//            pool = null;
//        }
//        if (null != monitor) {
//            pool.shutdownNow();
//            monitor.shutdownNow();
//        }
//        if (null != monitorThread) {
//            monitorThread.interrupt();
//        }
//    }

//    private class FlowRunner implements Callable<String> {
//
//        private FlowImpl flow;
//        private String identifier;
//
//        public FlowRunner(FlowImpl flow, String identifier) {
//            this.flow = flow;
//            this.identifier = identifier;
//        }
//
//        @Override
//        public String call() throws Exception {
//            Thread.yield();
//            flow.finish(identifier);
//            return client.newTransformer().runWithFlow(flowName, identifier);
//        }
//
//    }
//
//    public class CallerBlocksPolicy implements RejectedExecutionHandler {
//
//        private BlockingQueue<Runnable> queue;
//
//        private boolean warning = false;
//
//        /*
//         * (non-Javadoc)
//         *
//         * @see
//         * java.util.concurrent.RejectedExecutionHandler#rejectedExecution(java
//         * .lang.Runnable, java.util.concurrent.ThreadPoolExecutor)
//         */
//        public void rejectedExecution(Runnable r,
//                ThreadPoolExecutor executor) {
//            if (null == queue) {
//                queue = executor.getQueue();
//            }
//            try {
//                // block until space becomes available
//                if (!warning) {
//                    logger.info("queue is full: size = " + queue.size()
//                            + " (will only appear once)");
//                    warning = true;
//                }
//                queue.put(r);
//            } catch (InterruptedException e) {
//                logger.error("rejectedExecution", e);
//                // e.printStackTrace();
//                // reset interrupt status and exit
//                Thread.interrupted();
//                // someone is trying to interrupt us
//                throw new RejectedExecutionException(e);
//            }
//        }
//    }
}
