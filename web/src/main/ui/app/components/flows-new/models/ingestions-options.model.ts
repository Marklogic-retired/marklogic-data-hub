export class IngestionOptions {
  public sourceQuery: string;
  public outputFormat: string;
  public collections: string[] = [];
  public permissions: string;
  public targetDatabase: string;
}
