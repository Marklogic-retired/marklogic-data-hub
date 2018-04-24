---
layout: inner
title: Ingesting data into the DHF
permalink: /ingest/
---

# Ingesting Content Into MarkLogic

The Data Hub Framework ensures best practices are followed when building data hubs with MarkLogic. As such, we recommend you create [input flows](../understanding/how.md#input-flows) for loading content into MarkLogic. Input flows wrap your incoming data in [envelopes](../understanding/how.md#envelope-pattern), allowing you to enrich the content with additional information.

There are several ways to run input flows:

- [QuickStart](quickstart.md) - A user interface for developing with DHF. Use QuickStart if you want to get started with DHF quickly. (QuickStart is not supported for production use.)
- [MLCP (MarkLogic Content Pump)](mlcp.md) - A command-line utility for ingesting content into MarkLogic. Use MLCP if you need to load data into MarkLogic via the command line.
- [MarkLogic Java Client API](javaclientapi.md) - A Java API for interacting with MarkLogic. Use the Java Client API if you need to load data into MarkLogic from a Java program.
- [MarkLogic REST Client API](rest.md) - MarkLogic exposes RESTful APIs for loading content. Use the REST Client API if you need to load data into MarkLogic from a non-Java application.
