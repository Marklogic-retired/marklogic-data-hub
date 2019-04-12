export class MappingOptions {
  private sourceQuery: string;
  private sourceContext: string;
  private targetEntity: string;
  private targetEntityType: string;
  private properties: any;
  constructor() {
    this.sourceQuery = '';
    this.sourceContext = '';
    this.targetEntity = '';
    this.targetEntityType = '';
  }
}