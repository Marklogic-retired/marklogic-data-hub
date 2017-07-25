_The MarkLogic Data Hub Framework is a data integration framework and tool-set to quickly and efficiently integrate data from many sources into a single MarkLogic database, and expose that data._

_The Data Hub Framework is free and open source under the [Apache 2 License](https://github.com/marklogic-community/marklogic-data-hub/blob/1.0-master/LICENSE) and is supported by the community of developers who build and contribute to it. Please note that this open source project and its code and functionality is not representative of MarkLogic Server and is not supported by MarkLogic._

| OS | Status |
| --- | --- |
| Linux/Mac | [![Build Status](https://travis-ci.org/marklogic-community/marklogic-data-hub.svg?branch=1.0-master)](https://travis-ci.org/marklogic-community/marklogic-data-hub) |
| Windows | [![Windows Build status](https://ci.appveyor.com/api/projects/status/kgj0k5na59uhkvbv/branch/1.0-master?svg=true)](https://ci.appveyor.com/project/paxtonhare/marklogic-data-hub) |

# MarkLogic Data Hub

Go from nothing to Operational Data Hub in a matter of minutes.  

This project allows you to deploy a skeleton Data Hub into MarkLogic. With some basic configuration you will be running an Operational Data Hub in no time.

# Getting Started

### Prerequisites

You need these to get started

- Java 8 JDK
- MarkLogic 8.0-2 or greater
- Gradle 3.1 or greater **(Optional)**

### TL;DR

Head over to our [Getting Started Tutorial](https://marklogic.github.io/marklogic-data-hub/) to get up and running with the Data Hub.

Or watch the [MarkLogic University - Data Hub Framework On Demand Video Courses](http://mlu.marklogic.com/ondemand/index.xqy?q=Series%3A%22Operational%20Data%20Hubs%22)

### The Easiest Way

To use the Data Hub Framework you should download the quickstart.war file from the [releases page](https://github.com/marklogic-community/marklogic-data-hub/releases).

Then Run the war like so:

```bash
java -jar quickstart.war
```

### Using the Hub in your existing Java project

Alternatively you can include the jar file as a build dependency in your Java project. Make sure you reference the latest version.

**Gradle**

```groovy
compile('com.marklogic:marklogic-data-hub:1.1.4')
```

**Maven**

```xml
<dependency>
  <groupId>com.marklogic</groupId>
  <artifactId>marklogic-data-hub</artifactId>
  <version>1.1.4</version>
  <type>pom</type>
</dependency>
```

**Ivy**

```xml
<dependency org='com.marklogic' name='marklogic-data-hub' rev='1.1.4'>
  <artifact name='$AID' ext='pom'></artifact>
</dependency>
```

### Command Line Ninjas

If you prefer to use gradle for all of your hub interactions then you can include the ml-data-hub gradle plugin in your build.gradle file:

```groovy
plugins {
    id 'com.marklogic.ml-data-hub' version '1.1.4'
}
```

Now you have full access to the Data Hub tasks. To see all available tasks run:

```bash
./gradlew tasks
```

# Building From Source

Feeling intrepid? Want to contrubute to the Data Hub Framework? Perhaps you just want to poke the code?

Look at our [CONTRIBUTING.md](https://github.com/marklogic-community/marklogic-data-hub/blob/1.0-master/CONTRIBUTING.md#building-the-framework-from-source) file for details on building from source.
