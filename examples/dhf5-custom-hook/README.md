This DHF 5 project shows an example of a simple flow with one ingestion step that utilizes a custom hook. The custom 
hook provides a chance for logic that potentially may perform updates to run outside of the main DHF transaction, thus
ensuring that transaction can remain read-only. 

This project has been updated for the 5.3.0 release so that it can be deployed to a DHS instance and accessed via 
Hub Central.

## How to install

To try this project out, start with a clean DHS or MarkLogic instance - i.e. without an existing Data hub installation.
Then, install the project's application via Gradle. 

First initialize the project (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i hubInit
    
Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications. 
If you are deploying to DHS, you likely should modify gradle-dhs.properties instead.

Then deploy the application (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i mlDeploy

## How to test the custom hook

### Orders Custom Hook

Log in to HubCentral as `hub-operator`, run the "IngestOrders" step in "LoadOrders" flow twice. When the flow is run the second time, the order documents 
created during the first run will be archived - which in this simple example means being written to a different URI in 
an archive collection.

The custom hook is defined at src/main/ml-modules/root/custom-modules/ingestion/IngestOrders/archive-hook.sjs, and is set to run with `hub-operator` user.

### Customer Custom Hook

Log in to HubCentral as `hub-operator`, run the "IngestCustomers" step in "LoadCustomers" flow. After running the flow you will see the URIs in staging contianing a random UUID that is generated when ingesting the CSV data. 
Now run the "MapCustomers" step. The URI in data-hub-FINAL database, will reflect the ID of the person coming from the canonical instance. 
This can also be verified by clicking the "Explore Curated Data" button in the run confirmation modal, which takes you to Explore tile and displays the test results for that run in tabular view.
Click on the "snippet" view to verify the URI ending with CustomerID.

The custom hook is defined at src/main/ml-modules/root/custom-modules/mapping/MapCustomers/custom-uri-hook.sjs, and is set to run with `hub-operator` user.

### How to run via gradle

Run the following gradle tasks:

    ./gradlew hubRunFlow -PflowName=LoadOrders -PmlUsername=hub-operator -PmlPassword=password
    ./gradlew hubRunFlow -PflowName=LoadCustomers -PmlUsername=hub-operator -PmlPassword=password
    
Those tasks will run the ingestion and mapping steps in each of the flows. 

You can then use QConsole to explore the ingested and curated entities. 
