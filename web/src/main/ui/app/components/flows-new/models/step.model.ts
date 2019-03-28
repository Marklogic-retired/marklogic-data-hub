import { Config } from './step-config.model';

export class Step {
  public id: string;
  public type: string;
  public name: string = '';
  public description: string = '';
  public sourceDatabase: string = '';
  public targetDatabase: string;
  public language: string;
  public isValid: boolean = false;
  public version: string;

  public config: Config;
}