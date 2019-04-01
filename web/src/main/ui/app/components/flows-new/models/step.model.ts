import { Options } from './step-options.model';

export class Step {
  public id: string;
  public type: string;
  public name: string = '';
  public description: string = '';
  public sourceDatabase: string = '';
  public targetDatabase: string;
<<<<<<< HEAD
=======
  public config: any = {
    matchOptions: new Matching,
    mergeOptions: new Merging,
    targetEntity: ''
  };
>>>>>>> develop
  public language: string;
  public isValid: boolean = false;
  public version: string;

  public options: Options;
}