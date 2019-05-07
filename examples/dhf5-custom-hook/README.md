This DHF 5 project shows an example of a simple flow with one ingestion step that utilizes a custom hook. The custom 
hook provides a chance for logic that potentially may perform updates to run outside of the main DHF transaction, thus
ensuring that transaction can remain read-only. 

The custom hook is defined at src/main/ml-modules/root/custom-modules/ingestion/IngestOrders/archive-hook.sjs, and it 
is associated with the flow via flows/LoadOrders.flow.json.

To see the hook in action, you can either use QuickStart to deploy this application and run the "LoadOrders" flow at 
least twice, or you can run the following Gradle tasks to deploy the application and run the flow twice:

    ./gradlew mlDeploy
    ./gradlew loadOrders
    ./gradlew loadOrders
    
In either case, when the flow is run the second time, the order documents created during the first run will be 
archived - which in this simple example means being written to a different URI in an archive collection.

