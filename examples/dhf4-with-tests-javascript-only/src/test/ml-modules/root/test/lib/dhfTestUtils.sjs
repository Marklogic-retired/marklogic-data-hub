//standard update options to be used in the invoke function calls
function createStandardUpdateOptions() {
    return  {"update":"true",
                "commit":"auto",
                "isolation" : "different-transaction",
                "preventDeadlocks" : false
            };
}

/**
 * Executes the passed function in a new UPDATE transaciton on the current database
 * 
 * Note that if you update data in another transaction then you need to execute queries 
 * in a new query transaction to see the update (e.g. by using mlExecuteQueryAfterUpdate)
 * 
 * refer to https://docs.marklogic.com/xdmp.eval 'isolation' option for more details
 * 
 * @param functionImpl UPDATE function to execute in a new transaction
 */
function mlExecuteUpdate(functionImpl) {
    return xdmp.invokeFunction(functionImpl,createStandardUpdateOptions())
}

/**
 * Executes the passed function in a new UPDATE transaciton on the STAGING database
 * 
 * Note that if you update data in another transaction then you need to execute queries 
 * in a new query transaction to see the update (e.g. by using mlExecuteQueryAfterUpdateOnStaging)
 * 
 * refer to https://docs.marklogic.com/xdmp.eval 'isolation' option for more details
 * 
 * @param functionImpl UPDATE function to execute in a new transaction
 */
function mlExecuteUpdateOnStaging(functionImpl) {
    const options = createStandardUpdateOptions();
    options.database = xdmp.database(require("/com.marklogic.hub/config.sjs").STAGINGDATABASE)
    return xdmp.invokeFunction(functionImpl,options);
}

/**
 * Executes the passed function in a new UPDATE transaciton on the FINAL database
 * 
 * Note that if you update data in another transaction then you need to execute queries 
 * in a new query transaction to see the update (e.g. by using mlExecuteQueryAfterUpdateOnFinal)
 * 
 * refer to https://docs.marklogic.com/xdmp.eval 'isolation' option for more details
 * 
 * @param functionImpl UPDATE function to execute in a new transaction
 */
function mlExecuteUpdateOnFinal(functionImpl) {
    const options = createStandardUpdateOptions();
    options.database = xdmp.database(require("/com.marklogic.hub/config.sjs").FINALDATABASE)
    return xdmp.invokeFunction(functionImpl,options);
}


//standard query after update options to be used in the invoke function calls
function createStandardQueryAfterUpdateOptions() {
    return  {"update":"false",
            "isolation" : "different-transaction",
            "preventDeadlocks" : true,
            "timestamp":0
        };
}

/**
 * Executes the passed function in a new QUERY transaciton on the current database 
 * 
 * Note that if you update data in another transaction (e.g. using the 'mlExecuteUpdate' function)
 * then you need to execute queries in a new transaction to see the update
 * 
 * refer to https://docs.marklogic.com/xdmp.eval 'isolation' option for more details
 * 
 * @param functionImpl QUERY function to execute in a new transaction
 */
function mlExecuteQueryAfterUpdate(functionImpl) {
    return xdmp.invokeFunction(functionImpl,createStandardQueryAfterUpdateOptions());
}


/**
 * Executes the passed function in a new QUERY transaciton on the STAGING database 
 * 
 * Note that if you update data in another transaction (e.g. using the 'mlExecuteUpdateOnStaging' function)
 * then you need to execute queries in a new transaction to see the update
 * 
 * refer to https://docs.marklogic.com/xdmp.eval 'isolation' option for more details
 * 
 * @param functionImpl QUERY function to execute in a new transaction
 */
function mlExecuteQueryAfterUpdateOnStaging(functionImpl) {
    const options = createStandardQueryAfterUpdateOptions();
    options.database = xdmp.database(require("/com.marklogic.hub/config.sjs").STAGINGDATABASE)
    return xdmp.invokeFunction(functionImpl,options);
}

/**
 * Executes the passed function in a new QUERY transaciton on the FINAL database 
 * 
 * Note that if you update data in another transaction (e.g. using the 'mlExecuteUpdateOnFinal' function)
 * then you need to execute queries in a new transaction to see the update
 * 
 * refer to https://docs.marklogic.com/xdmp.eval 'isolation' option for more details
 * 
 * @param functionImpl QUERY function to execute in a new transaction
 */
function mlExecuteQueryAfterUpdateOnFinal(functionImpl) {
    const options = createStandardQueryAfterUpdateOptions();
    options.database = xdmp.database(require("/com.marklogic.hub/config.sjs").FINALDATABASE)
    return xdmp.invokeFunction(functionImpl,options);
}

/**
 * Executes a cts.doc operation for the specific uri in the STAGING Database.
 * 
 * Note that this is executed in new QUERY transaciton on the STAGING database 
 * 
 * refer to https://docs.marklogic.com/xdmp.eval 'isolation' option for more details
 * 
 * @param uri the uri to get
 */
function mlGetDocOnStaging(uri) {
    return fn.head(mlExecuteQueryAfterUpdateOnStaging(()=>cts.doc(uri)))
}

/**
 * Executes a cts.doc operation for the specific uri in the FINAL Database.
 * 
 * Note that this is executed in new QUERY transaciton on the FINAL database 
 * 
 * refer to https://docs.marklogic.com/xdmp.eval 'isolation' option for more details
 * 
 * @param uri the uri to get
 */
function mlGetDocOnFinal(uri) {
   return fn.head(mlExecuteQueryAfterUpdateOnFinal(()=>cts.doc(uri)))
}

/**
 * Runs the specified DHF harmonize flow.
 * 
 * Note that this is executed in new QUERY transaciton on the FINAL database 
 * 
 * refer to https://docs.marklogic.com/xdmp.eval 'isolation' option for more details
 * 
 * @param entityName the name of the entity to run the flow
 * @param flowName the name of the harmonize flow to run
 * @param [options] the options object to pass to the flow.
 * @return the JSON results of the harmonization in the form below.
 * ```
 * {
 *    "totalCount": 1, 
 *    "errorCount": 0, 
 *    "completedItems": [
 *       "/test-data/employee-test/32920.json"
 *    ], 
 *    "failedItems": [], 
 *    "errors": []
 * }
 * ```
 * Note that "completedItems" and "failedItems" are an array of xs.string objects and the errors are an array of stack trace objects 
 */
function mlHubRunFlow(entityName,flowName,options={}) {
    if (!entityName) {
        throw new Error("entityName is not defined")
    }
    if (!flowName) {
        throw new Error("flowName is not defined")
    }
    //collector
    const flowLib = require("/data-hub/4/impl/flow-lib.xqy")
    const flow = flowLib.getFlow(entityName,flowName,"harmonize")
    if (!flow) {
        throw new Error(`No harmonize flow found for entityName=${entityName} and flowName=${flowName}`)
    }
    // execute on staging db in different transaction (to catch the updates - if any)
    let ids = mlExecuteQueryAfterUpdateOnStaging(function() {
        return flowLib.runCollector(flow,sem.uuidString(),options)
    });
    console.log("IDS:"+ ids)
    if (ids) {
        ids = ids.toArray()
        //harmonizer
        const params = {
            "entity-name":entityName,
            "flow-name":flowName,
            "identifiers": ids,
            "options": JSON.stringify(options)
        }
        //simulates REST call
        const sjsflow = require("/data-hub/4/extensions/sjsflow.sjs");
        // execute on staging db in update transaction
        return fn.head(mlExecuteQueryAfterUpdateOnStaging(function() {
            return sjsflow.POST({},params)
        }));
    } else {
        //default no results return
        const noResults =  {
            "totalCount": 0, 
            "errorCount": 0, 
            "completedItems": [
            ], 
            "failedItems": [
            ], 
            "errors": [
            ]
        }
        return noResults
    }
}

/**
 * Helper function that performs a require for the content.sjs file for the
 * given entityName and flowName
 * 
 * @example just performs the following - 
 *  require(`/entities/${entityName}/harmonize/${flowName}/content.sjs`)
 * 
 * @param entityName the name of the entity 
 * @param flowName the name of the harmonize flow 
 */
function mlHubHarmonizeContentRequire(entityName,flowName) {
    if (!entityName) {
        throw new Error("entityName is not defined")
    }
    if (!flowName) {
        throw new Error("flowName is not defined")
    }
    return require(`/entities/${entityName}/harmonize/${flowName}/content.sjs`);
}

function mlHubHarmonizeCreateContent(entityName, flowName, id, options={}) {
    const contentLib = mlHubHarmonizeContentRequire(entityName, flowName)
    return fn.head(mlExecuteUpdateOnStaging(()=>contentLib.createContent(id,options)))
}


/**
 * Helper function that performs a require for the specified REST extenstion serviceName
 * 
 * @example just performs the following - 
 *  require('/marklogic.rest.resource/' + serviceName + '/assets/resource.sjs')
 * 
 * @param serviceName the name of the REST extenstion to perform the service require
 */
function mlServiceRequire(serviceName) {
    return require('/marklogic.rest.resource/' + serviceName + '/assets/resource.sjs')
}



module.exports.mlServiceRequire = mlServiceRequire
module.exports.mlExecuteUpdate = mlExecuteUpdate
module.exports.mlExecuteUpdateOnStaging = mlExecuteUpdateOnStaging
module.exports.mlExecuteUpdateOnFinal = mlExecuteUpdateOnFinal
module.exports.mlExecuteQueryAfterUpdate = mlExecuteQueryAfterUpdate
module.exports.mlExecuteQueryAfterUpdateOnStaging = mlExecuteQueryAfterUpdateOnStaging
module.exports.mlExecuteQueryAfterUpdateOnFinal = mlExecuteQueryAfterUpdateOnFinal
module.exports.mlGetDocOnStaging = mlGetDocOnStaging
module.exports.mlGetDocOnFinal = mlGetDocOnFinal
module.exports.mlHubRunFlow = mlHubRunFlow
module.exports.mlHubHarmonizeContentRequire = mlHubHarmonizeContentRequire
module.exports.mlHubHarmonizeCreateContent = mlHubHarmonizeCreateContent

//add to root object
//for (let property in module.exports) this[property] = module.exports[property];
  