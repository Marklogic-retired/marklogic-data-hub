This example project demonstrates how to configure step processors for invoking custom code before content is 
persisted by a step. 

## How to install

To install via Gradle, start with a clean MarkLogic instance - i.e. without an existing Data hub installation. 
Then, initialize the project (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i hubInit
    
Then modify the gradle-local.properties file and either un-comment the mlUsername and mlPassword properties and set the
password for your admin user, or set the properties to a different MarkLogic user that is able to deploy applications. 

Then deploy the application (include -Ptesting=true if you are trying to use a snapshot version of DHF):

    ./gradlew -i mlDeploy

## Running the test flow

This project contains a simple test flow named "orderFlow". It consists of two steps:

1. An ingestion step that will ingest 2 simple Order documents from the ./data directory in this project
1. A mapping step that has 2 step processors configured on it

To run the flow so that you can observe the output, run the following Gradle task:

    ./gradlew hubRunFlow -PflowName=orderFlow

## Understanding step processors

The step processors are configured in the ./flows/orderFlow.flow.json file. A step can have zero or many processors. 
Each processor refers to a module to be invoked via [xdmp.invoke](http://docs.marklogic.com/xdmp.invoke) in the same
transaction as the content being processed. 

The mapping step in "orderFlow" has the following two processors configured:

```
"processors": [
    {
      "path": "/custom-modules/step-processors/addHeaders.sjs",
      "when": "beforeContentPersisted",
      "vars": {
        "exampleVariable": "testValue"
      }
    },
    {
      "path": "/org.example/addPermissions.sjs",
      "when": "beforeContentPersisted"
    }
]
```

The properties of a processor are as follows:

- path = required; defines the path to a module that the user running the step can read and execute
- when = required; defines when the processor will be invoked. 
- vars = optional; an object whose key/value pairs will be passed to the processor module. This mirrors the "vars" 
argument in [xdmp.invoke](http://docs.marklogic.com/xdmp.invoke)

As of 5.3.0, only "beforeContentPersisted" is supported for "when", but this still must be specified. This value of 
"when" allows you to modify each content object before it is persisted, and thus after Data Hub has determined what 
its URI, collections, permissions, and metadata should be.

In addition to any variables defined via "vars", Data Hub will pass the following variables to the processor module:

- contentArray = an array of content objects that are about to be persisted
- options = the combined step configuration options that are derived from the flow, the step, and any options defined at runtime

Each object in the "contentArray" has the following keys:

- uri = the URI at which the document will be persisted
- value = the document to be persisted. Depending on the step being executed, this may be a node such that you must first
call toObject() on it to manipulate it. See the addHeaders.sjs processor module for more information.
- context = an object containing document metadata, including "collections", "permissions", and "metadata"

### A note about ingestion steps

The contents of the "context" object differ based on how you are ingesting data. If you are ingesting data via MLCP, 
then you will have access to everything that [MLCP provides in the context object](https://docs.marklogic.com/guide/mlcp/import#id_59764), 
thus allowing you to modify like collections and permissions.

But if you are executing an ingestion step via QuickStart or Gradle, you'll use a REST transform, and REST transforms
are limited in what you can modify. The [context object in a REST transform](https://docs.marklogic.com/guide/rest-dev/transforms#id_23889) 
does not provide access to collections and permissions.

In addition, if you'd like to set the URI for a document while ingesting it, you should do so via the following mechanism:

    content.context.uri = "/your/custom/uri.json";
    
Within the context of an ingestion step, Data Hub allows for the URI to be modified in the above fashion, but not by 
setting "content.uri" directly, which will not have an impact.

## Understanding each step processor in this example

The "addHeaders.sjs" processor demonstrates a common use case for a step processor - mapping data from the source 
document into the headers of the envelope. This approach is not yet supported by a Data Hub mapping step, but we still 
want to map everything we can via a mapping step. 

Note that as commented in this module, "content.value" is a node object that cannot be manipulated. So the addHeaders.sjs
module must first call "toObject()" on it. Then, after that object has been modified, addHeaders.sjs must assign the 
object back to the value of "content.value". If the step being executed instead sets "content.value" to a mutable 
object, it is not necessary to perform these actions.

The "addPermissions.sjs" processor then demonstrates another common use case for a step processor - content-driven 
permissions, where permissions are determined based on the content to be persisted. This example is trivial, but it 
could of course contain as much custom logic as needed to determine the correct permissions for a document. This 
example also shows a permission being added to the existing array of permissions, but the processor could instead 
replace that array with its own array of permissions.
  
