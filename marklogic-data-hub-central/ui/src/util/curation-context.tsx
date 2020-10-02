import React, { useState } from 'react';
import {
  CurationOptionsInterface,
  CurationContextInterface
} from '../types/curation-types';
import { definitionsParser } from './data-conversion';

const DEFAULT_CURATION_OPTIONS = {
  entityDefinitionsArray: [],
  activeStep: {
    stepDefinition: {},
    entityName: '',
    isModified: false
  }
}

export const CurationContext = React.createContext<CurationContextInterface>({
  curationOptions: DEFAULT_CURATION_OPTIONS,
  setActiveStep: () => {},
  updateActiveStepDefinition: () => {}
});

const CurationProvider: React.FC<{ children: any }> = ({ children }) => {

  const [curationOptions, setCurationOptions] = useState<CurationOptionsInterface>(DEFAULT_CURATION_OPTIONS);

  /**
    * Sets the current active step in the curate tile 
    * Transforms definitions object payload into array of objects with static key values
    * @param stepDefinition = Step definition object from payload
    * @example 'step.artifacts[0]'
    * @param modelDefinition = Entity type definitions object from payload
    * @example 'model.definitions'
    * @param entityName = Entity type name
    * @example 'model.info.title'
  **/
  const setActiveStep = (stepDefinition: any, modelDefinition: any, entityName: string) => {
    let entityDefArray = definitionsParser(modelDefinition);
    setCurationOptions({ 
      ...curationOptions,
      activeStep: { isModified: false, stepDefinition, entityName },
      entityDefinitionsArray: entityDefArray
    });
  }

  const updateActiveStepDefinition = (stepDefinition: any) => {
    let updatedStep = { ...curationOptions.activeStep, isModified: true, stepDefinition }
    setCurationOptions({ 
      ...curationOptions,
      activeStep: updatedStep,
    });
  }

  return (
    <CurationContext.Provider value={{
      curationOptions,
      setActiveStep,
      updateActiveStepDefinition
    }}>
      {children}
    </CurationContext.Provider>
  )
}

export default CurationProvider;
