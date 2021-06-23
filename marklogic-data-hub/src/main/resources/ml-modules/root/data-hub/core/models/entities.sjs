const { EntityModel } = require("/data-hub/core/models/entityModel.sjs");
const sem = require("/MarkLogic/semantics");
const {throwBadRequest} = require("/data-hub/5/impl/http-utils.sjs");

const entityModelCollection = "http://marklogic.com/entity-services/models";
const entityModelsByIRI = {};

function getEntityModel(entityModelIRI) {
    if (!entityModelsByIRI[entityModelIRI]) {
        const entityModelNode = getEntityModelDescriptor(entityModelIRI);
        if (entityModelNode) {
          entityModelsByIRI[entityModelIRI] = new EntityModel(entityModelNode.toObject());
        }
    }
    return entityModelsByIRI[entityModelIRI];
}

function getTitleAndParentIRI(iri) {
    const iriStr = fn.string(iri);
    const lastIndexOfSlash = iriStr.lastIndexOf("/");
    const parentIRI = iriStr.substring(0, lastIndexOfSlash - 1);
    const title = iriStr.substring(lastIndexOfSlash + 1);
    return {
      parentIRI,
      title
    }
}

function getEntityModelDescriptor(entityModelIRI) {
  return fn.head(cts.search(getEntityModelQuery(entityModelIRI)));
}

function getEntityModelQuery(entityModelIRI) {
  return cts.andQuery([
    cts.collectionQuery(entityModelCollection),
    cts.tripleRangeQuery(sem.iri(entityModelIRI), sem.iri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), [sem.iri('http://marklogic.com/entity-services#Model'),sem.iri('http://marklogic.com/entity-services#EntityType')], '=')
  ]);
}

function getEntityInstanceQuery(entityTypeIRI) {
  const tripleRangeQuery = cts.tripleRangeQuery(null, sem.iri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), sem.iri(entityTypeIRI), '=');
  if (cts.exists(tripleRangeQuery)) {
    return tripleRangeQuery;
  }
  return cts.collectionQuery(getTitleAndParentIRI(entityTypeIRI).title);
}

module.exports = { 
  getEntityInstanceQuery,
  getEntityModel
};