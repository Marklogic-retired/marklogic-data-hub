---
layout: inner
title: Ingesting data into the DHF
permalink: /ingest/
---

# Ingesting Content Into MarkLogic

The Data Hub Framework ensures best practices are followed when building Data Hubs with MarkLogic. As such, we recommend you create Input Flows for loading content into MarkLogic. With [Input Flows](../understanding/how.md#input-flows) you will wrap your incoming data in [envelopes](../understanding/how.md#envelope-pattern) allowing you to enrich the content with additional information.

There are several ways to run Input flows.

1. [QuickStart UI](quickstart.md) - A user interface for developing against the DHF.  
Use the Quickstart tool if you want to get started with DHF quickly (for development
 only; not supported for production use).
1. [MLCP (MarkLogic Content Pump)](mlcp.md) - A command-line utility for ingesting content into MarkLogic.  
Use MLCP if you need to easily load data into MarkLogic via the command line.
1. [MarkLogic Java Client API](javaclientapi.md) - A Java API for interacting with MarkLogic.  
Use the Java Client API if you need to load data into MarkLogic from a Java program.
1. [MarkLogic REST API](rest.md) - MarkLogic exposes RESTful APIs for loading content.  
Use the REST API if you need to load data into MarkLogic from a non-Java application.
