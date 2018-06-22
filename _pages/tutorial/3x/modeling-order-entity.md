---
layout: inner
title: Getting Started Tutorial 3.x<br>Modeling the Order Entity
lead_text: ''
permalink: /tutorial/modeling-order-entity/
---

## Determine What to Model

If we were developing a production application, we would now explore the order data to understand it better before making entity modeling decisions. Let's skip ahead and pretend that we have spoken to our company's data guru again and have learned the following about the order data:

* Each order can have more than one product.
* Each product in an order has a variable quantity.
* Each product is identified by its sku.
* Each order should include a total price, computed from the per product prices and quantities.

From this, we know we want to harmonize three fields: **id**, **price**, 
and **products**.

* **id** is the unique identifier of each order.
* **price** is the total price of the entire order.
* **products** will be an array of pointers to the Product entities in our Final database.

Let's look at the first order, which has an id equal to 1.

~~~
id,customer,order_date,ship_date,product_id,sku,price,quantity,discounted_price,title,description
1,600,04/20/2017,05/02/2017,1000055,101591922267,4.5,1.0,3.92,different gallon,
1,600,04/20/2017,05/02/2017,1000153,164451986229,4.5,1.0,3.92,unwilling eave,
1,600,04/20/2017,05/02/2017,1000066,118675935929,33.99,2.0,32.53,stingy sharon,
~~~
{: .language-csv}

For purposes of our entity modeling, this order contains the following key pieces of information:

| SKU | Quantity | Item Price |
| :--- | :---: | ---: |
| 101591922267 | 1.0 | 4.5 |
| 164451986229 | 1.0 | 4.5 |
| 118675935929 | 2.0 | 33.99 |

From this information, we can compute the price of the order as follows:

~~~
(4.5 * 1) +
(4.5 * 1) +
(33.99 * 2)
-----------
$76.98
~~~

Now, we can model our Order entity. 

1. Click **Entities** in the top navigation bar.
1. Open the entity editor by clicking on the **pencil** icon (<i class="fa fa-pencil"></i>) in the upper right corner of the Order entity.

    ![Open Editor]({{site.baseurl}}/images/3x/modeling-order-entity/open-editor.png)

## Add the **id** Property
1. Click **+**{:.circle-button} below **Properties** to add a new property.
1. Click the area just below the **key** icon (<i class="fa fa-key"></i>) to make **id** the primary key.
1. Click the area just below the **lightning bolt** icon (<i class="fa fa-bolt"></i>) to specify the need for an element range index for this property.
1. Enter **id** as the Name.
1. Select **string** as the Type.

The following pictures summarize the steps for adding the **id** property:

![Edit Entity]({{site.baseurl}}/images/3x/modeling-order-entity/edit-order-entity.png)

## Add the **price** Property

1. Click **+**{:.circle-button} below **Properties** to add another property.
1. Enter **price** as the Name.
1. Select **decimal** as the Type.

## Add the **products** Property

1. Click **+**{:.circle-button} below **Properties** to add another property.
1. Enter **products** as the Name.
1. Select **Product** as the Type.
1. Select **1..∞** as the Cardinality. This indicates an Order can contain more than one Product.

Your final Order properties definitions should look like the following:

![Edit Entity]({{site.baseurl}}/images/3x/modeling-order-entity/order-properties.png)

Click **Save**. When asked whether or not to update indexes in MarkLogic, click **Yes**.

You should now see Order and Product entity definitions similar to the following. If you do not see the properties for an entity, click and drag the lower right corner of the entity definition box to resize it.

![Update Indexes]({{site.baseurl}}/images/3x/modeling-order-entity/model-order-final.png)

One of the benefits of having the Data Hub Framework model your data with Entity Services is that it can use the model to create database configuration options automatically. This means it can update the necessary index settings based on how you model your data.

## Up Next

[Harmonizing the Order Data](../harmonizing-order-data/)
