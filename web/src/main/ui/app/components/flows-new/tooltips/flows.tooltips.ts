export class FlowsTooltips {

  static flowSettings: any = {
    batchSize: 'This is the Batch Size tooltip.',
    threadCount: 'This is the Thread Count tooltip.',
    options: 'This is the Options tooltip. It will most likely be longer.'
  }

  static stepSettings: any = {
    sourceType: '',
    sourceCollection: '',
    sourceQuery: '',
    targetEntity: '',
    sourceDatabase: '',
    targetDatabase: ''
  }

  static ingest: any = {
    sourcePath: '',
    sourceType: '',
    targetType: '',
    targetPerms: '',
    targetURIReplace: '',
    sourceType: '',
    sourcePath: '',
    sourceType: ''
  }

  static mapping: any = {
    source: '',
    sourceURI: '',
    targetEntity: ''
  }

  static mastering: any = {

    matching: {
        weightOption: '',
        thesaurusURI: '',
        filter: '',
        directoryURI: '',
        distanceThresh: '',
        collation: '',
        zip5matches9: '',
        zip9matches5: '',
        propsReduce: '',
        weightReduce: '',
        customURI: '',
        customFunc: '',
        customNS: '',
        weightThreshold: ''
    },

    merging: {
        maxValues: '',
        maxSources: '',
        sourceWeights: '',
        lengthWeight: '',
        defaultStrategy: '',
        timestamp: '',
        collectionsAdd: '',
        collectionsRemove: '',
        collectionsSet: ''
    }

  }

}
