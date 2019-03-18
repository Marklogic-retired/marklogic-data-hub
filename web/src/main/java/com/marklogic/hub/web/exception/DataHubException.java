/*
 * Copyright 2012-2019 MarkLogic Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
package com.marklogic.hub.web.exception;

public class DataHubException extends RuntimeException {

	private static final long serialVersionUID = 4824858930318275798L;

	public DataHubException(String message, Throwable cause) {
		super("Error in connecting to the Data Hub API with the following message: " + message, cause);
	}

    public DataHubException(String message) {
        super("Error: " + message);
    }
}
