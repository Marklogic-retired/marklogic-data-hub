---
layout: inner
title: Getting Started Tutorial 2.x<br>Load the Orders As-Is
lead_text: ''
permalink: /tutorial/load-orders-as-is/
---

## Ingest Order Data As-Is

Use the QuickStart Input Flow wizard to ingest the order data into MarkLogic.

1. <i class="fa fa-hand-pointer-o"></i> Click on **Load Orders** under **Input Flows**.
2. Use the file browser to select the **input\orders** directory.
3. Under **General Options**, change **Input File Type** to **Delimited Text**.
![Configure Load Orders]({{site.baseurl}}/images/2x/configure-load-orders-1.png)
4. Now expand **Delimited Text Options** and turn on **Generate URI?**.  
_This settings tells MLCP to generate a unique URI for every document it creates. Normally for CSV files it would use the value in the first column. If there are repeat values then we would end up overwriting documents. This ensures the uniqueness of the URIs._  
![Generate Uri]({{site.baseurl}}/images/2x/generate-uri-option.png)

To Recap, you should have set the following options:

- Input Files -> Current Folder -> c:\my-data-hub\input\orders _**(adjust for your folder structure)**_
- General Options -> Input File Type -> Delimited Text
- Delimited Text Options -> Generate URI? -> ON

Finally, <i class="fa fa-hand-pointer-o"></i> click the **RUN IMPORT**{:.blue-button} button to start the data load.

![Run Import]({{site.baseurl}}/images/2x/load-orders-run.png)

## Review Your Finished Input Job

Let's take a moment to look at the Jobs tab. <i class="fa fa-hand-pointer-o"></i> Click the **Jobs** tab in the top navigation bar.

![Click Jobs]({{site.baseurl}}/images/2x/click-jobs-2.png)

On the Jobs tab you will see a list of previously run jobs. This interface is searchable either via free text or via the facets on the left.

![Jobs View]({{site.baseurl}}/images/2x/jobs-view-2.png)

## Up Next

[Harmonizing Orders > Modeling the Order Entity](modeling-order-entity.md)
