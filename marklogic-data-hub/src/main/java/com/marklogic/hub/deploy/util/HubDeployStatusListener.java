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
package com.marklogic.hub.deploy.util;

public interface HubDeployStatusListener {
    /**
     * Sets the status change with a message
     * @param percentComplete - percentage (out of 100) completed in integer
     * @param message - the string message to be passed with this threshold
     */
    void onStatusChange(int percentComplete, String message);

    /**
     * Method to execute when the listener throws an error
     */
    void onError();
}
