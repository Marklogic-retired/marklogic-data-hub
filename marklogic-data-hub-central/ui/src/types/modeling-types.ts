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
  identifier: string,
  multiple: string,
  pii: string,
  facetable: boolean,
  sortable: boolean
  //wildcard: boolean
}

export enum ConfirmationType {
  Identifer = 'identifier',
  DeleteEntity = 'deleteEntity',
  DeleteEntityRelationshipWarn = 'deleteEntityRelationshipWarn',
  DeleteEntityRelationshipOutstandingEditWarn = 'deleteEntityRelationshipOutstandingEditWarn',
  DeleteEntityNoRelationshipOutstandingEditWarn = 'deleteEntityNoRelationshipOutstandingEditWarn',
  DeleteEntityStepWarn = 'deleteEntityStepWarn',
  DeletePropertyWarn = 'deletePropertyWarn',
  DeletePropertyStepWarn = 'deletePropertyStepWarn',
  SaveEntity = 'saveEntity',
  SaveAll = 'saveAllEntity',
  RevertEntity = 'revertEntity',
  RevertAll = 'revertAllEntity',
  NavigationWarn = 'navigationWarn'
}

export enum PropertyType {
  Basic = 'basic',
  Structured = 'structured',
  RelatedEntity = 'relatedEntity'
}

export interface ModelingOptionsInterface {
  entityTypeNamesArray: any[],
  isModified: boolean,
  modifiedEntitiesArray: EntityModified[]
}

export interface EntityModified {
  entityName: string,
  modelDefinition: any
}
