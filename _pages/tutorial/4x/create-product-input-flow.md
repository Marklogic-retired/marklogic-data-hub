---
layout: inner
title: Tutorial - Create the Product Input Flow
permalink: /tutorial/4x/create-product-input-flow/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Create the Product Input Flow

An **input flow** is a series of plugins that ingest data into the staging data hub. Input flows wrap incoming data in envelopes so you can track lineage and provenance, which track metadata, such as who loaded the data, when it was loaded, and where it came from.

A **harmonize flow** is another series of plugins that harmonizes the data in the staging database and stores the results in the final database. Harmonization includes standardizing formats, enriching data, resolving duplicates, indexing, and other tasks.

In this exercise, we create an input flow for the `Product` entity. The input flow will enable us to load raw data into the staging database.

{% include conrefs/conref-qs-create-input-flow.md imgpath=var-imgpath entityname="Product" %}


### Result

Your new flow appears under **Input Flows**{:.uilabel} in the left panel.
  {% assign full-imgpath = var-imgpath | append: "qs-4x-flows-xxx.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="" %}


{% include prev-next-nav.html
  prevtext="Create the Product Entity"
  prevlink="/tutorial/4x/create-product-entity/"
  increl="tutorial-toc.md"
  nexttext="Load the Product Data As-Is"
  nextlink="/tutorial/4x/load-products-as-is/"
%}
