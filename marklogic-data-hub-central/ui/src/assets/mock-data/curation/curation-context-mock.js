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
}

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
}

export const customerMergingStep = {
  curationOptions:   {
    entityDefinitionsArray: customerEntityDefsArray,
    activeStep: {
      stepArtifact: [],
      entityName: mergingStep.entityType,
      isModified: false
    }
  },
  setActiveStep: jest.fn(),
  updateActiveStepArtifact: jest.fn()
}
