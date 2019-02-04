---
layout: inner
title: Harmonize Using the DHF Java Library
permalink: /harmonize/java/
---

# Harmonize Using the DHF Java Library

## DHF Java Library

The DHF Java Library is the core of the Data Hub Framework and ships as a library .jar file. Calling the DHF Java library directly from your custom Java code is the most powerful way to use the DHF. Before you embark down this path, consider whether you can get by using the [ml-data-hub Gradle Plugin](gradle.md) instead.

The DHF Java library is distributed via bintray so that you can include it easily with your favorite Java build tool. The following snippets illustrate how to include it. Adjust the `marklogic-data-hub` version as needed to match your environment.

**Gradle**

```groovy
compile('com.marklogic:marklogic-data-hub:{{ site.data.global.hub_version }}')
```

**Maven**

```xml
<dependency>
  <groupId>com.marklogic</groupId>
  <artifactId>marklogic-data-hub</artifactId>
  <version>{{ site.data.global.hub_version }}</version>
  <type>pom</type>
</dependency>
```

**Ivy**

```xml
<dependency org='com.marklogic' name='marklogic-data-hub' rev='{{ site.data.global.hub_version }}'>
  <artifact name='$AID' ext='pom'></artifact>
</dependency>
```

## Running a Harmonize Flow from Java

By running a harmonize flow from Java, you get finer control over the process.

```java
    import com.marklogic.client.datamovement.JobTicket;
    import com.marklogic.hub.ApplicationConfig;
    import com.marklogic.hub.FlowManager;
    import com.marklogic.hub.HubConfig;
    import com.marklogic.hub.flow.Flow;
    import com.marklogic.hub.flow.FlowRunner;
    import com.marklogic.hub.flow.FlowType;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.boot.SpringApplication;
    import org.springframework.boot.WebApplicationType;

    import javax.annotation.PostConstruct;

    public class MyApp {

        // get a hub config
        @Autowired
        HubConfig hubConfig;

        // get a flow manager
        @Autowired
        FlowManager flowManager;

        @PostConstruct
        void runHarmonizeFlow() {

            /*
             * Once Spring creates HubConfig object and the project is initialized with
             * createProject(String) you can use setter methods to change HubConfig properties
             * and then call refreshProject() method which will load HubConfig object with values
             * from gradle.properties (optionally overridden with
             * gradle-(environment).properties) and the setters.
             */
            hubConfig.createProject("/path/to/your/project");
            hubConfig.withPropertiesFromEnvironment("local");
            hubConfig.refreshProject();

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


        public static void main(String[] args) {

            // start the Spring application
            SpringApplication app = new SpringApplication(MyApp.class, ApplicationConfig.class);
            app.setWebApplicationType(WebApplicationType.NONE);
            app.run();
        }
    }
```
