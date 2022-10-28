const httpUtils = require("/data-hub/5/impl/http-utils.sjs");
const cachedInterceptorModules = {};

function retrieveInterceptorFunction(interceptorObj, interceptorType) {
    let interceptorModule = cachedInterceptorModules[interceptorObj.path];
    if (!interceptorModule) {
        try {
            interceptorModule = require(interceptorObj.path);
            cachedInterceptorModules[interceptorObj.path] = interceptorModule;
        } catch (e) {
            httpUtils.throwBadRequest(`Module defined by ${interceptorType} not found: ${interceptorObj.path}`);
        }
    }
    const interceptorFunction = interceptorModule[interceptorObj.function];
    if (!interceptorFunction) {
        httpUtils.throwBadRequest(`Function defined by ${interceptorType} not exported by module: ${interceptorObj.function}#${interceptorObj.path}`);
    }
    return interceptorFunction;
}

function applyInterceptors(interceptorType, accumulated, interceptors, ...additionalArguments) {
    if (!interceptors || interceptors.length === 0) {
        return accumulated;
    } else {
        const interceptorObj = interceptors.shift();
        const interceptorFunction = retrieveInterceptorFunction(interceptorObj, interceptorType);
        return applyInterceptors(interceptorType, interceptorFunction(accumulated, ...additionalArguments), interceptors, ...additionalArguments);
    }
}

class GenericMatchModel {
    constructor(matchStep, options = {}) {
        this.matchStep = matchStep;
        this.matchStep.propertyDefs = this.matchStep.propertyDefs || {properties:[]};
        this._propertyDefinitionMap = {};
        this._indexesByPath = {};
        this._propertyDefinitionMap = {};
        this._namespaces = this.matchStep.propertyDefs.namespaces || {};
        const allProperties = this.matchStep.propertyDefs.hasOwnProperty("property") ? this.matchStep.propertyDefs.property: this.matchStep.propertyDefs.properties;
        for (const propertyDefinition of allProperties) {
            this._propertyDefinitionMap[propertyDefinition.name] = propertyDefinition;
        }
        const defaultCollection = matchStep.collections && matchStep.collections.content ? matchStep.collections.content : "mdm-content";
        this._instanceQuery = cts.collectionQuery(options.collection || defaultCollection);
    }

    instanceQuery() {
        return this._instanceQuery;
    }

    propertyDefinition(propertyPath) {
        return this._propertyDefinitionMap[propertyPath] || { localname: propertyPath, namespace: "" };
    }

    propertyValues(propertyPath, documentNode) {
        const propertyDefinition = this.propertyDefinition(propertyPath);
        return propertyDefinition.path ? documentNode.xpath(propertyDefinition.path, this._namespaces) : documentNode.xpath(`.//${propertyDefinition.namespace ? "ns:": ""}${propertyDefinition.localname}`, {ns: propertyDefinition.namespace});
    }

    propertyIndexes(propertyPath) {
        if (!this._indexesByPath[propertyPath]) {
            const pathIndexes = [];
            const propertyDefinition = this._propertyDefinitionMap[propertyPath];
            if (propertyDefinition && propertyDefinition.indexReferences && propertyDefinition.indexReferences.length) {
                for (const indexReference of propertyDefinition.indexReferences) {
                    try {
                        pathIndexes.push(cts.referenceParse(indexReference));
                    } catch (e) {
                        xdmp.log(`Couldn't use index for property path '${propertyPath}' Reason: ${xdmp.toJsonString(e)}`);
                    }
                }
            }
            this._indexesByPath[propertyPath] = pathIndexes;
        }
        return this._indexesByPath[propertyPath];
    }

    topLevelProperties() {
        return [];
    }
}

function propertyDefinitionsFromXPath(xpath, namespaces) {
    const xpathSteps = xpath.split("/").filter((step) => step);
    return xpathSteps
      .map((xpathStep, index) => {
          if (/\(.+\|.+\)/.test(xpathStep)) {
              xpathStep = xpathStep.replace(/\((.+)\|.+\)/, "$1");
          }
          if (xpathStep.includes(":")) {
              const [nsPrefix, localname] = xpathStep.split(":");
              return {
                  namespace: namespaces[nsPrefix] || "",
                  localname
              };
          } else {
              return { localname: xpathStep };
          }
      });
}

module.exports = {
    applyInterceptors,
    GenericMatchModel,
    propertyDefinitionsFromXPath
}