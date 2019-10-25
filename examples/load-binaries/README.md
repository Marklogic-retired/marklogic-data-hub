# Example Binary Loading
This example shows how to load binary documents with the Hub Framework.

# TLDR; How do I run it?
1. Download the [latest quick-start war](https://github.com/marklogic/marklogic-data-hub/releases/download/v2.0.7/quick-start-2.0.7.war) into this folder.

1. Run the quick-start war `java -jar quick-start-2.0.7.war`

1. Open your web browser to [http://localhost:8080](http://localhost:8080).

1. Browse to this folder from the login screen.

1. Initialize the project (if necessary)

1. Login with your MarkLogic credentials

1. Install the Hub into MarkLogic (if necessary)

## Loading the Sample PDF
1. Click on the **Flows** Tab at the top.
1. Click on the Guides entity on the left.
1. Click on the "LoadAsXml" or "LoadAsJson" input flow.
1. Browse to the input folder.
1. Expand the "General Options" section.
1. Add ,\\.pdf,'.json' or ,\\.pdf,'.xml' to the end of "Output URI Replace", depending on which Input Flow you are 
running. It should look something like:  
***nix**  
`/Users/yourname/data-hub/examples/load-binaries/input,'',\.pdf,'.xml'`  
**windows**  
`/c:/Users/yourname/data-hub/examples/load-binaries/input,'',\.pdf,'.xml'`  
1. Change "Document Type" to "binary".
1. Scroll down and press the "RUN IMPORT" button.

## Browsing the sample data
1. At this point you have loaded the sample data. You can browse the data by clicking on the **Browse** tab at the top.

# Ingesting Binaries

When you ingest a binary via the Quick Start MLCP process you will want to do a few things.

1. Change the file extension to xml or json via "Output URI Replace".

This is because we will be manually storing the binary, but returning XML or JSON metadata for MLCP to store into Marklogic.

1. Change the document type to binary via the "Document Type" option. This is necessary because MLCP might think this document is an XML or JSON after we changed the file extension above.

Now you have loaded the binary manually and returned xhtml content to store in the envelope.
