import { IngestionOptions } from './ingestion-options.model';
import { MappingOptions } from './mapping-options.model';
import { MasteringOptions } from './mastering-options.model';
import { CustomOptions } from './custom-options.model';
import { Matching } from '../edit-flow/mastering/matching/matching.model';
import { Merging } from '../edit-flow/mastering/merging/merging.model';

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

  public options: any = {};

  set stepOption(type: string) {
    switch (type) {
      case 'ingest': {
        this.options = new IngestionOptions();
        break;
      }
      case 'mapping': {
        this.options = new MappingOptions();
        break;
      }
      case 'mastering': {
        this.options = new MasteringOptions();
        break;
      }
      case 'custom': {
        this.options = new CustomOptions();
        break;
      }
      default: {
        break;
      }
   }
  }
}
