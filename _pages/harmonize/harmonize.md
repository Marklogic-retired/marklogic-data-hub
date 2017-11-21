---
layout: inner
title: Harmonize
permalink: /harmonize/
---

# Harmonizing Your Data

Harmonization is the process of creating a canonical model of your data using only the parts you need and leaving the rest **as-is**. Harmonization can be as simple as keeping the data as-is or as involved as you want to make it. Some common actions that can be performed as part of the harmonize step are:

- Standardize dates and other fields
- Enrich data with additional information
- Extract important data into indexes for faster searching
- Leverage semantic triples to enrich your data
- Denormalizing multiple data sources into one document

While not all of these are explicitly "harmonization" tasks, they do tend to happen during this phase.

## Create a Harmonize Flow

There are several ways to create and run Harmonize flows.

1. [QuickStart UI](quickstart.md) - A user interface for developing against the DHF.  
Use the Quickstart tool if want to get started with DHF quickly.
1. [Gradle Plugin](gradle.md) - This Gradle plugin allows you to interact with the DHF from a command line.  
Use the Gradle plugin if you prefer the command line.
1. [Java Library](java.md) - How to use the DHF Java Library for running Harmonize Flows.  
Use the Java Library if you need to harmonize data from a Java program.
1. [REST](rest.md) - Harmonize via HTTP REST calls.
Use the REST API if you need to harmonize data from a non-Java application and you cannot use the gradle command line.
