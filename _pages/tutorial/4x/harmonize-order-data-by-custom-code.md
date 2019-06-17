---
layout: inner
title: Tutorial - Harmonize the Order Data by Custom Code
permalink: /tutorial/4x/harmonize-order-data-by-custom-code/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Harmonize the Order Data by Custom Code

Harmonization of the **Order** entity is more complex.
  - The `price` property of the entity model is the total amount for the entire order; therefore, it must be calculated.
  - The `product` property is an array of the products ordered, but they are not represented as an array in the source.

Therefore, we must use DHF code scaffolding to generate the harmonization code and then customize it.


We have already loaded the **Order** raw data by:
  - [creating the **Order** entity]({{site.baseurl}}/tutorial/4x/create-entities/) and
  - [creating and running the associated input flow]({{site.baseurl}}/tutorial/4x/create-run-input-flows/).

In this section, we will:
  - [Define the entity model](#1_-_define_the_entity_model) by adding properties to the entity model.
  - [Create the Harmonize flow.](#2_-_create_the_harmonize_flow)
  - [Customize the Harmonize flow](#3_-_customize_the_harmonize_flow), specifically the **Collector** code and the **Content** code.
  - Run the Harmonize Flow.
  - View the results.


## 1 - Define the Entity Model

We assume the following about the **Order** data:

  - Each product is identified by its SKU.
  - Each order can have more than one product.
  - Each product in the order has a specified quantity.
  - Each order includes a total amount, which must be calculated.

Based on these assumptions, we will add the following properties to the **Order** entity model for harmonization:

  | Name | Type | Other settings | Notes |
  |:---:|:---:|:---:|---|
  | `id`       | string             | **<i class='fa fa-key'></i>** **<i class='fa fa-bolt'></i>** | Used as the primary key because order ID is unique for each order. Needs an element range index. |
  | `total`    | decimal            |     | The calculated total amount of the entire order. |
  | `products` | **Product** entity | Cardinality: 1..∞ | An array of pointers to the `Product` entities in our FINAL database. |
  {:.table-b1gray}

{% include conrefs/conref-qs-4x-define-entity-model.md imgpath=var-imgpath entityname="Order" fullsteps=true %}

### Result

Because the **Order** entity contains pointers to the **Product** entity, an arrow connects the **Order**{:.uilabel} entity card to the **Product**{:.uilabel} entity card with the cardinality we selected (<span class='uilabel'>1..∞</span>).

  {%- assign full-imgpath=var-imgpath | append: "qs-4x-entities-order-card-to-product-card.png" -%}{% include thumbnail.html imgfile=full-imgpath alttext="" imgclass="img-results" tab="  " %}


## 2 - Create the Harmonize Flow

Harmonization uses the data in your **STAGING** database to generate canonical entity instances (documents) in the **FINAL** database.

{% include conrefs/conref-qs-4x-create-run-harmonize-flow.md imgpath=var-imgpath entityname="Order" harmonizeflowname="Harmonize Orders" create=true fullsteps=true %}

Because we used the default **Create Structure from Entity Definition**{:.uilabel} and we did not specify a mapping, DHF creates boilerplate code based on the entity model. This code includes default initialization for the entity properties, which we will customize.


## 3 - Customize the Harmonize Flow

### 3a - Customize the Collector Plugin

The **Collector** plugin generates a list of IDs for the flow to operate on. The IDs can be whatever your application needs (e.g., URIs, relational row IDs, twitter handles). The default **Collector** plugin produces a list of source document URIs.

An `options` parameter is passed to the **Collector** plugin, and it contains the following properties:

  - **entity**: the name of the entity this plugin belongs to (e.g., "Order")
  - **flow**: the name of the flow this plugin belongs to (e.g., "Harmonize Orders")
  - **flowType**: the type of flow being run ("input" or "harmonize"; e.g., "harmonize")

The **Load Orders** input flow automatically groups the source documents into a collection named **Order**. The default **Collector** plugin uses that collection to derive a list of URIs.

  <details><summary>View code snippet.</summary>
  ```javascript
  cts.uris(null, null, cts.collectionQuery(options.entity))
  ```
  </details>

In our source **Order** CSV file, each row represented one line item in an order. For example, if the order had three line items, then three documents were created for that order in the staging database during the input phase. To combine all three documents into a single **Order** entity, they must be harmonized.

Each of those three documents would have the same order ID but different URIs. Therefore, we must customize the collector plugin to return a list of unique order IDs, instead of a list of URIs.

**Technical Notes**

  - In our custom collector plugin code, we use the [jsearch library](https://docs.marklogic.com/guide/search-dev/javascript) library to find all the values of **id** in the **Order** collection and return the result.
  - By default, jsearch paginates results; therefore, we call `slice()` to get all results at once.

**Steps**

To customize the **Collector** plugin,

{% assign full-imgpath=var-imgpath | append: "qs-4x-flows-harmonize-collector-custom-Order.png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Harmonize Flow - Collector - custom code" imgclass="screenshot" tab="  " %}

1. Click the **COLLECTOR**{:.uilabel} tab.
1. Replace the collector plugin code with the following:

      ```
/*
 * Collect IDs plugin
 * @param options - a map containing options. Options are sent from Java
 * @return - an array of ids or uris
 */
function collect(options) {
	const jsearch = require('/MarkLogic/jsearch.sjs');
  return jsearch
    .values('id')
    .where(cts.collectionQuery(options.entity))
    .slice(0, Number.MAX_SAFE_INTEGER)
    .result();
}
module.exports = {
  collect: collect
};
      ```
1. Click **SAVE**{:.inline-button}.
{:.ol-steps}


### 3b - Customize the Content Plugin

The list of order IDs collected by our custom **Collector** plugin is passed to the **Content** plugin, specifically to its `createContent` function.

We will customize `createContent` to do the following:

  - Collect all the line items of the same order into a single **Order** entity.
  - Calculate the total cost of the order.

**Technical Notes**

  - A [jsearch library](https://docs.marklogic.com/guide/search-dev/javascript) query searches the **Order** collection for all source documents that have the same order id.

    We also apply a `map` function to each matching document to extract the original content inside the envelope.

    The `orders` variable will contain an array of original JSON objects.

    <details><summary>View code snippet.</summary>
      <pre><code>
var orders = jsearch
  .collections('Order')
  .documents()
  .where(
    jsearch.byExample({
      'id': id
    })
  )
  .result('value')
  .results.map(function(doc) {
    return doc.document.envelope.instance;
  });
      </code></pre>
    </details>

  - After collecting the line items in the same order,

    - We calculate the total amount of the order and
    - We store the appropriate **Product** entity references (using the SKU) in the **products** property of the **Order** instance.

    <details><summary>View code snippet.</summary>
      <pre><code>
/* The following property is a local reference. */
var products = [];
var price = 0;
for (var i = 0; i < orders.length; i++) {
  var order = orders[i];
  if (order.sku) {
    products.push(makeReferenceObject('Product', order.sku));
    price += xs.decimal(parseFloat(order.price)) * xs.decimal(parseInt(order.quantity, 10));
  }
}
      </code></pre>
    </details>

  - The default code includes some additional functions that we will remove because we do not need them.

    - `extractInstanceProduct`: Extracts a Product instance in a form suitable for insertion into an Order instance. Because we reference Product entities within the Order instance, we do not need this function.
    - `extractInstanceOrder`: Extracts an Order instance from an order source document. Since we do not have a one-to-one correspondence, we cannot use this function.

    However, although we do not use `extractInstanceOrder`, our customized `createContent` function must produce a similar structure.

    <details><summary>View code snippet.</summary>
      <pre><code>
return {
  '$attachments': attachments,
  '$type': 'Order',
  '$version': '0.0.1',
  'id': id,
  'price': price,
  'products': products
}
      </code></pre>
    </details>

**Steps**

To customize the content plugin code,

{% assign full-imgpath=var-imgpath | append: "qs-4x-flows-harmonize-content-custom-Order.png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Harmonize Flow - Content - custom code" imgclass="screenshot" tab="  " %}

1. Click the **CONTENT**{:.uilabel} tab.
1. Replace the content plugin code with the following:
      <div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Order/harmonize/Harmonize Orders/content/content.sjs"></div>
1. Click **SAVE**{:.inline-button}.
{:.ol-steps}


## 4 - Run the Harmonize Flow

{% include conrefs/conref-qs-4x-create-run-harmonize-flow.md imgpath=var-imgpath entityname="Order" harmonizeflowname="Harmonize Orders" run=true fullsteps=true %}


## 5 - View the Harmonized Orders

As with other flow runs, you can view the job status.

{% include conrefs/conref-qs-4x-jobs.md imgpath=var-imgpath pickitem="the job for the harmonization flow `Harmonize Orders`" %}

You can also explore your harmonized data in the **FINAL** database.

{% include conrefs/conref-qs-4x-browse-data.md imgpath=var-imgpath pickdb="FINAL" pickitem="the first **Order** dataset item" %}


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
