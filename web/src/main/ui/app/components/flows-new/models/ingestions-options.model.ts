export class IngestionOptions {
  public sourceQuery: string = '';
  public outputFormat: string = 'json';
  public collections: string[] = [];
  public permissions: string = 'rest-reader,read,rest-writer,update';
  public targetDatabase: string;
}
