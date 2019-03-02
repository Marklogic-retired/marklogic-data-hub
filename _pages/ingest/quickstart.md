---
layout: inner
title: Ingest Using QuickStart
permalink: /ingest/quickstart/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Ingest Using QuickStart

QuickStart uses [MLCP]({{site.baseurl}}/ingest/mlcp/) to execute its input flows.

{% include note.html type="IMPORTANT" content="QuickStart is not supported for production use." %}


## Prerequisites

{% include_relative conref-prereq-createproject.md %}


## 1 - Create the entity.

{% include conrefs/conref-qs-4x-create-entity.md imgpath=var-imgpath fullsteps=true %}

***Result***

The new entity card is displayed.
  {% assign full-imgpath = var-imgpath | append: "qs-4x-entities-entity-card-Product-00.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="" imgclass="img-results" tab="  " %}


## 2 - Create the input flow and run it.

{% include conrefs/conref-qs-4x-create-run-input-flow.md
     imgpath=var-imgpath
     parentnum="2."
     fullsteps=true
%}


## Next
- [Harmonize Using Quickstart]({{site.baseurl}}/harmonize/quickstart/)

## See Also
- [Ingest Overview and Tools]({{site.baseurl}}/ingest/)
