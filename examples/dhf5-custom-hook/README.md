This DHF 5 project shows an example of a simple flow with one ingestion step that utilizes a custom hook. The custom 
hook provides a chance for logic that potentially may perform updates to run outside of the main DHF transaction, thus
ensuring that transaction can remain read-only. 

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

## How to test the custom hook

Once you're logged into QuickStart, run the "LoadOrders" flow twice. When the flow is run the second time, the order documents 
created during the first run will be archived - which in this simple example means being written to a different URI in 
an archive collection.

The custom hook is defined at src/main/ml-modules/root/custom-modules/ingestion/IngestOrders/archive-hook.sjs, and it 
is associated with the flow via flows/LoadOrders.flow.json.
