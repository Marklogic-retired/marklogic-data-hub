export const entityFromJSON = (data: any) => {
  interface EntityModel {
    uri: string,
    info: any
    definitions: Definitions[]
  }

  interface Definitions {
    name: string,
    elementRangeIndex: [],
    pii: [],
    rangeIndex: [],
    required: [],
    wordLexicon: [],
    properties: Property[]
  }

  interface Property {
    name: string,
    datatype: string,
    collation: string
  }

  let entityArray: EntityModel[] = [];

  for (let item of data) {

    let entityModel: EntityModel = {
      uri: item['uri'],
      info: item['docs']['info'],
      definitions: []
    }

    let definitions = item['docs']['definitions'];

    for ( let definition in definitions ) {

      let entityDefinition: Definitions = {
        name: '',
        elementRangeIndex: [],
        pii: [],
        rangeIndex: [],
        required: [],
        wordLexicon: [],
        properties: []
      };

      let entityProperties: Property[] = [];

      entityDefinition.name = definition;

      for (let entityKeys in item['docs']['definitions'][definition]) {
        if (entityKeys === 'properties') {
          for (let properties in item['docs']['definitions'][definition][entityKeys]) {
            let property: Property = {
              name: '',
              datatype: '',
              collation: ''
            }
            property.name = properties;
            property.collation = item['docs']['definitions'][definition][entityKeys][properties]['collation'];
            property.datatype = item['docs']['definitions'][definition][entityKeys][properties]['datatype'];
            entityProperties.push(property);
          }
        } else {
          entityDefinition[entityKeys] = item['docs']['definitions'][definition][entityKeys];
        }
        entityDefinition.properties = entityProperties;
      }
      entityModel.definitions.push(entityDefinition);
    }
    entityArray.push(entityModel);
  }
  return entityArray;
}