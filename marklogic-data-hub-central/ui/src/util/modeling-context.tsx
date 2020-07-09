import React, { useState } from 'react';
import {
  ModelingOptionsInterface,
  EntityModified
} from '../types/modeling-types';

const DEFAULT_MODELING_OPTIONS = {
  entityTypeNamesArray: [],
  isModified: false,
  modifiedEntitiesArray: []
}

export interface ModelingContextInterface {
  modelingOptions: ModelingOptionsInterface;
  setEntityTypeNamesArray: (entityTypeNamesArray: any[]) => void;
  toggleIsModified: (isModified: boolean) => void;
  updateEntityModified: (entityModified: EntityModified) => void;
  removeEntityModified: (entityModified: EntityModified) => void;
  clearEntityModified: () => void;
}

export const ModelingContext = React.createContext<ModelingContextInterface>({
  modelingOptions: DEFAULT_MODELING_OPTIONS,
  setEntityTypeNamesArray: () => {},
  toggleIsModified: () => {},
  updateEntityModified: () => {},
  removeEntityModified: () => {},
  clearEntityModified: () => {}
});

const ModelingProvider: React.FC<{ children: any }> = ({ children }) => {

  const [modelingOptions, setModelingOptions] = useState<ModelingOptionsInterface>(DEFAULT_MODELING_OPTIONS);

  const setEntityTypeNamesArray = (entityTypeNamesArray: any[]) => {
    setModelingOptions({ ...modelingOptions, entityTypeNamesArray })
  }

  const toggleIsModified = (isModified: boolean) => {
    setModelingOptions({ ...modelingOptions, isModified })
  }

  const updateEntityModified = (entityModified: EntityModified) => {
    let newModifiedEntitiesArray = [...modelingOptions.modifiedEntitiesArray];
    if (newModifiedEntitiesArray.some(entity => entity.entityName === entityModified.entityName)) {
      let index = newModifiedEntitiesArray.map((entity) => { return entity.entityName; }).indexOf(entityModified.entityName);
      newModifiedEntitiesArray[index] = entityModified;
    } else {
      newModifiedEntitiesArray.push(entityModified);
    }
    setModelingOptions({ ...modelingOptions, modifiedEntitiesArray: newModifiedEntitiesArray, isModified: true })
  }

  const removeEntityModified = (entityModified: EntityModified) => {
    let newModifiedEntitiesArray = [...modelingOptions.modifiedEntitiesArray];
    if (newModifiedEntitiesArray.some(entity => entity.entityName === entityModified.entityName)) {
      let index = newModifiedEntitiesArray.map((entity) => { return entity.entityName; }).indexOf(entityModified.entityName);
      newModifiedEntitiesArray.splice(index, 1);
      setModelingOptions({ ...modelingOptions, modifiedEntitiesArray: newModifiedEntitiesArray, isModified: false })
    }
  }

  const clearEntityModified = () => {
    setModelingOptions({ ...modelingOptions, modifiedEntitiesArray: [], isModified: false })
  }

  return (
    <ModelingContext.Provider value={{
      modelingOptions,
      setEntityTypeNamesArray,
      toggleIsModified,
      updateEntityModified,
      removeEntityModified,
      clearEntityModified
    }}>
      {children}
    </ModelingContext.Provider>
  )
}

export default ModelingProvider;
