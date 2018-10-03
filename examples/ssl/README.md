# SSL Example
This example demonstrates how to enable SSL for your entire MarkLogic instance. This includes the builtin AppServers and your Data Hub Appservers.

For additional information on SSL and Appservers see [Chapter 9 of the Security Guide](http://docs.marklogic.com/guide/security/SSL).

# What's required
### A certificate template
We provide one for you in `src/main/ml-config/security/certificate-templates/my-template.xml`
```xml
<certificate-template-properties xmlns="http://marklogic.com/manage">
  <template-name>dhf-cert</template-name>
  <template-description>Sample description</template-description>
  <key-type>rsa</key-type>
  <key-options />
  <req>
    <version>0</version>
    <subject>
      <countryName>US</countryName>
      <stateOrProvinceName>VA</stateOrProvinceName>
      <localityName>McLean</localityName>
      <organizationName>MarkLogic</organizationName>
      <organizationalUnitName>Consulting</organizationalUnitName>
      <emailAddress>nobody@marklogic.com</emailAddress>
    </subject>
  </req>
</certificate-template-properties>
```

### Set the certificate Template for each appserver
We do this for you in 
`src/main/ml-config/servers/*-server.json`

```json
{
  "ssl-certificate-template": "dhf-cert"
}
```

### Enable SSL properties
We do this for you in `gradle.properties`

```
# To use SSL on port 8001
mlAdminScheme=https
mlAdminSimpleSsl=true

# To use SSL on port 8002
mlManageScheme=https
mlManageSimpleSsl=true

# To use SSL on port 8000
mlAppServicesSimpleSsl=true

# Set these to true to use SSL for you Hub App Servers
mlStagingSimpleSsl=true
mlFinalSimpleSsl=true
mlTraceSimpleSsl=true
mlJobSimpleSsl=true
```

# TLDR; How do I run it?

### Step 1: Configure the `gradle.properties` files
Open `gradle.properties` and put in your username and password
next to:

```properties
mlUsername=
mlPassword=
```

### Step 2: Enable SSL for builtin AppServers
First you should enable SSL for the builtin Appservers. You can do this manually via the instructions in [Chapter 9 of the Security Guide](http://docs.marklogic.com/guide/security/SSL) or you can use the shortcut we provide in this example.

To use the shortcut simply run:

```bash
gradle enableSSL
```

### Step 3: Initialize your Hub Project
To initialize the Hub project simply type:

```bash
gradle hubInit
```

### Step 4: Deploy the Data Hub into MarkLogic
To deploy your Data Hub into MarkLogic simply type:

```bash
gradle mlDeploy
```

### Step 5: Deploy your custom modules
```bash
gradle mlLoadModules
```

### Scaffolding Commands
You can use scaffolding commands to create entities and configure flows.

```bash
gradle hubCreateEntity -PentityName=myNewEntity
gradle hubCreateInputFlow -PentityName=myNewEntity -PflowName=myInputFlow
gradle hubCreateHarmonizeFlow -PentityName=myNewEntity -PflowName=myHarmonizationFlow
```

For a complete list of gradle tasks, check here: [https://marklogic.github.io/marklogic-data-hub/docs/gradle-tasks](https://marklogic.github.io/marklogic-data-hub/docs/gradle-tasks)
