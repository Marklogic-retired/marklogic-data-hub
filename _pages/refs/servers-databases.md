---
layout: inner
title: Data Hub Servers and Databases
permalink: /refs/servers-databases/
redirect_from: "/docs/architecture/"
---

# Data Hub Servers and Databases

When installing a data hub, the following databases are created:

* Staging.  The staging database contains data that has been ingested into DHF for further processing.
  * Appserver:   data-hub-STAGING, port 8010.
  * Content db:  data-hub-STAGING
  * Modules db:  data-hub-MODULES
  * Triggers db: data-hub-staging-TRIGGERS
  * Schemas db:  data-hub-staging-SCHEMAS

* Final.  The final appserver is for downstream applications to access harmonized data.  harmonization flows write to the final database.

  * Appserver:   data-hub-FINAL, port 8011.
  * Content db:  data-hub-FINAL
  * Triggers db: data-hub-final-TRIGGERS
  * Modules db:  data-hub-MODULES
  * Schemas db:  data-hub-final-SCHEMAS

* Jobs.  The jobs subsystem stores records of job  (flow runs) activity and traces of what happened during flows runs.  Note that this appserver shares databases with STAGING.
  * Appserver:   data-hub-JOBS, port 8013.
  * Content db:  data-hub-JOBS
  * Triggers db: data-hub-staging-TRIGGERS
  * Modules db:  data-hub-MODULES
  * Schemas db:  data-hub-staging-SCHEMAS

The names of these databases are all configurable using values in `gradle.properties`.

{% include note.html type="NOTE" content="In DHF 4.0.0 and later versions, a separate TRACING database no longer exists. The JOBS database holds the tracing and jobs info." %}
