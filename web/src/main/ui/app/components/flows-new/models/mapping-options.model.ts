export class MappingOptions {
  public collections: string[] = [];
  public sourceQuery: string = '';
  public sourceCollection: string = '';
  public sourceDatabase: string = '';
  public targetDatabase: string;
  public mapping: any;
  public targetEntity: string;
}
