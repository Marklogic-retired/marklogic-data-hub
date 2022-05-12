const localDefinitionPrefix = "#/definitions/";

class EntityModel {

    constructor(entityModel) {
        this.entityModel = entityModel;
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

        this._namespaces = { es: "http://marklogic.com/entity-services" };
        definitionsArray.forEach((definition) => {
            this._namespaces[definition.namespacePrefix] = definition.namespace;
        });
        this.topLevelDefinition = this.definitions[this.topLevelDefinitionName];
        this._primaryEntityTypeIRI = `${this.entityModelIRI}/${this.topLevelDefinitionName}`;
    }

    extractInstanceProperties(instance, propertyPath) {
        let propertyXPath = this.propertyPathXPath(propertyPath);
        return instance.xpath(propertyXPath, this.namespaces);
    }

    getEntityModelIRI() {
        return this.entityModelIRI;
    }

    instanceQuery() {
        if (!this._instanceQuery) {
            const entities = require("/data-hub/core/models/entities.sjs");
            this._instanceQuery = entities.getEntityInstanceQuery(this.primaryEntityTypeIRI());
        }
        return this._instanceQuery;
    }

    propertyPathXPath(propertyPath) {
        if (!this._propertyPathsToXPaths) {
            this._propertyPathsToXPaths = {};
            const recursiveXPathFunction = (definition, definitionName, visitedDefinitions, accumulatedPropertyPath = [], accumulatedXPath = []) => {
                const nsPrefix = definition.namespacePrefix ? `${definition.namespacePrefix}:`:"";
                for (const property of Object.keys(definition.properties)) {
                    const propertyDefinition = definition.properties[property];
                    const propertyXPath = `${nsPrefix}${definitionName}/${nsPrefix}${property}`;
                    const accXPath = accumulatedXPath.concat([propertyXPath]);
                    const accPropPath = accumulatedPropertyPath.concat([property]);
                    const fullXPath = `/(es:envelope|envelope)/(es:instance|instance)/${accXPath.join("/")}`;
                    const fullPropPath = accPropPath.join(".");
                    this._propertyPathsToXPaths[fullPropPath] = fullXPath;
                    const ref = propertyDefinition.items ? propertyDefinition.items["$ref"] : propertyDefinition["$ref"];
                    if (ref && ref.startsWith(localDefinitionPrefix)) {
                        const definitionName = ref.substring(localDefinitionPrefix.length);
                        if (!visitedDefinitions.includes(definitionName)) {
                            visitedDefinitions.push(definitionName);
                            recursiveXPathFunction(this.definitions[definitionName], definitionName, visitedDefinitions, accPropPath, accXPath);
                        }
                    }
                }
            };
            recursiveXPathFunction(this.topLevelDefinition, this.topLevelDefinitionName, [this.topLevelDefinitionName]);
        }
        return this._propertyPathsToXPaths[propertyPath];
    }

    namespaces() {
        return this._namespaces;
    }

    indexes() {
        if (!this._indexes) {
            this._indexes = {};
            const recursiveIndexesFunction = (definition, definitionName, visitedDefinitions, accumulatedPropertyPath = [], accumulatedXPath = []) => {
                const nsPrefix = definition.namespacePrefix ? `${definition.namespacePrefix}:`:"";
                for (const property of Object.keys(definition.properties)) {
                    const propertyDefinition = definition.properties[property];
                    const propertyXPath = `${nsPrefix}${definitionName}/${nsPrefix}${property}`
                    if (propertyDefinition.sortable || propertyDefinition.facetable) {
                        try {
                            const scalarType = propertyDefinition.datatype === "array" ? propertyDefinition.items.datatype: propertyDefinition.items.datatype;
                            const collation = scalarType === "string" ? propertyDefinition.collation || fn.defaultCollation() : null;
                            this._indexes[property] = [ cts.reference({
                                "pathReference": {
                                    "pathExpression": `/(es:envelope|envelope)/(es:instance|instance)/${accumulatedXPath.concat([propertyXPath]).join("/")}`,
                                    scalarType,
                                    collation
                                }
                            }) ]
                        } catch (e) {
                            xdmp.log(`Couldn't use index for property '${property}' Reason: ${xdmp.toJsonString(e)}`);
                        }
                    }
                    const ref = propertyDefinition.items ? propertyDefinition.items["$ref"] : propertyDefinition["$ref"];
                    if (ref && ref.startsWith(localDefinitionPrefix)) {
                        const definitionName = ref.substring(localDefinitionPrefix.length);
                        if (!visitedDefinitions.includes(definitionName)) {
                            visitedDefinitions.push(definitionName);
                            const accPropPath = accumulatedPropertyPath.concat([property]);
                            const accXPath = accumulatedXPath.concat([propertyXPath]);
                            recursiveIndexesFunction(this.definitions[definitionName], definitionName, visitedDefinitions, accPropPath, accXPath);
                        }
                    }
                }
            };
            recursiveIndexesFunction(this.topLevelDefinition, this.topLevelDefinitionName, [this.topLevelDefinitionName]);
        }
        return this._indexes;
    }

    propertyDefinition(propertyPath) {
        const path = this.propertyPathXPath(propertyPath);
        const indexReferences = this.propertyIndexes(propertyPath);
        return path ? { path, indexReferences } : { localname: propertyPath, namespace: "" };
    }

    propertyValues(propertyPath, documentNode) {
        const propertyDefinition = this.propertyDefinition(propertyPath);
        return propertyPath.path ? documentNode.xpath(propertyDefinition.path, this._namespaces) : documentNode.xpath(`.//${propertyDefinition.namespace ? "ns:": ""}${propertyDefinition.localname}`, {ns: propertyDefinition.namespace});
    }

    propertyIndexes(propertyPath) {
        const indexes = this.indexes();
        return indexes[propertyPath];
    }

    primaryEntityTypeIRI() {
        return this._primaryEntityTypeIRI;
    }
}

module.exports = { EntityModel };