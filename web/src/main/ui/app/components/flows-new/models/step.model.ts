import { IngestionOptions } from './ingestions-options.model';
import { MappingOptions } from './mapping-options.model';
import { MasteringOptions } from './mastering-options.model';
import { CustomOptions } from './custom-options.model';

export enum StepType {
  INGESTION = 'INGESTION',
  MAPPING = 'MAPPING',
  MASTERING = 'MASTERING',
  CUSTOM = 'CUSTOM'
}

export class Step {
  public id: string;
  public name: string = '';
  public description: string = '';
  public selectedSource: string;
  public stepDefinitionName: string;
  public stepDefinitionType: StepType;
  public isValid: boolean = false;
  public options: any;
  // Ingestion only
  public fileLocations: {
    inputFilePath: string;
    inputFileType: string;
    outputURIReplacement: string;
  };
  // Custom only
  public modulePath: string;
  private constructor() {}

  static createIngestionStep(filePath: string): Step {
    const step = new Step();
    const fileLocations = {
      inputFilePath: filePath,
      inputFileType: 'json',
      outputURIReplacement: ''
    };
    step.fileLocations = fileLocations;
    step.options = new IngestionOptions();
    step.options.permissions = 'rest-reader,read,rest-writer,update';
    step.options.outputFormat = 'json';
    return step;
  }

  static createMappingStep(): Step {
    const step = new Step();
    step.options = new MappingOptions();
    step.options.outputFormat = 'json';
    return step;
  }

  static createMasteringStep(): Step {
    const step = new Step();
    step.options = new MasteringOptions();
    step.options.outputFormat = 'json';
    return step;
  }

  static createCustomStep(): Step {
    const step = new Step();
    step.modulePath = '';
    step.options = new CustomOptions();
    step.options.outputFormat = 'json';
    return step;
  }

  static fromJSON(json, projectDirectory, databases) {
    const newStep = new Step();
    if (json.id) {
      newStep.id = json.id;
    }
    if (json.name) {
      newStep.name = json.name;
    }
    if (json.selectedSource) {
      newStep.selectedSource = json.selectedSource;
    }
    if (json.stepDefinitionName) {
      newStep.stepDefinitionName = json.stepDefinitionName;
    }
    if (json.stepDefinitionType) {
      newStep.stepDefinitionType = json.stepDefinitionType;
    }
    if (json.fileLocations) {
      newStep.fileLocations = json.fileLocations;
    }
    if (json.isValid) {
      newStep.isValid = json.isValid;
    }
    if (json.modulePath) {
      newStep.modulePath = json.modulePath;
    }
    // Check options
    if (json.options) {
      // set defaults for each step type
      if (json.stepDefinitionType === StepType.INGESTION) {
        // Hard check to see if it's default gradle step
        if (json.fileLocations.inputFilePath === 'path/to/folder') {
          const fileLocations = {
            inputFilePath: projectDirectory,
            inputFileType: 'json',
            outputURIReplacement: ''
          };
          newStep.fileLocations = fileLocations;
        }
        newStep.options = new IngestionOptions();
        newStep.options.permissions = 'rest-reader,read,rest-writer,update';
        newStep.options.outputFormat = 'json';
        newStep.options.targetDatabase = databases.staging;
      }
      if (json.stepDefinitionType === StepType.MAPPING) {
        newStep.options = new MappingOptions();
        newStep.options.sourceDatabase = databases.staging;
        newStep.options.targetDatabase = databases.final;
      }
      if (json.stepDefinitionType === StepType.MASTERING) {
        newStep.options = new MasteringOptions();
        newStep.options.sourceDatabase = databases.final;
        newStep.options.targetDatabase = databases.final;
      }
      if (json.stepDefinitionType === StepType.CUSTOM) {
        newStep.options = new CustomOptions();
        newStep.options.sourceDatabase = databases.staging;
        newStep.options.targetDatabase = databases.final;
      }
      const newOptions = Object.assign(newStep.options, json.options);
      newStep.options = newOptions;
    }
    return newStep;
  }
}
