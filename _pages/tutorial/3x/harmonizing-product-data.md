---
layout: inner
title: Getting Started Tutorial 3.x<br>Harmonizing the Product Data
lead_text: ''
permalink: /tutorial/harmonizing-product-data/
---

Now that we have modeled the Product entity we can use the Data Hub Framework's code scaffolding to create boilerplate for harmonizing our data. Recall from earlier that the Data Hub Framework can use the Entity Services model definition to create code.

In this exercise, we will create a harmonize flow for Product, and then run it to create harmonized Product entities.

To begin, click **Flows** in the top navigation bar.

![Click Flows]({{site.baseurl}}/images/3x/harmonizing-product-data/select-flows.png)

## Create the Harmonize Flow

Use the following procedure to create a Product harmonize flow:

1. Click **+** next to **Harmonize Flows**
1. Type **Harmonize Products** in the **Harmonize Flow Name** field
1. Click **CREATE**. A new harmonize flow is created.

The following picture summarizes the steps for creating the Harmonize Products flow:
![Create Product Harmonize Flow]({{site.baseurl}}/images/3x/harmonizing-product-data/create-product-harmonize-flow.png)

Our new flow uses the default code generation option of **Create Structure from Entity Definition**. This means that the Data Hub Framework will create boilerplate code based on our entity model. The generated code creates and initializes harmonized entities. You can customize the code before you run the flow.

## Harmonization Flow Basics

Harmonize flows are designed to operate on your data in batches. A set of plugins orchestrate the processing and provide hooks for domain-specific code. A harmonization flow uses the following plugins:

- **collector**: returns a list of strings to operate on
- **content**: returns data to put into the content section of the envelope
- **headers**: returns data to put into the headers section of the envelope
- **main**: orchestrates the behavior of the other plugins
- **triples**: returns data to put into the triples section of the envelope
- **writer**: receives the final envelope and writes it to the database. _You can do whatever you like in the writer. The default code inserts the envelope into the database, but you could push the envelope onto a message bus or send a tweet if you like._

The collector plugin returns a list of things to operate on. The Data Hub Framework then breaks the list of things into parallel batches of a configurable size and sends each item to the (content, headers, triples, writer) plugins as a transaction. The main plugin receives id values from the collector and orchestrates the behavior of the other plugins.

If you are not interested in running harmonization flows as batches, the framework does [provide ways](../../faqs/#how-can-i-run-a-harmonize-flow-immediately-for-1-document) to run a harmonize flow on-demand for single items.

The following diagram shows the steps in a harmonize flow:

![Harmonize Flow Overview]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonize-flow-diagram.png)

## Configure the Harmonize Flow 

You can run a harmonize flow from the **Flow Info** tab. The other tabs allow you to edit the source code for the generated plugins. Harmonize flows have six plugins: collector, content, headers, main, triples, and writer.

Click the **Harmonize Products** flow. You see the tabs available for running and configuring the flow:

![Harmonize Flow Overview]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonize-flow-overview.png)

----

### Collector Plugin

First, we will examine the collector plugin. Click the **Collector** tab.

You see the default code generated for the collector. This code returns a list of URIs, one for every Product document in the staging database. We are using URIs because we intend to create a harmonized document for each ingested staging document.

The following options are passed into the collector plugin by default:

- **entity**: the name of the entity this plugin belongs to
- **flow**: the name of the flow this plugin belongs to
- **flowType**: the type of flow being run (input or harmonize)

The genterated code uses [cts.uris](https://docs.marklogic.com/cts.uris) to get values from the URI lexicon. We pass in [cts.collectionQuery](https://docs.marklogic.com/cts.collectionQuery) as the third parameter to constrain our results to only the URIs for documents in the Product collection. We are using `options.entity` as the parameter. The Data Hub Framework passes in options from Java to the plugins.

<div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Product/harmonize/Harmonize Products/collector/collector.sjs"></div>

We do not need to make any changes to the collector plugin, so we will move on to the content plugin.

----

### Content Plugin

Click the **Content** tab. You see the code generated for the content plugin.

The `createContent()` function receives an id as the first parameter. The id can be anything: a URI, a relational row id, a twitter handle, a random number. It's up to you to decide how to use that id to harmonize your data. For this flow, the id is the URI for a staging product document. 

The only modification we need to make to this file is to change the way we determine the value of the `sku` property. Recall that the corresponding property in our source data can be named either `sku` or `SKU`. We change the code to use whichever source property is available.

Follow these steps to modify the code:

1. Find the `extractInstanceProduct` function.
1. Find the line in `extractInstanceProduct` that sets the `sku` property.
1. Change that line to look like the following:

```
let sku = xs.string(source.sku || source.SKU);
```

Click **Save** to save your changes.

Here is the final content.sjs code:

<div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Product/harmonize/Harmonize Products/content/content.sjs"></div>

## Run the Flow

We do not need to modify the code for any of the other plugins, so we can now run the flow.

1. Click the **Flow Info** tab.
1. Click **Run Harmonize** to start the flow.

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
