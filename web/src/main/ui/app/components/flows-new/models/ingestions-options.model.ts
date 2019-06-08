export class IngestionOptions {
  public additionalCollections: string[] = [];
  public collections: string[] = [];
  public sourceQuery: string;
  public outputFormat: string;
  public permissions: string;
  public targetDatabase: string;
}
