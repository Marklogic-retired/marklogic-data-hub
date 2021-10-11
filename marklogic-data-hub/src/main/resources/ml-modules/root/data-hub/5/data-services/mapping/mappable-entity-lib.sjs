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
  const targetEntityContext = {
    "entityName" :  targetEntityName,
    targetEntityName,
    "entityProperties": expandStructuredProperties(targetEntityModel, targetEntityName)
  };

  entitiesNotToExpand = entitiesNotToExpand.concat(entityModelsReferringToTargetEntity.map(entityModel => entityModel.info.title));
  addRelatedMappableEntities(targetEntityContext, entitiesNotToExpand, {"mappingTitle": targetEntityName, "entityType": targetEntityName}, targetEntityName);

  entityModelsReferringToTargetEntity.forEach(entityModel=>{
    const entityName = entityModel.info.title;
    const entityContext = {
      "entityName" :  entityName,
      targetEntityName,
      "entityProperties": expandStructuredProperties(entityModel, entityName)
    };
    addRelatedMappableEntities(entityContext, entitiesNotToExpand, {"entityType": entityName}, entityName, "");
  });
  return responseArray;
}

function addRelatedMappableEntities(entityContext, entitiesNotToExpand, entityResponseObject, propertyPath, pathSoFar ) {
  const entityName = entityContext.entityName;
  const targetEntityName = entityContext.targetEntityName;
  const entityProperties = entityContext.entityProperties;

  if(!entityResponseObject.entityType){
    entityResponseObject.entityType = entityName;
  }
  addMappableEntityToResponse(entityName, entityProperties, entityResponseObject);
  for (let entityPropertyName in entityProperties) {
    let entityPropertyValue = entityProperties[entityPropertyName];
    if (entityPropertyValue["relatedEntityType"] || (entityPropertyValue.items && entityPropertyValue.items["relatedEntityType"])) {
      let relatedEntityType = entityPropertyValue["relatedEntityType"] ? entityPropertyValue["relatedEntityType"] : entityPropertyValue.items["relatedEntityType"];
      let relatedEntityName = relatedEntityType.substring(relatedEntityType.lastIndexOf('/') + 1);
      let joinPropertyName = null;
      if (entityPropertyValue["joinPropertyName"] != "") {
        joinPropertyName = entityPropertyValue["joinPropertyName"] ? entityPropertyValue["joinPropertyName"] : entityPropertyValue.items["joinPropertyName"]
      }
      if(relatedEntityName==targetEntityName){
        if(joinPropertyName){
          const targetEntityResponse = responseArray.find(response => response.entityType == targetEntityName);
          if(!entityHasMultipleForeignKey(targetEntityResponse, entityName)){
            const entityMappingId =  targetEntityName + "." + joinPropertyName + ":" + entityName;
            const mappingTitle = entityName + " (" + entityPropertyName + " "+ relatedEntityName + ")";
            entityResponseObject.entityMappingId = entityMappingId;
            entityResponseObject.mappingTitle = mappingTitle;
            setRelatedEntityMappings(targetEntityResponse, mappingTitle, entityMappingId);
            pathSoFar = targetEntityName + "." + joinPropertyName;
          }
        }
      }
      else if(!entitiesNotToExpand.includes(relatedEntityName)){
        propertyPath += "." + entityPropertyName;
        pathSoFar = pathSoFar ?  pathSoFar + ":" + propertyPath : propertyPath;
        let relatedEntityResponseObject = createRelatedEntityResponseObject(entityName, relatedEntityName, entityPropertyName, propertyPath, pathSoFar);
        setRelatedEntityMappings(entityResponseObject, entityPropertyName + " " + relatedEntityName, relatedEntityResponseObject.entityMappingId)
        entitiesNotToExpand.push(relatedEntityName)
        let relatedEntityProperties = expandStructuredProperties(getEntityModel(relatedEntityName), relatedEntityName);
        const entityContext = {
          "entityName": relatedEntityName,
          targetEntityName,
          "entityProperties": relatedEntityProperties
        }
        addRelatedMappableEntities(entityContext, entitiesNotToExpand, relatedEntityResponseObject, relatedEntityName, pathSoFar);
        pathSoFar = pathSoFar.lastIndexOf(":") != -1 ? pathSoFar.substring(0, pathSoFar.lastIndexOf(":")) : pathSoFar;
        propertyPath = propertyPath.lastIndexOf(".") != -1 ? propertyPath.substring(0, propertyPath.lastIndexOf(".")) : propertyPath;
        entitiesNotToExpand.pop();
      }
    }
    if (entityPropertyValue["subProperties"]) {
      const entityContext = {
        entityName,
        targetEntityName,
        "entityProperties": entityPropertyValue["subProperties"]
      }
      addRelatedMappableEntities(entityContext, entitiesNotToExpand, entityResponseObject, propertyPath+ "." + entityPropertyName, pathSoFar);
      propertyPath = propertyPath.lastIndexOf(".") != -1 ? propertyPath.substring(0, propertyPath.lastIndexOf(".")) : propertyPath;
    }
  }
}

function entityHasMultipleForeignKey(targetEntityResponse, entityName ){
  let relatedEntityMapping;
  if(targetEntityResponse.relatedEntityMappings){
    relatedEntityMapping = targetEntityResponse.relatedEntityMappings.find(relatedEntityMapping =>{
      relatedEntityMapping.entityMappingId.substring(relatedEntityMapping.entityMappingId.lastIndexOf(":")) == entityName
    });
  }
  return relatedEntityMapping ? true : false;
}

function createRelatedEntityResponseObject(entityName, relatedEntityName, entityPropertyName, propertyPath, pathSoFar){
  let relatedEntityResponseObject ={};
  relatedEntityResponseObject.entityMappingId = pathSoFar + ":"+ relatedEntityName;
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
