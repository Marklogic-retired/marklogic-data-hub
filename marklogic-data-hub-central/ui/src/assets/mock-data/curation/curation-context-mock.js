import { matchingStep } from './matching';
import { customerEntityDef } from './entity-definitions-mock';
import { definitionsParser } from '../../../util/data-conversion';
import { mergingStep } from './merging';

const customerEntityDefsArray = definitionsParser(customerEntityDef.definitions);

export const customerMatchingStep = {
  curationOptions:   {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: matchingStep.artifacts[0],
      entityName: matchingStep.entityType,
      isModified: false
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
};

export const customerMatchingStepEmpty = {
  curationOptions:   {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: matchingStep.artifacts[1],
      entityName: matchingStep.entityType,
      isModified: false
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
};

export const customerMergingStep = {
  curationOptions:   {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: mergingStep.artifacts[0],
      entityName: mergingStep.entityType,
      isModified: false
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
};

export const customerMergingStepEmpty = {
  curationOptions:   {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: mergingStep.artifacts[1],
      entityName: mergingStep.entityType,
      isModified: false
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
};

export const matchThresholdArtifact = {
  curationOptions:   {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: {
        "batchSize": 100,
        "threadCount": 1,
        "sourceDatabase": "data-hub-FINAL",
        "targetDatabase": "data-hub-FINAL",
        "targetEntity": "Change this to a valid entity type name; e.g. Customer",
        "sourceQuery": "cts.collectionQuery(['Customer'])",
        "collections": [
            "matchCustomers"
        ],
        "permissions": "data-hub-common,read,data-hub-common-writer,update",
        "targetFormat": "JSON",
        "matchRulesets": [],
        "thresholds": [
            {
                "thresholdName": "abc",
                "action": "merge",
                "score": 8
            },
            {
                "thresholdName": "def",
                "action": "notify",
                "score": 12
            },
            {
                "thresholdName": "customAction",
                "action": "custom",
                "score": 0,
                "actionModulePath": "/uri",
                "actionModuleFunction": "/function",
                "actionModuleNamespace": ""
            }
        ],
        "name": "matchCustomer",
        "description": "",
        "additionalCollections": [],
        "provenanceGranularityLevel": "fine",
        "selectedSource": "collection",
        "stepDefinitionName": "default-matching",
        "stepDefinitionType": "matching",
        "stepId": "matchCustomers-matching",
        "targetEntityType": "http://example.org/Customer-0.0.1/Customer",
        "acceptsBatch": true,
        "stepUpdate": false,
        "lastUpdated": "2020-11-11T22:01:18.172789-08:00"
      },
      entityName: "Customer",
      isModified: false
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
}

