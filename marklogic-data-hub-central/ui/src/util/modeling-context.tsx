import React, { useState } from 'react';
import {
  ModelingOptionsInterface,
  ModelingContextInterface,
  EntityModified
} from '../types/modeling-types';

const DEFAULT_MODELING_OPTIONS = {
  entityTypeNamesArray: [],
  isModified: false,
  modifiedEntitiesArray: [],
  entityPropertiesNamesArray: []
};

export const ModelingContext = React.createContext<ModelingContextInterface>({
  modelingOptions: DEFAULT_MODELING_OPTIONS,
  setEntityTypeNamesArray: () => {},
  toggleIsModified: () => {},
  updateEntityModified: () => {},
  removeEntityModified: () => {},
  clearEntityModified: () => {},
  setEntityPropertiesNamesArray: () => {}
});

const ModelingProvider: React.FC<{ children: any }> = ({ children }) => {

  const [modelingOptions, setModelingOptions] = useState<ModelingOptionsInterface>(DEFAULT_MODELING_OPTIONS);

  const setEntityTypeNamesArray = (entityTypeNamesArray: any[]) => {
    setModelingOptions({ ...modelingOptions, entityTypeNamesArray });
  };

  const toggleIsModified = (isModified: boolean) => {
    setModelingOptions({ ...modelingOptions, isModified });
  };

  const updateEntityModified = (entityModified: EntityModified) => {
    let newModifiedEntitiesArray = [...modelingOptions.modifiedEntitiesArray];
    if (newModifiedEntitiesArray.some(entity => entity.entityName === entityModified.entityName)) {
      let index = newModifiedEntitiesArray.map((entity) => { return entity.entityName; }).indexOf(entityModified.entityName);
      newModifiedEntitiesArray[index] = entityModified;
    } else {
      newModifiedEntitiesArray.push(entityModified);
    }
    setModelingOptions({ ...modelingOptions, modifiedEntitiesArray: newModifiedEntitiesArray, isModified: true });
  };

  const removeEntityModified = (entityModified: EntityModified) => {
    let newModifiedEntitiesArray = [...modelingOptions.modifiedEntitiesArray];
    if (newModifiedEntitiesArray.some(entity => entity.entityName === entityModified.entityName)) {
      let index = newModifiedEntitiesArray.map((entity) => { return entity.entityName; }).indexOf(entityModified.entityName);
      newModifiedEntitiesArray.splice(index, 1);
      setModelingOptions({ ...modelingOptions, modifiedEntitiesArray: newModifiedEntitiesArray, isModified: newModifiedEntitiesArray.length > 0 });
    }
  };

  const clearEntityModified = () => {
    setModelingOptions({ ...modelingOptions, modifiedEntitiesArray: [], isModified: false });
  };

  const setEntityPropertiesNamesArray = (entityDefinitionsArray: any[]) => {
    let entityPropertiesNamesArray: string[] = [];

    entityDefinitionsArray.forEach( entity => {
      entityPropertiesNamesArray.push(entity.name);
      entity.properties.forEach( property => {
        entityPropertiesNamesArray.push(property.name);
      });
    });

    setModelingOptions({ ...modelingOptions, entityPropertiesNamesArray });
  };

  return (
    <ModelingContext.Provider value={{
      modelingOptions,
      setEntityTypeNamesArray,
      toggleIsModified,
      updateEntityModified,
      removeEntityModified,
      clearEntityModified,
      setEntityPropertiesNamesArray
    }}>
      {children}
    </ModelingContext.Provider>
  );
};

export default ModelingProvider;
