# Example Binary Loading
This example shows how to load binary documents with the Hub Framework.

# TLDR; How do I run it?
1. Download the latest quick-start jar from the [releases page](https://github.com/marklogic/marklogic-data-hub/releases) into this folder.

1. Run the quick-start jar `java -jar quick-start.jar`

1. Open your web browser to [http://localhost:8080](http://localhost:8080).

1. Browse to this folder via the Hub login screen.

1. Login to the Data Hub using your MarkLogic credentials.

1. Load the sample pdf.

  1. Click on the Guides entity on the left.
  1. Click on the "LoadAsXml" input flow.
  1. Click on the "Run Flow" button.
  1. Browse to the input folder.
  1. Expand the "General Options" section.
  1. Add ,\\.pdf,'.xml' to the end of "Output URI Replace". It should look something like: /Users/yourname/data-hub/examples/load-binaries,'','\\.pdf','.xml'
  1. Change "Document Type" to "binary".
  1. Scroll down and press the "RUN IMPORT" button.

1. At this point you have loaded the sample data. You can browse the data via [QConsole](http://localhost:8000/qconsole) or by searching the REST endpoint on the Staging Http Server [http://localhost:8010/v1/search](http://localhost:8010/v1/search). *Your port may be different if you changed it during setup*

# Ingesting Binaries

When you ingest a binary via the Quick Start MLCP process you will want to do a few things.

1. Change the file extension to xml or json via "Output URI Replace".

This is because we will be manually storing the binary an using the ingest for creating XML or JSON metadata.

1. Change the document type to binary via the "Document Type" option. This is necessary because MLCP might think this document is an XML or JSON after we changed the file extension above.

1. Store the binary manually and return the metatada. In your content.xqy put this:

```xquery
declare function plugin:create-content(
  $id as xs:string,
  $raw-content as node()?,
  $options as map:map) as node()?
{
  (: name the binary uri with a pdf extension :)
  let $binary-uri := fn:replace($id, ".xml", ".pdf")

  (: stash the binary uri in the options map for later:)
  let $_ := map:put($options, 'binary-uri', $binary-uri)

  (: save the incoming binary as a pdf :)
  return
    xdmp:document-insert($binary-uri, $raw-content),

  (: extract the contents of the pdf and return them
   : as the content for the envelope
   :)
  xdmp:document-filter($raw-content)
};
```

Now you have loaded the binary manually and returned xhtml content to store in the envelope.
