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
2. Under **Input Files**, use the file browser to select the **input/orders** directory.
3. Under **General Options**, change **Input File Type** to **Delimited Text**.
4. Under **Delimited Text Options**, slide the **Generate URI?** slider to the right, enabling automatic unique URI generation.
5. Scroll to the bottom of the wizard and click **Save Options**.
6. Click **Run Import**. MarkLogic begins loading data. Quickstart displays a progress bar at the bottom of your browser.

When the load finishes, QuickStart displays a completion notice at the bottom of your browser.

## Review Your Finished Input Job

As when we loaded product data, we will inspect the status of our Load Orders job.

1. Click **Jobs** in the top navigation bar.
2. Examine the Load Orders job results. This job should be the most recent run.

## Up Next

[Modeling the Order Entity](../modeling-order-entity/)
