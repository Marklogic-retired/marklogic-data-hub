---
layout: inner
title: Managing Personally Identifiable Information (PII)
permalink: /govern/pii/
---

# Managing Personally Identifiable Information

Data governance policies often require access to Personally Identifiable Information (PII) to be more tightly controlled than access to other data. PII can include information such as phone numbers, social security numbers, credit or bank account numbers, and addresses.

The Data Hub Framework enables you to easily restrict access to PII in your harmonized data using the Element Level Security (ELS) feature of MarkLogic, using the following steps:

1. Designate properties as PII in your entity model.
1. Deploy your model to your FINAL database.
1. Use Data Hub Framework to generate a security configuration that restricts access to the PII properties to users with the "pii-reader" security role.
1. Deploy the security configuration to your FINAL database.

Users who do not have the "pii-reader" role cannot access the entity properties of your harmonized data that are flagged as PII. To these users, the PII entity properties effectively do not exist.

See the following topics for more details:

* [Identifying PII in an Entity Model](#identifying-pii-in-an-entity-model)
* [Generating PII Security Configuration Files](#generating-pii-security-configuration-files)
* [Deploying PII Security Configuration Files](#deploying-pii-security-configuration-files)
* [Understanding the PII Security Configuration](#understanding-the-pii-security-configuration)

## Identifying PII in an Entity Model

You can specify an entity property as PII in your model using one of the following methods:

* [Modeling PII in QuickStart](#modeling-pii-in-quickstart)
* [Modeling PII Manually](#modeling-pii-manually)

### Modeling PII in QuickStart

When you model an entity in QuickStart, you can designate an entity property as PII by putting a checkmark in the PII column of the entity descriptor. The PII column is identified by a padlock icon. For example:

![Marking an entity as PII]({{site.baseurl}}/images/pii/pii-tagging.png){:.screenshot-border}

When you save a model that includes PII entity properties, QuickStart generates security configuration files from the model. For details, see [Generating PII Security Configuration Files](#generating-pii-security-configuration-files).

### Modeling PII Manually

If you manually create an entity model, rather than using QuickStart, designate a property as PII by including the property name in the "pii" property of the entity definition in your descriptor. For example, the following model snippet defines a "Customer" entity that contains an "address" property designated as PII:
```
{ "info": { ... },
  "definitions": {
    "Customer": {
      "pii" : ["address"],
      ...,
      "properties": {
        "address": {
          "datatype": "string",
          "collation": "http://marklogic.com/collation/codepoint"
        },
        ...
      }
}}}
```
Once your model is updated, you can instruct Data Hub Framework to generate a PII security configuration from the model. For details, see [Generating PII Security Configuration Files](#generating-pii-security-configuration-files).

## Generating PII Security Configuration Files

This section describes how to generate PII-related security configuration files once you mark entity properties as containing PII. You can generate the configuration files using the following methods:

* [Generating a Configuration in QuickStart](#generating-a-configuration-in-quickstart)
* [Generating a Configuration with Gradle](#generating-a-configuration-with-gradle)

Regardless of the method you use to generate the PII security configuration files, Data Hub Framework saves the files in the following location in your project:

* PROJECT_DIR/user-config/security/protected-paths/
* PROJECT_DIR/user-config/security/query-rolesets/

These configuration files must be deployed to the FINAL database to take effect. For details, see [Deploying PII Security Configuration Files](#deploying-pii-security-configuration).

### Generating a Configuration in QuickStart

If you use QuickStart for entity modeling, then QuickStart generates the PII security configuration files when you save your model in QuickStart's Entity Modeler. When you save an entity model, QuickStart does the following:

* Deploys the model descriptor to the FINAL database.
* Requests MarkLogic to generate a security configuration for the PII properties in the model.
* Saves the resulting configuration files to your project.

If you need to generate the configuration files without using QuickStart, you can use gradle, as described in the next section.

### Generating a Configuration with Gradle

Data Hub Framework includes a gradle task called hubGeneratePii that generates PII security configuration files from a model stored in your FINAL database. QuickStart performs the equivalent steps for you when you save a model.

To generate PII security configuration files using gradle, run the following tasks:

* `mlLoadModules` (or `mlDeploy`): Deploys the model to the FINAL database. Run this task if the latest version of your model is not yet deployed to your FINAL database.
* `hubGeneratePii`: Generates the PII security configuration files and saves them to your project.

For example:
```
cd /my/project/dir
./graldew mlDeployModules hubGeneratePii
```

## Deploying PII Security Configuration Files

You must deploy the PII security configuration files generated by Data Hub Framework to your FINAL database before the PII access controls can take effect. 

Use the gradle tasks `mlDeploySecurity` or `mlDeploy` to install your PII configuration files in the FINAL database. For example:
```
cd /my/project/dir
./gradlew mlDeploySecurity
```
Once your configuration is deployed, you should find that a user with the "pii-reader" role can see PII properties in your harmonized data, but users without the "pii-reader" role cannot.

## Understanding the PII Security Configuration

This section provides details on how PII security polices are implemented in a Data Hub Framework application. You do not need to understand these details to use the feature. You might find them useful for debugging or when integrating PII protection into a larger security model.

Data Hub Framework implements PII security policies using the Element Level Security (ELS) feature of MarkLogic. ELS enables you to identify "protected paths" in XML and JSON documents, and then impose tighter access controls to those paths than to the containing documents. 

When you generate PII security configuration files, Data Hub Framework generates the following kinds of configuration files:

* A protected path configuration for each PII property. Data Hub Framework stores these configurations in PROJECT_DIR/user-config/security/protected-paths/.
* A query roleset. Data Hub Framework stores this configuration in PROJECT_DIR/user-config/security/query-rolesets/.

The protected path configuration limits read access to PII properities to users with the "pii-reader" security role. The query roleset prevents users without the "pii-reader" role from seeing the protected content in response to a query or XPath expression. The "pii-reader" role is pre-defined by MarkLogic.

Protected path restrictions are only relevant if a user also has read access to a document. That is, a user with the "pii-reader" role must still have read access to the enclosing document in order to access the PII data.

For example, if you have a Customer entity model that designates its "address" property as PII, then Data Hub Framework generates a protected path configuration such as the following:
```
{
  "path-expression" : "/envelope//instance//Customer/address",
  "path-namespace" : [ ],
  "permission" : {
    "role-name" : "pii-reader",
    "capability" : "read"
  }
}
```
The path to the protected "address" property corresponds to the layout of a harmonized Customer instance. For example, a harmonized Customer instance looks like the following:
```
{"envelope": {
  "headers": {},
  "triples": [],
  "instance": {
    "Customer": {
      ...
      "address": "100 Main Street, Hometown, USA"
    }
    "info": { ... }
  }, ...
} }
```
Note that, by default, a harmonized instance contains its original source document as an attachment. The PII security configuration generated by Data Hub Framework only protects the PII in the instance data (/envelope/instance/*). For full protection, you should customize your code to exclude the source attachment from your envelope documents or define additional protected paths for the PII in the source attachment.

To learn more about ELS, see [Element Level Security](http://docs.marklogic.com/guide/security/element) in the MarkLogic [Security Guide](http://docs.marklogic.com/guide/security).
