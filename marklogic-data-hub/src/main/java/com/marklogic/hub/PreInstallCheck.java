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

public class PreInstallCheck {
    public boolean stagingPortInUse;
    public String stagingPortInUseBy;
    public boolean finalPortInUse;
    public String finalPortInUseBy;
    public boolean jobPortInUse;
    public String jobPortInUseBy;
    public boolean tracePortInUse;
    public String tracePortInUseBy;
    public boolean serverVersionOk;
    public String serverVersion;

    public boolean isSafeToInstall() {
        return !(stagingPortInUse ||
            finalPortInUse ||
            jobPortInUse ||
            tracePortInUse) && serverVersionOk;
    }
}
