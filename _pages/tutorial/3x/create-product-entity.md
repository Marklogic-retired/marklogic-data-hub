---
layout: inner
title: Getting Started Tutorial 3.x<br>Create the Product Entity
lead_text: ''
permalink: /tutorial/create-product-entity/
---

Entities are the business objects that you will be working with in the hub. The steps in this tutorial will make use of MarkLogic's [Entity Services feature](https://docs.marklogic.com/guide/entity-services). Entity Services allows you to model your business entities as JSON. Using these data models, you can then generate code scaffolding, database configurations, index settings, and validations. The Data Hub Framework handles many of these for you. Later in this tutorial we will use the index and scaffolding generation.

To begin creating a Product entity, click on **Entities** in the top navigation bar:

![Click Entities]({{site.baseurl}}/images/3x/create-product-entity/entities-select.png)

Use the following procedure to create a Product entity. We will add entity properties to it later.

1. Click <span class="circle-button"><i class="fa fa-wrench"></i></span> to open the entity tools control.
1. Click **New Entity**. The entity creation dialog appears.
1. Type **Product** in the Title field.
1. Click **Save**. The new Product entity is displayed. If you are prompted to update the index, click **No**.

    ![New Entity]({{site.baseurl}}/images/3x/create-product-entity/create-product-entity.png)

When you are done, you should see a representation of the Product entity similar to the following:

![Product Entity]({{site.baseurl}}/images/3x/create-product-entity/first-entity.png)

## Next Up
[Create the Product Input Flow](../create-product-input-flow/)
