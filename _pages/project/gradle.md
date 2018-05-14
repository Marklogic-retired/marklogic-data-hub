---
layout: inner
title: Creating a DHF Project using the Gradle Plugin
permalink: /project/gradle/
---

### Creating a Project with the ml-data-hub Gradle Plugin
In order to get started with the ml-data-hub Gradle plugin, you will need to perform a few steps.

1. [Install Prerequisites](#install-prerequisites)
1. [Create a DHF Project](#create-a-dhf-project)
1. [Set Username and Password](#set-username-and-password)

### Install Prerequisites
You will need the following items to use the ml-data-hub Gradle plugin:
1. [Gradle 3.4](https://gradle.org/) or newer (see below if you have an older version)
1. MarkLogic 9.0-1.1 or newer

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

### Create a DHF Project
The first step in using ml-data-hub is to create your DHF project. Start by creating a project directory (henceforth referred to as $project-dir).

Next create a `build.gradle` file in that directory. $project-dir/build.gradle. It should look like this:

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
    id 'com.marklogic.ml-data-hub' version '2.0.3'
}
```

You can then initialize your DHF project.

{% include ostabs.html linux="./gradlew hubInit" windows="gradlew.bat hubInit" %}

You should see output like this:

```
############################################
# Your Data Hub Framework Project is ready.
############################################

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

### Set Username and Password
Note that in the output above, you are instructed to set your username and password in order for the ml-data-hub Gradle plugin to communicate with MarkLogic.

There are three ways of doing this.

#### In your properties file
Open `$project-dir/gradle.properties` and supply your MarkLogic username and password.

**$project-dir/gradle.properties**
```properties
mlUsername=admin
mlPassword=admin
```

#### In your environment-specific properties file
Open `$project-dir/gradle-$env.properties`, where `$env` is the environment you wish to setup. By default, the project has the `local` environment. Supply your MarkLogic username and password.

**$project-dir/gradle-local.properties**
```properties
mlUsername=admin
mlPassword=admin
```

#### On the command line
If you don't want to store your username and password in files, you can supply them on the command line.

{% include ostabs.html linux="./gradlew someTask -PmlUsername=admin -PmlPassword=admin" windows="gradlew.bat someTask -PmlUsername=admin -PmlPassword=admin" %}
