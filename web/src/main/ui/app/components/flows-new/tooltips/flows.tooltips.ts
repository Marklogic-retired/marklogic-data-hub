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
    targetType: 'The format that you want your data to be stored as. Default is JSON.',
    targetPerms: 'The comma-separated roles required to access the ingested data.',
    targetURIReplace: 'A comma-separated list of replacements used to customize the URIs of the ingested records. The list is comprised of regular expression patterns and their replacement strings. The replacement strings must be enclosed in single quotes.',
    delimiter: 'The delimiter character for the CSV file. Default is a comma (",").'
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
    targetEntity: 'The entity to map against the source data.',
    sourceDatabase: 'The database from which to take the input data. For mastering, choose the FINAL database where you stored processed data. Default is data-hub-FINAL.',
    targetDatabase: 'The database where to store the processed data. For mastering, choose the FINAL database where you want to store mastered data. Default is data-hub-FINAL. IMPORTANT: For mastering, the source database and the target database must be the same. If you want the target database to be different, create a custom step with a custom module to override the default.',

    matching: {
        weightOption: 'A factor that signifies the relative importance of the rule.',
        thesaurusURI: 'The path to a thesaurus that is stored in a MarkLogic Server database and used to determine synonyms.',
        filter: 'A node in the thesaurus to use as a filter. For example, <thsr:qualifier>birds</thsr:qualifier>.',
        directoryURI: 'The path to a phonetic dictionary that is stored in a database and used when comparing words phonetically. ',
        distanceThresh: 'The threshold below which the phonetic difference (distance) between two strings is considered insignificant; i.e., the strings are similar to each other.',
        collation: 'The URI to the collation to use. A collation specifies the order for sorting strings.',
        zip5matches9: 'The weight to use if, given one 9-digit zip code and one 5-digit zip code, the first five digits of the zip codes match.',
        zip9matches5: 'The weight to use if, given two 9-digit zip codes, the first five digits match and the last four do not. To add a weight when all nine digits match, use the Exact matching type to compare the zip codes as strings.',
        propsReduce: 'One or more properties whose values to compare.',
        weightReduce: 'A positive integer that denotes how much to reduce the weight of a match.',
        customURI: 'The path to the custom module.',
        customFunc: 'The name of the custom function within the custom module.',
        customNS: 'The namespace of the library module where the custom function is. Blank, if the custom function is JavaScript code.',
        weightThreshold: 'The threshold with which to compare the total weight of the matches.'
    },

    merging: {
        maxValues: 'The maximum number of values to allow in the merged property. Default is 99.',
        maxSources: 'The maximum number of data sources from which to get values to merge.',
        sourceWeights: 'The list of source data sets and the weights assigned to them.',
        lengthWeight: '	The weight assigned to the length of a string.',
        defaultStrategy: 'Choose "Yes" to make this strategy the default.',
        collectionsAdd: 'One or more collection tags to add to the default union of tags.',
        collectionsRemove: 'One or more collection tags to remove from the default union of tags.',
        collectionsSet: 'One or more collection tags to replace the default union of tags.'
    }

  }

}
