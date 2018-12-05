---
layout: inner
title: Getting Started Tutorial<br>Create a Model-to-Model Mapping for Product
lead_text: ''
permalink: /tutorial/mapping-product-entity/
---

# Getting Started Tutorial<br>Create a Model-to-Model Mapping for Product

This exercise walks you through creating a mapping for the Product entity.

### Model to Model Mapping Introduction
The Data Hub Framework enables you to control the source of an entity property value in two ways:
* Define a mapping from source to entity property that can be used to generate customized harmonization code.
* Customize the default code harmonization code yourself.

In many cases, a value in your source data model can be mapped directly on to its corresponding canonical entity property, perhaps with a simple type conversion. Data Hub Framework calls this _model to model mapping_ because you are mapping data from your (inferred) source data model to your canonical entity model.

A mapping enables you to quickly and easily create a harmonization flow without writing or modifying code.

You can create a mapping using QuickStart's mapping tool. QuickStart generates a list of possible source JSON property names by examining one of your source documents. Then, you use the UI to specify which source properties map to which entity properties.

To learn more about model to model mapping, see [Using Model-to-Model Mapping]({{site.baseurl}}/harmonize/mapping/).

### Product Mapping Requirements
We want to define a mapping that maps the **SKU** JSON property in the source data on to the **sku** entity property. The value is represented as a string in both source and model.

Similarly, we want to map the **price** JSON property on to the **price** entity property. In the source data, the price is stored as a string, but **price** has decimal type in our Product model.

### Create the Product Mapping

To get started with mapping, click **Mapping** in the top navigation bar.

![Click Mappings]({{site.baseurl}}/images/3x/mapping-product-entity/select-mappings.png)

Follow these steps to create a new mapping:

1. Click **+** next to **Product** in the left sidebar. The Mapping Creation dialog appears.
1. Type **ProductMapping** in the **Mapping Name** field.
1. Click **CREATE**. The mapping editor appears.

The following picture summarizes the steps for creating a mapping:

![Create Mapping]({{site.baseurl}}/images/3x/mapping-product-entity/create-mapping.png)

The mapping editor displays a row for each property in your entity model. The right column in each row is the name of an entity property. The left column in each row is a dropdown list from which you can select the source property to map on to the entity property in the right column.

QuickStart generates the list of source property names by examining one of your source documents in the STAGE database. You can view the URI of the selected document at the top of the **Source** column of the mapping editor.

You change the source document by clicking on the pencil icon next to the source URI. To find an alternative document URI, use the **Browse Data** view to review the documents in the "Product" collection in the **STAGING** database.

The following diagram illustrates key parts of the mapping editor:

![Mapping Editor]({{site.baseurl}}/images/3x/mapping-product-entity/mapping-editor.png){:.screenshot-border}

Next, map the **sku** and **price** properties using the following steps:

1. Click the dropdown in the **Source** column of the **sku** row. You see a list of the JSON property names found in the source document, along with the data type and an example value of each.
1. Scroll down or type into the text box at the top of the list to locate **SKU**, then select it.
1. Click the dropdown in the **Source** column of the **price** row.
1. Find and select **price** in the dropdown list.
1. Click **SAVE MAP** in the upper right corner to save your changes.

Your final Product mapping should look like the following:

![Final Product Mapping]({{site.baseurl}}/images/3x/mapping-product-entity/final-product-map.png){:.screenshot-border}

Next, we will create a harmonization flow that uses the mapping, and then run it to harmonize the product data.

## Up Next

[Harmonizing the Product Data](../harmonizing-product-data/)
