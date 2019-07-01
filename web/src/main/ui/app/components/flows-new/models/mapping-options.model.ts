export class MappingOptions {
  public additionalCollections: string[] = [];
  public collections: string[] = [];
  public sourceQuery: string = '';
  public sourceCollection: string = '';
  public sourceDatabase: string = '';
  public targetDatabase: string;
  public mapping: any;
  public targetEntity: string;
  public outputFormat: string;
}
