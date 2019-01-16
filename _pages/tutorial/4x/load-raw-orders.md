---
layout: inner
title: Tutorial - Load the Raw Orders Data
permalink: /tutorial/4x/load-raw-orders/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}
{% assign var-jobname = "Load Orders" %}


# Tutorial: Load the Raw Orders Data

## Ingest the Raw Orders Data

In this exercise, you will configure and run an input flow to load the `Orders` data, using the same procedure that we used to load the `Products` data.

We will configure the flow to do the following:

* Load data from the sample data directory `input/orders`.
* Interpret the input data as delimited text (CSV).
* Automatically generate unique URIs as the data is loaded. This prevents one document from overwriting another if multiple rows contain the same value in the first field.

{% include conrefs/conref-qs-load-raw-data.md imgpath=var-imgpath entityname="Orders" datadir="input\orders" jobname=var-jobname %}


## Review Your Finished Input Job

As we did with the `Products` data, we will use the QuickStart job viewer to view the results of the `{{ var-jobname }}` job.

{% include conrefs/conref-qs-jobs.md imgpath=var-imgpath entityname="Order" jobname=var-jobname %}

**Result**

If the job completed successfully, the report would show:
- `OUTPUT_RECORDS_FAILED: 0`
- the same value for both `INPUT_RECORDS` and `OUTPUT_RECORDS`

{% assign full-imgpath=var-imgpath | append: "qs-4x-jobs-job-output-Order.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="Job Output" class="img-small" tab="  " %}


{% include prev-next-nav.html
  prevtext="Create the Order Input Flow"
  prevlink="/tutorial/4x/create-order-input-flow/"
  increl="tutorial-toc.md"
  nexttext="Model the Order Entity"
  nextlink="/tutorial/4x/modeling-order-entity/"
%}
