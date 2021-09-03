'use strict';
const core = require('/data-hub/5/mapping-functions/core-functions');
function getGenderNormalized(gender){
  gender = fn.string(gender);
  if (gender == ""){
  	gender = gender //fn.generateId([gender]) ;
  	return gender;
  }	else{
  let genderMap =  {"m": "Male", "male": "Male", "guy": "Male", "f": "Female", "girl": "Female", "female": "Female", 
"unknown": "Unknown", "unk": "Unknown", "u": "Unknown", "unkown": "Unknown"}
  return core.memoryLookup((gender), JSON.stringify(genderMap))
 }
}
module.exports = {
    getGenderNormalized
  }