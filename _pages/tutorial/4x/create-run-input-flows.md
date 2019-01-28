---
layout: inner
title: Tutorial - Create and Run the Input Flows
permalink: /tutorial/4x/create-run-input-flows/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Create the Input Flows

An **input flow** is a series of plugins that ingest data into the staging data hub. Input flows wrap incoming raw data in envelopes and store them in the staging database. The envelopes contain metadata, including those related to lineage and provenance; for example, who loaded the data, when it was loaded, and where it came from.

The QuickStart **Run Input Flow** wizard enables you to quickly start loading data without learning the intricacies of the underlying tools. When you run your flow, QuickStart loads data into MarkLogic Server using [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp){:target="_blank"} (MLCP), a tool capable of importing a large volume of data into MarkLogic Server.

In this section, we create and run an input flow for each entity: `Product`, `Customer`, and `Order`. Each input flow performs the following:

  - Load data from the sample data directory.
  - Interpret the input data as delimited text (CSV), where each row is considered a *document*.
  - Automatically generate a unique URI to identify the wrapped document as it is added to the staging server. This prevents one document from overwriting another if multiple rows contain the same value in the first field.


## Product

{% include conrefs/conref-qs-4x-create-run-input-flow.md
     imgpath=var-imgpath
     entityname="Product"
     inputflowname="Load Products"
     datadir="input\products\games"
     jobname="Load Products"
     fullsteps=true
%}


## Order

Perform the same steps for **Order**.
{% include conrefs/conref-qs-4x-create-run-input-flow.md
     imgpath=var-imgpath
     entityname="Order"
     inputflowname="Load Orders"
     datadir="input\orders"
     jobname="Load Orders"
     fullsteps=false
%}


## Customer

Perform the same steps for **Customer**.
{% include conrefs/conref-qs-4x-create-run-input-flow.md
     imgpath=var-imgpath
     entityname="Customer"
     inputflowname="Load Customers"
     datadir="input\customers"
     jobname="Load Customers"
     fullsteps=false %}


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
