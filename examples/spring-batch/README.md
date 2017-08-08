# Spring Batch Job using the Data Hub

This example demonstrates how to run a custom Spring Batch job against the Data Hub Framework.

Learning [Spring Batch](http://docs.spring.io/spring-batch/reference/html/spring-batch-intro.html) is beyond the scope of this README. But let's pretend you know enough to be dangerous.

This example loads data from the [Invoice Database](./invoices-sql-diagram.jpg) to use Spring Batch to load from a relational database into MarkLogic. 

## What's the Big Idea?
The idea is pretty simple. You read the data into a tabular format using a SQL query (SELECT * FROM TABLE), transform the row into an XML document, and then write it into MarkLogic. But to properly integrate with the Data Hub Framework you need to run your data through an [input flow](https://github.com/marklogic-community/marklogic-data-hub/wiki/The-MarkLogic-Data-Hub-Overview#ingest).  The MarkLogic Spring Batch project provides an interface called the DataHubItemWriter that runs the appropriate input flow.  

## How does it work?
This example includes a sample Spring Batch Configuration [SqlDbToHubJobConfig.java](https://github.com/marklogic-community/marklogic-data-hub/blob/develop/examples/spring-batch/src/main/java/com/marklogic/hub/job/SqlDbToHubJobConfig.java) that configures a job.  To execute the job, we are utilizing the CommandLineJobRunner from the MarkLogic Spring Batch project.  

This example depends on a properties file called job.properties.  This project provides a sample job.properties file but you may need to change the host or port numbers for your environment.  

## How do I Run this Example?

First [deploy the MarkLogic Job Repository](https://github.com/marklogic-community/marklogic-spring-batch/wiki/MarkLogicJobRepository).  When the Spring Batch application starts it needs to persist the job into MarkLogic.  
Once your datahub is up and running and your job.properties file is configured based on the earlier step, then just execute the job with the following gradle command. 

`gradle ingestInvoices`

This reads invoice, customer, item, and customer data from a relational database called H2.  The data can be viewed in H2 by calling the following command.

`gradle runH2`

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
    compile "com.marklogic:marklogic-spring-batch-core:1.0.1"
}

task ingestInvoices(type: JavaExec) {
    classpath = sourceSets.main.runtimeClasspath
    main = "com.marklogic.spring.batch.core.launch.support.CommandLineJobRunner"
    args = [
            "--job_path", "com.marklogic.hub.job.MigrateInvoicesConfiguration",
            "--job_id", "job",
            "--entity", "Invoice",
            "--flow", "ingest-invoice-db"
    ]
}


```

