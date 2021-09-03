import {matchingStep} from "./matching.data";
import {customerEntityDef, customerEntityDefWithLargePropCount, personNestedEntityDef} from "./entity-definitions-mock";
import {definitionsParser} from "../../../util/data-conversion";
import {mergingStep} from "./merging.data";
import {mappingStep} from "./mapping.data";
import curateData from "./flows.data";

const customerEntityDefsArray = definitionsParser(customerEntityDef[0]["entityModel"].definitions);
const customerEntityDefsArrWithLargePropCount = definitionsParser(customerEntityDefWithLargePropCount[0]["entityModel"].definitions);
const personNestedEntityDefArray = definitionsParser(personNestedEntityDef[0]["entityModel"].definitions);

export const customerMatchingStep = {
  curationOptions: {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: matchingStep.artifacts[0],
      entityName: matchingStep.entityType,
      isModified: false,
      hasWarnings: []
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
};

export const customerMatchingStepEmpty = {
  curationOptions: {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: matchingStep.artifacts[1],
      entityName: matchingStep.entityType,
      isModified: false,
      hasWarnings: []
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
};

export const customerMergingStep = {
  curationOptions: {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: mergingStep.artifacts[0],
      entityName: mergingStep.entityType,
      isModified: false,
      hasWarnings: []
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
};

export const customerMergingStepEmpty = {
  curationOptions: {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: mergingStep.artifacts[1],
      entityName: mergingStep.entityType,
      isModified: false,
      hasWarnings: []
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
};

export const matchThresholdArtifact = {
  curationOptions: {
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
      isModified: false,
      hasWarnings: []
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
};

export const customerStepWarning = {
  curationOptions: {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: matchingStep.artifacts[1],
      entityName: matchingStep.entityType,
      hasWarnings: [
        {
          "level": "warn",
          "message": "Warning: Target Collections includes the target entity type Person"
        },
        {
          "level": "warn",
          "message": "Warning: Target Collections includes the source collection loadPersonJSON"
        }
      ]
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn(),
  setActiveStepWarning: jest.fn(),
  setValidateMatchCalled: jest.fn()
};

export const customerStepMergeWarning = {
  curationOptions: {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: mergingStep.artifacts[1],
      entityName: mergingStep.entityType,
      hasWarnings: [
        {
          "level": "warn",
          "message": "Warning: Target Collections includes the target entity type Person"
        },
        {
          "level": "warn",
          "message": "Warning: Target Collections includes the source collection loadPersonJSON"
        }
      ]
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn(),
  setActiveStepWarning: jest.fn(),
  setValidateMergeCalled: jest.fn()
};

export const customerMappingStep = {
  curationOptions: {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: curateData.mappings.data[0],
      entityName: curateData.mappings.data[0].entityType,
      isModified: false,
      hasWarnings: []
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn(),
  mappingOptions: {
    openStepSettings: false,
    openStep: {},
    isEditing: false
  },
  setOpenStepSettings: jest.fn(),
  setOpenStep: jest.fn(),
  setIsEditing: jest.fn(),
  setStepOpenOptions: jest.fn(),
  setActiveStepWarning: jest.fn(),
  setValidateMatchCalled: jest.fn(),
  setValidateMergeCalled: jest.fn()
};

export const personMappingStepEmpty = {
  curationOptions: {
    entityDefinitionsArray: personNestedEntityDefArray,
    activeStep: {
      stepArtifact: mappingStep.artifacts[1],
      entityName: mappingStep.entityType,
      isModified: false
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn(),
  mappingOptions: {
    openStepSettings: false,
    openStep: {},
    isEditing: false
  },
  setOpenStepSettings: jest.fn(),
  setOpenStep: jest.fn(),
  setIsEditing: jest.fn(),
  setStepOpenOptions: jest.fn()
};

export const personMappingStepWithData = {
  curationOptions: {
    entityDefinitionsArray: personNestedEntityDefArray,
    activeStep: {
      stepArtifact: mappingStep.artifacts[0],
      entityName: mappingStep.entityType,
      isModified: false
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn(),
  mappingOptions: {
    openStepSettings: false,
    openStep: {},
    isEditing: false
  },
  setOpenStepSettings: jest.fn(),
  setOpenStep: jest.fn(),
  setIsEditing: jest.fn(),
  setStepOpenOptions: jest.fn()
};

export const personMappingStepWithRelatedEntityData = {
  curationOptions: {
    entityDefinitionsArray: personNestedEntityDefArray,
    activeStep: {
      stepArtifact: mappingStep.artifacts[1],
      entityName: mappingStep.entityType,
      isModified: false
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn(),
  mappingOptions: {
    openStepSettings: false,
    openStep: {},
    isEditing: false
  },
  setOpenStepSettings: jest.fn(),
  setOpenStep: jest.fn(),
  setIsEditing: jest.fn(),
  setStepOpenOptions: jest.fn()
};

export const customerMatchStepWithLargePropCount = {
  curationOptions: {
    entityDefinitionsArray: customerEntityDefsArrWithLargePropCount,
    activeStep: {
      stepArtifact: matchingStep.artifacts[0],
      entityName: matchingStep.entityType,
      isModified: false,
      hasWarnings: []
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
};
