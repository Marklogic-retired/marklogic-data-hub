This example project demonstrates the new mapping features in Data Hub 5.1.0. Note that it requires the use of MarkLogic 
10 because it demonstrates usage of a [JavaScript module](https://docs.marklogic.com/guide/jsref/modules).

## How to install

To try this project out using QuickStart, start with a clean MarkLogic instance - i.e. without an existing Data hub installation.
Then, install the project's application via Gradle. 

First, initialize the project:

    ./gradlew -i hubInit
    
Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications. 

Then deploy the application:

    ./gradlew -i mlDeploy

Next, start up QuickStart and browse to this project folder and login to QuickStart. 

## How to test the flows

This project has two flows:

1. The jsonToJson flow ingests and maps a single JSON document to a JSON entity instance
1. The xmlToJson flow ingests and maps a single XML document to a JSON entity instance

The jsonToJson flow demonstrates a wide array of mapping features, while the xmlToJson flow is more focused on a few 
features specific to XML.

Both flows can be run from the "Flows" page in QuickStart. Each will ingest one document into the staging database and then
write one entity instance - a Person - to the final database. The Person entity definition contains two nested entity 
properties to demonstrate mapping data from a source document to nested entities:

- The "names" property is an array of Name entities
- The "address" property is an Address entity (it is likely that this Address entity could be used by other entity 
definitions and is thus worth defining as its own entity instead of as a set of properties on a Person)

Each of the mapping expressions is then described below. 

### Mapping features in the jsonToJson flow

From the "Flows" view in QuickStart, open the jsonToJson flow and select the mapping step. QuickStart will display the 
JSON document in staging in the "Source Data" panel and the mapping in the "Entity" panel. The mapping displays all of 
the properties of the Person entity along with its nested Name and Address entities. Each row in the mapping is described below:

1. The "ssn" property demonstrates usage of a custom XQuery mapping function - "remove-hyphens". The function is defined
in src/main/ml-modules/root/custom-modules/mapping-functions/custom-xquery-functions.xqy. The functions in that library 
are available because the library is in the "/custom-modules/mapping-functions" directory in the data-hub-MODULES database.
1. Because the "names" property is an array of Name entities, its mapping expression is labeled with "Context", and thus its
expression must be a path from which the properties of the nested entities can be resolved. In this case, "biographicData/names" 
is used to point to the array of objects in the source document that should each be mapped to the array of Name entities. 
1. The "prefix" property demonstrates the use of a custom JavaScript mapping function - "cleanPrefix". The function is defined 
in src/main/ml-modules/root/custom-modules/mapping-functions/custom-javascript-functions.sjs. The functions in that library 
are available because the library is in the "/custom-modules/mapping-functions" directory in the data-hub-MODULES database.
1. The "first" property demonstrates usage of a (MarkLogic function in the "fn" namespace)[http://docs.marklogic.com/js/fn].
Note that the "fn:" prefix does not need to be used.
1. The "middle" property demonstrates usage of a custom JavaScript module library, which requires the use of 
MarkLogic 10. The function is defined in src/main/ml-modules/root/custom-modules/mapping-functions/custom-javascript-module.mjs. 
1. The "last" property is a simple mapping with no function used. 
1. The "educationLevel" property demonstrates usage of the DH "memoryLookup" function. The memoryLookup function allows
for mapping a source value based on an inline JSON object.
1. The "dateOfBirth" property demonstrates usage of the DH "parseDate" function. 
1. The "lastUpdated" property demonstrates usage of the DH "parseDateTime" function. 
1. The "address" property has the Context label by it because "address" is a nested entity property. In the source document, 
all of the address data is in the "address" path, so "address" is the value for the context path. 
1. The "street" property demonstrates usage of another "fn" function - string-join is used to join together the values of the 
"number" and "street" paths in the source document. 
1. The "state" property demonstrates usage of the DH "documentLookup" function. This function references a document in the
staging database that was loaded by virtue of being under src/main/ml-data in the project. But it can reference any 
document in the staging database. 
1. The "zip" property demonstrates usage of another "fn" function - substring is used to select the first five characters
of the "zipCode" in the source document.

### Mapping features in the xmlToJson flow

From the "Flows" view in QuickStart, open the xmlToJson flow and select the mapping step. QuickStart will display the XML 
document in staging in the "Source Data" panel and the mapping in the "Entity" panel. 

The xmlToJson mapping is intended to highlight a few differences from mapping JSON to JSON:

1. Because the XML in the source document has a namespace at the root level, each mapping expression must use "*:" to 
refer to an element in the source document. This effectively ignores the namespace for each element.
1. Instead of the "names" context being a path to an array, the path instead points to the "*:name" element which can 
occur multiple times under "*:/person/*:names". 
1. As shown in the "prefix" mapping, XML attributes can be referenced via the "@" symbol. 

Otherwise, all of the features used in the jsonToJsonFlow can be used in this mapping as well. 
