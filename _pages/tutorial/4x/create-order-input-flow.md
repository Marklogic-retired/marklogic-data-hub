---
layout: inner
title: Tutorial - Create the Order Input Flow
permalink: /tutorial/4x/create-order-input-flow/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Create the Order Input Flow

Next, we create an input flow for the `Order` entity, following the same procedure we used to create the `Product` input flow.

{% include conrefs/conref-qs-create-input-flow.md imgpath=var-imgpath entityname="Order" %}


### Result

Your new flow appears under **Input Flows**{:.uilabel} in the left panel.
  {% assign full-imgpath = var-imgpath | append: "qs-4x-flows-result-load-orders.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="Load Orders in the list of input flows" class="screenshot" %}


{% include prev-next-nav.html
  prevtext="Create the Order Entity"
  prevlink="/tutorial/4x/create-order-entity/"
  increl="tutorial-toc.md"
  nexttext="Load the Raw Orders Data"
  nextlink="/tutorial/4x/load-raw-orders/"
%}
