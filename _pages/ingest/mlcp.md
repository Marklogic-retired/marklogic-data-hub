---
layout: inner
title: Ingest with MLCP
permalink: /ingest/mlcp/
---

### Ingesting with MLCP (MarkLogic Content Pump)

Before you can ingest, make sure you created a DHF project with [QuickStart](../project/quickstart.md) or with the [Gradle Plugin](../project/gradle.md).

[MLCP](https://docs.marklogic.com/guide/ingestion/content-pump) is a standalone Java utility provided by MarkLogic. It provides a rich command line interface for loading content into MarkLogic Server.

In order to get MLCP to invoke your Input Flow you must supply the `transform` command line parameter.

_If you happen to be running the **Quickstart UI**, it will generate the appropriate command line for you._

<br>

#### MLCP Parameters

The 3 parameters necessary for running Input Flows are:
- transform_module
- transform_namespace
- transform_param

**NOTE** that **transform_module** and **transform_namespace** must be set to the values shown:

<pre class="cmdline">
-transform_module "/com.marklogic.hub/mlcp-flow-transform.xqy"
-transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform"
</pre>

<br>
#### The Important Parameter

**transform_param** contains a comma-delimited list of key=value parameters to be passed to the `mlcp-flow-transform.xqy` module.

##### The parameters are:
 - **entity-name** - the URL encoded name of the entity the flow belongs to
 - **flow-name** - the URL encoded name of the flow
 - **options** - [_Optional_] additional json options you can pass to the flow. must be a json object
 - **job-id** - [_Optional_] a job id. any string is legit. If none is provided then a UUID is generated for you.

<br>

#### A note about spaces in Flow Names

MLCP does not allow spaces in the command line options for **-output_collections** and **-transform_param**. Prior to Data Hub Framework 2.0.0 there is no way to run a flow with a space in the name from a standalone MLCP.

Since 2.0.0 you can **url encode** the name and it will run.

This is how you would run a flow named **My Awesome Flow** for the entity named **YourEntityName**.

<pre class="cmdline">
/path/to/mlcp import \

... \

-transform_module "/com.marklogic.hub/mlcp-flow-transform.xqy" \
-transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform" \
-transform_param "entity-name=YourEntityName,flow-name=My%20Awesome%20Flow,job-id=someString,options={'your':'options'}"
</pre>
