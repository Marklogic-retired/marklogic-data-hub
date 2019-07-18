## Overview

This project shows a basic setup for writing marklogic unit tests for the DHF using __*only xquery*__.

Test data is loading into the staging db and then harmonized into final. The harmonization flow is executed via REST.  

Note that this exmaple __*does not*__ use a dedicated test database. Rather the tests runs using the staging and final databases that you have configured in your gradle-*.properties file

## Trying the project out locally

### Install

To try this out locally, run the following:

    ./gradlew mlDeploy

This will deploy the datahub application and the tests

### Running the tests via web gui -

Then you can go to the following url to view the test web gui - 

    http://server_name:staging_port/test/default.xqy

e.g.

    http://localhost:9010/test/default.xqy

### Running the tests via Junit test - 

    ./gradlew clean test CHANGEME

This will generate the following
*  JUnit XML tests results at `build\test-results\test`
*  HTML test report at `build\reports\tests\test\index.html`

## Details

The main configuration / files to be aware of is as follows -

| File / configuration | Details |
| -------------        | --------|
| src/main/ml-modules/root/lib/config.xqy | global configuration file |
| src/main/ml-modules/root/lib/test-config.xqy |  configuration file for tests |
| src/main/ml-modules/root/lib/test-flows-lib.xqy | Test utility library that contains useful helper functions for running dhf flows via REST  |
| src/test/ml-modules/root/test/suites/HarmonizeEmployeeTests/employee-harmonization-tests.xqy | Example tests for Employee entity including a sample search |
| src/test/ml-modules/root/test/suites/HarmonizeEmployeeTests/suite-setup.xqy | Setup script for the tests. It will insert the sample data in the staging database |
| src/test/ml-modules/root/test/suites/HarmonizeEmployeeTests/suite-teardown.xqy | Teardown script for the tests. It will delete the data in the staging and final databases|
| src/test/ml-modules/root/test/suites/HarmonizeEmployeeTests/test-data/32920.xml | Example of how to test an harmonization flow for the Employee entity|
| src/test/ml-modules/root/test/suites/HarmonizeEmployeeTests/test-data/34324.xml | Example of how to test an harmonization flow for the Employee entity|
| plugins/entities/Employee/* | The Employee entity and harmonization job (harmonizeEmployees) configuration and code  |
| build.gradle | The basic gradle build file to make these examples work. Note how the __isDeployUnitTestFramework__ property is used in this build file |
| gradle.properties | The gradle config properties. The most important ones for this example are <br>mlTestDbName=data-hub-STAGING <br>mlTestPort=8010 <br>mlModulePaths=src/main/ml-modules,src/test/ml-modules <br>isDeployUnitTestFramework=true|


## Other useful commands / configuration


### Deploying a dedicated test instance for running your unit tests

The file gradle-test.properties contains the configuration required to setup a dedicated dhf test instance (even on your local host)

When running the gradle deployment commands, make sure you include the `-PenvironmentName=test-local` argment. E.g. -

    ./gradlew mlDeploy -PenvironmentName=test-local

And then add ```@ContextConfiguration(classes = {TestEnvDataHubTestConfig.class})``` to the ```src/test/java/org/example/RunUnitTestsTest.java``` file

And then run your tests

    ./gradlew clean test -PenvironmentName=test-local

## Points to be aware of 

* You can only load the tests by using the gradle commands (the DHF quickstart gui does not load them). Commands you can use to load the tests - :

    ```./gradlew mlReloadModules ``` 
    or 
    ```./gradlew mlLoadModules ``` 
    or 
    ```./gradlew mlDeploy ```
or 
    ```./gradlew mlReDeploy ```

* Be aware that the harmonization job in the test will not generate job and trace documents

* Using the `mlHubRunFlow` command is only intended for running harmonizing a small number of documents for testing purposes. __Do not use this for production code!__

* Removing the ```src/test/ml-modules``` path from the mlModulePaths property will mean that the tests are not loaded
