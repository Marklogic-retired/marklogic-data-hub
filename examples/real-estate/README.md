# Data Hub Example: Integrating Real Estate Data

## About Real Estate Project

- Real estate data of around 5000 areas in US is captured
- Around 50 entities such as Lands, Commercial Properties, Restaurants, Hotels, Parks etc., with respect to each area are available
- The entity USZips, consists of all the area IDs and all the remaining entities are related to USZips. 
- Each entity has a separate flow created for ingestion, mapping, matching and merging. You can edit the build.gradle file accordingly to run the flows required.

## How to install

To try this project out using HubCentral, start with a clean MarkLogic instance - i.e. without an existing Data hub installation.
Then, you can install this project's application using Gradle.

### Install via Gradle

To install via Gradle, first initialize the project (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i hubInit

Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications.

Then deploy the application (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i mlDeploy


## Predefined Flows

The project has flows predefined for ingesting, curating and mastering the Real Estate data.

- **Data_Ingestion**: Has all ingestion steps to ingest the data
- **Data_Mapping**: Has all mapping steps to curate the data
- **Data_Matching**: Has all match steps to match documents based on match configurations
- **Data_Merging**: Has all merging steps to merge and create the new merged documents

## How to Integrate the RealEstate Data

You can run all the flows and set up the data by running the following task:

    ./gradlew -i runFlows


## Viewing Real Estate Data

1. Fire up Hubcentral in one of the two ways
   1. java -jar /path/to/hub/central/war/file.war
   2. /gradlew bootrun from marklogic-data-hub-central directory and npm start from marklogic-data-hub-central/ui directory 
2. Log in using the credentials hub-developer and password
3. Open the explore tile to visualize the data

