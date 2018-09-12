---
layout: inner
title: Getting Started Tutorial 3.x<br>Load the Orders As-Is
lead_text: ''
permalink: /tutorial/load-orders-as-is/
---

## Ingest Order Data As-Is

In this exercise, you will configure and run an input flow to load order data. We use the same procedure that we used to load product data.

We will configure the flow to do the following:

* Load data from the sample data directory input/order.
* Interpret the input data as delimited text (CSV).
* Automatically generate unique URIs as the data is loaded. This prevents one document from overwriting another if multiple rows contain the same value in the first field.

Follow these steps to configure the input flow:

1. Click **Load Orders** under the Orders **Input Flows**. The Run Input Flow wizard appears.
1. Under **Input Files**, use the file browser to select the **input/orders** directory.

    ![Input Files]({{site.baseurl}}/images/3x/load-orders-as-is/input-files.png){:.screenshot-border}
    
1. Under **General Options**, change **Input File Type** to **Delimited Text**.

    ![General Options]({{site.baseurl}}/images/3x/load-orders-as-is/general-options.png)
    
1. Under **Delimited Text Options**, slide the **Generate URI?** slider to the right, enabling automatic unique URI generation.
    
    ![Delimited Text Options]({{site.baseurl}}/images/3x/load-orders-as-is/delimited-text-options.png)

1. Scroll to the bottom of the wizard and click **SAVE OPTIONS**.
1. Click **RUN IMPORT**. MarkLogic begins loading data. Quickstart displays a progress bar at the bottom of your browser.

When the load finishes, QuickStart displays a completion notice at the bottom of your browser.

## Review Your Finished Input Job

As when we loaded product data, we will inspect the status of our Load Orders job.

Click **Jobs** in the top navigation bar to open the job viewer:

![Click Jobs]({{site.baseurl}}/images/3x/load-orders-as-is/select-jobs.png)

Examine the Load Orders job results. This job should be the most recent run.

## Up Next

[Modeling the Order Entity](../modeling-order-entity/)
