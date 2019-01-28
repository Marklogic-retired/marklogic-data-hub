---
layout: inner
title: Tutorial - Browse the Data
permalink: /tutorial/4x/browse-data/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Browse the Data

At this point, we have only loaded the raw data; therefore, the staging database is populated, but the final database is not.

In this exercise, we will browse the ingested data in the staging database.

{% include conrefs/conref-qs-4x-browse-data.md imgpath=var-imgpath pickdb="STAGING" pickitem="the first dataset item" %}


### Result

{% assign full-imgpath=var-imgpath | append: "qs-4x-browse-data-item-detail.png" %}{% include thumbnail.html imgfile=full-imgpath alttext="Browse Data item detail" imgclass="img-small" tab="  " %}


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
