---
layout: inner
title: Architecture
permalink: /docs/architecture
---

This page provides information about the implementation of DHF as it runs on MarkLogic

1. [In General](#in-general)
1. [Databases](#databases)
1. [Application Servers](#appservers)

## In General

As far as maintaining data goes, DHF provides the following services:

* manages the flow and integration of data into and through a MarkLogic system.
* records job and tracing metadata
* exposes code to operate upon data in the hub.

## Databases

In installing a data hub, the following databases are created:

Database    | Default Name     | Triggers DB       | Schema DB
Staging     | data-hub-STAGING | TRIGGERS          | SCHEMAS
Final       | data-hub-FINAL   | TRIGGERS          | SCHEMAS
Jobs        | data-hub-JOBS    | TRIGGERS          | SCHEMAS
Triggers    | data-hub-TRIGGERS| none              | none
Modules     | data-hub-MODULES | none              | none

The names of these databases are all configurable using values in `gradle.properties`.

Note: as of 3.1 there is no separate TRACING database.  JOBS holds tracing and jobs info.

### Application Servers

The following application servers are in use by a Data hub:

Appserver   | Default Name     | Default Port      | Modules DB
Final       | data-hub-FINAL   | 8011              | data-hub-MODULES
Staging     | data-hub-STAGING | 8010              | data-hub-MODULES
Jobs        | data-hub-JOBS    | 8013              | data-hub-MODULES

Note: deployment of DHF also makes use of the MarkLogic management API on port 8002.


