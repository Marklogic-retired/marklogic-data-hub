---
layout: inner
title: Harmonize
permalink: /harmonize/
---

# Harmonizing Your Data

Harmonization is the process of creating a canonical model of your data using only the parts you need and leaving the rest as-is. Harmonization can be as simple as keeping the data as-is or as involved as you want to make it. 

The following might be performed as part of the harmonize step:

- Standardize dates and other fields
- Enrich data with additional information
- Extract important data into indexes for faster searching
- Leverage semantic triples to enrich your data
- Denormalize multiple data sources into one document

While not all of the above are explicitly harmonization tasks, they typically happen during this phase.

## Create a Harmonize Flow

There are several ways to create and run Harmonize flows.

- [QuickStart](quickstart.md) - A user interface for developing with DHF. Use QuickStart if you want to get started with DHF quickly. (QuickStart is not supported for production use.)
- [Gradle Plugin](gradle.md) - The Gradle plugin allows you to interact with the DHF from the command line.  
- [Java Library](java.md) - A library for running harmonize flows from Java programs.
- [REST](rest.md) - MarkLogic exposes RESTful APIs for harmonizing via HTTP REST calls. Use the REST API if you need to harmonize data from a non-Java application.
