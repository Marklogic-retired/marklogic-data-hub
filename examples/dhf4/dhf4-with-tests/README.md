This project shows an example of running JUnit5 tests against a DHF 4.1 application, including tests 
that verify that the application was correctly deployed.

Before deploying, create gradle-local.properties in this directory and add the following to it:

    mlUsername=
    mlPassword=
    
Enter values for the properties for a MarkLogic user that is able to deploy an application - the admin user should suffice.

Then deploy the app; the -i is for info-level logging:

    ./gradlew -i mlDeploy

You can then run the test cases via:

    ./gradlew test
    
That task will run the following test classes in src/test/java:

- VerifyDeploymentTest, which verifies that the application was correctly deployed
- RunUnitTestsTest, which demonstrates executing tests written using marklogic-unit-test via JUnit5

