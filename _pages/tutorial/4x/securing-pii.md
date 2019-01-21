---
layout: inner
title: Tutorial - Securing Personally Identifiable Information
permalink: /tutorial/4x/securing-pii/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Securing Personally Identifiable Information

To protect personally identifiable information (PII), we will identify them in QuickStart, which automatically generates PII security configuration files. Then we will deploy these configuration files to the **FINAL** database.


## Identify PII

{% include conrefs/conref-qs-4x-identify-pii.md imgpath=var-imgpath entityname="Order" %}


## Deploy Configuration Files

To deploy the PII security configuration files to the **FINAL** database,

1. Open a command-line window, and navigate to your DHF project root directory.
1. {% include ostabs-run-gradle-step.html grtask="mlDeploySecurity" %}
{:.ol-steps}


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
