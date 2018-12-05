---
layout: inner
title: Ingest Content into MarkLogic
permalink: /ingest/
---

# Ingest Content into MarkLogic

The Data Hub Framework ensures best practices are followed when building data hubs with MarkLogic. MarkLogic recommends that you create [input flows]({{site.baseurl}}/understanding/flows/#input-flows) to load content into MarkLogic. Input flows wrap your incoming data in [envelopes]({{site.baseurl}}/understanding/envelope-pattern/), allowing you to enrich the content with additional information.

You can run input flows using any of the following:

- [QuickStart](quickstart.md) - A user interface for developing with DHF. Use QuickStart if you want to get started with DHF quickly. (QuickStart is not supported for production use.)
- [MLCP (MarkLogic Content Pump)](mlcp.md) - A command-line utility for ingesting content into MarkLogic. Use MLCP if you need to load data into MarkLogic via the command line.
- [MarkLogic Java Client API](javaclientapi.md) - A Java API for interacting with MarkLogic. Use the Java Client API if you need to load data into MarkLogic from a Java program.
- [MarkLogic REST Client API](rest.md) - MarkLogic exposes RESTful APIs for loading content. Use the REST Client API if you need to load data into MarkLogic from a non-Java application.
