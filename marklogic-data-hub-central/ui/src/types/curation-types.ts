import { Definition } from './modeling-types';

export enum StepType {
  Mapping = 'mapping',
  Matching = 'matching',
  Merging = 'merging'
}

export interface CurationContextInterface {
  curationOptions: CurationOptionsInterface;
  setActiveStep: (stepArtifact: any, modelDefinition: any, entityType: string) => void;
  updateActiveStepArtifact: (stepArtifact: any) => void;
}

export interface CurationOptionsInterface {
  entityDefinitionsArray: Definition[],
  activeStep: ActiveStep
}

export type ActiveStep ={
  stepArtifact: any | MatchingStep,
  entityName: string,
  isModified: boolean
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
  thresholds: any[]
}

export interface MatchRuleset {
  name: string,
  weight: number
  matchRules: MatchRule[]
}

export interface MatchRule {
  entityPropertyPath: string,
  matchType: string,
  options?: any,
  // custom options
  algorithmModuleNamespace?: string,
  algorithmModulePath?: string,
  algorithmModuleFunction?: string,
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
}
