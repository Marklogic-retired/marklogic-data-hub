---
layout: inner
title: Create a DHF Project Using QuickStart
permalink: /project/quickstart/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Create a DHF Project Using QuickStart

{% include note.html type="IMPORTANT" content="QuickStart is not supported for production use." %}


## 1 - Set up the project directory.
  1. Create a directory for your DHF project. This directory will be referred to as "your project root" or simply "root".
  1. {% include conrefs/conref-qs-4x-download.md warver=site.data.global.hub_version_4x v="v" %}
  {:.ol-steps}

## 2 - Start QuickStart.
  {% include conrefs/conref-qs-4x-start.md imgpath=var-imgpath %}

  Result:
    {% assign full-imgpath = var-imgpath | append: "qs-4x-install.png" %}{% include thumbnail.html imgfile=full-imgpath imgclass="img-results" alttext="" tab="  " %}

## 3 - Install the data hub.
  {% include conrefs/conref-qs-4x-install-dh.md imgpath=var-imgpath %}

***Result***

When installation is complete, the **Dashboard**{:.uilabel} page displays the three initial databases and the number of documents in each.
- **Staging**{:.uilabel} contains incoming data.
- **Final**{:.uilabel} contains harmonized data.
- **Jobs**{:.uilabel} contains data about the jobs that are run and tracing data about each harmonized document.

  {% assign full-imgpath = var-imgpath | append: "qs-4x-dashboard-00.png" %}{% include thumbnail.html imgfile=full-imgpath imgclass="img-results" alttext="" tab="  " %}


## Next
- [Ingest Using QuickStart]({{site.baseurl}}/ingest/quickstart/)

## See Also
- [Ingest Overview and Tools]({{site.baseurl}}/ingest/)
- [DHF Project Directory Structure]({{site.baseurl}}/refs/project-structure/)
