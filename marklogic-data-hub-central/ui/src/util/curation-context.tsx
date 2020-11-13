import React, { useState } from 'react';
import {
  CurationOptionsInterface,
  CurationContextInterface
} from '../types/curation-types';
import { definitionsParser } from './data-conversion';

const DEFAULT_CURATION_OPTIONS = {
  entityDefinitionsArray: [],
  activeStep: {
    stepArtifact: {},
    entityName: '',
    isModified: false
  }
};

export const CurationContext = React.createContext<CurationContextInterface>({
  curationOptions: DEFAULT_CURATION_OPTIONS,
  setActiveStep: () => {},
  updateActiveStepArtifact: () => {}
});

const CurationProvider: React.FC<{ children: any }> = ({ children }) => {

  const [curationOptions, setCurationOptions] = useState<CurationOptionsInterface>(DEFAULT_CURATION_OPTIONS);

  /**
    * Sets the current active step in the curate tile 
    * Transforms definitions object payload into array of objects with static key values
    * @param stepArtifact = Step definition object from payload
    * @example 'step.artifacts[0]'
    * @param modelDefinition = Entity type definitions object from payload
    * @example 'model.definitions'
    * @param entityName = Entity type name
    * @example 'model.info.title'
  **/
  const setActiveStep = (stepArtifact: any, modelDefinition: any, entityName: string) => {
    let entityDefArray = definitionsParser(modelDefinition);
    setCurationOptions({ 
      ...curationOptions,
      activeStep: { ...curationOptions.activeStep, stepArtifact, entityName },
      entityDefinitionsArray: entityDefArray
    });
  };

  const updateActiveStepArtifact = (stepArtifact: any) => {
    let updatedStep = { ...curationOptions.activeStep, stepArtifact };
    setCurationOptions({ 
      ...curationOptions,
      activeStep: updatedStep,
    });
  };
  return (
    <CurationContext.Provider value={{
      curationOptions,
      setActiveStep,
      updateActiveStepArtifact,
    }}>
      {children}
    </CurationContext.Provider>
  );
};

export default CurationProvider;
