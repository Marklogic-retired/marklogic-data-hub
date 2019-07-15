const { convertJSON, convertRightNowJSON, convertPureJSON } = require('../util/data-conversion');
const raceData = require('../sample-data/race-data.json');
const pureJSONData = require('../sample-data/pure-json-data.json');
const rightNowData = require('../sample-data/right-now-data.json');

const entities = [];
entities.push(convertJSON(raceData));

convertPureJSON(pureJSONData);

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
    },
    getRightNowEntity() {
      return convertRightNowJSON(rightNowData);
    }
  }
}

module.exports = resolvers;
