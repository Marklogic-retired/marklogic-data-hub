---
layout: inner
title: Creating a DHF Project using the Gradle Plugin
permalink: /project/gradle/
---

## Creating a Project with the ml-data-hub Gradle Plugin
In order to get started with the **ml-data-hub** Gradle plugin you will need to perform a few steps.

1. [Install Prerequisite Software](#install-prerequisites)
1. [Create a DHF Project](#creating-your-project)
1. [Set username and password](#set-username-and-password)

## Install Prerequisites
You will need the following items to use the ml-data-hub Gradle plugin:
1. [Gradle 3.4](https://gradle.org/) or newer (if you have an older version installed we can work around that)
1. MarkLogic 8.0-7 or newer, or MarkLogic 9.0-1.1 or newer

Before we continue, let's address the Gradle version. If you have version 3.4 or newer then you are golden. Check like so:

<pre class="cmdline">
gradle -v
</pre>

If you have an older version of gradle then you can either upgrade or install the gradle wrapper. The gradle wrapper is crazy simple to install and we recommend you do that. **THIS IS ONLY NECESSARY IF YOU DON'T HAVE VERSION 3.4 OR NEWER.**

<pre class="cmdline">
gradle wrapper --gradle-version 3.4
</pre>

After running this command you will need to run gradle via the shell scripts (for *nix systems) or the batch file (for windows systems)

{% include ostabs.html linux="./gradlew ..." windows="gradlew.bat ..." %}

## Creating Your Project
The first step in using ml-data-hub is to create your DHF project. Start off by creating a project directory (henceforth referred to as $project-dir).

Now create a `build.gradle` file in that directory. $project-dir/build.gradle. It should look like this:

**$project-dir/build.gradle**
```groovy
plugins {
    // This plugin allows you to create different environments
    // for your gradle deploy. Each environment is represented
    // by a gradle-${env}.properties file
    // See https://github.com/stevesaliman/gradle-properties-plugin
    // specify the env on the command line with:
    // gradle -PenvironmentName=x ...
    id 'net.saliman.properties' version '1.4.6'

    // This gradle plugin extends the ml-gradle plugin with
    // commands that make the Data Hub Framework do its magic
    id 'com.marklogic.ml-data-hub' version '2.0.0'
}
```

We assume you straightened out your gradle version above. Let's initialize our DHF project.

{% include ostabs.html linux="./gradlew hubInit" windows="gradlew.bat hubInit" %}

You should see output like this:

```
############################################
# Your Data Hub Framework Project is ready.
############################################

 - Set username and password
     There are several ways to do this. The easiest is to set mlUsername and mlPassword in gradle.properties.
     For other approaches see: https://github.com/marklogic-community/marklogic-data-hub/wiki/Password-Management

 - To deploy your application into MarkLogic...
     gradle mlDeploy    # this will bootstrap your application
     gradle mlLodModules        # this will load your custom plugins into MarkLogic

 - Full list of gradle tasks:
     https://github.com/marklogic-community/marklogic-data-hub/wiki/Gradle-Tasks

 - Curious about the project structure?
     Look here: https://github.com/marklogic-community/marklogic-data-hub/wiki/Project-Directory-Structure

BUILD SUCCESSFUL

Total time: 1.932 secs
```

Your DHF project has been initialized and you are ready to get down to business.

## Set username and password
Note that in the output above you are instructed to set your username and password. In order for the **ml-data-hub** Gradle plugin to communicate with MarkLogic you must complete this step.

You have a few options for doing this.

### 1. Set the Username and Password in your properties file
Open `$project-dir/gradle.properties`. Supply your MarkLogic username and password.

**$project-dir/gradle.properties**
```properties
mlUsername=admin
mlPassword=admin
```

### 2. Set the Username and Password in your environment specific properties file
Open `$project-dir/gradle-$env.properties` where `$env` is the environment you wish to setup. By default the project has the `local` environment. Supply your MarkLogic username and password.

**$project-dir/gradle-local.properties**
```properties
mlUsername=admin
mlPassword=admin
```

### 3. Supply the Username and Password on the command line
If you don't want to store your username and password in files you can supply them on the command line.

{% include ostabs.html linux="./gradlew someTask -PmlUsername=admin -PmlPassword=admin" windows="gradlew.bat someTask -PmlUsername=admin -PmlPassword=admin" %}
