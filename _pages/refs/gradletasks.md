---
layout: inner
title: Gradle Tasks in DHF
permalink: /refs/gradle-tasks/
redirect_from: "/docs/gradle-tasks/"
---

# Gradle Tasks in DHF

[Gradle](https://gradle.org/releases/) is a third-party tool that automates build tasks. MarkLogic provides a Gradle plugin ([ml-gradle](https://github.com/marklogic-community/ml-gradle/wiki)) that automates many of tasks required to manage a MarkLogic server.

The DHF Gradle Plugin (ml-data-hub) expands ml-gradle with DHF-specific tasks and uses it to deploy MarkLogic server resources (e.g., databases, users, roles, app servers). ml-gradle deploys these resources according to the configurations in the following directories:
- `hub-internal-config` (`your-project-root/src/main/hub-internal-config`)
- `ml-config` (`your-project-root/src/main/ml-config`)

This page provides a complete list of all of the Gradle tasks available in DHF Gradle Plugin (ml-data-hub).
- Tasks with names starting with `ml` are customized for DHF from the ml-gradle implementation.
- Tasks with names starting with `hub` are created specifically for DHF.

See [ml-gradle Common Tasks](
https://github.com/marklogic-community/ml-gradle/wiki/Common-tasks) or [ml-gradle Task Reference](https://github.com/marklogic-community/ml-gradle/wiki/Task-reference) for the default (non-DHF) behavior of ml-gradle tasks.


In this page:
- [Using Gradle in DHF](#using-gradle-in-dhf)
- [MarkLogic Data Hub Setup tasks](#marklogic-data-hub-setup-tasks)
- [MarkLogic Data Hub Scaffolding tasks](#marklogic-data-hub-scaffolding-tasks)
- [MarkLogic Data Hub Flow Management tasks](#marklogic-data-hub-flow-management-tasks)
- [Uninstalling Your MarkLogic Data Hub](#uninstalling-your-marklogic-data-hub)


## Using Gradle in DHF

To use DHF Gradle Plugin in the DHF flows (i.e., ingest and harmonize), see [DHF Gradle Plugin]({{site.baseurl}}/tools/gradle-plugin/).

To pass parameters to Gradle tasks, use the `-P` option.

{% include ostabs-run-gradle.html grtask="taskname ... -PparameterName=parameterValue ..." %}

### Running ml-gradle Tasks for Different Environments

You can run ml-gradle tasks for a specific environment (e.g., development, QA, production, local).

1. For each environment, create a properties file with a filename in the format `gradle-${env}.properties`, where `${env}` is the environment the file is intended for.

    **Examples:**
    - For a `development` environment, create a file called `gradle-dev.properties`.
    - For a `QA` environment, create a file called `gradle-qa.properties`.
    - For a `production` environment, create a file called `gradle-prod.properties`.

    By default, DHF uses `gradle-local.properties` for your local environment.

1. Enter the environment-specific property settings inside the appropriate properties file. The contents of these environment files will override any values set in the `gradle.properties` file.

1. To specify an environment at runtime, use the `-PenvironmentName=xxx` option.

    **Example:** To run a Gradle command against the production environment,

      {% include ostabs-run-gradle.html grtask="taskname ... -PenvironmentName=production ..." %}


## MarkLogic Data Hub Setup Tasks
These tasks are used to configure the Data Hub Framework and manage the data hub.

<dl>

<dt>mlDeploy</dt>
<dd>Uses `hubPreinstallCheck` to deploy your DHF project.
  {% include ostabs-run-gradle.html grtask="mlDeploy" %}
</dd>

<dt>mlWatch</dt>
<dd>Extends ml-gradle's WatchTask by ensuring that modules in DHF-specific folders (`plugins` and `entity-config`) are monitored.
  {% include ostabs-run-gradle.html grtask="mlWatch" %}
</dd>

<dt>mlUpdateIndexes</dt>
<dd>Updates the properties of every database without creating or updating forests. Many properties of a database are related to indexing.
  {% include ostabs-run-gradle.html grtask="mlUpdateIndexes" %}
</dd>

<!-- dt>mlClearModulesDatabase</dt>
<dd>Clears modules in the modules database, except the DHF-specific modules deployed by `hubInstallModules` from the DHF .jar file.
  {% include ostabs-run-gradle.html grtask="mlClearModulesDatabase" %}
</dd -->

<!-- dt>mlDeleteModuleTimestampsFile</dt>
<dd>Uses `hubDeleteModuleTimestampsFile` to delete both module timestamps files.
  {% include ostabs-run-gradle.html grtask="mlDeleteModuleTimestampsFile" %}
</dd -->

<dt>hubUpdate</dt>
<dd>Updates your DHF instance to a newer version.
  {% include ostabs-run-gradle-step.html grtask="hubUpdate -i" %}

  <div markdown="1">
  Before you run the `hubUpdate` task, edit the `build.gradle` file. Under `plugins`, change the value of `'com.marklogic.ml-data-hub' version` to the new DHF version.

  **Example:** If you are updating to DHF {{ site.data.global.hub_version }},
  ```
  plugins {
      id 'com.marklogic.ml-data-hub' version '{{ site.data.global.hub_version }}'
  }
  ```
  </div>

  For complete instructions to upgrade to a newer DHF version, see [Upgrading DHF]({{site.baseurl}}/upgrade/).

  {% include conrefs/conref-remark-hubupdate-verbose.md %}
</dd>

<dt>hubInfo</dt>
<dd>Prints out basic info about the DHF configuration.
  {% include ostabs-run-gradle.html grtask="hubInfo" %}
</dd>

<dt>hubEnableDebugging</dt>
<dd>Enables extra debugging features in DHF.
  {% include ostabs-run-gradle.html grtask="hubEnableDebugging" %}
</dd>

<dt>hubDisableDebugging</dt>
<dd>Disables extra debugging features in DHF.
  {% include ostabs-run-gradle.html grtask="hubDisableDebugging" %}
</dd>

<dt>hubEnableTracing</dt>
<dd>Enables tracing in DHF.
  {% include ostabs-run-gradle.html grtask="hubEnableTracing" %}
</dd>

<dt>hubDisableTracing</dt>
<dd>Disables tracing in DHF.
  {% include ostabs-run-gradle.html grtask="hubDisableTracing" %}
</dd>

<dt>hubDeployUserArtifacts</dt>
<dd>Installs user artifacts, such as entities and mappings, to the MarkLogic server. (DHF 4.2 or later)
  {% include ostabs-run-gradle.html grtask="hubDeployUserArtifacts" %}
</dd>

<!-- dt>hubDeployAmps</dt>
<dd>Deploys the amps included in the DHF .jar file.
  {% include ostabs-run-gradle.html grtask="hubDeployAmps" %}
</dd -->

<!-- dt>hubInstallModules</dt>
<dd>Installs the hub modules from the DHF .jar file to the MarkLogic server.
  {% include ostabs-run-gradle.html grtask="hubInstallModules" %}
</dd -->

<!-- dt>hubDeployUserModules</dt>
<dd>Loads the user modules from the DHF-specific folders (`plugins` and `entity-config`).
  {% include ostabs-run-gradle.html grtask="hubDeployUserModules" %}
</dd -->

<!-- dt>hubDeleteModuleTimestampsFile</dt>
<dd>Deletes the module timestamps file that DHF uses for DHF-specific module locations.
  {% include ostabs-run-gradle.html grtask="hubDeleteModuleTimestampsFile" %}
</dd -->

</dl>


## MarkLogic Data Hub Scaffolding Tasks
These tasks allow you to scaffold projects, entities, and flows.

<dt>hubInit</dt>
<dd>Initializes the current directory as a DHF project.
  {% include ostabs-run-gradle.html grtask="hubInit" %}
</dd>

<dt>hubCreateEntity</dt>
<dd>Creates a boilerplate entity.
  {% include ostabs-run-gradle.html grtask="hubCreateEntity -PentityName=yourentityname" %}
  <div markdown="1">
  | Parameter | Description |
  |---|---|
  | **entityName** | (Required) The name of the entity to create. |
  {:.table-b1gray}
  </div>
</dd>

<dt>hubCreateInputFlow</dt>
<dd>Creates an input flow.
  {% include ostabs-run-gradle.html grtask="hubCreateInputFlow -PentityName=yourentityname -PflowName=yourflowname -PdataFormat=(xml|json) -PpluginFormat=(xqy|sjs)" %}
  <div markdown="1">
  | Parameter | Description |
  |---|---|
  | **entityName** | (Required) The name of the entity that owns the flow. |
  | **flowName**   | (Required) The name of the input flow to create. |
  | **dataFormat** | `xml` or `json`. Default is `json`. |
  {:.table-b1gray}
  </div>
</dd>

<dt>hubCreateHarmonizeFlow</dt>
<dd>Creates a harmonization flow.
  {% include ostabs-run-gradle.html grtask="hubCreateHarmonizeFlow -PentityName=yourentityname -PflowName=yourflowname -PdataFormat=(xml|json) -PpluginFormat=(xqy|sjs) -PmappingName=yourmappingname" %}
  <div markdown="1">
  | Parameter | Description |
  |---|---|
  | **entityName**   | (Required) The name of the entity that owns the flow. |
  | **flowName**     | (Required) The name of the harmonize flow to create. |
  | **dataFormat**   | `xml` or `json`. Default is `json`. |
  | **pluginFormat** | `xqy` or `sjs`. The plugin programming language. |
  | **mappingName**  | The name of a model-to-model mapping to use during code generation. |
  {:.table-b1gray}
  </div>
</dd>

<dt>hubGeneratePii</dt>
<dd><span markdown="1">Generates security configuration files for protecting entity properties designated as Personally Identifiable Information (PII). For details, see [Managing Personally Identifiable Information]({{site.baseurl}}/govern/pii).</span>
  {% include ostabs-run-gradle.html grtask="hubGeneratePii" %}
</dd>


## MarkLogic Data Hub Flow Management tasks
These tasks allow you to run flows and clean up.

<dt>hubRunFlow</dt>
<dd>Runs a harmonization flow.
  {% include ostabs-run-gradle.html grtask="hubRunFlow -PentityName=yourentityname -PflowName=yourflowname -PbatchSize=100 -PthreadCount=4 -PsourceDB=data-hub-STAGING-PdestDB=data-hub-FINAL -PshowOptions=(true|false)" %}

  <div markdown="1">
  | Parameter | Description |
  |---|---|
  | **entityName**  | (Required) The name of the entity containing the harmonize flow. |
  | **flowName**    | (Required) The name of the harmonize flow to run. |
  | **batchSize**   | The number of items to include in a batch. Default is 100. |
  | **threadCount** | The number of threads to run. Default is 4. |
  | **sourceDB**    | The name of the database to run against. Default is the name of your staging database. |
  | **destDB**      | The name of the database to put harmonized results into. Default is the name of your final database. |
  | **showOptions** | Whether or not to print out options that were passed in to the command. Default is `false`. |
  {:.table-b1gray}

  You can also pass custom key-value parameters to your flows. These key-value pairs will be available in the $options (xqy) or options (sjs) passed to your flows. To pass custom key-value pairs, prefix your keys with `dhf`.
  </div>

  <span markdown="1">**Example:**</span>

  {% include ostabs-run-gradle.html grtask="hubRunFlow -PentityName=yourentityname -PflowName=yourflowname -Pdhf.myKey=myValue -Pdhf.myOtherKey=myOtherValue" %}

  <div markdown="1">
  The following options become available:
  ```json
    {
      "myKey": "myValue",
      "myOtherKey": "myOtherValue"
    }
  ```
  </div>
</dd>

<dt>hubExportJobs</dt>
<dd>Exports job records and their associated traces. This task does not affect the contents of the staging or final databases.

  {% include ostabs-run-gradle.html grtask="hubExportJobs -PjobIds=list-of-ids -Pfilename=export.zip" %}

  <div markdown="1">
  | Parameter | Description |
  |---|---|
  | **jobIds**   | A comma-separated list of job IDs to export. Any traces associated with those jobs will be exported. |
  | **filename** | The name of the zip file to generated, including the file extension. Default is `jobexport.zip`. |
  {:.table-b1gray}
  </div>
</dd>

<dt>hubDeleteJobs</dt>
<dd>Deletes job records and their associated traces. This task does not affect the contents of the staging or final databases.

  {% include ostabs-run-gradle.html grtask="hubDeleteJobs -PjobIds=list-of-ids" %}

  <div markdown="1">
  | Parameter | Description |
  |---|---|
  | **jobIds** | (Required) A comma-separated list of job IDs to delete. |
  {:.table-b1gray}
  </div>
</dd>


## Uninstalling Your MarkLogic Data Hub

<dt>mlUndeploy</dt>
<dd>Removes all components of your data hub from the MarkLogic server, including databases, application servers, forests, and users.
  {% include ostabs-run-gradle.html grtask="mlUndeploy -Pconfirm=true" %}
</dd>
