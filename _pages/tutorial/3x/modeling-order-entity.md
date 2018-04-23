---
layout: inner
title: Getting Started Tutorial 3.x<br>Modeling the Order Entity
lead_text: ''
permalink: /tutorial/modeling-order-entity/
---

In real life, we would browse the loaded data to try and better understand it. Let's skip ahead and pretend that we have spoken to our company's data guru again.

The order data we loaded is different than the product data. Each order can have more than one product. And for each product there can be a variable quantity.

Let's look at the first order, which has an id equal to 1.

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

Let's start modeling our entity. <i class="fa fa-hand-pointer-o"></i> Click **Entities** in the top navigation bar.

![Click Entities Tab]({{site.baseurl}}/images/3x/modeling-order-entity/click-entities-3.png)

1. <i class="fa fa-hand-pointer-o"></i> Click the pencil icon <i class="fa fa-pencil"></i> for the **Order** entity.
1. <i class="fa fa-hand-pointer-o"></i> Click **+**{:.circle-button} below **Properties** to add a new row.
1. Type **id** as the Name.
1. <i class="fa fa-hand-pointer-o"></i> Click the area just below the **key** icon to make this row the primary key.
1. <i class="fa fa-hand-pointer-o"></i> Click the area just below the **lightning bolt** icon to set an element range index for this row.
1. Select **string** as the Type.

![Edit Entity]({{site.baseurl}}/images/3x/modeling-order-entity/edit-order-entity.png)

1. <i class="fa fa-hand-pointer-o"></i> Click **+**{:.circle-button} below **Properties** to add a new row.
1. Type **price** as the Name.
1. Select **decimal** as the Type.

![Edit Entity]({{site.baseurl}}/images/3x/modeling-order-entity/edit-order-entity2.png)

1. <i class="fa fa-hand-pointer-o"></i> Click **+**{:.circle-button} below **Properties** to add a new row.
1. Type **products** as the Name.
1. Select **Product** as the Type.
1. Select **1..∞** as the Cardinality.
1. <i class="fa fa-hand-pointer-o"></i> Click **SAVE**{:.blue-button}.

![Edit Entity]({{site.baseurl}}/images/3x/modeling-order-entity/edit-order-entity3.png)

After clicking **Save** you will be prompted whether you want to update indexes in MarkLogic or not.

<i class="fa fa-hand-pointer-o"></i> Click **Yes**.

![Update Indexes]({{site.baseurl}}/images/3x/modeling-order-entity/update-indexes2.png)

One of the benefits of having the Data Hub Framework model your data with Entity Services is that it can use the model to create database configuration options automatically. This means it can update the necessary index settings bases on how you model your data. For the Product entity, you made sku the primary key. The Data Hub Framework will create a range index on the sku element.

## Up Next

[Harmonizing the Order Data](../harmonizing-order-data/)
