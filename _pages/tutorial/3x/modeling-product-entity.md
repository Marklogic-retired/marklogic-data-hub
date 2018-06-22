---
layout: inner
title: Getting Started Tutorial 3.x<br>Modeling the Product Entity
lead_text: ''
permalink: /tutorial/modeling-product-entity/
---

After browsing the data and speaking to our company's data guru, we now know that we want to harmonize two very specific fields: **sku** and **price**.

Sku is the unique identifier for each type of product. In our raw data sku is stored in two different fields: sku and SKU. We must harmonize the two into a common sku field so that searching over sku is easier.

Price is stored as a string during the raw ingest. We want to convert it to a decimal so that we can do arithmetic on it.

Before we can harmonize the data, we must add the "sku" and "price" properties to our Product entity model. 

Click **Entities** in the top navigation bar to open the entity modeling view,
and then follow these steps to add the "sku" property:

1. Click the **pencil** icon (<i class="fa fa-pencil"></i>) in the upper right corner of the **Product** entity to edit the entity definition.
1. Click **+**{:.circle-button} below **Properties** to add a new property.
1. Enter **sku** as the Name.
1. Click in the area just below the **key** icon (<i class="fa fa-key"></i>) to make "sku" the primary key.
1. Select **string** as the Type.

The following picture summarizes the step for adding the "sku" property to the Product entity definition:

![Edit Entity]({{site.baseurl}}/images/3x/modeling-product-entity/edit-product-entity.png)

Next, follow these steps to add the "price" property:

1. Click **+**{:.circle-button} below **Properties** to add a new proeprty.
1. Enter **price** as the Name.
1. Select **decimal** as the Type.
1. Click **SAVE** to save your changes.
1. Click **Yes** when asked whether or not to update the indexes in MarkLogic.

One of the benefits of modeling your data with Entity Services is that you can use the model to create database configuration options automatically. This means you can update the necessary index settings based on how you model your data.

## Up Next

[Harmonizing the Product Data](../harmonizing-product-data/)
