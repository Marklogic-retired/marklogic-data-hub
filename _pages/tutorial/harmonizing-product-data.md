---
layout: inner
title: Getting Started Tutorial 2.x<br>Browse and Understand the Product Data
lead_text: ''
permalink: /tutorial/harmonizing-product-data/
---

## Harmonizing the Product Data

Now that we have modeled the Product entity we can use the Data Hub Framework's code scaffolding to create a boilerplate for Harmonizing our data. Recall from earlier that the Data Hub Framework can use the Entity Services model definition to create code.

<i class="fa fa-hand-pointer-o"></i> Click on the **Flows** tab in the top navigation bar.

![Click Flows]({{site.baseurl}}/images/2x/click-flows-2.png)

1. <i class="fa fa-hand-pointer-o"></i> Click on the **+** icon next to **Harmonize Flows**
1. Type **Harmonize Products** into the **Harmonize Flow Name** field
1. <i class="fa fa-hand-pointer-o"></i> Click the **CREATE**{:.blue-button} button

This time we want to use the default option of **Create Structure from Entity Definition**. This means that the Data Hub Framework will create boilerplate code based on our Entity model. The code will pre-populate the fields we need to add.

![Create Product Harmonize Flow]({{site.baseurl}}/images/2x/create-product-harmonize-flow.png)

<i class="fa fa-hand-pointer-o"></i> Click on the **Harmonize Products** flow. You can run the harmonize flow from the **Flow Info** tab. The other tabs allow you to edit the source code for the generated plugins. Take note that there are five plugins for harmonize flows: collector, content, headers, triples, writer.

![Harmonize Flow Overview]({{site.baseurl}}/images/2x/harmonize-flow-overview.png)

There are five plugins because harmonize flows typically run as batch jobs _(although not always)_{:.smaller}. The Data Hub Framework first invokes the collector inside of MarkLogic. The collector returns a list of strings. The Data Hub Framework then breaks those strings into parallel batches and sends each one to the (content, headers, triples, writer) plugins as a transaction.

![Harmonize Flow Overview]({{site.baseurl}}/images/2x/harmonize-flow-diagram.png)

- **collector**: returns a list of strings to operate on
- **content**: returns data to put into the content section of the envelope
- **headers**: returns data to put into the headers section of the envelope
- **triples**: returns data to put into the triples section of the envelope
- **writer**: receives the final envelope and writes it to the database. _You can do whatever you like in the writer. The default code inserts the envelope into the database, but you could push the envelope onto a message bus or send a tweet if you like._

<i class="fa fa-hand-pointer-o"></i> Click on the **Collector** tab.

![Click Collector Tab]({{site.baseurl}}/images/2x/click-collector1.png)

<hr>

### Collector Plugin

This collector code is returning a list of URIs, one for every Product document in the staging database. We are using URIs because we intend to create one harmonized document for every ingested staging document.

The code you see is using [cts.uris](https://docs.marklogic.com/cts.uris) to get values from the URI lexicon. We pass in [cts.collectionQuery](https://docs.marklogic.com/cts.collectionQuery) as the 3rd parameter to constrain our results to only the URIs for documents in the **Product** collection. We are using `options.entity` as the parameter. The Data Hub Framework passes in options from Java to the plugins.

The default options passed in to the plugin are:

- **entity**: the name of the entity this plugin belongs to
- **flow**: the name of the flow this plugin belongs to
- **flowType**: the type of flow being run (input or harmonize)

<div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Product/harmonize/Harmonize Products/collector/collector.sjs"></div>

<hr>

<i class="fa fa-hand-pointer-o"></i> Click on the **Content** tab.

![Click Content Tab]({{site.baseurl}}/images/2x/click-content1.png)

<hr>

### Content Plugin

The content code receives an id as the first parameter. This id happens to be the URI for a staging Product document. The id can be anything: a URI, a relational row id, a twitter handle, a random number. It's up to you to decide how to use that id to harmonize your data.

The only modification we need to make to this file is to change the way we look up the sku.

```
let sku = xs.string(source.sku || source.SKU);
```

This change will use either sku or SKU depending on which one is found. This covers the case we are trying to solve of two separate field names.

**Here is the Final content.sjs file:**

<div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Product/harmonize/Harmonize Products/content/content.sjs"></div>

After making the code change, <i class="fa fa-hand-pointer-o"></i> Click **SAVE**{:.blue-button}.

![Edit and Save Content]({{site.baseurl}}/images/2x/save-product-content.png)

<i class="fa fa-hand-pointer-o"></i> Now Click on the **Flow Info** tab.

![Click Flow Info]({{site.baseurl}}/images/2x/click-flow-info1.png)

Let's Run the flow. <i class="fa fa-hand-pointer-o"></i> Click the **RUN HARMONIZE**{:.blue-button} button to start the flow.

![Run Product Harmonize]({{site.baseurl}}/images/2x/run-product-harmonize.png)

## Check out the Harmonized Products

After running the Input flow we verified that the job finished. Let's do that again.

1. <i class="fa fa-hand-pointer-o"></i> Click on the **Jobs** tab.
1. Make sure the job finished.

![Harmonized Products Jobs]({{site.baseurl}}/images/2x/harmonized-products-jobs.png)

Now let's explore our Harmonized Data.

1. <i class="fa fa-hand-pointer-o"></i> Click on the **Browse** tab.
1. Change Database to **FINAL**.
1. <i class="fa fa-hand-pointer-o"></i> Click **Search**{:.blue-button}.

You should see harmonized documents in the search results.

![Harmonized Products]({{site.baseurl}}/images/2x/harmonized-products.png)

<i class="fa fa-hand-pointer-o"></i> Click on a result to see the raw data.

![Harmonized Product Detail]({{site.baseurl}}/images/2x/harmonized-product-details.png)

## Up Next

Congratulations! You just loaded and harmonized your Product data. Up next is doing the same thing for the Order data.

[Loading Orders > Create the Order Entity](create-order-entity.md)
