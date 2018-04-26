# Custom Tokens Example

This example demonstrates how to utilize gradle environment properties that are substituted in configuraton files within the MarkLogic deployment process.  We are basing this example off of the [barebones example](https://github.com/marklogic/marklogic-data-hub/tree/master/examples/barebones).

This example utilizes gradle environment properties that are substituted in the configuration files for a user defined database and application server.  You can see the environment properties that are defined at the bottom of the `gradle.properties` file.

Inside of the `gradle.properties` file, you can see the following information:

```
# Custom properties defined here
TEST_DATABASE_NAME=custom-tokens-test-database
TEST_SERVER_NAME=custom-tokens-test-database-server
TEST_SERVER_PORT=8014
TEST_TRACE_AUTH=digest
```

To utilize the custom tokens, then you will need to refer to them as `%%TEST_DATABASE_NAME%%` if you want to reference the `TEST_DATABASE_NAME` name token within your gradle deployment.  You can change the default token prefix and suffix from "%%" by utilizing the following tokens in your `gradle.properties` file by setting the appropriate prefix and suffix values according:

```
mlTokenPrefix=
mlTokenSuffix=
```
For more information regarding this, then you can refer to the [ml-gradle wiki](https://github.com/marklogic-community/ml-gradle/wiki/Configuring-resources)

You can see that we are referencing the new custom tokens within the `custom-tokens-test-server.json` file.  We are utilizing the four (4) custom tokens that we defined in our properties file which are the following: `%%TEST_SERVER_NAME%%`, `%%TEST_SERVER_PORT%%`, `%%TEST_DATABASE_NAME%%`, and `%%TEST_TRACE_AUTH%%`.

```json
{
  "server-name": "%%TEST_SERVER_NAME%%",
  "server-type": "http",
  "root": "/",
  "group-name": "%%GROUP%%",
  "port": "%%TEST_SERVER_PORT%%",
  "modules-database": "%%mlModulesDbName%%",
  "content-database": "%%TEST_DATABASE_NAME%%",
  "authentication": "%%TEST_TRACE_AUTH%%",
  "default-error-format": "json",
  "error-handler": "/MarkLogic/rest-api/error-handler.xqy",
  "url-rewriter": "/MarkLogic/rest-api/rewriter.xml",
  "rewrite-resolves-globally": true
}
```

Next, Initialize your DHF app:

```bash
gradle hubInit
```

Then Bootstrap your DHF app with the user defined database and application that utilized custom tokens:

```bash
gradle mlDeploy
```
Once the deployment is complete, then you can login to the admin console and see the new test database and test database application server that were created with the values that were specified from our properties file.  Now that you've mastered utilizing custom tokens for your gradle deployment, you can continue on with your DHF app development.

For a complete list of gradle tasks, check here: [https://github.com/marklogic/marklogic-data-hub/wiki/Gradle-Tasks](https://github.com/marklogic/marklogic-data-hub/wiki/Gradle-Tasks)
