This DHF 5 project shows an example of a simple flow with one ingestion step that utilizes a custom hook. The custom 
hook provides a chance for logic that potentially may perform updates to run outside of the main DHF transaction, thus
ensuring that transaction can remain read-only. 

The custom hook is defined at src/main/ml-modules/root/custom-modules/ingestion/IngestOrders/archive-hook.sjs, and it 
is associated with the flow via flows/LoadOrders.flow.json.

To see the hook in action, start with a clean MarkLogic server, start up QuickStart, and browse to this project folder and 
install the application. Then run the "LoadOrders" flow twice. When the flow is run the second time, the order documents 
created during the first run will be archived - which in this simple example means being written to a different URI in 
an archive collection.

