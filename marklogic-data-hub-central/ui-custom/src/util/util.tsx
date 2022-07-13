import _ from "lodash";
const {JSONPath} = require('jsonpath-plus');
import { DateTime as dt } from "luxon";
 
/**
 * Extract a value from a data object based on a JSONPath expression.
 * @see https://jsonpath-plus.github.io/JSONPath/docs/ts/
 *
 * @function getValByPath
 */
 export const getValByPath = (data, expr, getFirst=false) => {
    expr = _.isNil(expr) ? "" : expr;
    let val: any = JSONPath({wrap: false, path: expr, json: data});
    return ((Array.isArray(val) && getFirst) ? val[0] : val);
};

/**
 * Extract a value from a data object based on a configuration object of JSONPath expressions.
 * @see https://jsonpath-plus.github.io/JSONPath/docs/ts/
 *
 * @function getValByConfig
 */
export const getValByConfig = (data, config, getFirst=false) => {
    let val: any = null;
    // If path only, get value based on path
    if (config?.path && !config?.arrayPath) {
        val = getValByPath(data, config.path, getFirst);
    } 
    // If arrayPath only, get value based on arrayPath
    else if (!config?.path && config?.arrayPath) {
        val = getValByPath(data, config.arrayPath, getFirst);
    } 
    // If both, first get temp value based on arrayPath
    else if (config?.path && config?.arrayPath) {
        let arrayData = getValByPath(data, config.arrayPath, getFirst);
        arrayData = Array.isArray(arrayData) ? arrayData : [arrayData];
        // Then get final value(s) in temp value based on path
        val = arrayData.map(d => {
            return getValByPath(d, config.path);
        })
    }
    // Return first element if array and getFirst is set
    let result =  _.isNil(val) ? null : 
        ((Array.isArray(val) && getFirst) ? val[0] : val);

    // Handle prepend/append for non-array values (different from prefix/suffix for display)
    result = (!Array.isArray(val) && config?.prepend) ? config.prepend + result : result;
    result = (!Array.isArray(val) && config?.append) ? result + config.append : result;

    return result;
};

export const getFormattedDateTime = (val, format=null, from=null) => {
    const defaultFormat = "yyyy-MM-dd";
    let result = val;
    const fr = from ? from : "ISO";
    if (!_.isNil(result)) {
        result = dt["from" + fr](val).toFormat(format ? format : defaultFormat);
    }
    return result;
};
