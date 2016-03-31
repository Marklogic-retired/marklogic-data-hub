# Example Tweet Hub
This example shows how to load JSON tweets from the [Twitter JSON API](https://dev.twitter.com/overview/api). 

The tweets are zipped into a .zip file in the input/ folder.  
```
|-- input  
  |-- tweets.zip
```

# TLDR; How do I run it?
1. Download the latest quick-start jar from the [releases page](https://github.com/marklogic/marklogic-data-hub/releases) into this folder.

1. Run the quick-start jar `java -jar quick-start.jar`

1. Open your web browser to [http://localhost:8080](http://localhost:8080).

1. Point the Login box to your MarkLogic installation.

1. Create the "tweets" Entity.  

  Click on **"New Entity"**  
  
    **Entity Name:** Tweet  
    **Ingest Flow Name:** ingest-tweets  
    **Conformance Flow Name:** conform-tweets  
    **Plugin Type:** Javascript  
    **Data Format:** JSON  

1. Deploy your modules by pressing the **Deploy Modules** button.

1. Load the tweets by pressing the **Load Data** button next to ingest-tweets. When prompted, choose the input folder. Set the collection to **tweets**. Set the Data Format to **Documents**. Check the **Input Files are Compressed** checkbox. Now Press **Submit**.

1. At this point you have loaded the sample tweets. You can browse the data via [QConsole](http://localhost:8000/qconsole) in the data-hub-STAGING database or by searching the REST endpoint on the Staging Http Server [http://localhost:8010/v1/search](http://localhost:8010/v1/search). *Your port may be different if you changed it during setup*

1. To run the conformance flow simply press the **Run** button next to the "conform-tweets" flow.

1. Now you have conformed the data into your final database. You can browse the data via [QConsole](http://localhost:8000/qconsole) or by searching the REST endpoint on the Final Http Server [http://localhost:8011/v1/search](http://localhost:8011/v1/search). *Your port may be different if you changed it during setup*


# Entities
Entities represent the data you are modeling. For this example you created the **Tweet** entity. Inside this entity definition you will find the generated flows.

# Flows
Flows are sets of plugins that work together to create an envelope document.

- [Input Flows](#input-flows) work on incoming data and store it in the Staging database.
- [Conformance Flows](#conformance-flows) work on staged data and transform and store it into the Final database.

## Input Flows

### input-tweets
The auto-generated input Flow will ingest the compressed tweets as JSON files.

## Conformance Flows

This "conform-tweets" flow will create a conformed JSON document that contains the original tweet JSON as the content of an envelope.
