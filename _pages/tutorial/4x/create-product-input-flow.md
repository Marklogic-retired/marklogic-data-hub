---
layout: inner
title: Tutorial - Create the Product Input Flow
permalink: /tutorial/4x/create-product-input-flow/
---

# Tutorial: Create the Product Input Flow

**Input flows** are responsible for getting data into the Hub staging area. These flows wrap incoming data in envelopes so you can track lineage and provenance. Such tracking enables you to answer questions such as: Who loaded this data? When was it loaded? Where did it come from?

**Harmonize flows** are responsible for batch harmonization of data from staging to final. Harmonization is the *main purpose* of using the Data Hub Framework.

In this exercise, we create an input flow for our Product entity. The input flow will enable us to load data into the staging area as-is. Exploring the as-is data enables you to understand it better and refine your entity models.

To create an input flow, click **Flows** in the top navigation bar:

![Click Flows]({{site.baseurl}}/images/3x/create-product-input-flow/select-flows.png)

Now, use the following procedure to create an input flow for the Product entity:

1. Click **Product** in the left sidebar to expand the flow options for this entity. You should see Input Flows and Harmonize Flows.
1. Click the **+** icon next to **Input Flows**. The Create Input Flow dialog appears.
1. Type **Load Products** in the **Input Flow Name** field.
1. Click **CREATE** to save your new flow and dismiss the dialog. Your new flow shows up under Input Flows in the left sidebar.

The following picture summarizes the procedure for creating an input flow:

![New Load Products Flows]({{site.baseurl}}/images/3x/create-product-input-flow/create-load-product-flow.png)


{% include prev-next-nav.html
  prevtext="Create the Product Entity"
  prevlink="/tutorial/4x/create-product-entity/"
  increl="tutorial-toc.md"
  nexttext="Load the Product Data As-Is"
  nextlink="/tutorial/4x/load-products-as-is/"
%}
