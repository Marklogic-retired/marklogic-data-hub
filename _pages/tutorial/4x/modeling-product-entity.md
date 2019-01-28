---
layout: inner
title: Tutorial - Model the Product Entity
permalink: /tutorial/4x/modeling-product-entity/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Model the Product Entity

Harmonization standardizes data labels and formats among different datasets. For example, "family name" in one dataset could be called "last name" in another, and harmonization can allow both to be accessed as "surname".

For the **Product** dataset, we will harmonize two fields: `sku` and `price`. However, before we can harmonize the data, we must add those fields as properties to our **Product** entity model.

  - Because SKU is unique for each product, we will use `sku` as the primary key.
  - Because we need to perform calculations with the price, we will set `price` as a decimal.

{% assign full-imgpath=var-imgpath | append: "qs-4x-entities-edit-properties-sku-price.png" %}
{% include thumbnail.html imgfile=full-imgpath alttext="Product Entity properties" imgclass="screenshot" tab="  " %}

1. In QuickStart's navigation bar, click **Entities**{:.uimenuitem}.
1. At the top of the `Product` entity card, click the pencil icon **<i class='fa fa-pencil-alt'></i>**{:.circle-button} to edit the `Product` entity definition.
1. In the `Product` entity editor, click **+**{:.circle-button} in the **Properties**{:.uilabel} section to add a new property.
1. Set **Name**{:.uilabel} to `sku`.
1. Set **Type**{:.uilabel} to `string`.
1. To make `sku` the primary key, click the area in the key **<i class='fa fa-key'></i>**{:.circle-button} column for the `sku` row.
1. Click **+**{:.circle-button} again to add another property.
1. Set **Name**{:.uilabel} to `price`.
1. Set **Type**{:.uilabel} to `decimal`.
1. Click **SAVE**{:.inline-button}.
{%- assign full-imgpath=var-imgpath | append: "qs-4x-update-indexes-yes.png" -%}{%- assign full-text="If prompted to update the index, click <span class='inline-button'>Yes</span>." -%}{%- include step-collapsed.html steptext=full-text stepimg=full-imgpath imgclass="img-small" -%}
{:.ol-steps}

QuickStart updates the index settings based on how you model your data. A benefit of modeling your data with Entity Services is that you can use the model to create database configuration options automatically.


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
