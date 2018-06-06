---
layout: inner
title: Ingest with the REST API
permalink: /ingest/rest/
---

### Ingest with the MarkLogic REST Client API

The [MarkLogic REST Client API](https://docs.marklogic.com/REST/client) is a set of REST endpoints that allow you to interact with MarkLogic.

Before you can ingest, make sure you have created a DHF project with [QuickStart](../project/quickstart.md) or with the [Gradle Plugin](../project/gradle.md). When you set up a DHF project, a transform is installed on MarkLogic with the name **run-flow**, which you can invoke using the REST Client API.

#### REST Client API Example

This example shows how to use the [v1/documents endpoint](https://docs.marklogic.com/REST/PUT/v1/documents) to insert a document and run an Input Flow against it. The parameters are the following:

1. **transform** - the name of the transform. If your flow is written in XQuey, this value must be **ml:inputFlow**.  If it's written in JavaScript, use **ml:sjsInputFlow**.
1. **trans:entity-name** - the name of the entity to which the input flow belongs.
1. **trans:flow-name** - the name of the input flow.
1. **trans:options** - [_Optional_] additional JSON options you can pass to the flow. Must be a JSON object.
1. **trans:job-id** - [_Optional_] a job id, any string is OK. If none is provided then a UUID is generated for you.

##### XQuery:

<pre class="cmdline">
curl --anyauth --user admin:admin -T ./my-content -i \
  -X PUT -H "Content-type: application/xml" \
  http://localhost:8010/v1/documents?uri=/shakespeare/plays/a_and_c.xml&transform=ml:inputFlow&trans:entity-name=YourEntityName&trans:flow-name=YourFlowName&trans:options={"your":"options"}&trans:job-id=someString
</pre>

##### JavaScript:

<pre class="cmdline">
curl --anyauth --user admin:admin -T ./my-content -i \
  -X PUT -H "Content-type: application/json" \
  http://localhost:8010/v1/documents?uri=/fascinating-data/structure.json&transform=ml:sjsInputFlow&trans:entity-name=YourEntityName&trans:flow-name=YourFlowName&trans:options={"your":"options"}&trans:job-id=someString
</pre>
