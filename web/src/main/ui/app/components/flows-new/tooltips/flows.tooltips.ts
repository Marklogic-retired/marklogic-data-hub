export class FlowsTooltips {

  static flowSettings: any = {
    batchSize: 'The number of documents to process per batch. Default is 100.',
    threadCount: 'The number of threads to use when running a flow. Default is 4.',
    options: 'Key-value pairs to pass as parameters to custom modules in every step in the flow.'
  }

  static ingest: any = {
    targetDatabase: 'The database where to store the processed data. For ingestion, choose the STAGING database where you want to store the ingested data. Default is data-hub-STAGING.',
    sourcePath: 'The location of your source files.',
    sourceType: 'The format of your source files. Default is JSON.',
    targetType: 'The format of your stored data. Default is JSON.',
    targetPerms: 'The comma-separated roles required to access the ingested data.',
    targetURIReplace: "A comma-separated list of regular expression patterns and their replacement strings to customize the URIs of the ingested records. Example: /foo/bar,'/mydir'"
  }

  static mapping: any = {
    sourceCollection: 'The collection of data to process in this step.',
    sourceQuery: 'The CTS query to use to select the source data to process in this step.',
    targetEntity: 'The entity to map against the source data.',
    sourceDatabase: 'The database from which to take the input data. For mapping, choose the STAGING database where you ingested the data. Default is data-hub-STAGING.',
    targetDatabase: 'The database where to store the processed data. For mapping, choose the FINAL database where you want to store the mapped data. Default is data-hub-FINAL.',
  }

  static mastering: any = {

    sourceCollection: 'The collection of data to process in this step.',
    sourceQuery: 'The CTS query to use to select the source data to process in this step.',
    targetEntity: 'The entity to master against the source data.',
    sourceDatabase: 'The database from which to take the input data. For mastering, choose the FINAL database where you stored processed data. Default is data-hub-FINAL.',
    targetDatabase: 'The database where to store the processed data. For mastering, choose the FINAL database where you want to store mastered data. Default is data-hub-FINAL. IMPORTANT: For mastering, the source database and the target database must be the same. If you want the target database to be different, create a custom step with a custom module to override the default.',

    matching: {
        weightOption: 'A factor signifying the relative importance of the rule.',
        thesaurusURI: 'The path to the thesaurus used to determine synonyms.',
        filter: 'A node in the thesaurus to use as a filter. Example: <thsr:qualifier>birds</thsr:qualifier>',
        dictionaryURI: 'The path to the dictionary used to compare words phonetically.',
        distanceThresh: 'The phonetic distance below which two strings are considered similar.',
        collation: 'The URI for a collation, which specifies the order for sorting strings.',
        zip5matches9: 'The weight to add to the exact match weight when a 5-digit zip code matches the first five digits of a 9-digit zip code.',
        zip9matches5: 'The weight to apply when the first five digits of a 9-digit zip code match a 5-digit zip code.',
        propsReduce: 'One or more properties to compare.',
        weightReduce: 'How much to reduce the weight when all compared properties match.',
        customURI: 'The path to the custom module.',
        customFunc: 'The name of the custom function within the custom module.',
        customNS: 'The namespace of the custom module. Leave blank if the custom module is JavaScript.',
        weightThreshold: 'The threshold the sum of match weights must meet for documents to be considered a match.',
        actionThreshold: 'The action to take when the threshold is met.'
    },

    merging: {
        maxValues: 'The maximum number of values to allow in the merged property. Default is 99.',
        maxSources: 'The maximum number of data sources from which to get values to merge.',
        sourceWeights: 'The list of source data sets and the weights assigned to them.',
        lengthWeight: '	The weight assigned to the length of a string.',
        defaultStrategy: 'Choose "Yes" to make this strategy the default.',
        timestamp: 'Path to the element used for sorting. When set, more recent values have priority by default.',
        collectionsAdd: 'One or more collection tags to add to the default union of tags.',
        collectionsRemove: 'One or more collection tags to remove from the default union of tags.',
        collectionsSet: 'One or more collection tags to replace the default union of tags.'
    }

  }
  static custom: any = {
      sourceCollection: 'The collection of data to process in this step.',
      sourceQuery: 'The CTS query to use to select the source data to process in this step.',
      targetEntity: 'The entity that represents the target data structure for your step.',
      modulesDatabase: 'The database where custom modules are stored. The value is read-only.',
      customModuleURI: 'The path to your custom module. A module with scaffolding code is generated by default.'
  }

}
