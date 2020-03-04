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
    ref: string,
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
              ref: '',
              collation: ''
            }
            property.name = properties;
            property.collation = item['definitions'][definition][entityKeys][properties]['collation'];
            if (item['definitions'][definition][entityKeys][properties]['datatype']) {
              property.datatype = item['definitions'][definition][entityKeys][properties]['datatype'];
              item['definitions'][definition][entityKeys][properties]['datatype'] === 'array' ? property.ref = item['definitions'][definition][entityKeys][properties]['items']['$ref'].split('/').pop() : property.ref = '';
            } else if (item['definitions'][definition][entityKeys][properties]['$ref']) {
              property.ref = item['definitions'][definition][entityKeys][properties]['$ref'].split('/').pop();
              property.datatype = 'entity';
            }
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
      let rangeIndex = [];
      let pathIndexMap = new Map();
      let pathEntityIndexMap = new Map();
      let nestedEntityDefinition;
      let parsedEntity = {};
      let properties = [];
      let entityDefinition = entity.definitions.find(definition => definition.name === entity.info.title);
      let values = {}
      let pathIndexArray = new Array();

      let propArray = entityDefinition['properties'].map(p => p.name);
      let propRefArray = entityDefinition['properties'].filter(p => p.ref.length > 0);

      for (var prop in entity.definitions) {
        let path = entity.info['baseUri'] + entity.info['title'] + '-' + entity.info['version'] + '/' + entityDefinition.name;
        // let entityPath = entityDefinition.name;

        nestedEntityDefinition = entity.definitions[prop];
        if (nestedEntityDefinition) {
            let rangeIndexWithDup = [];
            rangeIndexWithDup = rangeIndexWithDup.concat(nestedEntityDefinition['elementRangeIndex']).concat(nestedEntityDefinition['rangeIndex']);
            for (let key of rangeIndexWithDup) {
                if (rangeIndex.indexOf(key) === -1) {
                    rangeIndex.push(key);
                }
            }
        }

        if (entity.definitions[prop]['name'] === entity.info['title']) {
          properties = entity.definitions[prop]['properties'];
        }

        for (let index of nestedEntityDefinition['elementRangeIndex']) {
          if (propArray.includes(index)) {
            pathIndexMap.set(index, index);
            pathEntityIndexMap.set(index, index);
          } else if (propRefArray.length > 0) {  //has nested ref
            let pArr = new Array();
            pathIndexMap.set(index, getRefPath(entity.info.title, index, data, pArr).join(''));
            pathEntityIndexMap.set(index, getEntityPath(entity.info.title, index, data, pArr).join(''));
          }
          values = {
            index: index,
            referenceType: 'element',
            entityTypeId: '',
            propertyPath: pathIndexMap.get(index),
            entityPath: pathEntityIndexMap.get(index)
          }
          pathIndexArray.push(values);

          if (!pathIndexArray.some(e => e.index === index)) {
            pathIndexArray.push(values)
          }
        }

        for (let rIndex of nestedEntityDefinition['rangeIndex']) {
          if (propArray.includes(rIndex)) {
            pathIndexMap.set(rIndex, rIndex);
            pathEntityIndexMap.set(rIndex, rIndex);
          } else if (propRefArray.length > 0) {  //has nested ref
            let pArr = new Array();
            pathIndexMap.set(rIndex, getRefPath(entity.info.title, rIndex, data, pArr).join(''));
            pathEntityIndexMap.set(rIndex, getEntityPath(entity.info.title, rIndex, data, pArr).join(''));
          }
          values = {
            index: rIndex,
            referenceType: 'path',
            entityTypeId : path,
            propertyPath : pathIndexMap.get(rIndex),
            entityPath: pathEntityIndexMap.get(rIndex)
          }
          if (!pathIndexArray.some(e => e.index === rIndex)) {
            pathIndexArray.push(values)
          }
        }
      }

      parsedEntity = {
        name: entityDefinition['name'],
        info: entity.info,
        primaryKey: entityDefinition.hasOwnProperty('primaryKey') ? entityDefinition['primaryKey'] : '',
        rangeIndex: rangeIndex.length ? rangeIndex : [],
        properties: properties,
        pathIndex: pathIndexArray
      }
      return parsedEntity;
    });
  }


const getRefPath = (entity, index, data, path) => {

  let fullPath;

  const getPath = (entity, index, data, path) => {
    data.forEach(item => {
      if (item.info.title === entity) {
        let entityDefinition = item.definitions.find(definition => definition.name === entity);
        entityDefinition.properties.forEach(element => {
          let elementPath = [...path];
          if (element.ref.length > 0) {
            elementPath.push(element.name);
            getPath(element.ref, index, data, elementPath)
          }
          if (element.name === index) {
            elementPath.push('/');
            elementPath.push(element.name)
            fullPath = elementPath;
            return fullPath;
          }
        });
      }
    });

    return fullPath;
  }

  return getPath(entity, index, data, path);
}

const getEntityPath = (entity, index, data, path) => {

  let fullPath;

  const getPath = (entity, index, data, path) => {
    data.forEach(item => {
      if (item.info.title === entity) {
        let entityDefinition = item.definitions.find(definition => definition.name === entity);
        entityDefinition.properties.forEach(element => {
          let elementPath = [...path];

          if (element.ref.length > 0) {
            elementPath.push(element.ref)
            elementPath.push('.');
            getPath(element.ref, index, data, elementPath)
          }

          if (element.name === index) {
            // elementPath.push('/');
            elementPath.push(element.name)
            fullPath = elementPath;
            return fullPath;
          }
        });
      }
    });

    return fullPath;
  }

  return getPath(entity, index, data, path);
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
        if (item.extracted.content.length <= 1) {
          // content data does not exist in payload
          return null;
        }
        createdOn = item.extracted.content[0].headers.createdOn;
        if (item.extracted.hasOwnProperty('content') && item.extracted.content[1]) {
          itemEntityName = Object.keys(item.extracted.content[1]);
          itemEntityProperties = Object.values<any>(item.extracted.content[1]);
        };
      };

      if (item.format === 'xml' && item.hasOwnProperty('extracted')) {
        if (item.extracted.content.length <= 1) {
          // content data does not exist in payload
          return null;
        }
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
    entityTitle: entityTitle,
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

//constructs array of entity parameter name objects with zero dash keys.
export const headerPropsParser = function (entities, entity) {
  let keys = new Array();
  let deep = 0;
  keys.push(0);
  let obj = entities.find(e => e.name === entity[0])
  const parser = (entityObj, c) => {
    let data = new Array();
    entityObj && entityObj.properties.forEach(p => {
      if (p.datatype === 'array' && p.ref.length > 0) {
        keys.push(c);
        data.push({
          title: p.name,
          key: keys.join('-'),
          children: parser(entities.find(e => e.name === p.ref), deep)
        })
        keys.splice(-1)
      } else if (p.datatype === 'entity' && p.ref.length > 0) {
        keys.push(c);
        data.push({
          title: p.name,
          key: keys.join('-'),
          children: parser(entities.find(e => e.name === p.ref), deep)
        })
        keys.pop();
      } else {
        data.push({
          title: p.name,
          key: keys.join('-') + '-' + c
        })
      }
      c++;
    });
    return data;
  }
  return parser(obj, 0)
}

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

export const getChildKeys = function (obj: Object) {
  let keys = new Array();
  const parser = (obj: Object) => {
    for (let i in obj) {
      if (obj[i].hasOwnProperty('children')) {
        parser(obj[i].children)
      } else {
        keys.push(obj[i].key)
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
          let hasParent = getParentKey(k, obj);
          if (!hasParent) {
            let r = reconstruct(obj[i].children, keys)
            if (r.length === 0) {
              obj.splice(Number(i), 1);
              i--;
            }
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

export const updateHeader = (tree, keys) => {
  let updatedHeader: any[] = []
  let newtree: any[] = deepCopy(tree);
  keys.forEach((key, index) => {
    let headerObj = newtree.find(obj => obj.key === key);
    if (headerObj) {
      if (headerObj.hasOwnProperty('children')) {
        if (Array.isArray(headerObj.children)) {
          // remove children and add children back if key is found
          headerObj.children = [];
        } else if (typeof headerObj.children === 'object') {
          headerObj.children = {};
        }
      }
      if (updatedHeader.find(obj => obj.key === headerObj.key)) {

      } else {
        updatedHeader.push(headerObj);
      }

    } else {
      // could not find column. must be child key
      // TODO: keep parsing key until a parentObj is found?
      let parseKey = key.split('-');
      parseKey.pop();
      let parentKey = parseKey.join('-');

      let parentObj = updatedHeader.find(obj => obj.key === parentKey);
      let updateParentIndex = updatedHeader.findIndex(obj => obj.key === parentKey);
      if (parentObj !== undefined && parentObj.hasOwnProperty('children')) {
        // update parentObj's children by pushing new child obj
        // check if childobj is already in parent obj

        // adding child obj to update header
        let index = tree.findIndex(obj => obj.key === parentKey);
        let childObj = tree[index].hasOwnProperty('children') && tree[index].children.find(childObj => childObj.key === key);
        if (childObj) {
          if (parentObj.children.find(child => child.key === childObj.key)) {

          } else {
            parentObj.children.push(childObj);
            updatedHeader[updateParentIndex] = parentObj;
          }
        }
      } else {
        // no parent object in updated header
        // add parent object and child to updatedHeader
        parentObj = newtree.find(obj => obj.key === parentKey);
        if (parentObj && parentObj.hasOwnProperty('children')) {
          let childObj = parentObj.children.find(childObj => childObj.key === key);
          if (childObj) {
            //console.log('find child', parentObj.children.find( child => child.key === childObj.key))
            parentObj.children = [childObj];
            updatedHeader.push(parentObj);
          }
        }
      }
    }
  });
  return updatedHeader;
}

export const getTitles = (object: Array<Object>) => {
  let arr = new Array();
  const titles = (obj) => {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] !== null && (obj[i]).hasOwnProperty('children')) {
        arr.indexOf(obj[i].title) === -1 && arr.push(obj[i].title)
        titles(obj[i].children)
      } else {
        arr.indexOf(obj[i].title) === -1 && arr.push(obj[i].title)
      }
    }
    return arr;
  }
  return titles(object);
}

export const setTreeVisibility = (ob, str) => {
  const filter = (ob) => {
    let v;
    for (let i = 0; i < ob.length; i++) {
      if (ob[i] !== null && (ob[i]).hasOwnProperty('children')) {
        let n = filter(ob[i].children)
        if (n.v === false || n.v === undefined) {
          ob[i].visible = false;
        } else if (n.v === true) {
          v = true;
        }
        if (ob[i].title.toLowerCase().includes(str.toLowerCase())) {
          ob[i].visible = true;
          v = true;
        }
      } else {
        if (!ob[i].title.toLowerCase().includes(str.toLowerCase())) {
          ob[i].visible = false;
        } else {
          v = true;
          ob[i].visible = true;
        }
      }
    }
    return { ob, v };
  }
  return filter(ob);
}
