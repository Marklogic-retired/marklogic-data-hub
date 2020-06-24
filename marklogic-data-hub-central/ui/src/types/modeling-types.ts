export interface Definition {
  name: string,
  primaryKey: string,
  elementRangeIndex: string[],
  pii: string[],
  rangeIndex: string[],
  required: string[],
  wordLexicon: string[],
  properties: Property[]
}

export interface Property {
  name: string,
  description: string,
  datatype: string,
  ref: string,
  collation: string,
  multiple: boolean
}

export interface EntityDefinitionPayload {
  [entityName: string]: {
    primaryKey: string,
    elementRangeIndex: string[],
    pii: string[],
    rangeIndex: string[],
    required: string[],
    wordLexicon: string[],
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
  sort: boolean,
  facet: boolean,
  wildcard: boolean
}

export enum ConfirmationType {
  Identifer = 'identifier'
}

export enum PropertyType {
  Basic = 'basic',
  Structured = 'structured',
  Relationship = 'relationship'
}
