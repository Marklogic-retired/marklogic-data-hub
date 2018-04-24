---
layout: inner
title: Getting Started Tutorial 3.x<br>Harmonizing the Product Data
lead_text: ''
permalink: /tutorial/harmonizing-product-data/
---

Now that we have modeled the Product entity we can use the Data Hub Framework's code scaffolding to create boilerplate for harmonizing our data. Recall from earlier that the Data Hub Framework can use the Entity Services model definition to create code.

<i class="fa fa-hand-pointer-o"></i> Click **Flows** in the top navigation bar.

![Click Flows]({{site.baseurl}}/images/3x/harmonizing-product-data/click-flows-2.png)

1. <i class="fa fa-hand-pointer-o"></i> Click **+** next to **Harmonize Flows**
1. Type **Harmonize Products** in the **Harmonize Flow Name** field
1. <i class="fa fa-hand-pointer-o"></i> Click **CREATE**{:.blue-button}.

This time we want to use the default option of **Create Structure from Entity Definition**. This means that the Data Hub Framework will create boilerplate code based on our entity model. The code will prepopulate the fields we need to add.

<!--- DHFPROD-646 TODO Pre-populate them in what/where? Add to what/where? -->

![Create Product Harmonize Flow]({{site.baseurl}}/images/3x/harmonizing-product-data/create-product-harmonize-flow.png)

1. <i class="fa fa-hand-pointer-o"></i> Click the **Harmonize Products** flow. 

You can run the harmonize flow from the **Flow Info** tab. The other tabs allow you to edit the source code for the generated plugins. Take note that there are six plugins for harmonize flows: collector, content, headers, main, triples, and writer.

![Harmonize Flow Overview]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonize-flow-overview.png)

Harmonize flows were designed to be run as batch jobs. To support this batch running, the Data Hub Framework exposes a collector plugin whose purpose is to return a list of things to operate on. The Data Hub Framework then breaks the list of things into parallel batches of a configurable size and sends each and every single thing to the (content, headers, triples, writer) plugins as a transaction. The main plugin receives id values from the collector and orchestrates the behavior of the other plugins.

If you are not interested in running harmonization flows as batches we do [provide ways](../../faqs/#how-can-i-run-a-harmonize-flow-immediately-for-1-document) for running them on-demand for single items.

![Harmonize Flow Overview]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonize-flow-diagram.png)

- **collector**: returns a list of strings to operate on
- **content**: returns data to put into the content section of the envelope
- **headers**: returns data to put into the headers section of the envelope
- **main**: orchestrates the behavior of the other plugins
- **triples**: returns data to put into the triples section of the envelope
- **writer**: receives the final envelope and writes it to the database. _You can do whatever you like in the writer. The default code inserts the envelope into the database, but you could push the envelope onto a message bus or send a tweet if you like._

<i class="fa fa-hand-pointer-o"></i> Click the **Collector** tab.

![Click Collector Tab]({{site.baseurl}}/images/3x/harmonizing-product-data/click-collector1.png)

<hr>

### Collector Plugin

This collector code is returning a list of URIs, one for every product document in the staging database. We are using URIs because we intend to create one harmonized document for every ingested staging document.

The code you see is using [cts.uris](https://docs.marklogic.com/cts.uris) to get values from the URI lexicon. We pass in [cts.collectionQuery](https://docs.marklogic.com/cts.collectionQuery) as the third parameter to constrain our results to only the URIs for documents in the **Product** collection. We are using `options.entity` as the parameter. The Data Hub Framework passes in options from Java to the plugins.

The default options passed in to the plugin are:

- **entity**: the name of the entity this plugin belongs to
- **flow**: the name of the flow this plugin belongs to
- **flowType**: the type of flow being run (input or harmonize)

<div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Product/harmonize/Harmonize Products/collector/collector.sjs"></div>

<i class="fa fa-hand-pointer-o"></i> Click the **Content** tab.

![Click Content Tab]({{site.baseurl}}/images/3x/harmonizing-product-data/click-content1.png)

<hr>

### Content Plugin

The `createContent()` function receives an id as the first parameter. The id can be anything: a URI, a relational row id, a twitter handle, a random number. It's up to you to decide how to use that id to harmonize your data. For this flow, the id is the URI for a staging product document. 

The only modification we need to make to this file is to change the way we look up the sku.

```
let sku = xs.string(source.sku || source.SKU);
```

This change will use either sku or SKU depending on which one is found. This covers the case we are trying to solve of two separate field names.

Here is the final content.sjs code:

<div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Product/harmonize/Harmonize Products/content/content.sjs"></div>

1. Make the code change. 
1. <i class="fa fa-hand-pointer-o"></i> Click **SAVE**{:.blue-button}.

![Edit and Save Content]({{site.baseurl}}/images/3x/harmonizing-product-data/save-product-content.png)

<i class="fa fa-hand-pointer-o"></i> Click the **Flow Info** tab.

![Click Flow Info]({{site.baseurl}}/images/3x/harmonizing-product-data/click-flow-info1.png)

Let's run the flow. <i class="fa fa-hand-pointer-o"></i> Click **RUN HARMONIZE**{:.blue-button} to start the flow.

![Run Product Harmonize]({{site.baseurl}}/images/3x/harmonizing-product-data/run-product-harmonize.png)

## Check out the Harmonized Products

After running the input flow, we verified that the job finished. Let's do that for the harmonize flow.

1. <i class="fa fa-hand-pointer-o"></i> Click **Jobs** to view your jobs.
1. Make sure the job has finished and appears in the list.

![Harmonized Products Jobs]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonized-products-jobs.png)

Now let's explore our harmonized data.

1. <i class="fa fa-hand-pointer-o"></i> Click **Browse Data** to view your data.
1. Select **Final** in the database menu.

The search results should show the harmonized documents.

![Harmonized Products]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonized-products.png)

<i class="fa fa-hand-pointer-o"></i> Click a result to see the raw data.

![Harmonized Product Detail]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonized-product-details.png)

## Up Next

Congratulations! You just loaded and harmonized your product data. Up next is doing the same thing for the order data.

[Create the Order Entity](../create-order-entity/)
