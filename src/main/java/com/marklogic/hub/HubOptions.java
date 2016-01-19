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
package com.marklogic.hub;

public class HubOptions {

    public static final int SLEEP_TIME_MS = 500;
    public static final long PROGRESS_INTERVAL_MS = 60 * SLEEP_TIME_MS;

	public String CONTENT_DATABASE = "Documents";
	public String MODULES_DATABASE = "Modules";
	public String MODULES_ROOT = "/";

	public int threadCount = 1;

	public int getQueueSize() {
        return 100 * 1000;
    }
}
