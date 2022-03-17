import _ from "lodash";

/**
 * Extract a value from a data object based on a dot-notation path.
 * @see https://lodash.com/docs/4.17.15#get 
 *
 * @function getValueByPath
 * @arg {object} data Data object from which to extract the value.
 * @arg {string} path  Path to the value to extract.
 * @arg {boolean} getFirst If true, return first element if value is an array. Optional (default is false).
 * @returns {any} Value at that path location or null if not found. 
 */
export const getValByPath = (data, path, getFirst=false) => {
    let val: any = _.get(data, path, null);
    return _.isNil(val) ? null : 
        ((Array.isArray(val) && getFirst) ? val[0] : val);
};
 
/**
 * Extract a value from a data object based on a dot-notation path and return as array.
 * @see https://lodash.com/docs/4.17.15#get 
 *
 * @function getValByPathAsArray
 * @arg {object} data Data object from which to extract the value.
 * @arg {string} path  Path to the value to extract.
 * @returns {array} Value at that path location as an array or empty array if not found. 
 */
 export const getValByPathAsArray = (data, path) => {
    let val: any = _.get(data, path, []);
    return (Array.isArray(val) ? val : [val]);
};

 export const getValByConfig = (data, config, getFirst=false) => {
    let val: any = null;
    // If path only, get value based on path
    if (config?.path && !config?.arrayPath) {
        val = _.get(data, config.path, null);
    } 
    // If arrayPath only, get value based on arrayPath
    else if (!config?.path && config?.arrayPath) {
        val = _.get(data, config.arrayPath, null);
    } 
    // If both, first get temp value based on arrayPath
    else if (config?.path && config?.arrayPath) {
        let arrayData = _.get(data, config.arrayPath, []);
        arrayData = Array.isArray(arrayData) ? arrayData : [arrayData];
        // Then get final value(s) in temp value based on path
        val = arrayData.map(d => {
            return _.get(d, config.path, null);
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