export interface ModelingContextInterface {
  modelingOptions: ModelingOptionsInterface;
  setEntityTypeNamesArray: (entityTypeNamesArray: any[], isModified: boolean) => void;
  toggleIsModified: (isModified: boolean) => void;
  updateEntityModified: (entityModified: EntityModified) => void;
  removeEntityModified: (entityModified: EntityModified) => void;
  clearEntityModified: () => void;
  setEntityPropertiesNamesArray: (entityDefinitionsArray: any[]) => void;
  setView: (view: string) => void;
  setSelectedEntity: (entityName: string | undefined) => void;
  setGraphViewOptions: (graphViewOptions: graphViewOptions) => void;
  closeSidePanelInGraphView: () => void;
}

export interface ModelingOptionsInterface {
  entityTypeNamesArray: any[],
  isModified: boolean,
  modifiedEntitiesArray:  any[],
  entityPropertiesNamesArray: string[],
  view: string,
  selectedEntity?: string | undefined,
  openSidePanelInGraphView: boolean
}
export interface Definition {
  name: string,
  primaryKey?: string,
  pii?: string[],
  required?: string[],
  wordLexicon?: string[],
  properties: Property[]
}

export interface Property {
  name: string,
  description: string,
  datatype: string,
  ref: string,
  relatedEntityType: string,
  joinPropertyName: string,
  joinPropertyType: string,
  collation: string,
  multiple: boolean,
  facetable: boolean,
  sortable: boolean
}

export interface EntityDefinitionPayload {
  [entityName: string]: {
    primaryKey?: string,
    pii?: string[],
    required?: string[],
    wordLexicon?: string[],
    properties: any
  }
}

export interface StructuredTypeOptions {
  name: string,
  propertyName: string,
  isStructured: boolean
}

export interface EditPropertyOptions {
  name: string,
  isEdit: boolean,
  propertyOptions: PropertyOptions
}

export interface PropertyOptions {
  propertyType: PropertyType,
  type: string,
  joinPropertyName: string,
  joinPropertyType: string,
  identifier: string,
  multiple: string,
  pii: string,
  facetable: boolean,
  sortable: boolean
  //wildcard: boolean
}

export enum PropertyType {
  Basic = "basic",
  Structured = "structured",
  RelatedEntity = "relatedEntity"
}

export interface EntityModified {
  entityName: string,
  modelDefinition: any,
  hubCentral?: any
}

export interface graphViewOptions {
  view: string,
  selectedEntity: string
}
