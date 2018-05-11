---
layout: inner
title: Ingest with the MarkLogic Client API
permalink: /ingest/marklogic-client-api/
---

### Ingest with the MarkLogic Java Client API

The [MarkLogic Java Client API](https://developer.marklogic.com/products/java) is a Java library that facilitates communicating with MarkLogic Server from Java applications.

Before you can ingest, make sure you created a DHF project with [QuickStart](../project/quickstart.md) or with the [Gradle Plugin](../project/gradle.md). MarkLogic ships with two transforms **ml:inputFlow** and **ml:sjsInputFlow**, which you can invoke using the Java Client API.  Use **ml:inputFlow** for XQuery flows and **ml:sjsInputFlow** for JavaScript flows.

#### Java Client API Example

The following example shows how you can use the [DocumentManager Interface](https://docs.marklogic.com/javadoc/client/com/marklogic/client/document/DocumentManager.html) to ingest data into MarkLogic and run input flows against the data. The code uses the [ServerTransform class](https://docs.marklogic.com/javadoc/client/com/marklogic/client/document/ServerTransform.html) to execute the **ml:inputFlow** transform and pass parameters to it.

The parameters are the following:

 - **entity-name** - the name of the entity to which the input flow belongs.
 - **flow-name** - the name of the input flow.
 - **options** - [_Optional_] additional JSON options you can pass to the flow. Must be a JSON object.
 - **job-id** - [_Optional_] a job id, any string is OK. If none is provided then a UUID is generated for you.

```java
class FlowRunner {
  public void runFlow(String entityName, String flowName, String jobId) {
    String doc = "<a/>";
    GenericDocumentManager docMgr = databaseClient().newDocumentManager();
    ServerTransform runFlow = new ServerTransform("ml:inputFlow");
    runFlow.addParameter("entity-name", entityName);
    runFlow.addParameter("flow-name", flowName);
    runFlow.addParameter("options", "{\"your\": \"options\"}");
    runFlow.addParameter("job-id", jobId);
    docMgr.write(uri, new StringHandle(doc), runFlow);
  }
}
```
