---
layout: inner
title: Getting Started Tutorial 3.x<br>Harmonize the Order Data
lead_text: ''
permalink: /tutorial/harmonizing-order-data/
---

Now that we have modeled the Order entity we can use the Data Hub Framework's code scaffolding to generate harmonization code and then customize it for our application.

Recall that you can either generate customized harmonization code based on a model-to-model mapping, as we did with Product, or you can generate default harmonization code and customize it. In this exercise, we will generate and customize the default code since the **price** property of an Order is a computed value.

## Create the Order Harmonize Flow

Follow these steps to create a harmonize flow for Order entities and generate the default flow code:

1. Click **Flows** in the top navigation bar.
1. Click the **+** icon next to **Harmonize Flows**
1. Type **Harmonize Orders** in the **Harmonize Flow Name** field
1. Click **Create**.

The following picture summarizes these steps:

![Create Product Harmonize Flow]({{site.baseurl}}/images/3x/harmonizing-order-data/create-order-harmonize-flow.png)

Since we used the default option of **Create Structure from Entity Definition** and did not specify a mapping, the Data Hub Framework creates boilerplate code based on the Order entity model. The code includes default initialization for the entity properties, which we will modify after a brief overview of the harmonization code and the server-side plugins that use it.

## Harmonization Flow Basics

Harmonize flows are designed to operate on your data in batches. A set of plugins on MarkLogic orchestrate the processing and provide hooks for domain-specific code. When you create a flow, the Data Hub Framework generates harmonization code that the plugins call into when you run the flow.

(The framework also [provide ways](../../faqs/#how-can-i-run-a-harmonize-flow-immediately-for-1-document) to run a harmonize flow on-demand for single items.)

A harmonization flow uses the following plugins:

- **collector**: returns a list of strings to operate on
- **content**: returns data to put into the content section of the envelope
- **headers**: returns data to put into the headers section of the envelope
- **main**: orchestrates the behavior of the other plugins
- **triples**: returns data to put into the triples section of the envelope
- **writer**: receives the final envelope and writes it to the database.

The main plugin receives id values from the collector and orchestrates the behavior of the other plugins. The collector plugin returns a list of things to operate on. The Data Hub Framework then breaks the list of things into parallel batches of a configurable size and sends each item to the content, headers, triples, and writer plugins, in turn, as a transaction.

The writer plugin acts last. By default, the writer inserts the envelope into the FINAL database, but you can do whatever you like. For example, you could push the envelope on to a message bus or send a tweet.

The following diagram shows the steps in a harmonize flow:

![Harmonize Flow Overview]({{site.baseurl}}/images/3x/harmonizing-order-data/harmonize-flow-diagram.png)

In this exercise, we will examine and customize the harmonization code for the collector and content plugins.

When you create a flow, the Data Hub Framework generates harmonize code to be run by the plugins. You can review and modify the code using the tabs of the Quickstart **Flows** view. For example, if you click on the Harmonize Orders flow on the left, you see the following:

![Harmonize Flows View]({{site.baseurl}}/images/3x/harmonizing-order-data/harmonize-flow-view.png)

## Customize the Collector Plugin Code

Click the **COLLECTOR** tab to view the collector plugin code. We will discuss the cusotmizations and then apply them.

The Data Hub Framework calls the `collect` function to "collect" a list of ids for the flow to operate on. By default, this function generates a list of source document URIs. The ids can be anything: URIs, relational row ids, twitter handles - whatever suits the needs of your application.

The `options` parameter passed into the collector plugin contains the following properties by default:

- **entity**: the name of the entity this plugin belongs to ("Order")
- **flow**: the name of the flow this plugin belongs to ("Harmonize Orders")
- **flowType**: the type of flow being run ("input" or "harmonize"; in this case, "harmonize")

The "Load Orders" input flow automatically grouped the source documents into a collection named "Order". The default code uses that collection to derive a list of URIs:
```javascript
cts.uris(null, null, cts.collectionQuery(options.entity))
```
This approach worked for the Product entity type. However, the order source data in the **STAGING** database consists of one document for each item that occurs in an order. During harmonization, we want to collect all the items in the same order into a single Order entity.

Therefore, we will change the collector to generate a list of the unique order ids, instead of a list of URIs. The code below uses the [jsearch library](https://docs.marklogic.com/guide/search-dev/javascript) library to find all the values of **id** in the Order collection:

```javascript
jsearch
    .values('id')
    .where(cts.collectionQuery(options.entity))
    .slice(0, Number.MAX_SAFE_INTEGER)
    .result();
```

By default jsearch will paginate results. The `slice()` call tells jsearch to return all results from 0 to a really big number.

Now, we'll apply our customization: Replace the contents of the COLLECTOR tab with the following code, and click **SAVE**.

<div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Order/harmonize/Harmonize Orders/collector/collector.sjs"></div>

## Customize the Content Plugin Code
Click the **CONTENT** tab to bring up the content plugin code. We will discuss the cusotmizations and then apply them.

The `createContent` function is the main entry point for the content plugin. Because of our collector plugin customization, the **id** parameter passed to this function will be an order id generated by the collector plugin.

We will modify `createContent` to collect all the items that are part of the same order into a single Order entity. In addition, we will calculate the total cost of the order.

We will use the [jsearch library](https://docs.marklogic.com/guide/search-dev/javascript) to find the relevant source documents. The following query finds all order source documents with a matching order id:
```
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
```

We apply a `map` function to the matching documents to extract the original content that the input flow stored in the instance part of the envelope. The `orders` variable will contain an array of original JSON objects.

Given all the products in the same order, the following code sums up the prices and adds a reference to each Product in the order to the **products** property of the Order instance. The products are included by reference, using the **sku** to identify each product.
```
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
```
The default code includes some additional functions that we will remove because we do not need them.:
* `extractInstanceProduct`: Extracts a Product instance in a form suitable for inlining in an Order instance. Since we include Product entities by reference, we discard this function.
* `extractInstanceOrder`: Extracts an Order instance from an order source document. Since we do not have a one-to-one correspondence, we cannot use this function.

Though we do not use `extractInstanceOrder`, our customized `createContent` function must produce the same kind of structure, so we hoist the following block of code into `createContent`:
```
return {
  '$attachments': attachments,
  '$type': 'Order',
  '$version': '0.0.1',
  'id': id,
  'price': price,
  'products': products
}
```

Now, we'll apply our customizations: Replace the contents of the **CONTENT** tab with the following code and click **SAVE**.

<div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Order/harmonize/Harmonize Orders/content/content.sjs"></div>

## Run the Harmonize Flow

Next, run the flow using the following steps:

1. Click the **FLOW INFO** tab.
1. Click **RUN HARMONIZE** to start the flow.

![Run Order Harmonize]({{site.baseurl}}/images/3x/harmonizing-order-data/run-order-harmonize.png)

## View the Harmonized Orders

Similar to what we did after running the other flows, you might want to verify that the job finished.

1. Click **Jobs** in the top navigation bar.
1. Confirm the harmonize job status is FINISHED.

![Harmonized Products Jobs]({{site.baseurl}}/images/3x/harmonizing-order-data/harmonized-orders-jobs.png)

You might also want to explore your harmonized data.

1. Click **Browse Data**.
1. Change the database to **Final**.
1. Click the **Order** facet to filter the results.

You should see harmonized documents in the search results.

![Harmonized Products]({{site.baseurl}}/images/3x/harmonizing-order-data/harmonized-orders.png)

Click a result to see the raw data.

![Harmonized Product Detail]({{site.baseurl}}/images/3x/harmonizing-order-data/harmonized-order-details.png){:.screenshot-border}

## Up Next

[Serve the Data Out of MarkLogic](../serve-data/)
