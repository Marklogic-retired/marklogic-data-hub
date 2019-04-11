## Overview

This project shows a basic setup for writing marklogic unit tests for the DHF using __*only xquery*__.

This includes the insertion of the data into the database as well as running harmonization jobs (and testing the output). E.g.
```javascript
  CHANGEME
    const dtu = require('/test/lib/dhfTestUtils.sjs');

    const results = dtu.mlHubRunFlow("Employee","sampleHarmonize",{"entity":"Employee"})

    let testResults =  [
        test.assertEqual(2, results.totalCount),
        test.assertEqual(0, results.errorCount)
    ]
```

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

    http://localhost:8010/test/default.xqy

### Running the tests via Junit test - 

    ./gradlew clean test CHANGEME

This will generate the following
*  JUnit XML tests results at `build\test-results\test`
*  HTML test report at `build\reports\tests\test\index.html`

## Details

The main configuration / files to be aware of is as follows -

| File / configuration | Details |
| -------------        | --------|
| src/test/ml-modules/root/test/lib/dhfTestUtils.sjs | Test utility library that contains useful helper functions for running dhf tests - e.g. `mlHubRunFlow` |
| src/test/ml-modules/root/test/suites/EmployeeTest/setup.sjs | Setup script for the tests. It will insert the sample data in the staging database|
| src/test/ml-modules/root/test/suites/EmployeeTest/teardown.sjs | Teardown script for the tests. It will delete the data in the staging and final databases|
| src/test/ml-modules/root/test/suites/EmployeeTest/testSampleMapping.sjs | Example of how to test the content.sjs createContent mapping functionality for the Employee entity|
| src/test/ml-modules/root/test/suites/EmployeeTest/testSampleHarmonization.sjs | Example of how to test an harmonization flow for the Employee entity|
| src/test/java/org/example/RunUnitTestsTest.java | Simple Junit test class that will execute all of the javascript tests and output the results in JUNIT xml format and an html report. __Note__ if you want to run the tests against the __test__ env, you will need to set ```@ContextConfiguration(classes = {TestEnvDataHubTestConfig.class})``` in this java class.|
| src/test/java/org/example/TestEnvDataHubTestConfig.java | Configuration to use when running tests against the __test__ env |
| plugins/entities/Employee/* | The Employee entity and harmonization job (sampleHarmonize) configuration and code  |
| lib/moment.js | A useful date parsing library |
| build.gradle | The basic gradle build file to make these examples work. Note how the __isDeployUnitTestFramework__ property is used in this build file |
| gradle.properties | The gradle config properties. The most important ones for this example are <br>mlTestDbName=data-hub-STAGING <br>mlTestPort=8010 <br>mlModulePaths=src/main/ml-modules,src/test/ml-modules <br>isDeployUnitTestFramework=true|


## Other useful commands / configuration

### Ensuring tests do not get deployed to production

The file gradle-prod.properties contains the configuration required to ensure that the tests do not test deployed to production

When running the gradle deployment commands, make sure you include the `-PenvironmentName=prod` argment. E.g. -

    ./gradlew mlDeploy -PenvironmentName=prod

### Deploying a dedicated test instance for running your unit tests

The file gradle-test.properties contains the configuration required to setup a dedicated dhf test instance (even on your local host)

When running the gradle deployment commands, make sure you include the `-PenvironmentName=test` argment. E.g. -

    ./gradlew mlDeploy -PenvironmentName=test

And then add ```@ContextConfiguration(classes = {TestEnvDataHubTestConfig.class})``` to the ```src/test/java/org/example/RunUnitTestsTest.java``` file

And then run your tests

    ./gradlew clean test -PenvironmentName=test

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