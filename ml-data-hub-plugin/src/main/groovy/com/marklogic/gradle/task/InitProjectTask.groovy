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

package com.marklogic.gradle.task

import org.gradle.api.tasks.TaskAction

class InitProjectTask extends HubTask {

    @TaskAction
    void initProject() {
        getDataHub().initProject()

        println("\n\n############################################")
        println("# Your Data Hub Framework Project is ready.")
        println("############################################\n")
        println(" - Set username and password")
        println("     There are several ways to do this. The easiest is to set mlUsername and mlPassword in gradle.properties.")
        println("     For other approaches see: https://docs.marklogic.com/datahub/security/set-security-credentials-using-gradle.html\n")
        println(" - To deploy your application into MarkLogic...")
        println("     gradle mlDeploy\t# this will bootstrap your application")
        println("     gradle mlLoadModules\t# this will load your custom plugins into MarkLogic\n")
        println(" - Full list of gradle tasks:")
        println("     http://docs.marklogic.com/datahub/tools/gradle/gradle-tasks.html\n")
        println(" - Curious about the project structure?")
        println("     Look here: http://docs.marklogic.com/datahub/refs/project-structure.html")
    }
}
