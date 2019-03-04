export class Step {
  public id: string;
  public type: string;
  public name: string = '';
  public description: string = '';
  public sourceDatabase: string = '';
  public targetDatabase: string;
  public config: Object = {};
  public language: string;
  public isValid: boolean = false;
  public isRunning: boolean = false;
  public version: string;

  // Mapping
  public sourceCollection: string;
  public sourceQuery: string = '';
  public targetEntity: string;

}
