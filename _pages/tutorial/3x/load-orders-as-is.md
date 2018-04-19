---
layout: inner
title: Getting Started Tutorial 3.x<br>Load the Orders As-Is
lead_text: ''
permalink: /tutorial/load-orders-as-is/
---

## Ingest Order Data As-Is

Use the QuickStart Input Flow wizard to ingest the order data into MarkLogic.

1. <i class="fa fa-hand-pointer-o"></i> Click **Load Orders** under **Input Flows**.
2. Use the file browser to select the **input/orders** directory.
3. Under **General Options**, change **Input File Type** to **Delimited Text**.

![Configure Load Orders]({{site.baseurl}}/images/3x/load-orders-as-is/configure-load-orders-1.png)

Now expand **Delimited Text Options** and turn on **Generate URI?**.  
_This setting tells MLCP to generate a unique URI for every document it creates. Normally for CSV files it would use the value in the first column. If there are repeat values then we would end up overwriting documents. This ensures the uniqueness of the URIs._{:.smaller} 

![Generate Uri]({{site.baseurl}}/images/3x/load-orders-as-is/generate-uri-option.png)

To recap, you should have set the following options:

- Input Files -> Current Folder -> input/orders _(adjust for your folder structure)_{:.smaller}
- General Options -> Input File Type -> Delimited Text
- Delimited Text Options -> Generate URI? -> ON

Finally, <i class="fa fa-hand-pointer-o"></i> click **RUN IMPORT**{:.blue-button} to start the data load.

![Run Import]({{site.baseurl}}/images/3x/load-orders-as-is/load-orders-run.png)

## Review Your Finished Input Job

Let's take a moment to look at the Jobs view. <i class="fa fa-hand-pointer-o"></i> Click **Jobs** in the top navigation bar.

![Click Jobs]({{site.baseurl}}/images/3x/load-orders-as-is/click-jobs-2.png)

In the Jobs view, you will see a list of previously run jobs, including the most recent one. This interface is searchable either via free text or via the facets on the left.

![Jobs View]({{site.baseurl}}/images/3x/load-orders-as-is/jobs-view-2.png)

## Up Next

[Modeling the Order Entity](../modeling-order-entity/)
