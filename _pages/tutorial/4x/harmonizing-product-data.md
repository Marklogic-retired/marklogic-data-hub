---
layout: inner
title: Tutorial - Harmonize the Product Data
permalink: /tutorial/4x/harmonizing-product-data/
---

{% assign var-imgpath = site.baseurl | append: "/images/4x/" %}


# Tutorial: Harmonize the Product Data





## Run the Flow

When you run a harmonization flow, the Data Hub Framework uses the data in your **STAGING** database to generate canonical entity instances in **FINAL** database.

Use the following procedure to run a flow:

1. Click the **Flow Info** tab if you are not already on that tab.
1. Click **Run Harmonize** to start the flow. A pop-up appears at the bottom of the page indicating your harmonization job has started.

When harmonization completes, a notification pop-up appears at the bottom of the page.

## Check the Harmonized Job Status

Recall that we verified the job status after running the input flow. We will now do the same thing for the harmonize flow.

1. Click **Jobs** in the top navigation bar to view your jobs.
1. Verify the harmonization job appears in the list and has a FINISHED status.

![Harmonized Products Jobs]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonized-products-jobs.png)

## Explore the Harmonized Data

To explore the harmonized data:

1. Click **Browse Data** in the top navigation bar to display the data browser.
1. Select **Final** in the database dropdown. The search results show the harmonized documents.
1. Click a result to see the harmonized data. For example:

![Harmonized Product Detail]({{site.baseurl}}/images/3x/harmonizing-product-data/harmonized-product-details.png){:.screenshot-border}

Congratulations! You just loaded and harmonized your product data. Up next is doing the same thing for the order data.


{% include prev-next-nav-tut4xtoc.html gotopage="tutorial-toc.md" %}
