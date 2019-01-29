---
layout: inner
title: Tutorial - Install the Data Hub Framework
permalink: /tutorial/4x/install/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}

# Tutorial: Install the Data Hub Framework

## 1 - Set Up the Project Directory and Sample Data

1. Create a directory called `data-hub`. This directory will be referred to as "your project root" or simply "root".
1. {% include conrefs/conref-qs-4x-download.md warver=site.data.global.hub_version_4x v="v" %}
1. Under your project root, create a directory called `input`.
1. Download the [sample data .zip file]({{site.baseurl}}/data/store-data.zip){:target="_blank"}. Expand it, as needed.
1. Copy the subdirectories (e.g., `campaigns`, `customers`, `orders`) inside the sample data .zip file into the `input` directory.
{:.ol-steps}

### Result

Your project directory structure will be as follows:

<pre class="dirtree">
  data-hub
  ├─ quick-start-{{ site.data.global.hub_version_4x }}.war
  └─ input
     ├─ campaigns
     ├─ customers
     ├─ issuehistories
     ├─ issues
     ├─ orders
     ├─ parties
     ├─ products
     │  ├─ games
     │  └─ misc
     ├─ responses
     └─ supportcustomers
</pre>


## 2 - Start QuickStart

{% include conrefs/conref-qs-4x-start.md imgpath=var-imgpath %}

### Result

  {% assign full-imgpath = var-imgpath | append: "qs-4x-install.png" %}{% include thumbnail.html imgfile=full-imgpath imgclass="img-results" alttext="" tab="  " %}


## 3 - Install the Data Hub

{% include conrefs/conref-qs-4x-install-dh.md imgpath=var-imgpath %}

### Result

When installation is complete, the **Dashboard**{:.uilabel} page displays the three initial databases and the number of documents in each.
- **Staging**{:.uilabel} contains incoming data.
- **Final**{:.uilabel} contains harmonized data.
- **Jobs**{:.uilabel} contains data about the jobs that are run and tracing data about each harmonized document.

  {% assign full-imgpath = var-imgpath | append: "qs-4x-dashboard-00.png" %}{% include thumbnail.html imgfile=full-imgpath imgclass="img-results" alttext="" tab="  " %}


## See Also
- [DHF Project Directory Structure]({{site.baseurl}}/refs/project-structure/)


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
