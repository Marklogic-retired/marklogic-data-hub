import { xmlParser } from './../util/xml-parser';

export const entityFromJSON = (data: any) => {
  interface EntityModel {
    uri: string,
    info: any,
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

  let entityArray: EntityModel[] = data.map(item => {
    // TODO check uri and baseUri diff with server
    let entityModel: EntityModel = {
      uri: item['uri'],
      info: item['info'],
      definitions: []
    }

    let definitions = item['definitions'];

    for (let definition in definitions) {

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

      for (let entityKeys in item['definitions'][definition]) {
        if (entityKeys === 'properties') {
          for (let properties in item['definitions'][definition][entityKeys]) {
            let property: Property = {
              name: '',
              datatype: '',
              collation: ''
            }
            property.name = properties;
            property.collation = item['definitions'][definition][entityKeys][properties]['collation'];
            property.datatype = item['definitions'][definition][entityKeys][properties]['datatype'];
            entityProperties.push(property);
          }
        } else {
          entityDefinition[entityKeys] = item['definitions'][definition][entityKeys];
        }
        entityDefinition.properties = entityProperties;
      }
      entityModel.definitions.push(entityDefinition);
    }
    return entityModel;
  });
  return entityArray;
}

export const entityParser = (data: any) => {
  return data.map((entity, index) => {
    const entityDefinition = entity.definitions.find(definition => definition.name === entity.info.title);
    let parsedEntity = {}
    if (entityDefinition) {
      const rangeIndex = entityDefinition['elementRangeIndex'].concat(entityDefinition['rangeIndex'])
      parsedEntity = {
        name: entityDefinition['name'],
        primaryKey: entityDefinition.hasOwnProperty('primaryKey') ? entityDefinition['primaryKey'] : '',
        rangeIndex: rangeIndex.length ? rangeIndex : []
      }
    }
    return parsedEntity
  });
}

export const facetParser = (facets: any) => {
  let facetArray: any[] = [];
  for (let facet in facets) {
    let parsedFacet = {
      facetName: facet,
      ...facets[facet]
    }
    facetArray.push(parsedFacet);
  }
  return facetArray;
}

export const tableParser = (props) => {
  let createdOn = '';
  let itemEntityName: string[] = [];
  let itemEntityProperties: any[] = [];
  let entityDef: any = {};
  let primaryKeyValue: string = '';
  let primaryKeys: string[] = [];
  let entityTitle: string[] = [];
  let consdata = new Array();

  props.data && props.data.forEach(item => {
    if (item.hasOwnProperty('extracted')) {
      if (item.format === 'json' && item.hasOwnProperty('extracted')) {
        createdOn = item.extracted.content[0].headers.createdOn;
        if (item.extracted.hasOwnProperty('content') && item.extracted.content[1]) {
          itemEntityName = Object.keys(item.extracted.content[1]);
          itemEntityProperties = Object.values<any>(item.extracted.content[1]);
        };
      };

      if (item.format === 'xml' && item.hasOwnProperty('extracted')) {
        let header = xmlParser(item.extracted.content[0]);
        let entity = xmlParser(item.extracted.content[1]);
        if (header && header.hasOwnProperty('headers')) {
          createdOn = header.headers.createdOn;
        }

        if (header && entity) {
          itemEntityName = Object.keys(entity);
          itemEntityProperties = Object.values<any>(entity);
        };
      }

      // Parameters for both JSON and XML.
      //Get entity definition.
      if (itemEntityName.length && props.entityDefArray.length) {
        entityDef = props.entityDefArray.find(entity => entity.name === itemEntityName[0]);
      }

      //Get primary key if exists or set it to undefined.
      if (entityDef.primaryKey.length !== 0) {
        primaryKeyValue = encodeURIComponent(itemEntityProperties[0][entityDef.primaryKey]);
        primaryKeys.indexOf(entityDef.primaryKey) === -1 && primaryKeys.push(entityDef.primaryKey);
      } else {
        primaryKeyValue = 'uri';
      }

      if (entityTitle.length === 0) {
        primaryKeyValue === 'uri' ? entityTitle.push('Identifier') : entityTitle.push(entityDef.primaryKey);
      }

      consdata.push({
        primaryKey: primaryKeyValue, itemEntityName: itemEntityName[0], itemEntityProperties: itemEntityProperties,
        uri: item.uri, format: item.format, createdOn: createdOn
      })
    }

  });

  return {
    data: consdata,
    primaryKeys: primaryKeys,
    entityTitle: entityTitle
  }
}

//constructs array of entity parameter name objects with zero dash keys.
export const headerParser = function (obj: Object) {
  let keys = new Array();
  let deep = 0;
  keys.push(0);
  const parser = (obj: Object, counter) => {
    let parsedTitle = new Array();
    for (let i in obj) {
      if (obj[i] !== null && typeof (obj[i]) === 'object') {
        deep = counter;
        keys.push(deep);
        deep = 0;
        if (obj[i].length > 1) {
          parsedTitle.push({
            title: i,
            key: keys.join('-'),
            children: parser(obj[i][0], deep)
          })
        } else {
          parsedTitle.push({
            title: i,
            key: keys.join('-'),
            children: parser(obj[i], deep)
          })
        }
        keys.pop();
        counter++;
      } else {
        parsedTitle.push({
          title: i,
          key: keys.join('-') + '-' + counter
        });
        counter++;
      }
    }
    return parsedTitle;
  }
  return parser(obj, keys)
};

export const getKeys = function (obj: Object) {
  let keys = new Array();
  const parser = (obj: Object) => {
    for (let i in obj) {
      if (obj[i].hasOwnProperty('key')) {
        keys.push(obj[i].key)
      }
      if (obj[i].hasOwnProperty('children')) {
        parser(obj[i].children)
      }
    }
    return keys;
  }
  return parser(obj)
}

export const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

export function getObject(object, k) {
  if (object.hasOwnProperty('key') && object["key"] == k)
    return object;

  for (var i = 0; i < Object.keys(object).length; i++) {
    if (typeof object[Object.keys(object)[i]] == "object") {
      var o = getObject(object[Object.keys(object)[i]], k);
      if (o != null)
        return o;
    }
  }
  return null;
}

export const toStringArray = (obj) => {
  let arr = new Array();
  const toArray = (obj) => {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] !== null && (obj[i]).hasOwnProperty('children')) {
        arr.indexOf(obj[i].key) === -1 && arr.push(obj[i].key)
        toArray(obj[i].children)
      } else {
        arr.indexOf(obj[i].key) === -1 && arr.push(obj[i].key)
      }
    }
    return arr;
  }
  return toArray(obj);
}

//Iterates over obj array of objects and removes elements that are not in string array keys.
export const reconstructHeader = (obj1, keys) => {
  let obj = deepCopy(obj1)
  const reconstruct = (obj, keys) => {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] !== null && (obj[i]).hasOwnProperty('children')) {
        let k = obj[i].key;
        if (!keys.includes(k)) {
          let hasParent;
          for (let i in keys) {
            let pk = getParentKey(keys[i], obj)
            if (pk) {
              hasParent = true;
            }
          }
          if (hasParent) {
            reconstruct(obj[i].children, keys)
          } else {
            obj.splice(Number(i), 1);
            i--;
          }
        } else {
          reconstruct(obj[i].children, keys)
        }
      } else {
        let k = obj[i].key;
        if (!keys.includes(k)) {
          obj.splice(Number(i), 1);
          i--;
        }
      }
    }
    return obj;
  }
  return reconstruct(obj, keys)
}

export const deepCopy = inObject => {
  let outObject, value, key
  if (typeof inObject !== "object" || inObject === null) {
    return inObject // Return the value if inObject is not an object
  }
  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {}
  for (key in inObject) {
    value = inObject[key]
    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = (typeof value === "object" && value !== null) ? deepCopy(value) : value
  }
  return outObject
}


