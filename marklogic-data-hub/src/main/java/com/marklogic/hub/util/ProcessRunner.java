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

import com.marklogic.hub.HubConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

public class ProcessRunner extends Thread {

    private final Logger logger = LoggerFactory.getLogger(getClass());

    private HubConfig hubConfig;
    private ArrayList<String> processOutput = new ArrayList<>();

    private List<String> args;
    private Consumer<String> consumer;

    public HubConfig getHubConfig() {
        return hubConfig;
    }

    public String getProcessOutput() {
        return String.join("\n", processOutput);
    }

    public static ProcessRunner newRunner() {
        return new ProcessRunner();
    }

    public ProcessRunner() {
        super();
    }

    public ProcessRunner withArgs(List<String> args) {
        this.args = args;
        return this;
    }

    public ProcessRunner withHubconfig(HubConfig hubConfig) {
        this.hubConfig = hubConfig;
        return this;
    }

    public ProcessRunner withStreamConsumer(Consumer<String> consumer) {
        this.consumer = consumer;
        return this;
    }

    @Override
    public void run() {
        try {
            logger.error(String.join(" ", args));
            ProcessBuilder pb = new ProcessBuilder(args);
            pb.redirectErrorStream(true);
            Process process = pb.start();

            StreamGobbler gobbler = new StreamGobbler(process.getInputStream(), status -> {
                synchronized (processOutput) {
                    processOutput.add(status);
                }
                consumer.accept(status);
            });
            gobbler.start();
            process.waitFor();
            gobbler.join();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
