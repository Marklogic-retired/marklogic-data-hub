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
  isStructured: boolean
}

export enum ConfirmationType {
  identifer = 'IDENTIFIER'
}