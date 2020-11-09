The intent of this project is to define Gradle tasks and JMeter test plans for testing performance of various DHF
features. It is expected that the tests will be run against the app deployed by the ./examples/reference-entity-model 
project.

To run JMeter Test:
1. Set env variables (host, port, username, password). They are set to localhost, 8002, admin, admin as default.
2. Run ./gradlew jmRun
3. Report will be found in build/jmeter-report
