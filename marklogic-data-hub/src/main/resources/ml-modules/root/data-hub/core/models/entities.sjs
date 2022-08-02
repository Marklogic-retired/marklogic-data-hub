const { EntityModel } = require("/data-hub/core/models/entityModel.sjs");
const sem = require("/MarkLogic/semantics");
const {throwBadRequest} = require("/data-hub/5/impl/http-utils.sjs");

const entityModelCollection = "http://marklogic.com/entity-services/models";
const entityModelsByIRI = {};

function getEntityModel(entityModelIriOrTitle) {
    if (!entityModelsByIRI[entityModelIriOrTitle]) {
        const entityModelNode = getEntityModelDescriptor(entityModelIriOrTitle);
        if (entityModelNode) {
          entityModelsByIRI[entityModelIriOrTitle] = new EntityModel(entityModelNode.toObject());
        }
    }
    return entityModelsByIRI[entityModelIriOrTitle];
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

function getEntityModelDescriptor(entityModelIriOrTitle) {
  return fn.head(cts.search(getEntityModelQuery(entityModelIriOrTitle)));
}

function getEntityModelQuery(entityModelIriOrTitle) {
  return cts.andQuery([
    cts.collectionQuery(entityModelCollection),
    cts.orQuery([
      cts.tripleRangeQuery(sem.iri(entityModelIriOrTitle), sem.iri('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), [sem.iri('http://marklogic.com/entity-services#Model'),sem.iri('http://marklogic.com/entity-services#EntityType')], '='),
      cts.jsonPropertyScopeQuery(
        "info",
        cts.jsonPropertyValueQuery("title",entityModelIriOrTitle)
      )
    ])
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