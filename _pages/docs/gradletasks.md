---
layout: inner
title: Gradle Tasks
permalink: /docs/gradle-tasks/
---

This page provides a complete list of all of the Gradle tasks available from the ml-data-hub plugin.

1. [In General](#in-general)
1. [MarkLogic Data Hub Setup tasks](#marklogic-data-hub-setup-tasks)
1. [MarkLogic Data Hub Scaffolding tasks](#marklogic-data-hub-scaffolding-tasks)
1. [MarkLogic Data Hub Flow Management tasks](#marklogic-data-hub-flow-management-tasks)
1. [Uninstalling MarkLogic Data Hub](#uninstalling-marklogic-data-hub)

## In General
When passing parameters to Gradle tasks you must use the environment variable syntax `-PparameterName=parameterValue`.

We recommend the use of the [net.saliman.properties](https://github.com/stevesaliman/gradle-properties-plugin) Gradle plugin to manage different environments.

You can include the plugin by adding this to your `build.gradle` file:

```groovy
plugins {
    // This plugin allows you to create different environments
    // for your gradle deploy. Each environment is represented
    // by a gradle-${env}.properties file
    // See https://github.com/stevesaliman/gradle-properties-plugin
    // specify the env on the command line with:
    // gradle -PenvironmentName=x ...
    id 'net.saliman.properties' version '1.4.6'

    // this is the data hub framework gradle plugin
    // it includes ml-gradle. This plugin is what lets you
    // run DHF (Data Hub Framework) tasks from the
    // command line
    id 'com.marklogic.ml-data-hub' version '2.0.3'
}
```

You can create multiple environment scoped properties files with the naming convention: `gradle-${env}.properties` where `${env}` is the environment the file is for. So if you wanted a **qa** environment file you would create `gradle-qa.properties`. For a **production** file it would be `gradle-production.properties`. By default, the DHF uses a `gradle-local.properties` for your **local** environment.

The contents of these environment files will override any values set in the gradle.properties file.

To specify an environment at runtime you must pass the `-PenvironmentName=xxx` option to the gradle command line. To run a Gradle command against the production file you would type:

<pre class="cmdline">
gradle -PenvironmentName=production ...
</pre>

## MarkLogic Data Hub Setup tasks
These tasks are for configuring the Data Hub Framework.

### hubUpdate
Update your DHF instance from a previous version. Run this after you update your build.gradle to point to a newer ml-data-hub plugin.

Before you can run this command you will need to update your build.gradle file manually to point to the latest version of the ml-data-hub plugin.

```groovy
plugins {
    // this is the data hub framework gradle plugin
    // it includes ml-gradle. This plugin is what lets you
    // run DHF (Data Hub Framework) tasks from the
    // command line
    id 'com.marklogic.ml-data-hub' version '2.0.3'
}
```

Then run the command:
<pre class="cmdline">
gradle hubUpdate
</pre>

### hubEnableDebugging
Enable Extra Debugging within the Data Hub Framework
<pre class="cmdline">
gradle hubEnableDebugging
</pre>
---
### hubDisableDebugging
Disable Extra Debugging within the Data Hub Framework
<pre class="cmdline">
gradle hubDisableDebugging
</pre>
---
### hubEnableTracing
Enable Tracing within the Data Hub Framework
<pre class="cmdline">
gradle hubEnableTracing
</pre>
---
### hubDisableTracing
Disable Tracing within the Data Hub Framework
<pre class="cmdline">
gradle hubDisableTracing
</pre>
---
### hubInstallModules
Install the Data Hub Framework's built-in modules into MarkLogic
<pre class="cmdline">
gradle hubInstallModules
</pre>
---
### hubInfo
Print out some basic info about the Data Hub Framework config
<pre class="cmdline">
gradle hubInfo
</pre>

## MarkLogic Data Hub Scaffolding tasks
These tasks allow you to scaffold projects, entities, and flows.

### hubInit
Initialize the current directory as a Data Hub Framework project
<pre class="cmdline">
gradle hubInit
</pre>
---
### hubCreateEntity
Create a boilerplate entity
<pre class="cmdline">
gradle hubCreateEntity -PentityName=yourentityname
</pre>
#### Parameters
##### Required
- **entityName** - the entity name to create

---
### hubCreateInputFlow
Create an input flow
<pre class="cmdline">
gradle hubCreateInputFlow \
  -PentityName=yourentityname \
  -PflowName=yourflowname \
  -PdataFormat=(xml|json) \
  -PpluginFormat=(xqy|sjs)
</pre>
#### Parameters
##### Required
- **entityName** - the name of the entity that owns the flow
- **flowName** - the name of the input flow to create

##### Optional
- **dataFormat** - xml or json

##### Default Values
- **dataFormat**=json

### hubCreateHarmonizeFlow
Create a harmonize flow
<pre class="cmdline">
gradle hubCreateHarmonizeFlow \
  -PentityName=yourentityname \
  -PflowName=yourflowname \
  -PdataFormat=(xml|json) \
  -PpluginFormat=(xqy|sjs)
</pre>
#### Parameters
##### Required
- **entityName** - the name of the entity that owns the flow
- **flowName** - the name of the harmonize flow to create

##### Optional
- **dataFormat** - xml or json

##### Default Values
- **dataFormat**=json

### hubGeneratePii
Generate security configuration files for protecting entity properties designated as Personally Identifiable Information (PII). For details, see [Managing Personally Identifiable Information]({{site.baseurl}}/govern/pii).
<pre class="cmdline">
gradle hubGeneratePii
</pre>

## MarkLogic Data Hub Flow Management tasks
These tasks allow you to run and clean up after flows.

### hubRunFlow
Run a harmonize flow

<pre class="cmdline">
gradle hubRunFlow \
  -PentityName=yourentityname \
  -PflowName=yourflowname \
  -PbatchSize=100 \
  -PthreadCount=4 \
  -PsourceDB=data-hub-STAGING\
  -PdestDB=data-hub-FINAL \
  -PshowOptions=(true|false)
</pre>

#### Parameters
##### Required
- **entityName** - the name of the entity containing the harmonize flow
- **flowName** - the name of the harmonize flow to run

##### Optional
- **batchSize** - the number of items to include in a batch.
- **threadCount** - the number of threads to run
- **sourceDB** - the name of the database to run against
- **destDB** - the name of the database to put harmonized results into
- **showOptions** - whether or not to print out options that were passed in to the command

##### Default Values
- batchSize=100
- threadCount=4
- sourceDB=the name of your staging db
- destDB=the name of your final db
- showOptions=false

#### Passing Extra Options
You can also pass arbitrary key=value parameters to your flows. These key=value pairs will be available in the $options (xqy) or options (sjs) passed to your flows.

Simply prefix your keys with **dhf**:
<pre class="cmdline">
gradle hubRunFlow \
  -PentityName=yourentityname \
  -PflowName=yourflowname \
  -Pdhf.myKey=myValue \
  -Pdhf.myOtherKey=myOtherValue
</pre>

then you will get something like this in your options:
```json
  {
    "myKey": "myValue",
    "myOtherKey": "myOtherValue"
  }
```

### hubDeleteJobs
Delete job records and the traces that go with them. Does not affect the content of the staging or final databases.

<pre class="cmdline">
gradle hubDeleteJobs \
  -PjobIds=list-of-ids
</pre>

#### Parameters
##### Required
- **jobIds** - a comma-separated list of job IDs to delete

### hubExportJobs
Export job records and the traces that go with them. Does not affect the content of the staging or final databases.

<pre class="cmdline">
gradle hubExportJobs \
  -PjobIds=list-of-ids \
  -Pfilename=export.zip
</pre>

#### Parameters
##### Optional
- **jobIds** - a comma-separated list of job IDs to export. Any traces
  associated with those jobs will be exported.
- **filename** - name of the zip file to be generated, including extension
  (default: "jobexport.zip")

## Uninstalling MarkLogic Data Hub

### mlUndeploy
Removes all components of your data hub on MarkLogic, including databases, application servers, forests, and users.

<pre class="cmdline">
./gradlew mlUndeploy \
  -Pconfirm=true 
</pre>

