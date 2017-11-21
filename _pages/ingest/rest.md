---
layout: inner
title: Ingest with the REST API
permalink: /ingest/rest/
---

### Ingesting with the MarkLogic REST API

Before you can ingest, make sure you created a DHF project with [QuickStart](../project/quickstart.md) or with the [Gradle Plugin](../project/gradle.md).

The [MarkLogic REST API](https://docs.marklogic.com/REST/PUT/v1/documents) is a set of REST endpoints that allow you to interact with MarkLogic Server.

This example shows how to use the [v1/documents endpoint](https://docs.marklogic.com/REST/PUT/v1/documents) to insert a document and run an Input Flow against it.

#### The necessary parameter are:
1. **transform** - the name of the transform. This must be **run-flow**
1. **trans:entity-name** - the name of the entity the flow belongs to
1. **trans:flow-name** - the name of the input flow to run
1. **trans:options** - [_Optional_] additional json options you can pass to the flow. must be a json object
1. **trans:job-id** - [_Optional_] a job id. any string is legit. If none is provided then a UUID is generated for you.

<pre class="cmdline">
curl --anyauth --user user:password -T ./my-content -i \
  -H "Content-type: application/xml" \
  http://localhost:8010/v1/documents?uri=/shakespeare/plays/a_and_c.xml&transform=run-flow&trans:entity-name=YourEntityName&trans:flow-name=YourFlowName&trans:options={"your":"options"}&trans:job-id=someString
</pre>
