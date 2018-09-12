---
layout: inner
title: Getting Started Tutorial 3.x<br>Model the Product Entity
lead_text: ''
permalink: /tutorial/modeling-product-entity/
---

After browsing the data and speaking to our company's data guru, we now know that we want to harmonize two fields: **sku** and **price**.

An sku value uniquely identifies a product, so we will model **sku** as the primary key for a Product entity. We want to be able to perform arithmetic on the price, so we will model price as a decimal value.

Before we can harmonize the data, we must add the **sku** and **price** properties to our Product entity model.

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

When you answer yes in the last step, QuickStart updates the index settings based on how you model your data. One of the benefits of modeling your data with Entity Services is that you can use the model to create database configuration options automatically.

## Up Next

[Create a Product Source-to-Entity Mapping](../mapping-product-entity/)
