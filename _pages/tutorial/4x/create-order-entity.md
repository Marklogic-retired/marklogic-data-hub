---
layout: inner
title: Tutorial - Create the Order Entity
permalink: /tutorial/4x/create-order-entity/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Create the Order Entity

Next, we create an `Order` entity, following the same procedure we used to create the `Product` entity.

{% include conrefs/conref-qs-create-entity.md imgpath=var-imgpath entityname="Order" %}


### Result

The new `Order` entity card is displayed.
  {% assign full-imgpath = var-imgpath | append: "qs-4x-entities-entity-card-Order-00.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="" %}

{% include note.html type="NOTE" content="The `Order` entity card might be hidden behind the `Product` entity card. Click and drag the `Product` entity card to uncover the `Order` entity card." %}


{% include prev-next-nav.html
  prevtext="Harmonize the Product Data"
  prevlink="/tutorial/4x/harmonizing-product-data/"
  increl="tutorial-toc.md"
  nexttext="Create the Order Input Flow"
  nextlink="/tutorial/4x/create-order-input-flow/"
%}
