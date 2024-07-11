# Tutorial for DHF 4.x

## Overview
In this tutorial, you will set up a simple data hub containing harmonized farm data.

Imagine you work for a company that sells board games and board game accessories. You have three sets of data that must be harmonized so that an application can
access them easily:

* Farms
* Pastures
* Llamas

Your task is to create a data hub on MarkLogic Server using these datasets.

This tutorial uses QuickStart, an easy-to-use development tool that you can run locally to set up a working data hub quickly.

You will perform the following in QuickStart:

1. Load each raw dataset.
2. Harmonize each dataset in different ways:
    * Farm using mappings
    * Pasture using code
    * Llama with secured personally identifiable information
3. Serve the data to downstream clients.

**Will this tutorial overwrite an existing data hub?**
No, this tutorial creates separate databases and application servers. However, if the default DHF ports (8010, 8011, 8012, 8013) are already in use, you will be
warned about the conflicts and then prompted to change them. Other settings will be preserved.

**Can I delete the data hub created by this tutorial?**
Yes. See the Clean Up section in Takeaways.

## Prerequisites


## Procedure
1. Install the Data Hub Framework

2. Load the Raw Data

    1. Create the Entities

    2. Create and Run the Input Flows

3. View Jobs, Traces, and the Data

    1. View the Jobs Log

    2. View the Traces Log

    3. Browse the Data

4. Harmonize the Data

    1. Harmonize the “Farm” Data by Mappings

    2. Harmonize the “Pasture” Data by Custom Code

    3. Secure PII in the “Llama” Data

5. Access the Data from MarkLogic Server

6. Takeaways


## Create the Entities
Entities are the business objects that you work with in the data hub. MarkLogic’s Entity Services allows you to create models of your business entities. Using
these data models, you can then generate code scaffolding, database configurations, index settings, and validations. The Data Hub Framework handles many of
these tasks for you.

In this section, we create entities for the **Farm**, **Pasture**, and **Llama** datasets.

### Farm
````bash
./gradlew hubCreateEntity -PentityName=Farm
````

### Pasture
````bash
./gradlew hubCreateEntity -PentityName=Pasture
````

### Llama
````bash
./gradlew hubCreateEntity -PentityName=Llama
````

## Create and Run the Input Flows
An input flow is a series of plugins that ingest data into the staging data hub. Input flows wrap incoming raw data in envelopes and store them in the staging
database. The envelopes contain metadata, including those related to lineage and provenance; for example, who loaded the data, when it was loaded, and where it
came from.

In this section, we create and run an input flow for each entity: **Farm**, **Pasture**, and **Llama**. Each input flow performs the following:

* Load data from the sample data directory.
<!-- * Interpret the input data as delimited text (CSV), where each row is considered a _document_. -->
* Automatically generate a unique URI to identify the wrapped document as it is added to the staging server.

Before we can create the input flows, we need to deploy the entities:

````bash
./gradlew hubDeployUserArtifacts
````

### Farm

#### Create the Input Flow
````bash
./gradlew hubCreateInputFlow -PentityName=Farm -PflowName=loadFarms -PdataFormat=json -PpluginFormat=sjs
````

#### Run the Input Flow
````bash
mlcp import \
    -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" \
    -transform_param "entity-name=Farm,flow-name=loadFarms,jobId=cl-farms" \
    -input_file_path "data/farms" \
    -output_uri_replace "data,''" \
    -output_collections "Farm" \
    -input_file_type "json" \
    -host "localhost" \
    -port "8010"
````

### Pasture

#### Create the Input Flow
````bash
./gradlew hubCreateInputFlow -PentityName=Pasture -PflowName=loadPastures -PdataFormat=json -PpluginFormat=sjs
````

#### Run the Input Flow
````bash
mlcp import \
    -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" \
    -transform_param "entity-name=Pasture,flow-name=loadPastures,jobId=cl-pastures" \
    -input_file_path "data/pastures" \
    -output_uri_replace "data,''" \
    -output_collections "Pasture" \
    -input_file_type "json" \
    -host "localhost" \
    -port "8010"
````

### Llama

#### Create the Input Flow
````bash
./gradlew hubCreateInputFlow -PentityName=Llama -PflowName=loadLlamas -PdataFormat=json -PpluginFormat=sjs
````

#### Run the Input Flow
````bash
mlcp import \
    -transform_module "/data-hub/4/transforms/mlcp-flow-transform.sjs" \
    -transform_param "entity-name=Llama,flow-name=loadLlamas,jobId=cl-llamas" \
    -input_file_path "data/llamas" \
    -output_uri_replace "data,''" \
    -output_collections "Llama" \
    -input_file_type "json" \
    -host "localhost" \
    -port "8010"
````

## Harmonize the Farm Data by Mapping
A harmonize flow is another series of plugins that harmonizes the data in the staging database and stores the results in the final database. Harmonization
includes standardizing formats, enriching data, resolving duplicates, indexing, and other tasks.

We can specify the source of an entity property value using one of two methods:

* By customizing the default harmonization code.
* By defining mappings that specify which fields in the raw datasets correspond with which properties in the entity model.

Model-to-model mapping (between the source data model and the canonical entity model) was introduced in DHF v4.0.0 to enable users to easily create a
harmonization flow without coding. Mappings are ideal when the source data can be easily converted for use as the value of the entity property; a simple
conversion can be a difference in the label case or a difference in simple data types.

We have already loaded the **Farm** raw data by:

* creating the **Farm** entity and
* creating and running the associated input flow.

In this section, we will:

* Define the entity model by adding properties to the entity model.
* Define the mappings to specify which field in the dataset corresponds to the properties in the entity model.
* Create and Run the Harmonize Flow.

### Define the Entity Model
We first define the entity model, which specifies the standard labels for the fields we want to harmonize. For the **Farm** dataset, we will harmonize two
fields: `id` and `name`. Therefore, we must add those fields as properties to our **Farm** entity model.

| Name | Type | Other settings | Notes |
| --- | --- | --- | --- |
| id | int | key | Used as the primary key because it is unique for each farm. |
| name | string | | |

To define the **Farm** entity model:
````json
{
  "info" : {
    "title" : "Farm",
    "version" : "0.0.1",
    "baseUri" : "http://example.com/",
    "description" : "An Farm entity"
  },
  "definitions" : {
    "Farm" : {
      "description" : "The Farm entity root.",
      "required" : [ ],
      "rangeIndex" : [ ],
      "elementRangeIndex" : [ ],
      "wordLexicon" : [ ],
      "pii" : [ ],
      "properties" : {
        "id": {
          "datatype": "int"
        },
        "name": {
          "datatype": "string"
        }
      }
    }
  }
}
````

### Define the Mappings
For the **Farm** entity, we define the following simple mappings:

| field in raw dataset (type) | property in entity model (type) | Notes |
| --- | --- | --- |
| id (string) | id (int) | Difference in types |
| farmName (string) | name (string) | Difference between field names |

To create a mapping named `FarmMapping` at `plugins/mappings/FarmMapping/FarmMapping-1.mapping.json`:

````json
{
  "language" : "zxx",
  "name" : "FarmMapping",
  "description" : "Mapping for Farm",
  "version" : 1,
  "targetEntityType" : "http://example.org/Farm-0.0.1/Farm",
  "sourceContext" : "//",
  "sourceURI" : "/farms/1.json",
  "properties" : {
    "id" : {
      "sourcedFrom" : "id"
    },
    "name" : {
      "sourcedFrom" : "farmName"
    }
  }
}
````

Before we can create the harmonization flow, we need to deploy the mapping::
````bash
./gradlew hubDeployUserArtifacts
````

### Create and Run the Harmonize Flow
Harmonization uses the data in your **STAGING** database to generate canonical entity instances in the **FINAL** database.

To create a harmonization flow for the **Farm** entity:
````bash
./gradlew hubCreateHarmonizeFlow -PentityName=Farm -PflowName=harmonizeFarms -PdataFormat=json -PpluginFormat=sjs -PmappingName=FarmMapping-1
````

When you create a flow with mapping, gradle automatically generates harmonization code based on the entity model and the mapping, we then need to deploy the
code to MarkLogic Server:
````bash
./gradlew mlReloadModules
````

Now we can run the harmonization flow:
````bash
./gradlew hubRunFlow -PentityName=Farm -PflowName=harmonizeFarms
````

## Harmonize the Pasture Data by Custom Code
Harmonization of the **Pasture** entity is is done using custom code.

### Define the Entity Model
To define the **Pasture** entity model:
````json
{
  "info" : {
    "title" : "Pasture",
    "version" : "0.0.1",
    "baseUri" : "http://example.com/",
    "description" : "An Pasture entity"
  },
  "definitions" : {
    "Pasture" : {
      "description" : "The Pasture entity root.",
      "required" : [ ],
      "rangeIndex" : [ ],
      "elementRangeIndex" : [ ],
      "wordLexicon" : [ ],
      "pii" : [ ],
      "properties" : {
        "id": {
          "datatype": "int"
        },
        "name": {
          "datatype": "string"
        },
        "type": {
          "datatype": "string"
        },
        "farm": {
          "datatype": "int"
        }
      }
    }
  }
}
````

### Create the Harmonize Flow
Harmonization uses the data in your **STAGING** database to generate canonical entity instances in the **FINAL** database.

To create a harmonization flow for the **Pasture** entity:
````bash
./gradlew hubCreateHarmonizeFlow -PentityName=Pasture -PflowName=harmonizePastures -PdataFormat=json -PpluginFormat=sjs
````

After creating a harmonization stub the code needs to be altered, we then need to deploy the code to MarkLogic Server:
````bash
./gradlew mlReloadModules
````

Now we can run the harmonization flow:
````bash
./gradlew hubRunFlow -PentityName=Pasture -PflowName=harmonizePastures
````

## Securing Personally Identifiable Information
Securing personally identifiable information (PII) was introduced in DHF v4.0.0. To protect PII, the PII fields must be identified in the entity model.

We have already loaded the **Llama** raw data by:

* creating the **Llama** entity and
* creating and running the associated input flow.

In this section, we will:

* Define the entity model by adding properties to the entity model.
* Define the source-to-entity mapping to specify which field in the dataset corresponds to the properties in the entity model.
* Create and run the Harmonize Flow.
* Deploy the configuration files.

### Define the Entity Model
Make the following changes to the **Llama** entity:

````json
{
  "info" : {
    "title" : "Llama",
    "version" : "0.0.1",
    "baseUri" : "http://example.com/",
    "description" : "An Llama entity"
  },
  "definitions" : {
    "Llama" : {
      "description" : "The Llama entity root.",
      "required" : [ ],
      "rangeIndex" : [ ],
      "elementRangeIndex" : [ ],
      "wordLexicon" : [ ],
      "pii" : [ "birthDate" ],
      "properties" : {
        "id": {
          "datatype": "int"
        },
        "name": {
          "datatype": "string"
        },
        "birthDate": {
          "datatype": "date"
        },
        "pasture": {
          "datatype": "id"
        }
      }
    }
  }
}
````

### Define the Mappings
Create a mapping named `LlamaMapping` at `plugins/mappings/LlamaMapping/LlamaMapping-1.mapping.json`:

````json
{
  "language" : "zxx",
  "name" : "LlamaMapping",
  "description" : "Mapping for Llama",
  "version" : 1,
  "targetEntityType" : "http://example.org/Llama-0.0.1/Llama",
  "sourceContext" : "//",
  "sourceURI" : "/llamas/1.json",
  "properties" : {
    "id" : {
      "sourcedFrom" : "id"
    },
    "name" : {
      "sourcedFrom" : "farmName"
    },
    "birthDate" : {
      "sourcedFrom" : "birthDate"
    },
    "pasture" : {
      "sourcedFrom" : "pasture"
    }
  }
}

````

Before we can create the harmonization flow, we need to deploy the entity and mapping:
````bash
./gradlew hubDeployUserArtifacts
````

### Create and Run the Harmonize Flow
Harmonization uses the data in your **STAGING** database to generate canonical entity instances in the **FINAL** database.

To create a harmonization flow for the **Llama** entity:
````bash
./gradlew hubCreateHarmonizeFlow -PentityName=Llama -PflowName=harmonizeLlamas -PdataFormat=json -PpluginFormat=sjs -PmappingName=LlamaMapping-1
````

When you create a flow with mapping, gradle automatically generates harmonization code based on the entity model and the mapping, we then need to deploy the
code to MarkLogic Server:
````bash
./gradlew mlReloadModules
````

Now we can run the harmonization flow:
````bash
./gradlew hubRunFlow -PentityName=Llama -PflowName=harmonizeLlamas
````

### Generate the PII Configuration Files
To generate the PII security configuration files:
````bash
./gradlew hubGeneratePii
````

### Deploy the Configuration Files
To deploy the PII security configuration files to the **FINAL** database,

1. In the `gradle.properties` file, set `mlSecurityUsername` and `m`lSecurityPassword` to your MarkLogic Server credentials.

**IMPORTANT: Your MarkLogic Server account must be assigned both `manage-admin` and `security` roles.**

2. Open a command-line window, and navigate to your DHF project root directory.
3. At your project’s root folder, run the `mlDeploySecurity` Gradle task.
````bash
./gradlew mlDeploySecurity
````

Only users with the `pii-reader` role will be able to view properties marked as PII in the documents they are allowed to view.
