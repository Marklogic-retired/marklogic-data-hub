---
layout: inner
title: Tutorial - Create the Entities
permalink: /tutorial/4x/create-entities/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Create the Entities

Entities are the business objects that you work with in the data hub. MarkLogic's [Entity Services](https://docs.marklogic.com/guide/entity-services) allows you to create models of your business entities. Using these data models, you can then generate code scaffolding, database configurations, index settings, and validations. The Data Hub Framework handles many of these tasks for you.

In this section, we create entities for the **Product**, **Customer**, and **Order** datasets.


## Product

{% include conrefs/conref-qs-4x-create-entity.md imgpath=var-imgpath entityname="Product" fullsteps=true %}

### Result

The new `Product` entity card is displayed.
  {% assign full-imgpath = var-imgpath | append: "qs-4x-entities-entity-card-Product-00.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="" imgclass="img-results" tab="  " %}


## Order

Perform the same steps for **Order**.
{% include conrefs/conref-qs-4x-create-entity.md imgpath=var-imgpath entityname="Order" fullsteps=false %}

{% include note.html type="TIP" content="Entity cards might be hidden behind the top one. Drag the top entity card to uncover others." %}


## Customer

Perform the same steps for **Customer**.
{% include conrefs/conref-qs-4x-create-entity.md imgpath=var-imgpath entityname="Customer" fullsteps=false %}


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
