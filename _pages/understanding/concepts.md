---
layout: inner
title: High Level Concepts
permalink: /understanding/concepts/
---

# What Is an Operational Data Hub?
At the highest conceptual level an Operational Data Hub is a place to harmonize and govern all of your enterprise data. The ODH allows you to harmonize data from many data sources in order to meet business needs.

The following diagram illustrates the architectural view of an ODH:

![Architecture diagram]({{site.baseurl}}/images/odh-arch.png)

### An ODH performs four key functions:

1. **Ingest** - Load data from upstream system
1. **Govern** - Provides trust about your data. Where did it come from? Is the data valid?
1. **Harmonize** - Harmonize the incoming data into consistent, usable formats
1. **Serve** - Serve the harmonized data to other systems

### Ingest
First thing is first. Load all of your data into MarkLogic... every last bit. Upon ingest, data is stored in a staging area. During the ingest phase you can enhance your data with extra metadata like provenance. _Where did this data come from and when did it get ingested?_ See our [ingest page](../ingest/ingest.md) for more details on ingesting data.

### Govern
In order to trust your data you need to know where it came from, how it maps to the sources, how and when it was transformed, if there were errors on ingest or harmonize, and if the data is valid.

Governance encompasses security and security policies as well as provenance and traceability.

#### Specifically, an Operational Data Hub:
1. Secures all the data and operations, at the entity or attribute level
1. Traces data lineage. _Where did it come from? Who loaded it? When?_

### Harmonize
Harmonization is the process of creating a canonical model of your data using only the parts you need and leaving the rest **as-is**. Harmonization can be as simple as keeping the data as-is or as involved as you want to make it. Some common actions that can be performed as part of the harmonize step are:

- Standardize dates and other fields
- Enrich data with additional information
- Extract important data into indexes for faster searching
- Leverage semantic triples to enrich your data
- Denormalize multiple data sources into one document

While not all of these are explicitly "harmonization" tasks, they do tend to happen during this phase.

### Serve
Storing your data in the Data Hub is great, but you need to access it. Your data is made available to downstream sources via HTTP, REST, and ODBC.
