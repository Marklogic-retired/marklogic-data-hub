---
layout: inner
title: Getting Started Tutorial 3.x<br>Load the Product Data As-Is
lead_text: ''
permalink: /tutorial/load-products-as-is/
---

Now you will use the QuickStart input flow wizard to load the product data into MarkLogic. The QuickStart application will use the settings you are about to specify to run [MarkLogic Content Pump](https://docs.marklogic.com/guide/mlcp){:target="_blank"} (MLCP) for you. MLCP is a command line tool for loading large amounts of data into MarkLogic. This input flow wizard is helpful because you don't have to learn the intricacies of the MLCP command line to get started.

1. <i class="fa fa-hand-pointer-o"></i> Click **Load Products** under **Input Flows**.
1. Use the file browser to select the **input/products** directory.
1. Under **General Options**, change **Input File Type** to **Delimited Text**.

![Configure Load Products]({{site.baseurl}}/images/3x/load-products-as-is/configure-load-products-1.png)

Now expand **Delimited Text Options** and turn on **Generate URI?**.  
_This setting tells MLCP to generate a unique URI for every document it creates. Normally for CSV files it would use the value in the first column. If there are repeat values then we would end up overwriting documents. This ensures the uniqueness of the URIs._{:.smaller}

![Generate Uri]({{site.baseurl}}/images/3x/load-products-as-is/generate-uri-option.png)

To recap, you should have set the following options:

- Input Files -> Current Folder -> input/products _(adjust for your folder structure)_{:.smaller}
- General Options -> Input File Type -> Delimited Text
- Delimited Text Options -> Generate URI? -> ON

Finally, <i class="fa fa-hand-pointer-o"></i> click **RUN IMPORT**{:.blue-button} to start the data load.

![Run Import]({{site.baseurl}}/images/3x/load-products-as-is/load-products-run.png)

You will see a progress bar during the data load.

![Progress Bar]({{site.baseurl}}/images/3x/load-products-as-is/progress-bar.png)

When it is finished you will see a popup message indicating that the job has completed.

![Toast Message]({{site.baseurl}}/images/3x/load-products-as-is/toast-message.png)

## Review Your Finished Job

Let's take a moment to look at the Jobs tab. <i class="fa fa-hand-pointer-o"></i> Click **Jobs** in the top navigation bar.

![Click Jobs]({{site.baseurl}}/images/3x/load-products-as-is/click-jobs-1.png)

Under Jobs you will see a list of previously run jobs. This interface offers <strong>free-text search</strong> and <strong>faceted navigation</strong>.

![Jobs View]({{site.baseurl}}/images/3x/load-products-as-is/jobs-view.png)

Let's inspect the output of MLCP.

1. <i class="fa fa-hand-pointer-o"></i> Click **&gt;_**{:.blue-button} to see the output.
2. If everything ran successfully you should see **OUTPUT_RECORDS_COMMITTED: 450** in the output.
3. <i class="fa fa-hand-pointer-o"></i> Click the **x** icon to close the dialog.

![MLCP Output]({{site.baseurl}}/images/3x/load-products-as-is/mlcp-output.png)

## Inspect the Trace Logs for your Job

Now let's look at the trace output for our job. Tracing is a debugging feature that logs inputs and outputs to each of the plugins that run during a flow. This feature is useful for helping you see where along the chain something may have gone wrong.

<i class="fa fa-hand-pointer-o"></i> Click the dark blue **lightning bolt** icon <i class="fa fa-bolt"></i> on the far right of the job row. This will show only traces for that job. Alternatively, you can click Traces in the top navigation bar to see all traces.

![Click Lightning Bolt]({{site.baseurl}}/images/3x/load-products-as-is/click-lightning-bolt.png)

Similar to the Jobs view, the Traces view offers <strong>free-text search</strong> and <strong>faceted navigation</strong>.

![Trace View]({{site.baseurl}}/images/3x/load-products-as-is/trace-view.png)

<i class="fa fa-hand-pointer-o"></i> Click one of the rows in the Traces table to see a detailed view of the trace.

The trace detail view allows you to click each plugin in the flow to see the inputs and outputs. You can also see the **identifier** that was being processed as well as the time each plugin took to execute.

![Trace Detail View]({{site.baseurl}}/images/3x/load-products-as-is/trace-details.png)

## Up Next

[Browse and Understand the Product Data](../browse-understand-product-data/)
