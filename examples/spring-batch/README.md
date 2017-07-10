# Spring Batch Job using the Data Hub

This example demonstrates how to run a custom Spring Batch job against the Data Hub Framework.

Learning [Spring Batch](http://docs.spring.io/spring-batch/reference/html/spring-batch-intro.html) is beyond the scope of this README. But let's pretend you know enough to be dangerous.

Now you want to use Spring Batch to load a bunch of data into MarkLogic. Maybe that data is coming from a message queue. Maybe it's a bunch of files in a folder. It can be anything really. 

## What's the Big Idea?
The idea is pretty simple. You read the data, do a little processing (maybe), and then write it into MarkLogic. But to properly integrate with the Data Hub Framework you will want to run your data through an [input flow](https://github.com/marklogic-community/marklogic-data-hub/wiki/The-MarkLogic-Data-Hub-Overview#ingest).

## How does it work?
This example includes a sample Spring Boot Configuration [LoadAndRunFlow.java](https://github.com/marklogic-community/marklogic-data-hub/blob/develop/examples/spring-batch/src/main/java/example/LoadAndRunFlow.java) that configures a job to ingest some xml files and run a flow.

This example depends on a runtime class **com.marklogic.spring.batch.hub.HubJobRunner** that is responsible for reading command line parameters and connects to the Data Hub by reading your gradle project files.

## How do I Run this Example?

First you compile it.

`gradle installDist`

Then you launch it.

`./run.sh`


## How do I add this to my existing Data Hub Project?

This is an example where the Data Hub Project artifacts have already been initialized. If you are wanting to add this ability to existing Data Hub Projects then you simply need to modify the build.gradle file.

```gradle
plugins {
    // existing ids...
    ...

    // add application
    id 'application'
}

dependencies {
    // existing dependencies

    // add this one:
    compile "com.marklogic:marklogic-spring-batch-core:0.6.0"
}


// add the distributions section
distributions {
    main {
        baseName = 'baseJob'
    }
}

// add the mainClassName to specify the HubJobRunner
mainClassName = "com.marklogic.spring.batch.hub.HubJobRunner"

```

Then drop in your custom Java Config class in src/main/java/.....

Next you simply Compile your code with `gradle installDist`.

Then you can run take a look at the [run.sh script](https://github.com/marklogic-community/marklogic-data-hub/blob/develop/examples/spring-batch/run.sh) to see how to run your custom config.

Note that this is not the only way to run it. It's merely the easiest. Java Ninjas can directly call the main() function of the [HubJobRunner class](https://github.com/marklogic-community/marklogic-data-hub/blob/develop/marklogic-data-hub/src/main/java/com/marklogic/spring/batch/hub/HubJobRunner.java). Or you can make your own class to start up Spring Batch by reading the HubJobRunner code and doing something similar.
