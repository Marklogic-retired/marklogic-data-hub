---
layout: inner
title: Tutorial - Load the Raw Products Data
permalink: /tutorial/4x/load-raw-products/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}
{% assign var-jobname = "Load Products" %}


# Tutorial: Load the Raw Products Data

## Ingest the Raw Products Data

In this exercise, you will configure and execute an input flow to load the `Products` data.

The QuickStart input flow wizard enables you to quickly start loading data without learning the intricacies of the underlying tools. When you run your flow, QuickStart loads data into MarkLogic Server using [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp){:target="_blank"} (MLCP), a tool capable of importing a large volume of data into MarkLogic Server.

We will configure the flow to do the following:

* Load data from the sample data directory `input/products/games`.
* Interpret the input data as delimited text (CSV).
* Automatically generate unique URIs as the data is loaded. This prevents one document from overwriting another if multiple rows contain the same value in the first field.

{% include conrefs/conref-qs-load-raw-data.md imgpath=var-imgpath entityname="Product" datadir="input\products\games" jobname=var-jobname %}


## Review Your Finished Job

We will use the QuickStart job viewer to view the results of the `{{ var-jobname }}` job. This interface offers free-text search and faceted navigation.

{% include conrefs/conref-qs-jobs.md imgpath=var-imgpath entityname="Product" jobname=var-jobname %}

**Result**

If the job completed successfully, the report would show:
- `OUTPUT_RECORDS_FAILED: 0`
- the same value for both `INPUT_RECORDS` and `OUTPUT_RECORDS`

{% assign full-imgpath=var-imgpath | append: "qs-4x-jobs-job-output-Product.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="Job Output" class="screenshot" %}


## Inspect the Trace Logs for your Job

Tracing is a debugging feature that logs inputs and outputs to each of the plugins that run during a flow. This feature is useful for helping you see where along the chain something may have gone wrong.

To view the trace output from your `{{ var-jobname }}` job, click the **lightning bolt** icon (<i class="fa fa-bolt"></i>) on the far right of the job row. Alternatively, you can click **Traces** in the top navigation bar to see all traces.

![Click Lightning Bolt]({{site.baseurl}}/images/3x/load-raw-products/click-lightning-bolt.png){:.screenshot-border}

Click one of the rows in the Traces table to see the trace detail view. At the top of the detailed view, you see information about this trace, including the **identifier** whose processing generated it.

You also see a flow diagram that enables you to examine the inputs and outputs for each stage of the flow. Each box in the diagram represents a plugin that handles a stage of the flow. When you click on a box, the input to and output from that plugin is displayed, along with that plugin's execution time.

![Trace Detail View]({{site.baseurl}}/images/3x/load-raw-products/trace-details.png){:.screenshot-border}


{% include prev-next-nav.html
  prevtext="Create the Product Input Flow"
  prevlink="/tutorial/4x/create-product-input-flow/"
  increl="tutorial-toc.md"
  nexttext="Browse and Understand the Product Data"
  nextlink="/tutorial/4x/browse-understand-product-data/"
%}
