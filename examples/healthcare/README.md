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
1. Download the [latest quick-start war](https://github.com/marklogic/marklogic-data-hub/releases/download/v2.0.7/quick-start-2.0.7.war) into this folder.

1. Run the quick-start jar `java -jar quick-start-2.0.7.war`

1. Open your web browser to [http://localhost:8080](http://localhost:8080).

1. Browse to this folder from the login screen.

1. Initialize the project (if necessary)

1. Login with your MarkLogic credentials

1. Install the Hub into MarkLogic (if necessary)

## Loading the HL7 data

1. Click on the **Flows** tab.

1. Click on Input Flows => hl7 on the left side.

1. On the right side you can configure the MLCP (MarkLogic Content Pump) options.

1. Browse the Input Files to **input/hl7**.

1. Set the Input File Type to **Documents**.

1. Now Click **RUN IMPORT**.

## Loading the NPPES data

1. Click on Input Flows => nppes on the left side.

1. On the right side you can configure the MLCP (MarkLogic Content Pump) options.

1. Browse the Input Files to **input/nppes**.

1. Set the Input File Type to **Delimited Text**.

1. Now Click **RUN IMPORT**.

## Browsing the Staging Data

1. At this point you have loaded the sample data. You can browse the data by clicking on the Browse Data tab at the top menu.

## Harmonizing Data

1. Click on the **Flows** tab.

1. Click on the **final** flow.

1. To run the harmonize flows simply press the **Run Harmonize** button on the info screen.

## Browsing the Harmonized Data

1. Now you have harmonized the data into your final database. You can browse the harmonized data by clicking on the Browse Data tab at the top menu.

1. Next change the database to **FINAL**. Quick Start will automatically run a search against the Final database.

# Entities
Entities represent the data you are modeling. For this example we provide the **Patients** entity. Inside this entity definition you will find all of the example flows.

# Flows
Flows are sets of plugins that work together to create an envelope document.

- [Input Flows](#input-flows) work on incoming data and store it in the Staging database.
- [Harmonize Flows](#harmonize-flows) work on staged data and transform and store it into the Final database.

## Input Flows

### hl7
The hl7 Flow is intended to ingest C-CDA C32 Hl7 XML files. When running the hl7 flow simply point it at input/hl7. Set the Input Document Type to **Document**.

### nppes
The nppes Flow is intended to ingest NPPES csv files. This flow will split each row of the NPPES file into a separate XML document in the staging database. When running the hl7 flow simply point it at input/nppes. Set the Input Document Type to **Delimited Text**.

## Harmonize Flows

There is only one harmonize flow provided. This final flow will create a harmonized XML document that contains the original C32 xml as the content of an envelope. It will also extract various data from the C32 into the header section for easier queryability.

## Final REST services

A sample REST service has been provided to illustrate how one might query the data to extract a list of providers for a given patient. You can access this service on the Final Http Rest server at [http://localhost:8011/v1/resources/providers?rs:patient-id=000-00-0000](http://localhost:8011/v1/resources/providers?rs:patient-id=000-00-0000). You may need to substitute the port number if you changed the final Port on installation.
