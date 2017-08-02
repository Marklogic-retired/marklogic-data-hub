---
layout: inner
title: What is it?
permalink: /what/
---

<p style="font-style: italic; font-size:12px;">The MarkLogic Data Hub Framework is free and open source under the <a href="https://github.com/marklogic-community/marklogic-data-hub/blob/1.0-master/LICENSE">Apache 2 License</a> and is supported by the community of developers who build and contribute to it. Please note that Data Hub Framework is not a supported MarkLogic product.</p>

![What is it](//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/design/images/hub-architecture.png){: .center-image }

<div class="section" markdown="1">

### Ingest
First thing is first. Load all of your data into MarkLogic... every last bit. Upon ingest, data is stored in a staging area. During the ingest phase you can enhance your data with extra metadata like provenance. Where did this data come from and when did it get ingested? Data can be loaded via:

- [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp){:target="_blank"} - a Java command-line utility for ingesting content into MarkLogic.
- [MarkLogic Java Client API](https://github.com/marklogic-community/java-client-api){:target="_blank"} - A Java API for interacting with MarkLogic
- [REST APIs](https://docs.marklogic.com/guide/rest-dev/documents#id_11953){:target="_blank"} - MarkLogic exposes RESTful APIs for loading content

</div>

<div class="section" markdown="1">

### Harmonize
Now that the data is loaded into the Staging area you will want to harmonize it. This can be as simple as keeping the data as-is or as involved as you want to make it. Some common actions that can be performed as part of the harmonize step are:

- Standardize dates and other fields
- Enrich data with additional information
- Extract important data into indexes for faster searching
- Leverage semantic triples to enrich your data
- Denormalizing multiple data sources into one document

</div>

<div class="section" markdown="1">

### Serve
Storing your data in the Data Hub is great, but you need to access it. Your data is made available to downstream sources via HTTP and REST.

</div>
