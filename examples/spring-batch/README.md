# Spring Batch Job using the Data Hub

This example demonstrates how to run a custom Spring Batch job against the Data Hub Framework.

This is based on the [base job from MarkLogic Spring batch](https://github.com/sastafford/marklogic-spring-batch/tree/master/examples/base). The base job is intended to be a starter template for writing any MarkLogic Spring Batch job.  Just copy and paste this directory into your workspace and modify the classes to your specific batch processing use case.  

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

# How to Run

gradle installDist

./run.sh

