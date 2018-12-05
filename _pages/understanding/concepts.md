---
layout: inner
title: DHF as an Operational Data Hub
permalink: /understanding/concepts/
---

# DHF as an Operational Data Hub

An operational data hub (ODH) is a place to harmonize and govern enterprise data from many sources.

The following diagram illustrates the architectural view of an ODH:

<a href="{{site.baseurl}}/images/odh-arch-lg.png">
  <img src="{{site.baseurl}}/images/odh-arch.png" alt="Architecture diagram"/>
</a>

An ODH performs four key functions:

1. **Ingest** - Load data from upstream system
1. **Govern** - Provide trust about your data. Where did it come from? Is the data valid?
1. **Harmonize** - Harmonize the incoming data into consistent, usable formats
1. **Serve** - Serve the harmonized data to other systems


## Ingest

Load all your data into MarkLogic. Upon ingestion, the data is stored in a staging area. During the Ingest phase, you can enhance your data with additional metadata, such as provenance. _Where did this data come from and when did it get ingested?_

See [Ingest]({{site.baseurl}}/ingest/).


## Govern
To trust your data, you need to know where it came from, how it maps to the sources, how and when it was transformed, if there were errors on ingest or harmonize, and if the data is valid.

Governance encompasses security and security policies as well as provenance and traceability.

Specifically, an operational data hub:
- Secures all the data and operations at the entity or attribute level.
- Traces data lineage. _Where did it come from? Who loaded it? When?_

See [DHF Governance]({{site.baseurl}}/govern/).


## Harmonize

Harmonization is the process of creating a canonical model of your data using only the parts you need and leaving the rest *as is*. Harmonization can be as simple as keeping the data as-is or as involved as you want to make it. Some common actions that can be performed as part of the harmonize step are:

- Standardize dates and other fields
- Enrich data with additional information
- Extract important data into indexes for faster searching
- Leverage semantic triples to enrich your data
- Denormalize multiple data sources into one document

While not all of these are explicitly "harmonization" tasks, they do tend to happen during this phase.

See [Harmonize]({{site.baseurl}}/harmonize/).


## Serve
The data stored in your data hub is available through HTTP, REST, and ODBC.

See [Serve]({{site.baseurl}}/serve/).

