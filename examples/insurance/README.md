# Data Hub Example: Integrating Insurance Customer Data

## Scenario

- Sunrise Insurance has bought two other insurance companies, Advantage Insurance and Bedrock Insurance.
- Each company has a database of customers; in each database, customers are represented differently.
- Sunrise Insurance wants to integrate the customers from Advantage and Bedrock with its own.

## Predefined Flows

The project has flows predefined for integrating the customer data.

- **AdvantageFlow**: Has steps for ingesting and mapping Advantage customer data.
- **BedrockFlow**: Has steps for ingesting and mapping Bedrock customer data.
- **CustomerMastering**: Has a mastering step for matching and merging duplicate customers across the Advantage and Bedrock datasets.

You can finish configuring the flows and run the steps to complete the integration.

## How to Integrate the Customer Data

1. Start the Data Hub and select the project folder: examples/insurance
2. View the `AdvantageFlow` flow. Configure the `AdvantageIngest` step by setting the Source Directory Path to the `datasets/advantage` directory.
3. Ingest the Advantage dataset by running the `AdvantageIngest` step. This ingests 100 Advantage customer documents into the staging database. You can view the documents in the Browse Data view.
4. With the Advantage customer data ingested, configure the `AdvantageMap` step in the `AdvantageFlow` flow.
5. Run the `AdvantageMap` step in the `AdvantageFlow` flow. This harmonizes the 100 Advantage customer documents into the final database. You can view the documents in the Browse Data view.
6. View the `BedrockFlow` flow. Configure the `BedrockIngest` step by setting the Source Directory Path to the `datasets/bedrock` directory.
7. Ingest the Bedrock dataset by running the `BedrockIngest` step. This ingests 100 Bedrock customer documents into the staging database. You can view the documents in the Browse Data view.
8. With the Bedrock customer data ingested, configure the `BedrockMap` step in the `BedrockFlow` flow.
9. Run the `BedrockMap` step in the `BedrockFlow` flow. This harmonizes the 100 Bedrock customer documents into the final database. You can view the documents in the Browse Data view.
10. Run the `CustomerMaster` flow to master the Advantage and Bedrock customer data. This merges documents for two matching customers in the final database. You can view the results in the Browse Data view.


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

### Bedrock Insurance Customer (CSV)

```
id, first_name, last_name, email, zip, pin, insurance_id, last_updated
22, Gisella, Raven, gravenl@furl.net, 186018, 4369, BTGbvwJw, 2010-09-06T15:09:40
```

## Surise Insurance Target Entity

```
CUSTOMER
id         string
firstname  string
lastname   string
phone      string
email      string
pin        int
postal     string
updated    dateTime
```



