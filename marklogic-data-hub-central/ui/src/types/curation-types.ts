import {Definition} from "./modeling-types";

export enum StepType {
  Mapping = "mapping",
  Matching = "matching",
  Merging = "merging",
  Custom = "custom"
}

export interface CurationContextInterface {
  curationOptions: CurationOptionsInterface;
  setActiveStep: (stepArtifact: any, modelDefinition: any, entityType: string) => void;
  updateActiveStepArtifact: (stepArtifact: any) => void;
  validateCalled: (boolean);
  validateMerge:(boolean);
  loadModalClicked:(boolean);
  setLoadModalClickedCalled:  (isLoadModalClicked: any) => void;
  setValidateMatchCalled: (validateCalled: boolean) => void;
  setValidateMergeCalled: (validateCalled: boolean) => void;
  setActiveStepWarning: (warning: any) => void;
  mappingOptions: MappingOptionsInterface;
  setOpenStepSettings: (openStepSettings: boolean) => void;
  setOpenStep: (openStep: any) => void;
  setIsEditing: (isEditing: boolean) => void;
  setStepOpenOptions: (stepOpenOptions: any) => void;
}

export interface CurationOptionsInterface {
  entityDefinitionsArray: Definition[],
  activeStep: ActiveStep
}

export interface MappingOptionsInterface {
  openStepSettings: boolean,
  openStep: any,
  isEditing: boolean
}

export type ActiveStep ={
  stepArtifact: any | MatchingStep,
  entityName: string,
  isModified: boolean,
  hasWarnings: any[]
}

export interface MatchingStep {
  name: string,
  description: string,
  additionalCollections: any,
  collections: any,
  lastUpdated: string,
  permissions: string,
  provenanceGranularityLevel: string,
  selectedSource: string,
  sourceDatabase: string,
  sourceQuery: string,
  stepDefinitionName: string,
  stepDefinitionType: string,
  stepId: string,
  targetDatabase: string,
  targetEntityType: string,
  targetFormat: string,
  matchRulesets: any[],
  thresholds: any[],
  interceptors: any,
  customHook: any
}

export interface MatchRuleset {
  name: string,
  weight: number,
  matchRules: MatchRule[],
  rulesetType? : string
}

export interface MatchRule {
  entityPropertyPath: string,
  matchType: string,
  options?: any,
  // custom options
  algorithmModuleNamespace?: string,
  algorithmModulePath?: string,
  algorithmFunction?: string,
}

export interface Threshold {
  thresholdName: string,
  action: string,
  score: number,
  actionModulePath?: string,
  actionModuleNamespace?: string,
  actionModuleFunction?: string,
}

export interface MergingStep {
  name: string,
  stepDefinitionName: string,
  stepDefinitionType: string,
  stepId: string,
  targetEntityType: string,
  description: string,
  selectedSource: string,
  sourceQuery: string,
  collections: any,
  additionalCollections: any,
  sourceDatabase: string,
  targetDatabase: string,
  targetFormat: string,
  permissions: string,
  provenanceGranularityLevel: string,
  lastUpdatedLocation: {
     namespaces: {},
     documentXPath: string,
  },
  mergeStrategies: any[],
  mergeRules: any[],
  interceptors: any,
  customHook: any
}

export const defaultPriorityOption = {
  start: 0,
  id: "Timestamp:0",
  value: "Timestamp:0"
};

export interface MappingStep {
  name: string,
  description: string,
  additionalCollections: any,
  collections: any,
  lastUpdated: string,
  permissions: string,
  properties: any,
  provenanceGranularityLevel: string,
  selectedSource: string,
  sourceDatabase: string,
  sourceQuery: string,
  stepDefinitionName: string,
  stepDefinitionType: string,
  stepId: string,
  targetDatabase: string,
  targetEntityType: string,
  targetFormat: string,
  batchSize: number,
  interceptors: any,
  customHook: any,
  validateEntity: string,
  uriExpression: string
}
