import { Definition, Property } from '../types/modeling-types';

export const entityFromJSON = (data: any) => {
  interface EntityModel {
    uri: string,
    info: any,
    definitions: Definitions[]
  }

  interface Definitions {
    name: string,
    pii: [],
    required: [],
    wordLexicon: [],
    properties: []
  }

  let entityArray: EntityModel[] = data.map(item => {
    // TODO check uri and baseUri diff with server
    let entityModel: EntityModel = {
      uri: item['uri'],
      info: item['info'],
      definitions: []
    };

    let definitions = item['definitions'];

    for (let definition in definitions) {

      let entityDefinition: Definitions = {
        name: '',
        pii: [],
        required: [],
        wordLexicon: [],
        properties: []
      };

      let entityProperties: any = [];

      entityDefinition.name = definition;

      for (let entityKeys in item['definitions'][definition]) {
        if (entityKeys === 'properties') {
          for (let properties in item['definitions'][definition][entityKeys]) {
            let property = {
              name: '',
              datatype: '',
              ref: '',
              collation: ''
            };
            property.name = properties;
            property.collation = item['definitions'][definition][entityKeys][properties]['collation'];
            if (item['definitions'][definition][entityKeys][properties]['datatype']) {
              property.datatype = item['definitions'][definition][entityKeys][properties]['datatype'];

              if (item['definitions'][definition][entityKeys][properties]['datatype'] === 'array') {
                if (item['definitions'][definition][entityKeys][properties]['items'].hasOwnProperty('$ref')) {
                  property.ref = item['definitions'][definition][entityKeys][properties]['items']['$ref'].split('/').pop();
                } else {
                  property.ref = '';
                }
              }

            } else if (item['definitions'][definition][entityKeys][properties]['$ref']) {
              property.ref = item['definitions'][definition][entityKeys][properties]['$ref'].split('/').pop();
              property.datatype = 'entity';
            }
            if(item['definitions'][definition][entityKeys][properties]['sortable']){
              property['sortable'] = item['definitions'][definition][entityKeys][properties]['sortable'];
            }
            if(item['definitions'][definition][entityKeys][properties]['facetable']){
              property['facetable'] = item['definitions'][definition][entityKeys][properties]['facetable'];
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
};

export const entityParser = (data: any) => {
  return data.map((entity) => {
    let parsedEntity = {};
    let properties = [];
    let entityDefinition = entity.definitions.find(definition => definition.name === entity.info.title);

    for (var prop in entity.definitions) {
      if (entity.definitions[prop]['name'] === entity.info['title']) {
        properties = entity.definitions[prop]['properties'];
      }
    }

    parsedEntity = {
      name: entityDefinition['name'],
      info: entity.info,
      primaryKey: entityDefinition.hasOwnProperty('primaryKey') ? entityDefinition['primaryKey'] : '',
      properties: properties,
    };
    return parsedEntity;
  });
};

export const facetParser = (facets: any) => {
  let facetArray: any[] = [];
  for (let facet in facets) {
    let parsedFacet = {
      facetName: facet,
      ...facets[facet]
    };
    facetArray.push(parsedFacet);
  }
  return facetArray;
};

export const getKeys = function (obj: Object) {
  let keys = new Array();
  const parser = (obj: Object) => {
    for (let i in obj) {
      if (obj[i].hasOwnProperty('key')) {
        keys.push(obj[i].key);
      }
      if (obj[i].hasOwnProperty('children')) {
        parser(obj[i].children);
      }
    }
    return keys;
  };
  return parser(obj);
};

export const getChildKeys = function (obj: Object) {
  let keys = new Array();
  const parser = (obj: Object) => {
    for (let i in obj) {
      if (obj[i].hasOwnProperty('children')) {
        parser(obj[i].children);
      } else {
        keys.push(obj[i].key);
      }
    }
    return keys;
  };
  return parser(obj);
};

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
        arr.indexOf(obj[i].key) === -1 && arr.push(obj[i].key);
        toArray(obj[i].children);
      } else {
        arr.indexOf(obj[i].key) === -1 && arr.push(obj[i].key);
      }
    }
    return arr;
  };
  return toArray(obj);
};

//Iterates over obj array of objects and removes elements that are not in string array keys.
export const reconstructHeader = (obj1, keys) => {
  let obj = deepCopy(obj1);
  const reconstruct = (obj, keys) => {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] !== null && (obj[i]).hasOwnProperty('children')) {
        let k = obj[i].key;
        if (!keys.includes(k)) {
          let hasParent = getParentKey(k, obj);
          if (!hasParent) {
            let r = reconstruct(obj[i].children, keys);
            if (r.length === 0) {
              obj.splice(Number(i), 1);
              i--;
            }
          } else {
            obj.splice(Number(i), 1);
            i--;
          }
        } else {
          reconstruct(obj[i].children, keys);
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
  };
  return reconstruct(obj, keys);
};


export const deepCopy = inObject => {
  let outObject, value, key;
  if (typeof inObject !== "object" || inObject === null) {
    return inObject; // Return the value if inObject is not an object
  }
  // Create an array or object to hold the values
  outObject = Array.isArray(inObject) ? [] : {};
  for (key in inObject) {
    value = inObject[key];
    // Recursively (deep) copy for nested objects, including arrays
    outObject[key] = (typeof value === "object" && value !== null) ? deepCopy(value) : value;
  }
  return outObject;
};

export const updateHeader = (tree, keys) => {
  let updatedHeader: any[] = [];
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
      if (!updatedHeader.find(obj => obj.key === headerObj.key)) {
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
          if (!parentObj.children.find(child => child.key === childObj.key)) {
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
};

export const setTreeVisibility = (ob, str) => {
  const filter = (ob) => {
    let v;
    for (let i = 0; i < ob.length; i++) {
      if (ob[i] !== null && (ob[i]).hasOwnProperty('children')) {
        let n = filter(ob[i].children);
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
  };
  return filter(ob);
};

export const definitionsParser = (definitions: any): Definition[] => {

  let entityDefinitions: Definition[] = [];

  for (let definition in definitions) {
    let entityDefinition: Definition = {
      name: '',
      properties: []
    };

    let entityProperties: Property[] = [];

    entityDefinition.name = definition;

    for (let entityKeys in definitions[definition]) {
      if (entityKeys === 'properties') {
        for (let properties in definitions[definition][entityKeys]) {
          let property: Property = {
            name: '',
            datatype: '',
            description: '',
            ref: '',
            collation: '',
            multiple: false,
            facetable: false,
            sortable: false
          };
          property.name = properties;
          property.description = definitions[definition][entityKeys][properties]['description'] || '';
          property.collation = definitions[definition][entityKeys][properties]['collation'] || '';
          property.facetable = definitions[definition][entityKeys][properties]['facetable'] || '';
          property.sortable = definitions[definition][entityKeys][properties]['sortable'] || '';

          if (definitions[definition][entityKeys][properties]['datatype']) {
            property.datatype = definitions[definition][entityKeys][properties]['datatype'];

            if (definitions[definition][entityKeys][properties]['datatype'] === 'array') {
              property.multiple = true;

              if (definitions[definition][entityKeys][properties]['items'].hasOwnProperty('$ref')) {
                // Array of Structured/Entity type
                if (definitions[definition][entityKeys][properties]['items']['$ref'].split('/')[1] === 'definitions') {
                  property.datatype = 'structured';
                } else {
                  property.datatype = definitions[definition][entityKeys][properties]['items']['$ref'].split('/').pop();
                }
                property.ref = definitions[definition][entityKeys][properties]['items']['$ref'];
              } else if (definitions[definition][entityKeys][properties]['items'].hasOwnProperty('datatype')) {
                // Array of datatype
                property.datatype = definitions[definition][entityKeys][properties]['items']['datatype'];
                property.collation = definitions[definition][entityKeys][properties]['items']['collation'];
              }
            }
          } else if (definitions[definition][entityKeys][properties]['$ref']) {
            let refSplit = definitions[definition][entityKeys][properties]['$ref'].split('/');
            if (refSplit[1] === 'definitions') {
              // Structured type
              property.datatype = 'structured';
            } else {
              // External Entity type
              property.datatype = refSplit[refSplit.length - 1];
            }

            property.ref = definitions[definition][entityKeys][properties]['$ref'];
          }
          entityProperties.push(property);
        }
      } else {
        entityDefinition[entityKeys] = definitions[definition][entityKeys];
      }
      entityDefinition.properties = entityProperties;
    }
    entityDefinitions.push(entityDefinition);
  }
  return entityDefinitions;
};

export const getTableProperties = (object: Array<Object>) => {
  let labels = new Array();
  const getProperties = (obj) => {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] !== null && (obj[i]).hasOwnProperty('properties')) {
        getProperties(obj[i].properties);
      } else {
          labels.indexOf(obj[i].propertyPath) === -1 && labels.push(obj[i].propertyPath);
      }
    }
    return labels;
  };
  return getProperties(object);
};

export const getSelectedTableProperties = (object: Array<Object>, keys: Array<String>) => {
  let labels = new Array();
  const getProperties = (obj) => {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] !== null && (obj[i]).hasOwnProperty('children')) {
        getProperties(obj[i].children);
      } else {
        labels.indexOf(obj[i].propertyPath) === -1 && keys.includes(obj[i].key) && labels.push(obj[i].propertyPath);
      }
    }
    return labels;
  };
  return getProperties(object);
};

//constructs array of entity parameter name objects with zero dash keys.
export const treeConverter = function (obj: Object) {
  let keys = new Array();
  let deep = 0;
  keys.push(0);
  const parser = (obj: Object, counter) => {
    let parsedTitle = new Array();
    for (let i in obj) {
      if (obj[i].hasOwnProperty('properties')) {
        deep = counter;
        keys.push(deep);
        deep = 0;
        parsedTitle.push({
          title: obj[i].propertyLabel,
          key: keys.join('-'),
          propertyPath: obj[i].propertyPath,
          children: parser(obj[i].properties, deep)
        });
        keys.pop();
        counter++;
      } else {
        parsedTitle.push({
          title: obj[i].propertyLabel,
          key: keys.join('-') + '-' + counter,
          propertyPath: obj[i].propertyPath,
        });
        counter++;
      }
    }
    return parsedTitle;
  };
  return parser(obj, keys);
};

export const getCheckedKeys = (entityPropertyDefinitions: any[], selectedPropertyDefinitions: any[]) => {
  let keys = new Array();
  const parser = (selectedPropertyDefinitions: any[]) => {
    selectedPropertyDefinitions.filter(item => {
      if (item.hasOwnProperty('properties')) {
        parser(item.properties);
      } else {
        let key = findKey(entityPropertyDefinitions, item.propertyPath);
        key && keys.push(key);
      }
    });
    return keys;
  };
  return parser(selectedPropertyDefinitions);
};


const findKey = (entityPropertyDefinitions: any[], propertyPath: string) => {
  let key: string;
  const parser = (entityPropertyDefinitions: any[], propertyPath: string) => {
    entityPropertyDefinitions.filter(item => {
      if (item.propertyPath === propertyPath) {
        key = item.key;
      } else if (item.hasOwnProperty('children')) {
        parser(item.children, propertyPath);
      }
    });
    return key;
  };
  return parser(entityPropertyDefinitions, propertyPath);
};
