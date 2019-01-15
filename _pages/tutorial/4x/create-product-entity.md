---
layout: inner
title: Tutorial - Create the Product Entity
permalink: /tutorial/4x/create-product-entity/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Create the Product Entity

Entities are the business objects that you will be working with in the data hub. MarkLogic's [Entity Services](https://docs.marklogic.com/guide/entity-services) allows you to create models of your business entities. Using these data models, you can then generate code scaffolding, database configurations, index settings, and validations. The Data Hub Framework handles many of these tasks for you. Later in this tutorial we will use the index and scaffolding generation.

{% include conrefs/conref-qs-create-entity.md imgpath=var-imgpath entityname="Product" %}


### Result

The new `Product` entity card is displayed.
  {% assign full-imgpath = var-imgpath | append: "qs-4x-entities-entity-card-Product-00.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="" class="screenshot" %}


{% include prev-next-nav.html
  prevtext="Install the Data Hub Framework"
  prevlink="/tutorial/4x/install/"
  increl="tutorial-toc.md"
  nexttext="Create the Product Input Flow"
  nextlink="/tutorial/4x/create-product-input-flow/"
%}
