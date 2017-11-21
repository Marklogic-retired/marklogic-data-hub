---
layout: inner
title: Ingest with the MarkLogic Client API
permalink: /ingest/marklogic-client-api/
---

### Ingesting with the MarkLogic Java Client API

Before you can ingest, make sure you created a DHF project with [QuickStart](../project/quickstart.md) or with the [Gradle Plugin](../project/gradle.md).

The [MarkLogic Java Client API](https://developer.marklogic.com/products/java) is a Java library that facilitates communicating with MarkLogic Server from Java applications.

The following example shows how you can use the [DocumentManager Interface](https://docs.marklogic.com/javadoc/client/com/marklogic/client/document/DocumentManager.html) to ingest data into MarkLogic and run Input Flows against the data.

**NOTE** how the code is using the [ServerTransform class](https://docs.marklogic.com/javadoc/client/com/marklogic/client/document/ServerTransform.html) to execute the **run-flow** transform and pass parameters to it.

##### The parameters are:
 - **entity-name** - the name of the entity the flow belongs to
 - **flow-name** - the name of the flow
 - **options** - [_Optional_] additional json options you can pass to the flow. must be a json object
 - **job-id** - [_Optional_] a job id. any string is legit. If none is provided then a UUID is generated for you.

```java
class FlowRunner {
  public void runFlow(String entityName, String flowName, String jobId) {
    String doc = "<a/>";
    GenericDocumentManager docMgr = databaseClient().newDocumentManager();
    ServerTransform runFlow = new ServerTransform("run-flow");
    runFlow.addParameter("entity-name", entityName);
    runFlow.addParameter("flow-name", flowName);
    runFlow.addParameter("options", "{\"your\": \"options\"}");
    runFlow.addParameter("job-id", jobId);
    docMgr.write(uri, new StringHandle(doc), runFlow);
  }
}
```
