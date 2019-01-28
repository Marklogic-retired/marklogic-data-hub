---
layout: inner
title: Tutorial - Secure Personally Identifiable Information
permalink: /tutorial/4x/secure-pii-in-customer-data/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Securing Personally Identifiable Information

Securing personally identifiable information (PII) was [introduced in DHF v4.0.0]({{site.baseurl}}/release-notes/release-notes-4_0_x/). To protect PII, the PII fields must be identified in the entity model. Then QuickStart automatically generates PII security configuration files, which we will deploy to the **FINAL** database.

We have already loaded the **Customer** raw data by:
  - [creating the **Customer** entity]({{site.baseurl}}/tutorial/4x/create-entities/) and
  - [creating and running the associated input flow]({{site.baseurl}}/tutorial/4x/create-run-input-flows/).

In this section, we will:
  - [Define the entity model](#1_-_define_the_entity_model) by adding properties to the entity model.
  - [Define the source-to-entity mapping](#2_-_define_the_mappings) to specify which field in the dataset corresponds to the properties in the entity model.
  - [Create and run the Harmonize Flow.](#3_-_create_and_run_the_harmonize_flow)
  - [Deploy the configuration files.](#4_-_deploy_the_configuration_files)


## 1 - Define the Entity Model

To simplify this tutorial, we are going to harmonize only the primary key (`id`) and two fields that we choose to protect as PII (`billing_address` and `shipping_address`).

  | Name | Type | Other settings | Notes |
  |:---:|:---:|:---:|---|
  | `id`               | string | key | Unique for each customer. |
  | `billing_address`  | string | PII |  |
  | `shipping_address` | string | PII |  |
  {:.table-b1gray}

{% include conrefs/conref-qs-4x-define-entity-model.md imgpath=var-imgpath entityname="Customer" fullsteps=true %}


## 2 - Define the Mappings

Because the information can easily be mapped between the source dataset and the entity model, we will create the following source-to-entity mappings:

  | field in raw dataset (type) | property in entity model (type) | Notes |
  |---|---|---|
  | `id` (string)               | `id` (string)               | No changes |
  | `billing_address` (string)  | `billing_address` (string)  | No changes |
  | `shipping_address` (string) | `shipping_address` (string) | No changes |
  {:.table-b1gray}

{% include conrefs/conref-qs-4x-define-source-to-entity-maps.md imgpath=var-imgpath entityname="Customer" mappingname="Customer Mapping" fullsteps=true %}


## 3 - Create and Run the Harmonize Flow

Harmonization uses the data in your **STAGING** database to generate canonical entity instances in **FINAL** database.

{% include conrefs/conref-qs-4x-create-run-harmonize-flow.md imgpath=var-imgpath entityname="Customer" harmonizeflowname="Harmonize Customers" mappingname="Customer Mapping" create=true run=true fullsteps=true %}


## 4 - Deploy the Configuration Files

To deploy the PII security configuration files to the **FINAL** database,

1. Open a command-line window, and navigate to your DHF project root directory.
1. {% include ostabs-run-gradle-step.html grtask="mlDeploySecurity" %}
{:.ol-steps}


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
