package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction
import org.gradle.api.tasks.TaskExecutionException

class PreinstallCheckTask extends HubTask {

    @TaskAction
    void runPreinstallCheck() {
        def check = getDataHub().runPreInstallCheck()
        if (!check.isSafeToInstall()) {
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

            if (!check.serverVersionOk) {
                sb.append("- PROBLEM: Unsupported MarkLogic Server Version: " + check.serverVersion + "\n")
                  .append("      FIX: Update to a supported version of MarkLogic.\n")
            }

            if (check.stagingPortInUseBy != null) {
                sb.append("- PROBLEM: Staging Port " + hubConfig.stagingPort + " already in use by: [" + check.stagingPortInUseBy + "]\n")
                .append("      FIX: Change the [mlStagingPort] property in gradle.properties to a free port\n")
            }

            if (check.finalPortInUseBy != null) {
                sb.append("- PROBLEM: Final Port " + hubConfig.finalPort + " already in use by: [" + check.finalPortInUseBy + "]\n")
                .append("      FIX: Change the [mlFinalPort] property in gradle.properties to a free port\n")
            }

            if (check.jobPortInUseBy != null) {
                sb.append("- PROBLEM: Job Port " + hubConfig.jobPort + " already in use by: [" + check.jobPortInUseBy + "]\n")
                .append("      FIX: Change the [mlJobPort] property in gradle.properties to a free port\n")
            }

            if (check.tracePortInUseBy != null) {
                sb.append("- PROBLEM: Trace Port " + hubConfig.tracePort + " already in use by: [" + check.tracePortInUseBy + "]\n")
                .append("      FIX: Change the [mlTracePort] property in gradle.properties to a free port\n")
            }
            throw new TaskExecutionException(this, new Throwable(sb.toString()))
        }
        print(check.toString())
    }
}
