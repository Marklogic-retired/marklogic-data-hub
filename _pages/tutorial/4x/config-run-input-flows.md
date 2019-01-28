---
layout: inner
title: Tutorial - Configure and Run the Input Flows
permalink: /tutorial/4x/config-run-input-flows/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Configure and Run the Input Flows

The QuickStart input flow wizard enables you to quickly start loading data without learning the intricacies of the underlying tools. When you run your flow, QuickStart loads data into MarkLogic Server using [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp){:target="_blank"} (MLCP), a tool capable of importing a large volume of data into MarkLogic Server.

In this exercise, we configure each input flow to do the following:
  - Load data from the sample data directory.
  - Interpret the input data as delimited text (CSV).
  - Wrap the raw data into envelopes.
  - Automatically generate unique URIs as the data is added to the staging server. This prevents one document from overwriting another if multiple rows contain the same value in the first field.

Then we execute the input flow.


## Product

{% include conrefs/conref-qs-4x-config-run-input-flows.md imgpath=var-imgpath entityname="Product" datadir="input\products\games" jobname="Load Products" fullsteps=true %}


## Customer

Perform the same steps for **Customer**.
{% include conrefs/conref-qs-4x-config-run-input-flows.md imgpath=var-imgpath entityname="Customer" datadir="input\customers" jobname="Load Customers" fullsteps=false %}


## Order

Perform the same steps for **Order**.
{% include conrefs/conref-qs-4x-config-run-input-flows.md imgpath=var-imgpath entityname="Order" datadir="input\orders" jobname="Load Orders" fullsteps=false %}


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
