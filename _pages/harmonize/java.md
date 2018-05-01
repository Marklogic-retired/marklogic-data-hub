---
layout: inner
title: Harmonize from Java
permalink: /harmonize/java/
---

### Using the DHF from Java

The core of the Data Hub Framework ships as a library .jar file. Calling the DHF Java library directly from your custom Java code is the most powerful way to use the DHF. Before you embark down this path, consider whether you can get by using the [ml-data-hub Gradle Plugin](gradle.md) instead.

The DHF Java library is distributed via bintray so that you can include it easily with your favorite Java build tool. Here's how to include it:

**Gradle**

```groovy
compile('com.marklogic:marklogic-data-hub:2.0.3')
```

**Maven**

```xml
<dependency>
  <groupId>com.marklogic</groupId>
  <artifactId>marklogic-data-hub</artifactId>
  <version>2.0.3</version>
  <type>pom</type>
</dependency>
```

**Ivy**

```xml
<dependency org='com.marklogic' name='marklogic-data-hub' rev='2.0.3'>
  <artifact name='$AID' ext='pom'></artifact>
</dependency>
```

### Running a Harmonize Flow from Java

By running a harmonize flow from Java, you get finer control over the process.

```java
    import com.marklogic.hub.flow.FlowRunner;
    import com.marklogic.hub.HubConfig;
    import com.marklogic.hub.HubConfigBuilder;
    import com.marklogic.hub.FlowRunner;
    import com.marklogic.hub.Flow;
    import com.marklogic.hub.FlowType;
    import com.marklogic.client.datamovement.JobTicket;

    public class MyApp {
        public static void main(String[] args) {
            // get a hub config
            HubConfig dataHubConfig = HubConfigBuilder.newHubConfigBuilder("/path/to/your/project")
                .withPropertiesFromEnvironment("local")
                .build();

            // get a flow manager
            FlowManager flowManager = new FlowManager(dataHubConfig);

            // retrieve the flow you wish to run
            Flow harmonizeFlow = flowManager.getFlow("my entity name", "my flow name", FlowType.HARMONIZE);

            // build the flow runner
            FlowRunner flowRunner = flowManager.newFlowRunner()
                .withFlow(harmonizeFlow)
                .withBatchSize(10)
                .withThreadCount(4)
                .withOptions(options)
                .withSourceClient(srcClient)
                .withDestinationDatabase(destDb)
                .onItemComplete((String jobId, String itemId) -> {
                  // do something with this completed item
                })
                .onItemFailed((String jobId, String itemId) -> {
                  // do something with this failed item
                });

            // run the flow
            JobTicket jobTicket = flowRunner.run();

            // optionally wait for the flow to finish running
            flowRunner.awaitCompletion();
        }
    }
```
