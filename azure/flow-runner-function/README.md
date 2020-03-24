# Run a flow via an Azure Function

For an overview, first read https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-java-maven .

## Testing locally 

First, ensure you're connected to the MarkLogic VPN. This allows you to resolve the dependency on 
marklogic-data-hub-5.2.0-rc1. Once 5.2.0 is publicly available, we'll update this to use that and you won't need to 
be on the VPN.

Then edit the following line in the pom.xml file. Provide a different name for the functionAppName:
 
    <functionAppName>az-functions-20200227122602814</functionAppName> 

Then, build the uber jar for this Azure function (the jar will be in the ./target directory):

    mvn clean package

Then run the function locally: (note: make sure to have JAVA_HOME env variable is setup and points to JDK 1.8)

    mvn azure-functions:run

You can then test it by running the following:

    curl -w "\n" http://localhost:7071/api/HttpExampleDataHubFlow --data flowNameDoesntMatterYet

## Testing on Azure

Follow the instructions at https://docs.microsoft.com/en-us/azure/azure-functions/functions-create-first-java-maven#deploy-the-function-to-azure to login to Azure (contact someone on the Data Hub team for access to Azure). 

You'll first need to login to Azure:

    az login

Then deploy your function (this can take many seconds to finish):

    mvn azure-functions:deploy

Then get your HTTP trigger URL and test the endpoint - your URL should be similar to what's shown below:

    curl -w "\n" https://az-functions-data-hub-sample-v1.azurewebsites.net/api/HttpExampleDataHubFlow --data flowNameDoesntMatterYet


You can also follow the instructions at https://docs.microsoft.com/en-us/azure/azure-functions/functions-add-output-binding-storage-queue-java to connect the function to Azure storage. If you do that, then after running the test, 
look in the storage for messages in the queue. 
