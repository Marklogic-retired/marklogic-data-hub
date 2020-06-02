import React, { useState } from 'react';

interface ModelingOptionsInterface {
  entityTypeNamesArray: any[],
  isModified: boolean,
  modifiedEntitiesArray: EntityModified[]
}

interface EntityModified {
  entityName: string,
  definitiions: any
}

interface ModelingContextInterface {
  modelingOptions: ModelingOptionsInterface;
  setEntityTypeNamesArray: (entityTypeNamesArray: any[]) => void;
  toggleIsModified: (isModified: boolean) => void;
}

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
