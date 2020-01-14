const NewLoadTooltips = { 
    'name': 'The name of this data load configuration.', 
    'description': 'The description of this data load configuration.', 
    'files' : 'Click *Upload* to select the source files. The total size of the files must be 100MB or less.', 
    'sourceFormat': 'The format of the source files to be ingested: Text, JSON, XML, Binary, or Delimited Text', 
    'fieldSeparator': 'The delimiter in source files. Required if *Source Format* is *Delimited Text*.', 
    'targetFormat': 'The format of the processed record: Text, JSON, XML, or Binary.', 
    'outputURIReplacement': 'A comma-separated list of replacements used to customize the URIs of the ingested records.', 
    'targetURIPreview': 'The URI of an example ingested document.' 
}

const LoadDataSettings = {
    'targetDatabase': 'The database where to store the processed data. For ingestion, choose the STAGING database where you want to store the ingested data. Default is data-hub-STAGING.', 
    'additionalCollections': 'One or more collection tags to add to the default union of tags.', 
    'targetPermissions' : 'The comma-separated roles required to access the ingested data.', 
    'provGranularity': 'The value of Provenance Granularity for this Load Data Configuration.', 
    'module': 'The path to your custom hook module.', 
    'cHParameters': 'Parameters, as key-value pairs, to pass to your custom hook module.', 
    'user': 'The user account to use to run the module. Default is the user running the flow; e.g., flow-operator.', 
    'runBefore': 'For a pre-step hook, set to true. For a post-step hook, set to false.',
    'mlcpCommand': 'To ingest files using MLCP, copy and paste this complete command to a command-line prompt . Note: MLCP and QuickStart generate two different URIs for the same delimited file.'
}

const NewFlowTooltips = { 
    'name': 'The name of this flow.', 
    'description': 'The description of this flow.'
}

export {
    NewLoadTooltips,
    LoadDataSettings,
    NewFlowTooltips
}