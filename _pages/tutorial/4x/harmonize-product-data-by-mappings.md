---
layout: inner
title: Tutorial - Harmonize the Product Data by Mappings
permalink: /tutorial/4x/harmonize-product-data-by-mappings/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Harmonize the Product Data by Mapping

A **harmonize flow** is another series of plugins that harmonizes the data in the staging database and stores the results in the final database. Harmonization includes standardizing formats, enriching data, resolving duplicates, indexing, and other tasks.

We can specify the source of an entity property value using one of two methods:
  - By customizing the default harmonization code.
  - By defining mappings that specify which fields in the raw datasets correspond with which properties in the entity model.

Model-to-model mapping (between the source data model and the canonical entity model) was [introduced in DHF v4.0.0]({{site.baseurl}}/release-notes/release-notes-4_0_x/) to enable users to easily create a harmonization flow without coding. Mappings are ideal when the source data can be easily converted for use as the value of the entity property; a simple conversion can be a difference in the label case or a difference in simple data types.


We have already loaded the **Product** raw data by:
  - [creating the **Product** entity]({{site.baseurl}}/tutorial/4x/create-entities/) and
  - [creating and running the associated input flow]({{site.baseurl}}/tutorial/4x/create-run-input-flows/).

In this section, we will:
  - [Define the entity model](#1_-_define_entity_model) by adding properties to the entity model.
  - [Define the mappings](#2_-_define_the_mappings) to specify which field in the dataset corresponds to the properties in the entity model.
  - [Create and Run the Harmonize Flow.](#3_-_create_and_run_the_harmonize_flow)


## 1 - Define the Entity Model

We first define the entity model, which specifies the standard labels for the fields we want to harmonize. For the **Product** dataset, we will harmonize two fields: `sku` and `price`. Therefore, we must add those fields as properties to our **Product** entity model.

  | Name | Type | Other settings | Notes |
  |:---:|:---:|:---:|---|
  | `sku`   | string  | key | Used as the primary key because the SKU is unique for each product. |
  | `price` | decimal |     | Set as a decimal because we need to perform calculations with the price. |
  {:.table-b1gray}

{% include conrefs/conref-qs-4x-define-entity-model.md imgpath=var-imgpath entityname="Product" fullsteps=true %}


## 2 - Define the Mappings

For the **Product** entity, we define the following simple mappings:

  | field in raw dataset (type) | property in entity model (type) | Notes |
  |---|---|---|
  | `SKU` (string)   | `sku` (string)    | Difference (case-sensitive) between field names |
  | `price` (string) | `price` (decimal) | Difference in types |
  {:.table-b1gray}

{% include conrefs/conref-qs-4x-define-source-to-entity-maps.md imgpath=var-imgpath entityname="Product" mappingname="Product Mapping" fullsteps=true %}


## 3 - Create and Run the Harmonize Flow

Harmonization uses the data in your **STAGING** database to generate canonical entity instances in the **FINAL** database.

{% include conrefs/conref-qs-4x-create-run-harmonize-flow.md imgpath=var-imgpath entityname="Product" harmonizeflowname="Harmonize Products" mappingname="Product Mapping" create=true run=true fullsteps=true %}


## See Also
- [Using Model-to-Model Mapping]({{site.baseurl}}/harmonize/mapping/)


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
