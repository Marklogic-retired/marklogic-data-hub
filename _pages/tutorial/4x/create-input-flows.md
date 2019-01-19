---
layout: inner
title: Tutorial - Create the Input Flows
permalink: /tutorial/4x/create-input-flows/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Create the Input Flows

An **input flow** is a series of plugins that ingest data into the staging data hub. Input flows wrap incoming raw data in envelopes and store them in the staging database. The envelopes contain metadata, including those related to lineage and provenance; for example, who loaded the data, when it was loaded, and where it came from.

A **harmonize flow** is another series of plugins that harmonizes the data in the staging database and stores the results in the final database. Harmonization includes standardizing formats, enriching data, resolving duplicates, indexing, and other tasks.

In this section, we create an input flow for each entity: `Product`, `Customer`, and `Order`.


## Product

{% include conrefs/conref-qs-4x-create-input-flow.md imgpath=var-imgpath entityname="Product" inputflowname="Load Products" fullsteps=true %}

### Result

Your new flow appears under **Input Flows**{:.uilabel} in the left panel.
  {% assign full-imgpath = var-imgpath | append: "qs-4x-flows-result-load-Product.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="Load Products in the list of input flows" imgclass="img-results" tab="  " %}


## Customer

Perform the same steps for **Customer**.
{% include conrefs/conref-qs-4x-create-input-flow.md imgpath=var-imgpath entityname="Customer" inputflowname="Load Customers" fullsteps=false %}


## Order

Perform the same steps for **Order**.
{% include conrefs/conref-qs-4x-create-input-flow.md imgpath=var-imgpath entityname="Order" inputflowname="Load Orders" fullsteps=false %}


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
