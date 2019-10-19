import { IngestionOptions } from './ingestions-options.model';
import { MappingOptions } from './mapping-options.model';
import { MatchingOptions } from './matching-options.model';
import { MergingOptions } from './merging-options.model';
import { MasteringOptions } from './mastering-options.model';
import { CustomOptions } from './custom-options.model';
import stepConfig from '../../../../../../../e2e/test-objects/stepConfig';
import {isNumber} from "util";

export enum StepType {
  INGESTION = 'INGESTION',
  MAPPING = 'MAPPING',
  MATCHING = 'MATCHING',
  MERGING = 'MERGING',
  MASTERING = 'MASTERING',
  CUSTOM = 'CUSTOM'
}

export enum StepTypePurpose {
  INGESTION = 'CUSTOM INGESTION',
  MAPPING = 'CUSTOM MAPPING',
  MASTERING = 'CUSTOM MASTERING',
  OTHER = 'CUSTOM'
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
    separator: string;
  };
  // Custom only
  public modulePath: string;
  public stepPurpose: StepTypePurpose;
  public stepDefType: any;

  // All step types
  public customHook: any;
  public batchSize: number;
  public threadCount: number;

  private constructor() {}

  static createIngestionStep(filePath: string): Step {
    const step = new Step();
    const fileLocations = {
      inputFilePath: filePath,
      inputFileType: 'json',
      outputURIReplacement: '',
      separator: '',
    };
    step.fileLocations = fileLocations;
    step.options = new IngestionOptions();
    step.options.permissions = 'rest-reader,read,rest-writer,update';
    step.options.outputFormat = 'json';
    step.customHook = {"module" : "",
    "parameters" : {},
    "user" : "",
    "runBefore" : false
  };
    step.batchSize = 100;
    step.threadCount = 4;
    return step;
  }

  static createMappingStep(): Step {
    const step = new Step();
    step.options = new MappingOptions();
    step.options.outputFormat = 'json';
    step.customHook = {"module" : "",
    "parameters" : {},
    "user" : "",
    "runBefore" : false
  };
    step.batchSize = 100;
    step.threadCount = 4;
    return step;
  }

  static createMatchingStep(): Step {
    const step = new Step();
    step.options = new MatchingOptions();
    step.options.outputFormat = 'json';
    step.customHook = {"module" : "",
    "parameters" : {},
    "user" : "",
    "runBefore" : false
  };
    step.batchSize = 100;
    step.threadCount = 4;
    return step;
  }

  static createMergingStep(): Step {
    const step = new Step();
    step.options = new MergingOptions();
    step.options.outputFormat = 'json';
    step.customHook = {"module" : "",
    "parameters" : {},
    "user" : "",
    "runBefore" : false
  };
    step.batchSize = 100;
    step.threadCount = 4;
    return step;
  }

  static createMasteringStep(): Step {
    const step = new Step();
    step.options = new MasteringOptions();
    step.options.outputFormat = 'json';
    step.customHook = {"module" : "",
    "parameters" : {},
    "user" : "",
    "runBefore" : false
  };
    step.batchSize = 100;
    step.threadCount = 4;
    return step;
  }

  static createCustomStep(): Step {
    const step = new Step();
    step.modulePath = '';
    step.options = new CustomOptions();
    step.options.permissions = 'rest-reader,read,rest-writer,update';
    step.options.outputFormat = 'json';
    step.customHook = {"module" : "",
    "parameters" : {},
    "user" : "",
    "runBefore" : false
  };
    step.batchSize = 100;
    step.threadCount = 4;
    return step;
  }
  
  static updateCustomStep(step: Step,customStepType: String,filePath: string) : Step {
    if(customStepType === StepType.INGESTION){
      const fileLocations = {
        inputFilePath: filePath,
        inputFileType: 'json',
        outputURIReplacement: '',
        separator: '',
      };
      step.fileLocations = fileLocations;
    }
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
    if(json.description){
      newStep.description = json.description;
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
    if (json.stepDefType) {
      newStep.stepDefType = json.stepDefType;
    }
    if (json.customHook) {
      newStep.customHook = json.customHook;
    }
    if (json.batchSize && isNumber(parseInt(json.batchSize))) {
      newStep.batchSize = json.batchSize;
    }
    if (json.threadCount && isNumber(parseInt(json.threadCount))) {
      newStep.threadCount = json.threadCount;
    }
 
    // Check options
    if (json.options) {
      // set defaults for each step type
      if (json.stepDefinitionType === StepType.INGESTION && json.stepDefinitionName === 'default-ingestion') {
        // Hard check to see if it's default gradle step
        if (json.fileLocations.inputFilePath === 'path/to/folder') {
          const fileLocations = {
            inputFilePath: projectDirectory,
            inputFileType: 'json',
            outputURIReplacement: '',
            separator: ''
          };
          newStep.fileLocations = fileLocations;
        }
        newStep.options = new IngestionOptions();
        newStep.options.permissions = 'rest-reader,read,rest-writer,update';
        newStep.options.outputFormat = 'json';
        newStep.options.targetDatabase = databases.staging;
      }
      if (json.stepDefinitionType === StepType.MAPPING && (json.stepDefinitionName === 'default-mapping' || json.stepDefinitionName === 'entity-services-mapping')) {
        newStep.options = new MappingOptions();
        newStep.options.sourceDatabase = databases.staging;
        newStep.options.targetDatabase = databases.final;
      }
      if (json.stepDefinitionType === StepType.MATCHING && json.stepDefinitionName === 'default-matching') {
        newStep.options = new MatchingOptions();
        newStep.options.sourceDatabase = databases.final;
        newStep.options.targetDatabase = databases.final;
      }
      if (json.stepDefinitionType === StepType.MERGING && json.stepDefinitionName === 'default-merging') {
        newStep.options = new MergingOptions();
        newStep.options.sourceDatabase = databases.final;
        newStep.options.targetDatabase = databases.final;
      }
      if (json.stepDefinitionType === StepType.MASTERING && json.stepDefinitionName === 'default-mastering') {
        newStep.options = new MasteringOptions();
        newStep.options.sourceDatabase = databases.final;
        newStep.options.targetDatabase = databases.final;
      }
      if (json.stepDefinitionType === StepType.CUSTOM || (json.stepDefinitionType === StepType.INGESTION && json.stepDefinitionName !== 'default-ingestion') || (json.stepDefinitionType === StepType.MAPPING && (json.stepDefinitionName !== 'default-mapping' || json.stepDefinitionName === 'entity-services-mapping')) || (json.stepDefinitionType === StepType.MASTERING && json.stepDefinitionName !== 'default-mastering')) {
        if (json.stepDefinitionType === StepType.INGESTION) {
          if (json.fileLocations.inputFilePath === 'path/to/folder') {
            const fileLocations = {
              inputFilePath: projectDirectory,
              inputFileType: 'json',
              outputURIReplacement: '',
              separator: ''
            };
            newStep.fileLocations = fileLocations;
          }
        }
        
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
