const { gql } = require('apollo-server');

const typeDefs = gql`
  type EntityModel {
    version: String
    idField: String
    title: String
    description: String
    baseUri: String
    schema: String
    definitions: [EntityDefinition]
    triple: [Triple]
  }

  type Triple {
    subject: String
    predicate: String
    object: String
  }

  type EntityDefinition {
    name: String
    idField: String
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
    type: String
    description: String
    collation: String
    ref: String
    item: Item
  }
  
  type Item {
    name: String
    type: String
    refPath: String
    refParent: String
  }
  
  type Query {
    getAllEntities: [EntityModel],
    getEntityByTitle( title: String): EntityModel,
    getAllEntityDefinitions: [EntityDefinition]
  }
`;

module.exports = typeDefs;