# Example Single Step Ingest
This example shows how to insert a document into the STAGING database and harmonize the document ingested at the same time while calling a custom REST endpoint named **run-ingest-harmonize**

This example uses some of the same data as the online-store example

The sample data is located in the input/ folder
```
|-- input
  |-- products
    |-- xxx.xml
```

# TLDR; How do I run it?
1. Download the [latest quick-start war](https://github.com/marklogic/marklogic-data-hub/releases/download/4.0.3/quick-start-4.0.3.war) into this folder.

1. Run the quick-start jar `java -jar quick-start-4.0.3.war`

1. Open your web browser to [http://localhost:8080](http://localhost:8080).

1. Browse to this folder from the login screen.

1. Initialize the project (if necessary)

1. Login with your MarkLogic credentials

1. Install the Hub into MarkLogic (if necessary)

# Loading and Ingesting the Products data via the REST API
To load the shirt.xml file from the input/products directory by calling the custom REST extension:

```
curl --anyauth --user user:password -X PUT \
  -T shirt.xml -i -H "Content-type: application/xml" \
  'http://localhost:8010/v1/resources/run-ingest-harmonize?rs:uri=shirt.xml&rs:job-id=1234&rs:entity-name=Products&rs:ingest-flow-name=Load Products&rs:harmonize-flow-name=Harmonize Products'
```

The parameters are:
- **rs:uri** - the URI that the document in the STAGING database should be saved to
- **rs:job-id** - a job id. any string is legit
- **rs:entity-name** - the name of the entity the flow belongs to
- **rs:ingest-flow-name** - the name of the ingestion flow
- **rs:harmonize-flow-name** - the name of the harmonization flow

The successful response of the CURL request is the following:
```
<?xml version="1.0" encoding="UTF-8"?>
<response>
    <ingestion>
        <envelope xmlns="http://marklogic.com/entity-services">
            <headers/>
            <triples/>
            <instance>
                <product xmlns="">
                    <id>10</id>
                    <sku>380140431212</sku>
                    <title>Shirt</title>
                    <game_title>promising title</game_title>
                    <description>A shirt for promising title</description>
                    <price>10.0</price>
                    <game_id>1000174</game_id>
                    <game_SKU>182232002232</game_SKU>
                </product>
            </instance>
            <attachments/>
        </envelope>
    </ingestion>
    <harmonization>
        <harmonizationSuccessful>true</harmonizationSuccessful>
        <errorFound>false</errorFound>
    </harmonization>
</response>
```

The envelope that is generated from the ingestion flow is returned in the `envelope` element inside of the `ingestion` element.  The `harmonization` element will contain a boolean value if the harmonization is successful or not and if there was an error found during the harmonization process.  If there is an error thrown during the harmonization process, then the error string will be displayed.
