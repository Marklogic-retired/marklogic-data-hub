---
layout: inner
title: Flows
permalink: /understanding/flows/
---

# Flows

Flows are sets of plugins that process your data as they are pulled into MarkLogic. The two types of flows are **input** and **harmonize**.


## Input Flows

Input flows are specialized flows that are invoked via MLCP, the Java Client API, or the REST Client API as transforms that process one incoming document before it gets written into MarkLogic. Because these flows run as transforms, they are not responsible for persisting data. They merely transform the given data into envelopes. It is MLCP, the Java Client API, or the REST Client API that will write the final, transformed document into MarkLogic.

Input flows are useful for tracking information about data in your staging database.
 - Which system did the data come from?
 - What date/time was the data loaded?
 - Who loaded the data?
 - Has the data been harmonized yet?

Input flows consist of four parts:
- **Main Plugin**: Orchestrates the running of the other three plugins.
- **Content Plugin**: Determines which data to store in the **instance** section of the envelope.
- **Headers Plugin**: Returns a list of headers to store in the **headers** section of the envelope.
- **Triples Plugin**: Returns a list of semantic triples to store in the **triples** section of the envelope.


## Harmonize Flows

Harmonization is the process of creating a canonical model of your data using only the parts you need and leaving the rest as is. Harmonize flows harmonize your ingested data and are meant to run in batches. The primary purpose of the Data Hub Framework is to run harmonize flows.

Harmonize flows have six plugins. There is one plugin for each piece of the envelope (headers, triples, and content):

- **Main Plugin**: Orchestrates the running of the other five plugins.
- **Collector Plugin**: Returns a list of strings that will be batch processed by the harmonize flow. These strings can be anything from document URIs in the database to IDs. Collectors are only used for harmonize flows. harmonize flows run as batches and need a list of things to operate on. Input flows run per document and do not need collectors.
- **Content Plugin**: Determines which data to store in the **instance** section of the envelope.
- **Headers Plugin**: Returns a list of headers to store in the **headers** section of the envelope.
- **Triples Plugin**: Returns a list of semantic triples to store in the **triples** section of the envelope.
- **Writer Plugin**: Responsible for saving the final envelope to disk.

Because harmonize flows run in batches, DHF uses the [Data Movement SDK (DMSDK)](https://developer.marklogic.com/learn/data-movement-sdk) to orchestrate the batching.
<br>
<div class="text-center" style="font-style: italic">This data flow diagram details how a harmonize flow is executed.</div>
<!--- DHFPROD-646 TODO consistency, update image to reference all plugins above -->
![Harmonize Flow Overview]({{site.baseurl}}/images/2x/harmonize-flow-diagram.png 'This data flow diagram details how a harmonize flow is executed.'){: .center-image }


## See Also
- [Entities](/understanding/entities/)
- [Plugins](/understanding/plugins/)
- [Envelope Pattern](/understanding/envelope-pattern/)
