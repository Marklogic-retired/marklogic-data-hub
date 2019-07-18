# What does this example do?

This example demonstrates how to execute a simple DataHub input flow using the Spring Batch Framework.  It provides an alternative from MarkLogic Content Pump.  

Check out [Spring Batch](http://docs.spring.io/spring-batch/reference/html/spring-batch-intro.html) to learn more on the framework.

This example loads relational data from an [Invoice Database](./invoices-sql-diagram.jpg), transforms each row into an XML document and loads each XML document into the input flow of a MarkLogic Data Hub. 

## How do I run this example?

1. [Deploy the MarkLogic Job Repository](https://github.com/marklogic-community/marklogic-spring-batch/wiki/SetupMarkLogicJobRepository). When the application starts it needs to persist the job metadata into MarkLogic.  Note that this metadata is different than datahub job metadata.  
1. Start up the Data Hub Quick Start, deploy the project from the examples/dhf4/spring-batch directory.  Verify that the Customer entity and customer-flow exist.  
1. Verify the property values in src/test/resources/job.properties for your environment.  
   1. Verify the hosts for the STAGING database and mlJobRepo
   1. Verify the destination port where the data will be written - marklogic.port, this should match the data-hub-STAGING app server. 
   1. Make sure that the port specified in Step 1 for your MarkLogic JobRepository is the same as the marklogic.jobrepo.port property. 
1. Execute the job with the following gradle command. `./gradlew ingestCustomers`  This task will deploy the H2 database and kick off the input-flow job
1. Browse the data in the STAGING database in the QuickStart. 

