---
layout: inner
title: Getting Started Tutorial 2.x<br>Harmonizing Order Data
lead_text: ''
permalink: /tutorial/2x/harmonizing-order-data/
---

## Harmonizing the Order Data

Now that we have modeled the Order entity we can use the Data Hub Framework's code scaffolding to create a boilerplate for Harmonizing our data.

<i class="fa fa-hand-pointer-o"></i> Click on the **Flows** tab in the top navigation bar.

![Click Flows]({{site.baseurl}}/images/2x/click-flows-4.png)

1. <i class="fa fa-hand-pointer-o"></i> Click on the **+** icon next to **Harmonize Flows**
1. Type **Harmonize Orders** into the **Harmonize Flow Name** field
1. <i class="fa fa-hand-pointer-o"></i> Click the **CREATE**{:.blue-button} button

Note that this time we used the default option of **Create Structure from Entity Definition**. This means that the Data Hub Framework will create boilerplate code based on our Entity model. The code will pre-populate the fields we need to add.

![Create Product Harmonize Flow]({{site.baseurl}}/images/2x/create-order-harmonize-flow.png)

1. <i class="fa fa-hand-pointer-o"></i> Click on the **Harmonize Orders** flow. 
1. <i class="fa fa-hand-pointer-o"></i> Click on the **Collector** tab.

![Harmonize Flow Overview]({{site.baseurl}}/images/2x/go-to-order-collector.png)

<hr>

### Collector Plugin

Because each Order can consist of multiple rows which are then turned into multiple documents in MarkLogic, we cannot do a 1:1 mapping like we did for Products. This means we cannot simply return a list of URIs. Instead we need to return a unique list of all of the values from the relation **id** column.

We use the [jsearch library](https://docs.marklogic.com/guide/search-dev/javascript) to run our query.

This code is simply returning all unique values in the **id** field. The one tricky bit is the `slice` call:

`.slice(0, Number.MAX_SAFE_INTEGER)`

By default jsearch will paginate results. The slice is telling it to return all results from 0 to **a really big number**.

The final collector.sjs code:  
<div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Order/harmonize/Harmonize Orders/collector/collector.sjs"></div>

1. Make the code change.
1. <i class="fa fa-hand-pointer-o"></i> Click on **SAVE**{:.blue-button} button.
1. <i class="fa fa-hand-pointer-o"></i> Click on the **Content** tab.

![Click Content Tab]({{site.baseurl}}/images/2x/save-order-collector.png)

<hr>

### Content Plugin
For the Order entity the id is the id from the original relational system. Instead of a 1:1 mapping of source documents, we must find all source documents that match the given id.

After we get all of the matching documents we must then build up an array of the Products while also summing the total price.

Once again we use the [jsearch library](https://docs.marklogic.com/guide/search-dev/javascript) to run our query.

Note how we query all Order documents containing the matching id. We use the `map` function to extract out the original content (stored in the instance part of the envelope). The `orders` variable will contain an array of original json objects.

You can also see how we iterate over the orders to sum up the price and add pointers to the Product entities into the `products` array.

**The Final content plugin looks like:**

<div class="embed-git lang-js" href="//raw.githubusercontent.com/marklogic-community/marklogic-data-hub/develop/examples/online-store/plugins/entities/Order/harmonize/Harmonize Orders/content/content.sjs"></div>

1. Change the code.
1. <i class="fa fa-hand-pointer-o"></i> Click **SAVE**{:.blue-button}.

![Edit and Save Content]({{site.baseurl}}/images/2x/save-order-content.png)

<i class="fa fa-hand-pointer-o"></i> Now Click on the **Flow Info** tab.

![Click Flow Info]({{site.baseurl}}/images/2x/click-flow-info2.png)

Let's Run the flow. <i class="fa fa-hand-pointer-o"></i> Click the **RUN HARMONIZE**{:.blue-button} button to start the flow.

![Run Order Harmonize]({{site.baseurl}}/images/2x/run-order-harmonize.png)

## Check out the Harmonized Orders

Similar to what we did after running the other flows you might want to verify that the job finished.

1. <i class="fa fa-hand-pointer-o"></i> Click on the **Jobs** tab.
1. Make sure the job finished.

![Harmonized Products Jobs]({{site.baseurl}}/images/2x/harmonized-orders-jobs.png)

You may also want to explore your Harmonized Data.

1. <i class="fa fa-hand-pointer-o"></i> Click on the **Browse** tab.
1. Change Database to **FINAL**.
1. <i class="fa fa-hand-pointer-o"></i> Click the **Search**{:.blue-button} button.
1. Click on the Order Facet to filter the results.

You should see harmonized documents in the search results.

![Harmonized Products]({{site.baseurl}}/images/2x/harmonized-orders.png)

<i class="fa fa-hand-pointer-o"></i> Click on a result to see the raw data.

![Harmonized Product Detail]({{site.baseurl}}/images/2x/harmonized-order-details.png)

## Up Next

[Serve the Data Out of MarkLogic](../serve-data/)
