import React, {useState} from "react";
import {
  CurationOptionsInterface,
  CurationContextInterface,
  MappingOptionsInterface
} from "../types/curation-types";
import {definitionsParser} from "./data-conversion";

const DEFAULT_CURATION_OPTIONS = {
  entityDefinitionsArray: [],
  activeStep: {
    stepArtifact: {},
    entityName: "",
    isModified: false,
    hasWarnings: []
  }
};

const DEFAULT_MAPPING_OPTIONS: MappingOptionsInterface = {
  openStepSettings: false,
  openStep: {},
  isEditing: false
};

export const CurationContext = React.createContext<CurationContextInterface>({
  curationOptions: DEFAULT_CURATION_OPTIONS,
  setActiveStep: () => {},
  updateActiveStepArtifact: () => {},
  validateCalled: false,
  setValidateMatchCalled: () => {},
  setActiveStepWarning: () => {},
  mappingOptions: DEFAULT_MAPPING_OPTIONS,
  setOpenStepSettings: () => {},
  setOpenStep: () => {},
  setIsEditing: () => {},
  setStepOpenOptions: () => {}
});

const CurationProvider: React.FC<{ children: any }> = ({children}) => {

  const [curationOptions, setCurationOptions] = useState<CurationOptionsInterface>(DEFAULT_CURATION_OPTIONS);
  const [mappingOptions, setMappingOptions] = useState<MappingOptionsInterface>(DEFAULT_MAPPING_OPTIONS);
  const [validateCalled, setValidateCalled] = useState(false);
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
      activeStep: {...curationOptions.activeStep, stepArtifact, entityName},
      entityDefinitionsArray: entityDefArray
    });
  };

  const setValidateMatchCalled = (validateCalledUpdate: boolean) => {
    setValidateCalled(validateCalledUpdate);
  };

  const setActiveStepWarning = (warning: any[]) => {
    setCurationOptions({
      ...curationOptions,
      activeStep: {...curationOptions.activeStep, hasWarnings: warning}
    });
  };

  const updateActiveStepArtifact = (stepArtifact: any) => {
    let updatedStep = {...curationOptions.activeStep, stepArtifact};
    setCurationOptions({
      ...curationOptions,
      activeStep: updatedStep,
    });
  };

  const setOpenStepSettings = (openStepSettings: boolean) => {
    setMappingOptions({
      ...mappingOptions,
      openStepSettings: openStepSettings
    });
  };

  const setOpenStep = (openStep: any) => {
    setMappingOptions({
      ...mappingOptions,
      openStep: openStep
    });
  };

  const setIsEditing = (isEditing: boolean) => {
    setMappingOptions({
      ...mappingOptions,
      isEditing: isEditing
    });
  };

  const setStepOpenOptions = (stepOpenOptions: any) => {
    setMappingOptions({
      ...mappingOptions,
      openStepSettings: stepOpenOptions.openStepSettings,
      isEditing: stepOpenOptions.isEditing,
    });
  };

  return (
    <CurationContext.Provider value={{
      curationOptions,
      setActiveStep,
      updateActiveStepArtifact,
      validateCalled,
      setValidateMatchCalled,
      setActiveStepWarning,
      mappingOptions,
      setOpenStepSettings,
      setOpenStep,
      setIsEditing,
      setStepOpenOptions
    }}>
      {children}
    </CurationContext.Provider>
  );
};

export default CurationProvider;
