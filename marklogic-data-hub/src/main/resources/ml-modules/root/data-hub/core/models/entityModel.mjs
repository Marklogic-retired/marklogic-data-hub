import consts from "/data-hub/5/impl/consts.mjs";
import entities from "/data-hub/core/models/entities.mjs";

const localDefinitionPrefix = "#/definitions/";
const entityDebugTraceEnabled = xdmp.traceEnabled(consts.TRACE_ENTITY_DEBUG);

/*
 * A class that encapsulates the information about the MarkLogic propitiatory Entity Model necessary for indexing, querying, and extracting information.
 * @since 5.8.0
 */
export class EntityModel {

  constructor(entityModel) {
    this.entityModel = entityModel;
    if (entityDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_ENTITY_DEBUG, `Constructing Entity Model Class with ${xdmp.describe(entityModel)}`);
    }
    const info = entityModel.info;
    const baseUri = info.baseUri || "http://example.org/";
    this.entityModelIRI = baseUri + info.title + "-" + info.version;
    this.definitions = entityModel.definitions;
    const definitionNames = Object.keys(this.definitions);
    const localReferences = definitionNames
      .map((definitionName) => {
        return `#/definitions/${definitionName}`;
      });
    const definitionsArray = Object.keys(this.definitions).map((key) => this.definitions[key]);
    this.topLevelDefinitionName = localReferences
      .filter((localReference) => {
        return !definitionsArray.some((definition) => {
          return Object.keys(definition.properties)
            .map((key) => definition.properties[key])
            .some((property) => {
              const ref = property["$ref"] || (property.items && property.items["$ref"]);
              return ref === localReference;
            });
        });
      })
      .map((localReference) =>
        localReference.startsWith(localDefinitionPrefix) ? localReference.substring(localDefinitionPrefix.length): localReference
      )[0]
          || info.title;
    if (entityDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_ENTITY_DEBUG, `Top-level definition for  ${this.entityModelIRI} is determined to be ${this.topLevelDefinitionName}`);
    }

    this._namespaces = {es: "http://marklogic.com/entity-services"};
    definitionsArray.forEach((definition) => {
      this._namespaces[definition.namespacePrefix] = definition.namespace;
    });
    this.topLevelDefinition = this.definitions[this.topLevelDefinitionName];
    this._primaryEntityTypeIRI = `${this.entityModelIRI}/${this.topLevelDefinitionName}`;
    this.propertyPathsToDefinions = new Map();
  }

  topLevelProperties() {
    return Object.keys(this.topLevelDefinition.properties);
  }

  _populatePropertyInformation() {
    if (entityDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_ENTITY_DEBUG, `Populating entity property information for  ${this.entityModelIRI}`);
    }

    this._propertyPathsToXPaths = {};
    this._indexes = {};
    this._propertyDefinitions = {};
    const recursiveXPathFunction = (definition, definitionName, visitedDefinitions, accumulatedPropertyPath = [], accumulatedXPath = []) => {
      const nsPrefix = definition.namespacePrefix ? `${definition.namespacePrefix}:`:"";
      for (const property of Object.keys(definition.properties)) {
        const propertyDefinition = definition.properties[property];
        const propertyXPath = `${nsPrefix}${definitionName}/${nsPrefix}${property}`;
        const accXPath = accumulatedXPath.concat([propertyXPath]);
        const accPropPath = accumulatedPropertyPath.concat([property]);
        const fullXPath = `/(es:envelope|envelope)/(es:instance|instance)/${accXPath.join("/")}`;
        const fullPropPath = accPropPath.join(".");
        if (entityDebugTraceEnabled) {
          xdmp.trace(consts.TRACE_ENTITY_DEBUG, `XPath for  ${fullPropPath} of ${this.entityModelIRI} is ${fullXPath}`);
        }
        this._propertyDefinitions[fullPropPath] = {namespace: definition.namespace, localname: property, path: fullXPath};
        if (propertyDefinition.sortable || propertyDefinition.facetable) {
          if (entityDebugTraceEnabled) {
            xdmp.trace(consts.TRACE_ENTITY_DEBUG, `Index for property ${fullPropPath} of ${this.entityModelIRI} configured`);
          }
          try {
            const scalarType = propertyDefinition.datatype === "array" ? propertyDefinition.items.datatype: propertyDefinition.datatype;
            const collation = scalarType === "string" ? propertyDefinition.collation || fn.defaultCollation() : null;
            this._indexes[fullPropPath] = [cts.referenceParse({
              "pathReference": {
                "pathExpression": `/(es:envelope|envelope)/(es:instance|instance)/${accumulatedXPath.concat([propertyXPath]).join("/")}`,
                scalarType,
                collation
              }
            })];
          } catch (e) {
            xdmp.log(`Couldn't use index for property '${property}' Reason: ${xdmp.toJsonString(e)}`);
          }
        }
        this._propertyPathsToXPaths[fullPropPath] = fullXPath;
        const ref = propertyDefinition.items ? propertyDefinition.items["$ref"] : propertyDefinition["$ref"];
        if (ref && ref.startsWith(localDefinitionPrefix)) {
          const childDefinitionName = ref.substring(localDefinitionPrefix.length);
          if (!(this.topLevelDefinitionName === childDefinitionName || definitionName === childDefinitionName)) {
            recursiveXPathFunction(this.definitions[childDefinitionName], childDefinitionName, visitedDefinitions, accPropPath, accXPath);
          }
        }
      }
    };
    recursiveXPathFunction(this.topLevelDefinition, this.topLevelDefinitionName, [this.topLevelDefinitionName]);
    if (entityDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_ENTITY_DEBUG, `Property definitions of ${this.entityModelIRI} set to ${JSON.stringify(this._propertyDefinitions, null, 2)}`);
    }
    if (entityDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_ENTITY_DEBUG, `Property XPaths of ${this.entityModelIRI} set to ${JSON.stringify(this._propertyPathsToXPaths, null, 2)}`);
    }

  }

  extractInstanceProperties(instance, propertyPath) {
    let propertyXPath = this.propertyPathXPath(propertyPath);
    return instance.xpath(propertyXPath, this.namespaces);
  }

  /*
     * Returns the semantic IRI for the Entity Model
     * @return string
     * @since 5.8.0
     */
  getEntityModelIRI() {
    return this.entityModelIRI;
  }

  /*
     * Returns the cts.query that returns all record instances that conform to the given Entity Model
     * @return cts.query
     * @since 5.8.0
     */
  instanceQuery() {
    if (!this._instanceQuery) {
      this._instanceQuery = entities.getEntityInstanceQuery(this.primaryEntityTypeIRI());
    }
    return this._instanceQuery;
  }

  propertyPathXPath(propertyPath) {
    if (!this._propertyPathsToXPaths) {
      this._populatePropertyInformation();
    }
    return this._propertyPathsToXPaths[propertyPath];
  }

  namespaces() {
    return this._namespaces;
  }

  indexes() {
    if (!this._indexes) {
      this._populatePropertyInformation();
    }
    return this._indexes;
  }

  /*
     * Returns a JSON Object that describes a property of the model
     * @return Object - { path?, namespace?, indexReferences?, localname }
     * @since 5.8.0
     */
  propertyDefinition(propertyPath) {
    if (!this._propertyDefinitions) {
      this._populatePropertyInformation();
    }
    if (entityDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_ENTITY_DEBUG, `Retrieving property definition ${propertyPath} of ${this.entityModelIRI} from ${JSON.stringify(this._propertyDefinitions)}`);
    }
    if (!this.propertyPathsToDefinions.has(propertyPath)) {
      const propertyDefinition = this._propertyDefinitions[propertyPath] || {
        namespace: this.topLevelDefinition.namespaceURI,
        localname: propertyPath
      };
      const indexReferences = this.propertyIndexes(propertyPath);
      Object.assign(propertyDefinition, {indexReferences});
      this.propertyPathsToDefinions.set(propertyPath, propertyDefinition);
    }
    const propertyDefinition = this.propertyPathsToDefinions.get(propertyPath);
    if (entityDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_ENTITY_DEBUG, `Property definition ${propertyPath} of ${this.entityModelIRI} is ${JSON.stringify(propertyDefinition, null, 2)}`);
    }
    return propertyDefinition;
  }

  /*
     * Returns a Sequence of Node from documentNode located at the given property path
     * @param propertyPath - Identifier for the property whose values to return
     * @param documentNode - Document to extract values from
     * @return Sequence(Node)
     * @since 5.8.0
     */
  propertyValues(propertyPath, documentNode) {
    if (entityDebugTraceEnabled) {
      xdmp.trace(consts.TRACE_ENTITY_DEBUG, `Extracting values for property ${propertyPath} of ${this.entityModelIRI} from ${xdmp.describe(documentNode)}`);
    }
    const propertyDefinition = this.propertyDefinition(propertyPath);
    return propertyDefinition.path ? documentNode.xpath(propertyDefinition.path, this._namespaces) : documentNode.xpath(`.//${propertyDefinition.namespace ? "ns:": ""}${propertyDefinition.localname}`, {ns: propertyDefinition.namespace});
  }

  /*
     * Returns a JSON Array of cts.reference for indexes of a property
     * @param propertyPath - Identifier for the property whose indexes to return
     * @return []cts.reference
     * @since 5.8.0
     */
  propertyIndexes(propertyPath) {
    const indexes = this.indexes();
    return indexes[propertyPath];
  }

  primaryEntityTypeIRI() {
    return this._primaryEntityTypeIRI;
  }

  getFeatures() {
    const definition = this.entityModel.definitions[this.entityModel.info.title];
    return definition.features;
  }
}
export default {EntityModel};
