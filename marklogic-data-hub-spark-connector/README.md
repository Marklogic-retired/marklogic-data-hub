# MarkLogic Connector for Apache Spark

This project contains the software for the MarkLogic connector for Spark. Please see
[the documentation](https://docs.marklogic.com/cloudservices/aws/admin/dhs-tools.html) and 
[the tutorial](https://developer.marklogic.com/learn/spark/) for information on using the connector in 
an AWS Glue environment. The rest of this README provides instructions for building and testing the connector locally.

Note that this connector is part of the Data Hub Framework project. This is due to its dependency on a few DHF library
modules. It is possible to remove this dependency by configuring the connector to use your own endpoint modules. 
[The connector documentation](https://docs.marklogic.com/cloudservices/aws/admin/dhs-tools.html) provides information 
on the connector options for using your own endpoint modules.

## Building and testing the connector jar 

To build the connector, run:

    ../gradlew shadowJar
    
This produces an "uber" jar at build/libs/marklogic-data-hub-spark-connector-(version)-all.jar . This jar can then be 
included in a Spark environment. 

An example of such an environment is in the ./spark-test-project directory. Please see the README file in that directory
for instructions on how to test the connector jar within that project. 

## Running the connector tests 

If you are working on enhancements to this project, you'll likely want to run the automated tests for it. To do so, run:

    ../gradlew test

Note that if you would like to run the tests in an IDE like Intellij, you must first run the Gradle task 
"copyConnectorModulesFromCoreProject" so that the connector modules, which live in the ./marklogic-data-hub project, 
are available to be loaded by the tests. Running "test" will do this for you automatically. 
