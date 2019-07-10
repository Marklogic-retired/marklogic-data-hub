const { convertJSON, convertJSONSchema } = require('../util/data-conversion');
const raceData = require('../sample-data/race-data.json');
const testData = require('../sample-data/test-data.json');

const entities = [];
entities.push(convertJSON(raceData));
// convertJSONSchema(testData);

const resolvers = {
  Query: {
    getAllEntities() {
      return entities;
    },
    getEntityByTitle(root, { title }) {
      const entity = entities.filter( item => {
        return item.title === title;
      })
      return entity[0];
    },
    getAllEntityDefinitions() {
      let entityDefsArray = [];
      entities.map( entity => {
        entityDefsArray.push(...entity.entityDefinitions);
      });
      return entityDefsArray;
    }
  }
}

module.exports = resolvers;
