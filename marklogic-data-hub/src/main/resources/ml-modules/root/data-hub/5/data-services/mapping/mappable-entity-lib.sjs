const entityLib = require("/data-hub/5/impl/entity-lib.sjs");
const consts = require("/data-hub/5/impl/consts.sjs");

const modelArray = fn.collection(entityLib.getModelCollection()).toArray().map(entityModel =>{
  return entityModel.toObject();
});
const responseArray = [];

function getEntitiesForUI(targetEntityName){
  let targetEntityModel = getEntityModel(targetEntityName);
  const entityModelsReferringToTargetEntity = findEntityModelsWithPropertyThatRefersToTargetEntity(targetEntityModel, targetEntityName);

  //Used to avoid cyclical dependencies
  let entitiesNotToExpand = [targetEntityName];
  entitiesNotToExpand = entitiesNotToExpand.concat(entityModelsReferringToTargetEntity.map(entityModel => entityModel.info.title));
  addRelatedMappableEntities(targetEntityName, targetEntityName, expandStructuredProperties(targetEntityModel, targetEntityName), entitiesNotToExpand,
    {"mappingTitle": targetEntityName, "entityType": targetEntityName}, targetEntityName);
  entityModelsReferringToTargetEntity.forEach(entityModel=>{
    const entityName = entityModel.info.title;
    addRelatedMappableEntities(entityName, targetEntityName, expandStructuredProperties(entityModel, entityName), entitiesNotToExpand,
      {"entityType": entityName}, entityName);
  });
  return responseArray;
}

function addRelatedMappableEntities(entityName, targetEntityName, entityProperties, entitiesNotToExpand, entityResponseObject , propertyPath ) {
  if(!entityResponseObject.entityType){
    entityResponseObject.entityType = entityName;
  }
  addMappableEntityToResponse(entityName, entityProperties, entityResponseObject);
  for (let entityPropertyName in entityProperties) {
    let entityPropertyValue = entityProperties[entityPropertyName];
    if (entityPropertyValue["relatedEntityType"] || (entityPropertyValue.items && entityPropertyValue.items["relatedEntityType"])) {
      let relatedEntityType = entityPropertyValue["relatedEntityType"] ? entityPropertyValue["relatedEntityType"] : entityPropertyValue.items["relatedEntityType"];
      let relatedEntityName = relatedEntityType.substring(relatedEntityType.lastIndexOf('/') + 1);
      let joinPropertyName = entityPropertyValue["joinPropertyName"] ? entityPropertyValue["joinPropertyName"] : entityPropertyValue.items["joinPropertyName"]
      if(relatedEntityName==targetEntityName){
        const entityMappingId = entityName + ":" + targetEntityName + "." + joinPropertyName;
        const mappingTitle = entityName + " (" + entityPropertyName + " "+ relatedEntityName + ")";
        entityResponseObject.entityMappingId = entityMappingId;
        entityResponseObject.mappingTitle = mappingTitle;
        setRelatedEntityMappings(responseArray.find(response => response.entityType == targetEntityName), mappingTitle, entityMappingId);
      }
      else if(!entitiesNotToExpand.includes(relatedEntityName)){
        propertyPath += "." + entityPropertyName;
        let relatedEntityResponseObject = createRelatedEntityResponseObject(entityName, relatedEntityName, entityPropertyName, propertyPath);
        setRelatedEntityMappings(entityResponseObject, entityPropertyName + " " + relatedEntityName, relatedEntityResponseObject.entityMappingId)
        entitiesNotToExpand.push(relatedEntityName)
        let relatedEntityProperties = expandStructuredProperties(getEntityModel(relatedEntityName), relatedEntityName);
        addRelatedMappableEntities(relatedEntityName, targetEntityName, relatedEntityProperties , entitiesNotToExpand ,  relatedEntityResponseObject, relatedEntityName);
        entitiesNotToExpand.pop();
      }
    }
    if (entityPropertyValue["subProperties"]) {
      addRelatedMappableEntities(entityName, targetEntityName, entityPropertyValue["subProperties"], entitiesNotToExpand, entityResponseObject, propertyPath+ "." + entityPropertyName);
      propertyPath = propertyPath.lastIndexOf(".") != -1 ? propertyPath.substring(0, propertyPath.lastIndexOf(".")) : propertyPath;
    }
  }
}

function createRelatedEntityResponseObject(entityName, relatedEntityName, entityPropertyName, propertyPath){
  let relatedEntityResponseObject ={};
  relatedEntityResponseObject.entityMappingId = relatedEntityName + ":" + propertyPath;
  relatedEntityResponseObject.entityType = relatedEntityName;
  relatedEntityResponseObject.mappingTitle = relatedEntityName + " (" + entityName + " " +entityPropertyName + ")";
  return relatedEntityResponseObject;
}

function setRelatedEntityMappings(responseObject, mappingLinkText, entityMappingId){
  if(responseObject){
    if(!responseObject.relatedEntityMappings){
      responseObject.relatedEntityMappings = [];
    }
    responseObject.relatedEntityMappings.push({"mappingLinkText": mappingLinkText, "entityMappingId": entityMappingId})
  }
}

//'entityProperties' have their structured properties expanded by 'expandStructuredProperties' function
function addMappableEntityToResponse(entityName, entityProperties, entityResponseObject){
  const entityModel = getEntityModel(entityName);
  let expandedEntityModel = Object.assign({}, entityModel);
  if(!entityResponseObject.entityModel){
    expandedEntityModel.definitions = {};
    expandedEntityModel.definitions[entityName] = {};
    expandedEntityModel.definitions[entityName].properties = entityProperties;
    entityResponseObject.entityModel =  expandedEntityModel;
    responseArray.push(entityResponseObject);
  }
}

function getEntityModel(entityName){
  return modelArray.find(model => model.info.title == entityName);
}

function expandStructuredProperties(entityModel, entityName) {
  let entityProperties = entityModel.definitions[entityName].properties;

  for(let entityPropertyName in entityProperties){
    let entityPropertyValue = entityProperties[entityPropertyName];
    if(entityPropertyValue["$ref"] || (entityPropertyValue["items"] && entityPropertyValue["items"]["$ref"])){
      let ref = entityPropertyValue["$ref"] ? entityPropertyValue["$ref"] : entityPropertyValue["items"]["$ref"];
      if(ref.startsWith("#/")){
        let subEntityName = ref.substring(ref.lastIndexOf('/') + 1);
        entityPropertyValue["subProperties"] = expandStructuredProperties(entityModel, subEntityName);
      }
      else{
        //Remove external references as they shouldn't show up in mapping
        delete entityProperties[entityPropertyName];
      }
    }
    else{
      entityProperties[entityPropertyName] = entityPropertyValue;
    }
  }
  return entityProperties;
}


function findEntityModelsWithPropertyThatRefersToTargetEntity(targetEntityModel, targetEntityName){
  const entityTypeId = entityLib.getEntityTypeId(targetEntityModel, targetEntityName);
  const entityModelsWithPropertyThatRefersToTargetEntity = cts.search(cts.andQuery([cts.collectionQuery(consts.ENTITY_MODEL_COLLECTION),
    cts.jsonPropertyValueQuery("relatedEntityType", entityTypeId, "case-insensitive")])).toArray().map(entityModel =>{
    return entityModel.toObject();
  });
  return entityModelsWithPropertyThatRefersToTargetEntity;
}

module.exports = {
  getEntitiesForUI,
  findEntityModelsWithPropertyThatRefersToTargetEntity,
  expandStructuredProperties
};
