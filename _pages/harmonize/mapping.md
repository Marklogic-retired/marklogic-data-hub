---
layout: inner
title: Using Model-to-Model Mapping
permalink: /harmonize/mapping/
---

# Using Model-to-Model Mapping

Use a model-to-model mapping to quickly and easily define how to harmonize source data to produce entity instances without writing any code.
* [What is Model-to-Model Mapping?](#what-is-model-to-model-mapping?)
* [Creating a Mapping](#creating-a-mapping)
* [Changing the Mapping Source Document](#changing-the-mapping-source-document)
* [Using a Mapping for Harmonization](#using-a-mapping-for-harmonization)
* [Modifying an Existing Mapping](#modifying-an-existing-mapping)
* [Understanding the Harmonization Code](#understanding-the-harmonization-code)
* [Model-to-Model Mapping Limitations](#model-to-model-mapping-limitations)


## What is Model-to-Model Mapping?

The process of harmonization extracts values from your source data and uses them to create canonical instances of your entity model. A model-to-model mapping defines the source property from which to extract a given entity property value.

For example, the following diagram illustrates a case where the **sku** entity property is extracted from the **SKU** source property and the **price** entity property is extracted from the **price** source property.

![Basic Mapping Diagram]({{site.baseurl}}/images/mapping/m2m-basic.png)

A model-to-model mapping enables you to encode such relationships so Data Hub Framework can act on them.

The models in "model-to-model mapping" are your source model and your entity model. The source model is inferred from your source data, rather than explicitly defined in the same way as your entity model. When you create a mapping using the QuickStart **Mappings** view, QuickStart infers this for you.

When you configure a harmonization flow, you can associate a mapping with the flow, so mapping creation fits into your workflow between modeling and harmonization. For example, you might go through steps such as the following:

![Mapping Workflow]({{site.baseurl}}/images/mapping/workflow.png)

For details, see [Using a Mapping for Harmonization](#using-a-mapping-for-harmonization).

When you associate a mapping with a harmonization flow, Data Hub Framework generates harmonization code that extracts entity property values from the sources specified in the mapping. You can customize the generated code. For more details, see [Understanding the Harmonization Code](#understanding-the-harmonization-code).

Model-to-model mapping addresses many common harmonization use cases, but it is not the best choice for some cases. For details, see [Model-to-Model Mapping Limitations](#model-to-model-mapping-limitations).

## Creating a Mapping

Use the **Mappings** view of QuickStart to create a model-to-model mapping. Mappings are stored in your project under `plugins/mappings/`.

Before you can create a mapping in QuickStart, you must do the following:
* ingest some source data
* model the entity properties you want to target with the map

You must ingest some data first because QuickStart uses the source data to create the list of source properties from which you can select.

Use the following procedure to create a mapping in QuickStart:
1. Click **Mappings** in the top navigation bar. The Mappings view appears.
1. Click **+** next to the entity type for which you want to create a mapping. The mapping creation dialog opens.
1. Enter a name for the mapping.
1. Optionally, enter a description of the mapping.
1. Click **CREATE** to save the mapping. The mapping editor appears.

The mapping editor displays a row for each property in the target entity model. The right column in each row is the name of an entity property. The left column in each row is a dropdown list from which you can select the source property to map on to the entity property in the right column.

The following diagram highlights key parts of the mapping editor:

![Mapping Editor Highlights]({{site.baseurl}}/images/mapping/mapping-editor.png){:.screenshot-border}

QuickStart chooses an arbitrary document from the appropriate source documents in the STAGING database from which to create the list of source properties, but you can change it. For details, see [Changing the Mapping Source Document](#changing-the-mapping-source-document).

When you create or update a mapping, QuickStart saves the mapping configuration in your project as:
```
plugins/mappings/mappingName/mappingName-version.json
```
For example, version 1 of a mapping named ProductMapping is saved as:
```
plugins/mappings/ProductMapping/ProductMapping-1.json
```
Each time you modify a mapping, QuickStart saves a new version. For details, see [Modifying an Existing Mapping](#modifying-an-existing-mapping).

## Changing the Mapping Source Document

You can change the source document from which QuickStart generates the list of source property names. When you change the source document, the mapping resets, and you will have to re-map all the properties.

You can browse the **STAGING** data base to find an alternative source document:

1. Click **Browse Data** in the top navigation bar. The data browser view appears.
1. Choose **STAGING** from the database dropdown at the top of the data browser.
1. In the Collections control on the left, click the name of the entity type whose source data you want to review. The browser lists only the documents in the selected collection.
1. Review or search the documents to find a suitable source.
1. Copy or note the URI of your chosen source.

Once you know the source URI, use these steps to modify the mapping:

1. Click **Mappings** in the top navigation bar. The Mappings view appears.
1. Click on the name of the mapping you want to change. The mapping editor appears.
1. Click the pencil icon next to the Source URI.
1. Replace the current URI with your new one.
1. Click the checkmark to save your change.
1. Click **OK** in the confirmation dialog.

## Using a Mapping for Harmonization

When you create a harmonization flow from the QuickStart **Flows** view, you can specify the name of an existing mapping. In the following picture, "ProductMapping" is the name of a previously created mapping.

![Add Mapping to Flow]({{site.baseurl}}/images/mapping/add-map-to-flow.png){:.screenshot-border}

When you save the flow, Data Hub Framework generates harmonization code based on the mapping. The mapping affects the code you see on the **CONTENT** tab of the flows view. To learn more about the resulting code, see [Understanding the Harmonization Code](#understanding-the-harmonization-code).

You cannot add a mapping to an existing flow. Instead, create a new flow that uses the mapping.

For an end to end example, see the following parts of the QuickStart tutorial:

* [Create a Model-to-Model Mapping for Product]({{site.baseurl}}/tutorial/3x/mapping-product-entity/)
* [Harmonize the Product Data]({{site.baseurl}}/tutorial/3x/harmonizing-product-data/)

## Modifying an Existing Mapping

Each time you modify a mapping, QuickStart saves a new version of the mapping configuration file under `plugins/mappings/`.

A harmonization flow configured to use a mapping always uses the latest version of the mapping _at the time you create the flow_. The harmonization code is not regenerated when you change the mapping.

Therefore, when you modify a mapping, you must create a new harmonization flow to exercise it. If you have harmonization code customizations, you must reapply them to the new code.

Creating a new mapping version and a new flow for each mapping change enables you to safely experiment with different harmonization flows.

To modify a mapping and then use it for harmonization:

1. Click the **Mappings** tab in in the top navigation bar. The Mappings view appears.
1. Click on the name of the mapping to be modified.
1. Make your changes.
1. Click **SAVE MAP** to save your changes.
1. Click the **Flows** tab.
1. Create a new harmonization flow that uses the mapping.

## Understanding the Harmonization Code

When you configure a harmonization flow with a mapping, Data Hub Framework generates code for the Content plugin based on the mapping.

Harmonization code for some entity type _T_ always includes a function named `extractInstanceT`. Data Hub Framework calls this function when constructing entity instance envelope documents during harmonization. The code in the function is affected by your mapping, and this function is usually where you will apply content customizations.

The `extractInstanceT` function contains a variable declaration for each entity property. This declaration extracts the source property value for use as the corresponding entity property value.

For some entity property _EP_ whose value gets extracted from a source property _SP_, the declaration looks like the following. Notice that if the source data does not include the targeted property, then the entity property is initialized to `null`.
```javascript
let EPName = !fn.empty(source.xpath(pathToSP))
             ? EPType(fn.head(source.xpath(pathToSP)))
             : null
```

If you need to customize the handling of a property and you do so through setting this variable, then you generally do not need to change the rest of the code.

For example, the QuickStart tutorial uses a mapping to harmonize Product entity instances. The mapping maps **SKU** to **sku**, resulting in the following declaration in the `extractInstanceProduct` function of the content plugin:
```javascript
let sku = !fn.empty(source.xpath('//SKU'))
          ? xs.string(fn.head(source.xpath('//SKU')))
          : null;
```
The generated code casts the source value to the entity property type. If this is not sufficient to transform the source value to the entity property type, you must customize the code.

For example, in the tutorial's Product mapping, the **price** property has string type in the source data, but decimal type in the Product entity type, so the generated code looks like the following. Since the **price** source data always contains serialized numbers, no customization is needed transform the source string value into an `xs:decimal` value.
```javascript
let price = !fn.empty(source.xpath('//price'))
            ? xs.decimal(fn.head(source.xpath('//price')))
            : null;
```
Data Hub Framework generates default harmonization code for any entity property not specified in the mapping. The default code is based on the following assumption:

* The source property has the same name as the entity property.
* The source property value can be cast directly to the entity property data type.
* The source property can be accessed with the XPath expression '/_propName_'.

## Model-to-Model Mapping Limitations

A model-to-model mapping is best suited for defining the relationship between source and entity properties when all of the following conditions are true:

* Your source documents are flat JSON documents. That is, all the source properties are root level properties. For details, see [Flat JSON Requirement](#flat-json-requirement).
* The relationship between source and entity property value is one-to-one. That is, harmonization extracts the value of a given entity property from exactly one value in one source document. For details, see [One-to-One Mapping Requirement](#one-to-one-mapping-requirement).
* The source value does not require transformation beyond a simple type cast. For details, see [Simple Value Transformation Requirement](#simple-value-transformation-requirement)

If these conditions are not met, you might still be able to use a mapping to generate baseline code and then customize the code to handle properties that cannot be covered by the mapping.

To learn more about the generated code, see [Understanding the Harmonization Code](#understanding-the-harmonization-code).

### Flat JSON Requirement

The following is an example of hierarchical source data that is not suitable for model-to-model mapping. You could use model-to-model mapping to define “id” as a source for an entity property, but you could not use “first” or “last” because they are not root level properties.
```json
{ "id": 1234,
  "name": {
    "first": "Joe",
    "last": "Schmoe"
  }
}
```
In such a case, you can generate a harmonization flow without using a mapping, and then customize the code for your application.

### One-to-One Mapping Requirement

The products property of the Order entity type used by the QuickStart tutorial is an example of a property whose value is derived from multiple sources.

The products property of an Order is an array of references to Product entity instances, and each reference in the array is derived from a different source document, as shown in the following diagram.

![Many Sources to One Instance]({{site.baseurl}}/images/mapping/many-to-one.png)

Such a relationship cannot be captured in a mapping. Whether you use a mapping to generate baseline code or not, you must customize the content plugin to handle this case.

In the tutorial, the Order harmonization flow does not use a mapping to generate baseline code, but it could: The same code customizations could be applied to mapping-based baseline code. To review the Order customizations, see [Harmonize the Order Data]({{site.baseurl}}/tutorial/3x/harmonizing-order-data/) in the tutorial.

### Simple Value Transformation Requirement
The code generated from a mapping handles the case where the source value can be converted to the entity property data type through a simple type conversion. For example, if you have a string source property whose contents can always be safely cast to a number, such as "1234", then you can map it on to an entity property of type decimal.

However, if a source value requires a more sophisticated transformation, such as date normalization, string concatenation, or a computation, then the code generated from a mapping will not work out of the box. The **price** property of the Order entity type in the QuickStart tutorial is an example of a property whose value is computed during harmonization. See [Harmonize the Order Data]({{site.baseurl}}/tutorial/3x/harmonizing-order-data/) in the tutorial.

Whether you use a mapping as a baseline or not, you must customize the content plugin to handle this case.
