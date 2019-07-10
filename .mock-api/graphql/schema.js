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
  
  type Query {
    getAllEntities: [EntityModel],
    getEntityByTitle( title: String): EntityModel,
    getAllEntityDefinitions: [EntityDefinition]
  }
`;

module.exports = typeDefs;