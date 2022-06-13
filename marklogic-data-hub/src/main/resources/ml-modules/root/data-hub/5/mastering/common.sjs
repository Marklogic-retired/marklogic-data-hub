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

module.exports = {
    applyInterceptors
}