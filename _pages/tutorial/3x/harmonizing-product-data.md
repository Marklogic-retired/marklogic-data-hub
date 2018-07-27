---
layout: inner
title: Getting Started Tutorial 3.x<br>Harmonize the Product Data
lead_text: ''
permalink: /tutorial/harmonizing-product-data/
---

Now that we have modeled Product and defined a model-to-model mapping for it, we can use the Data Hub Framework to harmonize our source data with our entity model. Harmonization creates canonical entity instances containing the necessary parts of your source data.

Recall from earlier that the Data Hub Framework can use the Entity Services model definition and a mapping to generate harmonization code. In this exercise, we will do the following:

1. Create a harmonize flow that uses a model-to-model mapping to guide harmonization code generation.
1. Run the flow to create harmonized Product entities in the FINAL database.

To begin, click **Flows** in the top navigation bar.

![Click Flows]({{site.baseurl}}/images/3x/harmonizing-product-data/select-flows.png)

## Create the Harmonize Flow

Use the following procedure to create a Product harmonize flow:

1. Click **+** next to **Harmonize Flows**.
1. Type **Harmonize Products** in the **Harmonize Flow Name** field.
1. Click on **ProductMapping** under Mapping Generation.
1. Click **CREATE**. A new harmonize flow is created.

The following picture summarizes the steps for creating the Harmonize Products flow:
![Create Product Harmonize Flow]({{site.baseurl}}/images/3x/harmonizing-product-data/create-product-harmonize-flow.png)

When you create the flow, QuickStart generates harmonization code based on the Product model and the **ProductMapping** model-to-model mapping and deploys the code to MarkLogic.

Though you can customize the harmonization code, it is not necessary. The mapping expressed everything needed to create Product entities. For example, the mapping caused the generated code to include the following assignments for initializing a Product instance:
```
/* These mappings were generated using mapping: ProductMapping, version: 1 on ... */
let sku = !fn.empty(source.xpath('//SKU')) ? xs.string(fn.head(source.xpath('//SKU'))) : null;
let price = !fn.empty(source.xpath('//price')) ? xs.decimal(fn.head(source.xpath('//price'))) : null;
```
We'll dig deeper into the generated code when we work with our second entity later in this tutorial.

## Run the Flow

When you run a harmonization flow, the Data Hub Framework uses the data in your **STAGING** database to generate canonical entity instances in **FINAL** database.

Use the following procedure to run a flow:

1. Click the **Flow Info** tab if you are not already on that tab.
1. Click **Run Harmonize** to start the flow. A pop-up appears at the bottom of the page indicating your harmonization job has started.

When harmonization completes, a notification pop-up appears at the bottom of the page.

## Check the Harmonized Job Status

Recall that we verified the job status after running the input flow. We will now do the same thing for the harmonize flow.

1. Click **Jobs** in the top navigation bar to view your jobs.
1. Verify the harmonization job appears in the list and has a FINISHED status.

![Harmonized Products Jobs]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonized-products-jobs.png)

## Explore the Harmonized Data

To explore the harmonized data:

1. Click **Browse Data** in the top navigation bar to display the data browser.
1. Select **Final** in the database dropdown. The search results show the harmonized documents.
1. Click a result to see the harmonized data. For example:

![Harmonized Product Detail]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonized-product-details.png){:.screenshot-border}

## Up Next

Congratulations! You just loaded and harmonized your product data. Up next is doing the same thing for the order data.

[Create the Order Entity](../create-order-entity/)
