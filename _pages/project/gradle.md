---
layout: inner
title: Create a DHF Project Using the DHF Gradle Plugin
permalink: /project/gradle/
---

# Create a DHF Project Using the DHF Gradle Plugin

- [Install Prerequisites](#install-prerequisites)
- [Create a DHF Project](#create-a-dhf-project)
- [Set Username and Password](#set-username-and-password)


## Install Prerequisites

- [Gradle 3.4](https://gradle.org/) or newer (see below if you have an older version)
- MarkLogic 9.0-1.1 or newer

If you already have gradle installed, you can use the following command to check the version:

<pre class="cmdline">
gradle -v
</pre>

If your version is older than 3.4, do one of the following:

- Upgrade gradle.
- Install the gradle wrapper. We strongly recommend this. Installing the gradle wrapper is simple, see below.

To install the gradle wrapper, run the following command:

<pre class="cmdline">
gradle wrapper --gradle-version 3.4
</pre>

Once the wrapper is installed, you must run gradle on your DHF project using the "gradlew" shell script on *nix or the "gradlew.bat" batch file on Windows.

{% include ostabs.html linux="./gradlew ..." windows="gradlew.bat ..." %}

{% include conrefs/conref-note-gradle-double-quotes.md %}

## Create a DHF Project
The first step in using ml-data-hub is to create your DHF project. Start by creating a project directory (henceforth referred to as $project-dir).

Next create a `build.gradle` file in that directory ($project-dir/build.gradle) that looks like the following. Adjust the version value of com.marklogic.ml-data-hub as needed to match the version of DHF you are using.

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
    id 'com.marklogic.ml-data-hub' version '{{ site.data.global.hub_version }}'
}
```

You can then initialize your DHF project.

{% include ostabs.html linux="./gradlew hubInit" windows="gradlew.bat hubInit" %}

You should see output like this:

```
##############################
# Your Data Hub Framework Project is ready.
##############################

 - Set username and password
     There are several ways to do this. The easiest is to set mlUsername and mlPassword in gradle.properties.
     For other approaches see: https://github.com/marklogic/marklogic-data-hub/wiki/Password-Management

 - To deploy your application into MarkLogic...
     gradle mlDeploy    # this will bootstrap your application
     gradle mlLoadModules        # this will load your custom plugins into MarkLogic

 - Full list of gradle tasks:
     https://github.com/marklogic/marklogic-data-hub/wiki/Gradle-Tasks

 - Curious about the project structure?
     Look here: https://github.com/marklogic/marklogic-data-hub/wiki/Project-Directory-Structure

BUILD SUCCESSFUL

Total time: 1.932 secs
```

Your DHF project has been initialized and you are ready to get down to business.

## Set Username and Password
You must set your username and password for the ml-data-hub Gradle plugin to communicate with MarkLogic. You can do so in any of the following ways:

- **In your properties file:** Open `$project-dir/gradle.properties` and supply your MarkLogic username and password.

**$project-dir/gradle.properties**
```properties
mlUsername=admin
mlPassword=admin
```

- **In your environment-specific properties file:** Open `$project-dir/gradle-$env.properties`, where `$env` is the environment you wish to setup. By default, the project has the `local` environment. Supply your MarkLogic username and password.

**$project-dir/gradle-local.properties**
```properties
mlUsername=admin
mlPassword=admin
```

- **On the command line:** If you don't want to store your username and password in files, you can supply them on the command line.

{% include ostabs.html linux="./gradlew someTask -PmlUsername=admin -PmlPassword=admin" windows="gradlew.bat someTask -PmlUsername=admin -PmlPassword=admin" %}
