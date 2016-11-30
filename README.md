<p style="font-style: italic; font-size:12px;">The MarkLogic Data Hub Framework is free and open source under the <a href="https://github.com/marklogic/marklogic-data-hub/blob/master/LICENSE">Apache 2 License</a> and is supported by the community of developers who build and contribute to it. Please note that Data Hub Framework is not a supported MarkLogic product.</p>

OS | Status
--- | --- | ---
Linux/Mac | [![Build Status](https://travis-ci.org/marklogic/marklogic-data-hub.svg?branch=2.0-develop)](https://travis-ci.org/marklogic/marklogic-data-hub)
Windows | [![Windows Build status](https://ci.appveyor.com/api/projects/status/kgj0k5na59uhkvbv?svg=true)](https://ci.appveyor.com/project/paxtonhare/marklogic-data-hub)

# MarkLogic Data Hub

## WARNING!!!! This is the the 2.0 branch of The MarkLogic Data Hub Framework. The 2.0 version is only compatible with MarkLogic 9.0 which is currently in Early Access and not generally available.

Go from nothing to Enterprise Data Hub in a matter of minutes.  

This project allows you to deploy a skeleton Data Hub into MarkLogic. With some basic configuration you will be running an Enterprise Data Hub in no time.



# Getting Started

###TL;DR

Head over to our [Getting Started Tutorial](https://marklogic.github.io/marklogic-data-hub/) to get up and running with the Data Hub.

Or watch the [MarkLogic University - Data Hub Framework On Demand Video Courses](http://mlu.marklogic.com/ondemand/index.xqy?q=Series%3A%22Operational%20Data%20Hubs%22)

###The Easiest Way

To use the Data Hub Framework you should download the quickstart.war file from the [releases page](https://github.com/marklogic/marklogic-data-hub/releases).

Then Run the war like so:

```bash
java -jar quickstart.war
```

###Using the Hub in your existing Java project

Alternatively you can include the jar file as a build dependency in your Java project. Make sure you reference the latest version.

**Gradle**

```groovy
compile('com.marklogic:marklogic-data-hub:2.0.0-alpha.1')
```

**Maven**

```xml
<dependency>
  <groupId>com.marklogic</groupId>
  <artifactId>marklogic-data-hub</artifactId>
  <version>2.0.0-alpha.1</version>
  <type>pom</type>
</dependency>
```

**Ivy**

```xml
<dependency org='com.marklogic' name='marklogic-data-hub' rev='2.0.0-alpha.1'>
  <artifact name='$AID' ext='pom'></artifact>
</dependency>
```

### Command Line Ninjas

If you prefer to use gradle for all of your hub interactions then you can include the ml-data-hub gradle plugin in your build.gradle file:

```groovy
plugins {
    id 'com.marklogic.ml-data-hub' version '2.0.0-alpha.1'
}
```

Now you have full access to the Data Hub tasks. To see all available tasks run:

```bash
gradle tasks
```

# Building From Source

Feeling intrepid? Want to contrubute to the Data Hub Framework? Perhaps you just want to poke the code?

Look at our [CONTRIBUTING.md](https://github.com/marklogic/marklogic-data-hub/blob/master/CONTRIBUTING.md#building-the-framework-from-source) file for details on building from source.
