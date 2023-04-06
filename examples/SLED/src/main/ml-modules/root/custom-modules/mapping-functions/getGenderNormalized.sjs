'use strict';
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const core = mjsProxy.requireMjsModule("/data-hub/5/mapping-functions/core.mjs");
function getGenderNormalized(gender){
  gender = fn.string(gender);
  if (gender == ""){
  	gender = gender //fn.generateId([gender]) ;
  	return gender;
  }	else{
  let genderMap =  '{"m": "Male", "male": "Male", "guy": "Male", "f": "Female", "girl": "Female", "female": "Female", "unknown": "Unknown", "unk": "Unknown", "u": "Unknown", "unkown": "Unknown"}'
  return core.memoryLookup((gender), (genderMap))
 }
}
module.exports = {
    getGenderNormalized
  }
