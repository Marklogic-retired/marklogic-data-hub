# Example Healthcare Hub
This example shows how to load C32 Consolidated Continuity of Care Documents (CCD) hl7 XML and National Plan and Provider Enumeration System (NPPES) provider csv files.

Look Here for more information on these 2 file formats:  
- [C-CDA C32 HL7](http://www.hl7.org/implement/standards/product_brief.cfm?product_id=258)
- [NPPES](http://download.cms.gov/nppes/NPI_Files.html)

The sample data is located in the input/ folder.  
```
|-- input  
  |-- hl7  
    |-- 000-00-0000.xml  # This is the C-CDA C32 xml  
  |-- nppes  
    |-- nppes.csv  # This is a sample NPPES csv file  
```

# TLDR; How do I run it?
1. Download the latest quick-start jar from the [releases page](https://github.com/marklogic-community/marklogic-data-hub/releases) into this folder.

1. Run the quick-start jar `java -jar quick-start.jar`

1. Open your web browser to [http://localhost:8080](http://localhost:8080).

1. Browse to this folder from the login screen.

1. Initialize the project (if necessary)

1. Login with your MarkLogic credentials

1. Install the Hub into MarkLogic (if necessary)

1. Load hl7 data by pressing the **Load Data** button next to hl7. When prompted Set the Path to **input/hl7**. Set the collection to **hl7**. Set the Data Format to **Documents**. Now Press **Submit**.

1. Load nppes data by pressing the **Load Data** button next to nppes. When prompted Set the Path to **input/nppes**. Set the collection to **nppes**. Set the Data Format to **Delimited Text**. Now Press **Submit**.

1. At this point you have loaded the sample data. You can browse the data via [QConsole](http://localhost:8000/qconsole) or by searching the REST endpoint on the Staging Http Server [http://localhost:8010/v1/search](http://localhost:8010/v1/search). *Your port may be different if you changed it during setup*

1. To run the harmonize flows simply press the **Run** button next to the final flow.

1. Now you have harmonized the data into your final database. You can browse the data via [QConsole](http://localhost:8000/qconsole) or by searching the REST endpoint on the Final Http Server [http://localhost:8011/v1/search](http://localhost:8011/v1/search). *Your port may be different if you changed it during setup*


# Entities
Entities represent the data you are modeling. For this example we provide the **Patients** entity. Inside this entity definition you will find all of the example flows.

# Flows
Flows are sets of plugins that work together to create an envelope document.

- [Input Flows](#input-flows) work on incoming data and store it in the Staging database.
- [Harmonize Flows](#harmonize-flows) work on staged data and transform and store it into the Final database.

## Input Flows

### hl7
The hl7 Flow is intended to ingest C-CDA C32 Hl7 XML files. When running the hl7 flow simply point it at input/hl7. Set the collection to **hl7** and set the document type to **Document**.

### nppes
The nppes Flow is intended to ingest NPPES csv files. This flow will split each row of the NPPES file into a separate XML document in the staging database. When running the hl7 flow simply point it at input/nppes. Set the collection to **nppes** and set the document type to **Delimited Text**.

## Harmonize Flows

There is only one harmonize flow provided. This final flow will create a harmonized XML document that contains the original C32 xml as the content of an envelope. It will also extract various data from th3 C32 into the header section for easier queryability.

## Final REST services

A sample REST service has been provided to illustrate how one might query the data to extract a list of providers for a given patient. You can access this service on the Final Http Rest server at [http://localhost:8011/v1/resources/providers?rs:patient-id=000-00-0000](http://localhost:8011/v1/resources/providers?rs:patient-id=000-00-0000). You may need to substitute the port number if you changed the final Port on installation.
