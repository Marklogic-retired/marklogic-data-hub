import { IngestionOptions } from './ingestion-options.model';
import { MappingOptions } from './mapping-options.model';
import { MasteringOptions } from './mastering-options.model';
import { CustomOptions } from './custom-options.model';
import { Matching } from '../edit-flow/mastering/matching/matching.model';
import { Merging } from '../edit-flow/mastering/merging/merging.model';

export class Step {
  private id: string;
  private type: string;
  private name: string;
  private description: string;
  private sourceDatabase: string;
  private targetDatabase: string;
  private language: string;
  private isValid: boolean;
  private version: string;
  public options: any;

  constructor(type: string, inputFilePath: string) {
    this.type = type;
    this.name = '';
    this.description = '';
    this.sourceDatabase = '';
    this.targetDatabase = '';
    this.language = '';
    this.isValid = false;
    this.version = '';

    switch (type) {
      case 'ingest': {
        this.options = new IngestionOptions(inputFilePath);
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
  get stepId(): string {
    return this.id;
  }
  get stepName(): string {
    return this.name;
  }
  get stepType(): string {
    return this.type;
  }
  set stepOptions(options: any) {
    this.name = options.name;
    this.description = options.description;
    this.options.sourceQuery = options.sourceQuery;
    this.options.targetEntity = options.targetEntity;
    this.sourceDatabase = options.sourceDatabase;
    this.targetDatabase = options.targetDatabase;
  }
}
