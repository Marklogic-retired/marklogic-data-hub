---
layout: inner
title: Harmonize Using QuickStart
permalink: /harmonize/quickstart/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Harmonize Using Quickstart

{% include note.html type="IMPORTANT" content="QuickStart is not supported for production use." %}


## Prerequisites

You must have done the following:
- Created an entity and ingested some raw data for that entity. (See [Ingest Using QuickStart]({{site.baseurl}}/ingest/quickstart/).)
- Decided which fields in the raw data to harmonize and how to name the corresponding property in the entity model. The entity model property names (not the field name in the raw dataset) will be used by apps to access that field in the datahub. If you later decide to expose more data to apps, you can add more properties to the entity model and rerun the harmonization flow.


## 1 - Define the entity model.

The entity model specifies the standard labels for the fields we want to harmonize.

{% include conrefs/conref-qs-4x-define-entity-model.md imgpath=var-imgpath fullsteps=true %}


## 2 - Define the mappings.

{% include conrefs/conref-qs-4x-define-source-to-entity-maps.md imgpath=var-imgpath diffsource=true fullsteps=true %}


## 3 - Create and run the harmonize flow.

Harmonization uses the data in your **STAGING** database to generate canonical entity instances in the **FINAL** database.

{% include conrefs/conref-qs-4x-create-run-harmonize-flow.md imgpath=var-imgpath create=true run=true fullsteps=true %}


## Next Steps

You can ingest additional data into your data hub and harmonize them. You can also add properties to your entity model as needed and rerun the harmonization flow.

When your project is ready, you can deploy it either on your own production environment or [on the Data Hub Service (DHS)]({{site.baseurl}}/deploy/deploy-to-dhs/), and then [serve your data]({{site.baseurl}}/serve/).

After deployment to your production environment, you can still run additional ingestion and harmonization flows. However, you must use other tools, because QuickStart is not intended for a production environment. See [Ingest]({{site.baseurl}}/ingest/) and [Harmonize]({{site.baseurl}}/harmonize/) for a list of other tools you can use for each flow.

## See Also
- [Ingest Overview and Tools]({{site.baseurl}}/ingest/)
- [Using Model-to-Model Mapping]({{site.baseurl}}/harmonize/mapping/)
