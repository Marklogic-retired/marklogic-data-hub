### MarkLogic Data Hub - RunFlows via Azure Functions

### Getting Started
Read https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-java-maven

### Brief Developer instructions:
1) Follow the Azure Functions - Java sample mentioned above
2) For this to work well, Maven requires DHS Client jar in teh local maven repo. AFAIK, it is not available in a central repo. So, install it locally via:
mvn install:install-file -Dfile=<path-to>/marklogic-data-hub-5.2-SNAPSHOT-client.jar  -DgroupId=com.marklogic -DartifactId=marklogic-data-hub -Dversion=5.2-SNAPSHOT -Dpackaging=jar
 --> once successful, you can check it out under ~/.m2/repository directory
3) local.settings.json is NOT checked into Git for security reasons. You would need to do the following to retried the settings:
func azure functionapp fetch-app-settings <APP_NAME>

Build:
1) mvn clean package 
   --> You should see a fat jar in the target directory
   
Deploy:
1) mvn azure-functions:deploy

Run:
1) Locally:
  mvn azure-functions:run
2) As an Azure function 
  get the function app end-point from Azure Portal (or look at the mvn deploy output)
    
Test:
1) Locally:
  curl -w "\n" http://localhost:7071/api/HttpExampleDhfFlow --data VasuG
    
2) Azure function:
  curl -w "\n" https://az-functions-20200227122602814.azurewebsites.net/api/HttpExampleDhfFlow --data VasuG
  <replace az-functions-20200227122602814 with your function id>
  
    
Check:
If you have setup the Storage account, you can look into Azure storage for the messages in the queue. Also, log output in the Tables
