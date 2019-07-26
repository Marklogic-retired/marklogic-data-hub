export class StepConfig {

  ingestion = {
    stepType: 'Ingestion',
    stepName: 'json-ingestion',
    stepDesc: 'json ingestion description',
    targetDatabase: 'data-hub-qa-STAGING',
    path: '/input/flow-test/json',
    sourceFileType: 'JSON',
    targetFileType: 'JSON',
  };

  mapping = {
    stepType: 'Mapping',
    stepName: 'json-mapping',
    stepDesc: 'json mapping description',
    sourceType: 'Collection',
    sourceCollection: 'json-ingestion',
    targetEntity: 'Person',
    sourceDatabase: 'data-hub-qa-STAGING',
    targetDatabase: 'data-hub-qa-FINAL',
  };

  mapping2 = {
    stepType: 'Mapping',
    stepName: 'json-mapping2',
    stepDesc: 'json mapping description',
    sourceType: 'Collection',
    sourceCollection: 'json-ingestion',
    targetEntity: 'Person',
    sourceDatabase: 'data-hub-qa-STAGING',
    targetDatabase: 'data-hub-qa-STAGING',
  };

  mastering = {
    stepType: 'Mastering',
    stepName: 'json-mastering',
    stepDesc: 'json mastering description',
    sourceType: 'Collection',
    sourceCollection: 'json-mapping',
    targetEntity: 'Person',
    sourceDatabase: 'data-hub-qa-FINAL',
    targetDatabase: 'data-hub-qa-FINAL',
  };

  json = {
    stepType: 'Ingestion',
    stepName: 'json-ingestion',
    stepDesc: 'json ingestion description',
    targetDatabase: 'data-hub-qa-STAGING',
    path: '/input/flow-test/json',
    sourceFileType: 'JSON',
    targetFileType: 'JSON',
  };

  xml = {
    stepType: 'Ingestion',
    stepName: 'xml-ingestion',
    stepDesc: 'xml ingestion description',
    targetDatabase: 'data-hub-qa-STAGING',
    path: '/input/flow-test/xml',
    sourceFileType: 'XML',
    targetFileType: 'JSON',
  };

  csv = {
    stepType: 'Ingestion',
    stepName: 'csv-ingestion',
    stepDesc: 'csv ingestion description',
    targetDatabase: 'data-hub-qa-STAGING',
    path: '/input/flow-test/csv',
    sourceFileType: 'Delimited Text',
    separator: ',',
    targetFileType: 'JSON',
  };

  csv_pipe = {
    stepType: 'Ingestion',
    stepName: 'csv-ingestion',
    stepDesc: 'csv ingestion description',
    targetDatabase: 'data-hub-qa-STAGING',
    path: '/input/flow-test/sep-types/pipe-data',
    sourceFileType: 'Delimited Text',
    separator: '|',
    targetFileType: 'JSON',
  };

  csv_semicolon = {
    stepType: 'Ingestion',
    stepName: 'csv-ingestion',
    stepDesc: 'csv ingestion description',
    targetDatabase: 'data-hub-qa-STAGING',
    path: '/input/flow-test/sep-types/semicolon-data',
    sourceFileType: 'Delimited Text',
    separator: ';',
    targetFileType: 'JSON',
  };

  csv_tab = {
    stepType: 'Ingestion',
    stepName: 'csv-ingestion',
    stepDesc: 'csv ingestion description',
    targetDatabase: 'data-hub-qa-STAGING',
    path: '/input/flow-test/sep-types/tab-data',
    sourceFileType: 'Delimited Text',
    separator: 'Tab',
    targetFileType: 'JSON',
  };
  text = {
    stepType: 'Ingestion',
    stepName: 'text-ingestion',
    stepDesc: 'text ingestion description',
    targetDatabase: 'data-hub-qa-STAGING',
    path: '/input/flow-test/text',
    sourceFileType: 'Text',
    targetFileType: 'Text',
  };

  binary = {
    stepType: 'Ingestion',
    stepName: 'binary-ingestion',
    stepDesc: 'binary ingestion description',
    targetDatabase: 'data-hub-qa-STAGING',
    path: '/input/flow-test/binary',
    sourceFileType: 'Binary',
    targetFileType: 'JSON',
  };

  simpleIngest = {
    stepType: 'Ingestion',
    stepName: 'SimpleJSONIngest',
    stepDesc: 'json ingestion description',
    targetDatabase: 'data-hub-qa-STAGING',
    path: '/input/flow-test/json',
    sourceFileType: 'JSON',
    targetFileType: 'JSON',
  };

  simpleMapping = {
    stepType: 'Mapping',
    stepName: 'SimpleJSONMapping',
    stepDesc: 'json mapping description',
    sourceType: 'Collection',
    sourceCollection: 'json-ingestion',
    targetEntity: 'Person',
    sourceDatabase: 'data-hub-qa-STAGING',
    targetDatabase: 'data-hub-qa-FINAL',
  };

  simpleMastering = {
    stepType: 'Mastering',
    stepName: 'SimpleJSONMastering',
    stepDesc: 'json mastering description',
    sourceType: 'Collection',
    sourceCollection: 'json-mapping',
    targetEntity: 'Person',
    sourceDatabase: 'data-hub-qa-FINAL',
    targetDatabase: 'data-hub-qa-FINAL',
  };

}

let stepConfig = new StepConfig();
export default stepConfig;
