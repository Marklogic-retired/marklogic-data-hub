import React, { useState } from 'react';
import {
  ModelingOptionsInterface,
  EntityModified,
  ModelingContextInterface
} from '../types/modeling-types';

const DEFAULT_MODELING_OPTIONS = {
  entityTypeNamesArray: [],
  isModified: false,
  modifiedEntitiesArray: []
}

export const ModelingContext = React.createContext<ModelingContextInterface>({
  modelingOptions: DEFAULT_MODELING_OPTIONS,
  setEntityTypeNamesArray: () => {},
  toggleIsModified: () => {},
});

const ModelingProvider: React.FC<{ children: any }> = ({ children }) => {

  const [modelingOptions, setModelingOptions] = useState<ModelingOptionsInterface>(DEFAULT_MODELING_OPTIONS);

  const setEntityTypeNamesArray = (entityTypeNamesArray: any[]) => {
    setModelingOptions({ ...modelingOptions, entityTypeNamesArray })
  }

  const toggleIsModified = (isModified: boolean) => {
    setModelingOptions({ ...modelingOptions, isModified })
  }

  const addPropertyToDefinition = () => {
    let array = []
    setModelingOptions({ ...modelingOptions, modifiedEntitiesArray: [] })
  }

  return (
    <ModelingContext.Provider value={{
      modelingOptions,
      setEntityTypeNamesArray,
      toggleIsModified,
    }}>
      {children}
    </ModelingContext.Provider>
  )
}

export default ModelingProvider;
