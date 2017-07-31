---
layout: inner
title: Getting Started Tutorial 2.x<br>Load the Product data As-Is
lead_text: ''
permalink: /getting-started-2x/load-products-as-is
---

Now you will use the QuickStart Input Flow wizard to load the product data into MarkLogic. The QuickStart application will use the settings you are about to specify to run [MarkLogic Content Pump MLCP](https://docs.marklogic.com/guide/mlcp){:target="_blank"} for you. MLCP is a command line tool for loading large amounts of data into MarkLogic. This Input Flow Wizard is quite awesome because you don't have to learn the intricacies of the MLCP command line to get started.

1. <i class="fa fa-hand-pointer-o"></i> Click on **Load Products** under **Input Flows**.
2. Use the file browser to select the **input\products** directory.
3. Under **General Options**, change **Input File Type** to **Delimited Text**.
![Configure Load Products]({{site.baseurl}}/images/2x/configure-load-products-1.png)
4. Now expand **Delimited Text Options** and turn on **Generate URI?**.  
_This settings tells MLCP to generate a unique URI for every document it creates. Normally for CSV files it would use the value in the first column. If there are repeat values then we would end up overwriting documents. This ensures the uniqueness of the URIs._{:.smaller}  
![Generate Uri]({{site.baseurl}}/images/2x/generate-uri-option.png)

To Recap, you should have set the following options:

- Input Files -> Current Folder -> c:\my-data-hub\input\products _**(adjust for your folder structure)**_{:.smaller}
- General Options -> Input File Type -> Delimited Text
- Delimited Text Options -> Generate URI? -> ON

Finally, <i class="fa fa-hand-pointer-o"></i> click the **RUN IMPORT**{:.blue-button} button to start the data load.

![Run Import]({{site.baseurl}}/images/2x/load-products-run.png)

You will see a progress bar during the data load.

![Progress Bar]({{site.baseurl}}/images/2x/progress-bar.png)

When it is finished you will see a _toast_ _(named such because it pops up load bread in a toaster)_{:.smaller} message indicating that the job completed.

![Toast Message]({{site.baseurl}}/images/2x/toast-message.png)

## Review Your Finished Job

Let's take a moment to look at the Jobs tab. <i class="fa fa-hand-pointer-o"></i> Click the **Jobs** tab in the top navigation bar.

![Click Jobs]({{site.baseurl}}/images/2x/click-jobs-1.png)

On the Jobs tab you will see a list of previously run jobs. This interface is searchable either via free text or via the facets on the left.

![Jobs View]({{site.baseurl}}/images/2x/jobs-view.png)

Let's inspect the Output of MLCP.

<i class="fa fa-hand-pointer-o"></i> Click on the **&gt;_**{:.blue-button} button to see the output.

If everything ran successfully you should see **OUTPUT_RECORDS_COMMITTED: 450** in the output.

<i class="fa fa-hand-pointer-o"></i> Now click on the **x** icon to close the dialog.

![MLCP Output]({{site.baseurl}}/images/2x/mlcp-output.png)

## Inspect the Trace Logs for your Job

Now let's look at the Trace Output for our Job. Tracing is a debugging feature that logs inputs and outputs to each of the plugins that run during a flow. This feature is useful for helping you see where along the chain something may have gone wrong.

<i class="fa fa-hand-pointer-o"></i> Click on the dark blue **lightning bolt** icon <i class="fa fa-bolt"></i> on the far right of the Jobs table. This will show only traces for that Job. Alternatively, you can click on the Traces tab in the top navigation bar to see all Traces.

![Click Lightning Bolt]({{site.baseurl}}/images/2x/click-lightning-bolt.png)

Similar to the Jobs tab, the trace tab offers Free text search and faceted navigation.

![Trace View]({{site.baseurl}}/images/2x/trace-view.png)

<i class="fa fa-hand-pointer-o"></i> Click on one of the rows in the Trace table so see a detailed view of the trace.

The Trace details view allows you to click on each plugin in the Flow to see the inputs and outputs. You can also see the **identifier** that was being processed as well as the time each plugin took to execute.

![Trace Details View]({{site.baseurl}}/images/2x/trace-details.png)

## Up Next

[Harmonizing Products > Browse and Understand the Product Data](/marklogic-data-hub/getting-started-2x/browse-understand-product-data)
