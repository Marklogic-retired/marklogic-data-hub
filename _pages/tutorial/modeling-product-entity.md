---
layout: inner
title: Getting Started Tutorial 2.x<br>Modeling the Product Entity
lead_text: ''
permalink: /tutorial/modeling-product-entity
---

## Modeling the Product Entity

After browsing the data and speaking to our Data Guru we now know that we want to harmonize two very specific fields: **sku** and **price**.

### sku
Sku is the unique identifier for each type of product. In our raw data sku is stored in two different fields: sku and SKU. We must harmonize the two into a common sku field so that searching over sku is easier.

### price
Price is stored as a string during the raw ingest. We want to convert it to a decimal so that we can do arithmetic on it.

Let's get started by modeling our Entity. <i class="fa fa-hand-pointer-o"></i> Click on the **Entities** tab in the top navigation bar.

![Click Entities Tab]({{site.baseurl}}/images/2x/click-entities.png)

1. <i class="fa fa-hand-pointer-o"></i> Click on the **pencil** icon <i class="fa fa-pencil"></i> for the **Product** entity.
1. <i class="fa fa-hand-pointer-o"></i> Click the **+**{:.circle-button} button below **Properties** to add a new row.
1. <i class="fa fa-hand-pointer-o"></i> Click in the area just below the **key** icon to make this row the primary key.
1. Type in **sku** as the Name.
1. Change the Type to **string**.

![Edit Entity]({{site.baseurl}}/images/2x/edit-product-entity.png)

1. <i class="fa fa-hand-pointer-o"></i> Click the **+**{:.circle-button} button below **Properties** to add a new row.
1. Type in **price** as the Name.
1. Change the Type to **decimal**.
1. <i class="fa fa-hand-pointer-o"></i> Click the **SAVE**{:.blue-button} button.

![Edit Entity]({{site.baseurl}}/images/2x/edit-product-entity2.png)

After clicking **Save** you will be prompted whether you want to Update Indexes in MarkLogic or not.

<i class="fa fa-hand-pointer-o"></i> Click **YES**.

One of the benefits of modeling your data with Entity Services is that we can use the model to create database configuration options automatically. This means we can update the necessary index settings bases on how you model your data. For the Product entity, we made sku the primary key. The Data Hub Framework will create a range index on the sku element.

![Update Indexes]({{site.baseurl}}/images/2x/update-indexes1.png)

## Up Next

[Harmonizing the Product Data](harmonizing-product-data.md)
