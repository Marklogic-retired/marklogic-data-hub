const { gql } = require('apollo-server');

const typeDefs = gql`
  type EntityModel {
    version: String
    title: String
    description: String
    baseUri: String
    entityDefinitions: [EntityDefinition]
    triple: [Triple]
  }
  
  type EntityDefinition {
    name: String
    description: String
    primaryKey: String
    required: [String]
    rangeIndex: [String]
    pathRangeIndex: [String]
    elementRangeIndex: [String]
    wordLexicon: [String]
    namespace: String
    namespacePrefix: String
    properties: [Property]
  }

  type Property {
    name: String
    datatype: String
    description: String
    collation: String
    refItem: RefItem
  }
  
  type RefItem {
    itemType: String
    refPath: String
    collation: String
  }
  
  type Triple {
    subject: String
    predicate: String
    object: String
  }

  type EntityRightNow {
    version: String
    title: String
    baseUri: String
    schema: String
    language: String
    properties: RightNowProperty
    entityDefinitions: [EntityDefinitionRightNow]
  }

  type RightNowProperty {
    name: String
    ref: String
  }
  type EntityDefinitionRightNow {
    name: String
    primaryKey: String
    pii: [String]
    required: [String]
    rangeIndex: [String]
    elementRangeIndex: [String]
    wordLexicon: [String]
    properties: [PropertyRightNow]
  }

  type PropertyRightNow {
    name: String
    type: String
    collation: String
    refItem: RefItemRightNow
  }

  type RefItemRightNow {
    name: String
    type: String
    refPath: String
  }
  
  type Query {
    getAllEntities: [EntityModel],
    getEntityByTitle( title: String): EntityModel,
    getAllEntityDefinitions: [EntityDefinition],
    getRightNowEntity: EntityRightNow,
  }
`;

module.exports = typeDefs;