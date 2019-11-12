# Data Hub Example: Integrating Insurance Customer Data

## Scenario

- Sunrise Insurance has bought two other insurance companies, Advantage Insurance and Bedrock Insurance.
- Each company has a database of customers; in each database, customers are represented differently.
- Sunrise Insurance wants to integrate the customers from Advantage and Bedrock with its own.
- Sunrise Insurance wants to enrich Advantage Insurance data via a custom step called enrichAdvantage that
    - Takes the U.S. five-digit zip code from a customer document
    - Looks up the corresponding latitude and longitude coordinates
      - This is achieved by calling a library(zipcodeData.sjs) invoked within the custom step 
    - Writes those coordinates as new document properties

## How to install

To try this project out using QuickStart, start with a clean MarkLogic instance - i.e. without an existing Data hub installation.
Then, you can either install this project's application via QuickStart or via Gradle.

### Install via QuickStart

To install via QuickStart, simply start QuickStart and browse to this project folder. Use QuickStart to initialize
this project and then deploy the application.

### Install via Gradle

To install via Gradle, first initialize the project:

    ./gradlew -i hubInit
    
Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications. 

Then deploy the application:

    ./gradlew -i mlDeploy

Next, start up QuickStart and browse to this project folder and login to QuickStart. 

## Predefined Flows

The project has flows predefined for integrating the customer data.

- **AdvantageFlow**: Has steps for ingesting and mapping Advantage customer data.
- **BedrockFlow**: Has steps for ingesting and mapping Bedrock customer data.
- **CustomerMastering**: Has a mastering step for matching and merging duplicate customers across the Advantage and Bedrock datasets.

There is also a flow to enrich data

- **customEnrichment**: Has steps for ingestion and a custom step to enrich customer data

You can finish configuring the flows and run the steps to complete the integration.

## How to Integrate the Customer Data

1. View the `AdvantageFlow` flow.
1. Ingest the Advantage dataset by running the `AdvantageIngest` step. This ingests 100 Advantage customer documents into the staging database. You can view the documents in the Browse Data view.
1. With the Advantage customer data ingested, view the `AdvantageMap` step to see the mapping expressions that have been configured.
1. Run the `AdvantageMap` step in the `AdvantageFlow` flow. This harmonizes the 100 Advantage customer documents into the final database. You can view the documents in the Browse Data view.
1. View the `BedrockFlow` flow.
1. Ingest the Bedrock dataset by running the `BedrockIngest` step. This ingests 100 Bedrock customer documents into the staging database. You can view the documents in the Browse Data view.
1. With the Bedrock customer data ingested, view the `BedrockMap` step to see the mapping expressions that have been configured.
1. Run the `BedrockMap` step in the `BedrockFlow` flow. This harmonizes the 100 Bedrock customer documents into the final database. You can view the documents in the Browse Data view.
1. Run the `CustomerMaster` flow to master the Advantage and Bedrock customer data. This merges documents for two matching customers in the final database. You can view the results in the Browse Data view.


## How to Enrich Customer Data Using Custom Step

1. Using Data Hub QuickStart with a clean MarkLogic server, select and install the example project folder: examples/insurance. Skip this step if this insurance example has been installed already
1. View the `AdvantageEnrichment` flow. It has 2 steps, one for ingestion called `AdvantageIngest` and a custom step called `AdvantageEnrich`
1. Configure the `AdvantageIngest` step by setting the Source Directory Path to the `datasets/advantage` directory (exact path will depend on your filesystem)
1. View the custom step `AdvantageEnrich`. It was created by selecting the type as "Custom" when creating a new step. When adding a custom step to a flow, Data Hub generates a scaffolded custom module for that step at: `src/main/ml-modules/root/custom-modules/custom/STEPNAME/main.sjs`. In this example, the custom module for `AdvantageEnrich` has been edited to enrich the instances with geospatial information corresponding to the postal codes.  The resulting URI has also been prepended with `/enriched` in the FINAL database  
1. Run the `AdvantageEnrichment` flow. This ingests and enriches the Advantage customer documents. You can view the enriched documents in the Browse Data view against FINAL database

## Example Customer Data

### Advantage Customer (JSON)

```
{
  "ObjectID": {
    "$oid": "5cd0da4d1d6d56542262c347"
  },
  "CustomerID": "82ff687e-210c-42c2-9f33-907a45929c73",
  "FirstName": "Alice",
  "LastName": "Hopper",
  "Email": "alicehopper@comvex.com",
  "Postal": "87779-4238",
  "Phone": "(870) 409-2724",
  "PIN": 6454,
  "Updated": "2015-05-17T08:24:16"
}
```

### Snippet of Enriched Data

```
"instance": {
  "ObjectID": {
    "$oid": "5cd0da4d4162c033d57dc2f6"
  },
  "CustomerID": "bc0dd434-232b-4ff9-bef9-c0cd2fcb72be",
  "FirstName": "Camille",
  "LastName": "Case",
  "Email": "camillecase@comvex.com",
  "Postal": "45348-4317",
  "Phone": "(935) 438-3459",
  "PIN": 4019,
  "Updated": "2018-02-12T03:33:41",
  "latitude": "40.316833",
  "longitude": "-84.633911"
}
```

### Bedrock Insurance Customer (CSV)

```
id, first_name, last_name, email, zip, pin, insurance_id, last_updated
22, Gisella, Raven, gravenl@furl.net, 186018, 4369, BTGbvwJw, 2010-09-06T15:09:40
```

## Sunrise Insurance Target Entity

```
CUSTOMER
id         string
firstname  string
lastname   string
postal     string
phone      string
email      string
pin        int
updated    dateTime
```



