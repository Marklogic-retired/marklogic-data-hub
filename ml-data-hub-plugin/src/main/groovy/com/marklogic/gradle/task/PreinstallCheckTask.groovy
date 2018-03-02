/*
 * Copyright 2012-2018 MarkLogic Corporation
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

package com.marklogic.gradle.task

import com.marklogic.hub.DataHub
import org.gradle.api.tasks.TaskAction
import org.gradle.api.tasks.TaskExecutionException

class PreinstallCheckTask extends HubTask {

    @TaskAction
    void runPreinstallCheck() {
        DataHub dh = getDataHub();
        dh.runPreInstallCheck()
        if (!dh.isSafeToInstall()) {
            StringBuilder sb = new StringBuilder();
            sb.append("\n\n" +
                "██╗  ██╗ ██████╗ ██╗   ██╗███████╗████████╗ ██████╗ ███╗   ██╗                                                                     \n" +
                "██║  ██║██╔═══██╗██║   ██║██╔════╝╚══██╔══╝██╔═══██╗████╗  ██║                                                                     \n" +
                "███████║██║   ██║██║   ██║███████╗   ██║   ██║   ██║██╔██╗ ██║                                                                     \n" +
                "██╔══██║██║   ██║██║   ██║╚════██║   ██║   ██║   ██║██║╚██╗██║                                                                     \n" +
                "██║  ██║╚██████╔╝╚██████╔╝███████║   ██║   ╚██████╔╝██║ ╚████║▄█╗                                                                  \n" +
                "╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝                                                                  \n" +
                "                                                                                                                                   \n" +
                "██╗    ██╗███████╗    ██╗  ██╗ █████╗ ██╗   ██╗███████╗     █████╗     ██████╗ ██████╗  ██████╗ ██████╗ ██╗     ███████╗███╗   ███╗\n" +
                "██║    ██║██╔════╝    ██║  ██║██╔══██╗██║   ██║██╔════╝    ██╔══██╗    ██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██║     ██╔════╝████╗ ████║\n" +
                "██║ █╗ ██║█████╗      ███████║███████║██║   ██║█████╗      ███████║    ██████╔╝██████╔╝██║   ██║██████╔╝██║     █████╗  ██╔████╔██║\n" +
                "██║███╗██║██╔══╝      ██╔══██║██╔══██║╚██╗ ██╔╝██╔══╝      ██╔══██║    ██╔═══╝ ██╔══██╗██║   ██║██╔══██╗██║     ██╔══╝  ██║╚██╔╝██║\n" +
                "╚███╔███╔╝███████╗    ██║  ██║██║  ██║ ╚████╔╝ ███████╗    ██║  ██║    ██║     ██║  ██║╚██████╔╝██████╔╝███████╗███████╗██║ ╚═╝ ██║\n" +
                " ╚══╝╚══╝ ╚══════╝    ╚═╝  ╚═╝╚═╝  ╚═╝  ╚═══╝  ╚══════╝    ╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝╚═╝     ╚═╝\n" +
                "                                                                                                                                   \n\n")
            .append("PreInstall Check: [FAILED]\n")
            .append("---------------------------------------\n")

            if (!dh.isServerVersionOk()) {
                sb.append("- PROBLEM: Unsupported MarkLogic Server Version: " + dh.getServerVersion() + "\n")
                  .append("      FIX: Update to a supported version of MarkLogic.\n")
            }

            if (dh.getStagingPortInUseBy() != null) {
                sb.append("- PROBLEM: Staging Port " + hubConfig.stagingPort + " already in use by: [" + dh.getStagingPortInUseBy() + "]\n")
                .append("      FIX: Change the [mlStagingPort] property in gradle.properties to a free port\n")
            }

            if (dh.getFinalPortInUseBy() != null) {
                sb.append("- PROBLEM: Final Port " + hubConfig.finalPort + " already in use by: [" + dh.getFinalPortInUseBy() + "]\n")
                .append("      FIX: Change the [mlFinalPort] property in gradle.properties to a free port\n")
            }

            if (dh.getJobPortInUseBy() != null) {
                sb.append("- PROBLEM: Job Port " + hubConfig.jobPort + " already in use by: [" + dh.getJobPortInUseBy() + "]\n")
                .append("      FIX: Change the [mlJobPort] property in gradle.properties to a free port\n")
            }

            if (dh.getTracePortInUseBy() != null) {
                sb.append("- PROBLEM: Trace Port " + hubConfig.tracePort + " already in use by: [" + dh.getTracePortInUseBy() + "]\n")
                .append("      FIX: Change the [mlTracePort] property in gradle.properties to a free port\n")
            }
            throw new TaskExecutionException(this, new Throwable(sb.toString()))
        }
        print(dh.toString())
    }
}
