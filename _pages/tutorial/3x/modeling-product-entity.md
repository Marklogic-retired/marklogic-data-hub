---
layout: inner
title: Getting Started Tutorial 3.x<br>Modeling the Product Entity
lead_text: ''
permalink: /tutorial/modeling-product-entity/
---

After browsing the data and speaking to our company's data guru, we now know that we want to harmonize two very specific fields: **sku** and **price**.

### sku
Sku is the unique identifier for each type of product. In our raw data sku is stored in two different fields: sku and SKU. We must harmonize the two into a common sku field so that searching over sku is easier.

### price
Price is stored as a string during the raw ingest. We want to convert it to a decimal so that we can do arithmetic on it.

Let's get started by modeling our Entity. <i class="fa fa-hand-pointer-o"></i> Click **Entities** in the top navigation bar.

![Click Entities Tab]({{site.baseurl}}/images/3x/modeling-product-entity/click-entities.png)

1. <i class="fa fa-hand-pointer-o"></i> Click the pencil icon <i class="fa fa-pencil"></i> for the **Product** entity.
1. <i class="fa fa-hand-pointer-o"></i> Click **+**{:.circle-button} below **Properties** to add a new row.
1. Type **sku** as the Name.
1. <i class="fa fa-hand-pointer-o"></i> Click in the area just below the **key** icon to make this row the primary key.
1. Select **string** as the Type.

![Edit Entity]({{site.baseurl}}/images/3x/modeling-product-entity/edit-product-entity.png)

1. <i class="fa fa-hand-pointer-o"></i> Click **+**{:.circle-button} below **Properties** to add a new row.
1. Type **price** as the Name.
1. Select **decimal** as the Type.
1. <i class="fa fa-hand-pointer-o"></i> Click **SAVE**{:.blue-button}.

![Edit Entity]({{site.baseurl}}/images/3x/modeling-product-entity/edit-product-entity2.png)

After clicking **Save** you will be prompted whether you want to Update Indexes in MarkLogic or not.

<i class="fa fa-hand-pointer-o"></i> Click **Yes**.

![Update Indexes]({{site.baseurl}}/images/3x/modeling-product-entity/update-indexes1.png)

One of the benefits of modeling your data with Entity Services is that you can use the model to create database configuration options automatically. This means you can update the necessary index settings based on how you model your data.

## Up Next

[Harmonizing the Product Data](../harmonizing-product-data/)
