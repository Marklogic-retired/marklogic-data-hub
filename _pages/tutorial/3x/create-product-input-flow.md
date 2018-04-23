---
layout: inner
title: Getting Started Tutorial 3.x<br>Create the Product Input Flow
lead_text: ''
permalink: /tutorial/create-product-input-flow/
---

**Input flows** are responsible for getting data into the Hub staging area. These flows wrap incoming data in envelopes. It's useful to wrap incoming data in envelopes to track lineage and provenance, to answer questions such as: Who loaded this data? When was it loaded? Where did it come from?

**Harmonize flows** are responsible for batch harmonization of data from staging to final. Harmonization is the *main purpose* of using the Data Hub Framework.

We start by creating an input flow so that we can load data as-is. This gives us a chance to explore our data a bit and hopefully better understand it.

<i class="fa fa-hand-pointer-o"></i> Click **Flows** in the top navigation bar.

![Click Flows]({{site.baseurl}}/images/3x/create-product-input-flow/click-flows-1.png)

1. <i class="fa fa-hand-pointer-o"></i> Click the disclosure arrow <i class="fa fa-sort-desc"></i> next to **Product** to show the Input and Harmonize Flows.
1. <i class="fa fa-hand-pointer-o"></i> Click the **+** icon next to **Input Flows**.
1. Type **Load Products** in the **Input Flow Name** field.
1. <i class="fa fa-hand-pointer-o"></i> Click **CREATE**{:.blue-button}.

![New Load Products Flows]({{site.baseurl}}/images/3x/create-product-input-flow/create-load-product-flow.png)

## Next Up
[Load the Product Data As-Is](../load-products-as-is/)
