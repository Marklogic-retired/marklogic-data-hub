---
layout: inner
title: Getting Started Tutorial 2.x<br>Modeling the Order Entity
lead_text: ''
permalink: getting-started-2x/modeling-order-entity
---

In real life we would browse the loaded data to try and better understand it. Let's skip ahead and pretend that we have spoken to our Data Guru again.

The Order data we loaded is different than the Product data. Each order can have more than one Product. And for each product there can be a variable quantity.

Let's look at order 1.

~~~
id,customer,order_date,ship_date,product_id,sku,price,quantity,discounted_price,title,description
1,600,04/20/2017,05/02/2017,1000055,101591922267,4.5,1.0,3.92,different gallon,
1,600,04/20/2017,05/02/2017,1000153,164451986229,4.5,1.0,3.92,unwilling eave,
1,600,04/20/2017,05/02/2017,1000066,118675935929,33.99,2.0,32.53,stingy sharon,
~~~
{: .language-csv}

We can see that there are three products in this order. We want to refer to them by sku: 101591922267, 164451986229, and 118675935929. Note that 118675935929 has a quantity of 2.0. Our data guru wants us to compute the total price for each order. To compute the price for this order we need to do some math.

~~~
(4.5 * 1) +
(4.5 * 1) +
(33.99 * 2)
-----------
$76.98
~~~

We know that we want to harmonize three fields: **id**, **price**, and **products**. id is the unique identifier for each order. Price will be the total price of the entire order. Products will be an array of pointers to the Product entities in our Final database.

Let's start modeling our Entity. <i class="fa fa-hand-pointer-o"></i> Click on the **Entities** tab in the top navigation bar.

![Click Entities Tab]({{site.baseurl}}/images/2x/click-entities-3.png)

1. <i class="fa fa-hand-pointer-o"></i> Click on the **pencil** icon <i class="fa fa-pencil"></i> for the **Order** entity.
1. <i class="fa fa-hand-pointer-o"></i> Click the **+**{:.circle-button} button below **Properties** to add a new row.
1. <i class="fa fa-hand-pointer-o"></i> Click in the area just below the **key** icon to make this row the primary key.
1. Type in **id** as the Name.
1. Change the Type to **string**.

![Edit Entity]({{site.baseurl}}/images/2x/edit-order-entity.png)

1. <i class="fa fa-hand-pointer-o"></i> Click the **+**{:.circle-button} button below **Properties** to add a new row.
1. Type in **price** as the Name.
1. Change the Type to **decimal**.

![Edit Entity]({{site.baseurl}}/images/2x/edit-order-entity2.png)

1. <i class="fa fa-hand-pointer-o"></i> Click the **+**{:.circle-button} button below **Properties** to add a new row.
1. Type in **products** as the Name.
1. Change the Type to **Product**.
1. Change the cardinality to 1..∞
1. <i class="fa fa-hand-pointer-o"></i> Click the **SAVE**{:.blue-button} button.

![Edit Entity]({{site.baseurl}}/images/2x/edit-order-entity3.png)

After clicking **Save** you will be prompted whether you want to Update Indexes in MarkLogic or not.

<i class="fa fa-hand-pointer-o"></i> Click **YES**.

One of the benefits of modeling your data with Entity Services is that we can use the model to create database configuration options automatically. This means we can update the necessary index settings bases on how you model your data. For the Product entity, we made sku the primary key. The Data Hub Framework will create a range index on the sku element.

![Update Indexes]({{site.baseurl}}/images/2x/update-indexes2.png)

## Up Next

[Harmonizing the Order Data](/marklogic-data-hub/getting-started-2x/harmonizing-order-data)
