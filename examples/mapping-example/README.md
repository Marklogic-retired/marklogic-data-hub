This example project demonstrates the new mapping features in Data Hub 5.1.0. Note that it requires the use of MarkLogic 
10 because it demonstrates usage of a [JavaScript module](https://docs.marklogic.com/guide/jsref/modules).

This project has been updated for the 5.3.0 release so that it can be deployed to a DHS instance and accessed via 
Hub Central.

## How to install

To try this project out, start with a clean DHS or MarkLogic instance - i.e. without an existing Data hub installation.
Then, install the project's application via Gradle. 

First, initialize the project (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i hubInit
    
Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications. 
If you are deploying to DHS, you likely should modify gradle-dhs.properties instead.  

Then deploy the application (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i mlDeploy

## How to test the flows

This project has nine flows:

1. The jsonToJson flow ingests and maps a single JSON document to a JSON entity instance
1. The jsonToXml flow ingests and maps a single JSON document to an XML entity instance
1. The xmlToJson flow ingests and maps a single XML document to a JSON entity instance
1. The xmlToXml flow ingests and maps a single XML document to an XML entity instance
1. The application_member flow ingests and maps a single JSON document to a JSON entity instance
1. The gene_sample flow ingests and maps a single XML document to an XML entity instance
1. The insurance_application flow ingests and maps a single XML document to an XML entity instance
1. The medical_journal flow ingests and maps a single XML document to an XML entity instance
1. The protein_sample flow ingests and maps a single XML document to an XML entity instance

The jsonToJson and jsonToXml flows demonstrate a wide array of mapping features, while the xmlToJson and xmlToXml flows are more focused on a few
features specific to XML like attributes and namespaces. All the remaining flows demonstrate a similar mapping feature and uses the sample data from "Pharma Hub" project.

### How to run the flows

To see the results of the flows, the easiest way to run them is to run the following Gradle tasks:

    ./gradlew -i ingestData
    ./gradlew -i mapData

Those tasks will run the ingestion and mapping steps in each of the flows. 

You can then use Hub Central or qconsole to explore the curated entities. 

## Inspecting the mapping steps

You can use Hub Central to inspect the mapping steps, or you can simply open each file - the mapping steps are in the 
./steps/mapping directory. The sections below call out items of interest in each mapping.

### Mapping features in the mapjson step

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

### Mapping features in the mapxml step

The xmlToJson mapping is intended to highlight a few differences from mapping JSON to JSON:

1. Because the XML in the source document has a namespace at the root level, each mapping expression must use "*:" to 
refer to an element in the source document. This effectively ignores the namespace for each element.
1. Instead of the "names" context being a path to an array, the path instead points to the "*:name" element which can 
occur multiple times under "*:/person/*:names". 
1. As shown in the "prefix" mapping, XML attributes can be referenced via the "@" symbol. 

Otherwise, all of the features used in the jsonToJsonFlow can be used in this mapping as well. 

### Mapping features in the mapJsonToXml step

Each row in this mapping is similar to the mapjson step.

### Mapping features in the mapXmlToXml step

The xmlToXml mapping is intended to highlight usage of namespace and namespace prefix in the mapping.

1. The properties in the expression have a namespace defined for the "person" element. The mapping also shows usage of a namespace prefix. The source document has a namespace prefix and the same is reflected in the source table and element selector.
1. The "state" property demonstrates usage of an "if then else" expression.
1. The "email" property is an array of strings and can hold multiple values. Click on the "Test" button to verify multiple values are returned with an ellipsis showing how many more such elements were extracted.
