---
layout: inner
title: Ingest Using MLCP
permalink: /ingest/mlcp/
---

# Ingest Using MLCP

[MarkLogic Content Pump (MLCP)](https://docs.marklogic.com/guide/ingestion/content-pump) is a standalone Java utility provided by MarkLogic. It provides a rich command-line interface for loading content into MarkLogic. You can read more in the [MLCP User Guide](https://docs.marklogic.com/guide/mlcp).

{% include_relative prereq-createproject.html %}

You can have MLCP invoke your input flow by including three parameters with your MLCP command:

- `-transform_module`
- `-transform_namespace`
- `-transform_param`

{% include note.html type="NOTE" content="QuickStart generates the appropriate MLCP commands for loading content." %}


## Input Flow Parameters

The `-transform_module` and `-transform_namespace` parameters must be set to the following:

<pre class="cmdline">
-transform_module "/data-hub/4/transforms/mlcp-flow-transform.xqy"
-transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform"
</pre>

For SJS transforms use

<pre class="cmdline">
-transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs"
</pre>

The `-transform_param` parameter will contain a comma-delimited list of key=value pairs to be passed to the `mlcp-flow-transform.xqy` module. Here are the keys and a description of their values:

 - **entity-name** - the URL-encoded name of the entity to which the flow belongs.
 - **flow-name** - the URL-encoded name of the flow.
 - **job-id** - [_Optional_] a job id, any string is OK. If none is provided then a UUID is generated for you.
 - **options** - [_Optional_] additional JSON options you can pass to the flow. Must be a JSON object


## Spaces in Flow Names

MLCP does not allow spaces in the command line options for **-output_collections** and **-transform_param**. Prior to Data Hub Framework 2.0.0 there is no way to run a flow with a space in the name from standalone MLCP.

Since 2.0.0 you can [URL encode](https://en.wikipedia.org/wiki/Percent-encoding) the name and it will run (as in the example below).


## MLCP Example

This is how you would run a flow named "My Awesome Flow" for the entity named "YourEntityName".

<pre class="cmdline">
/path/to/mlcp import \
... \
-transform_module "/data-hub/4/transforms/mlcp-flow-transform.xqy" \
-transform_namespace "http://marklogic.com/data-hub/mlcp-flow-transform" \
-transform_param 'entity-name=YourEntityName,flow-name=My%20Awesome%20Flow,job-id=someString,options={"your":"options"}'
</pre>

If your flow is implemented with JavaScript, use this module:

<pre class="cmdline">
/path/to/mlcp import \
... \
-transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" \
-transform_param 'entity-name=YourEntityName,flow-name=My%20Awesome%20Flow,job-id=someString,options={"your":"options"}'


## See Also
- [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp){:target="_blank"}
