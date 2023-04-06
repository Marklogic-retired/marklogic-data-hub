'use strict';
const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const core = mjsProxy.requireMjsModule("/data-hub/5/mapping-functions/core.mjs");
function getRaceNormalized(race){
race = fn.string(race);
if (race == ""){
	race = race //fn.generateId([race]) ;
	return race
 } else {
  let raceMap =  '{"white": "White", "w": "White", "black": "Black", "b": "Black", "african american": "African American", "hispanic": "Hispanic", "latino": "Hispanic", "h": "Hispanic", "l": "Hispanic", "asian": "Asian", "a": "Asian", "american indian": "Native American", "native american": "Native American", "alaska native": "Native American", "native hawaiian": "Native Hawaiian", "other pacific islander": "Native Hawaiian", "pacific islander": "Native Hawaiian", "other": "Other", "unknown": "Unknown", "unk": "Unknown", "u": "Unknown", "unkown": "Unknown"}'
  return core.memoryLookup((race), (raceMap))
 }
}
module.exports = {
    getRaceNormalized
  }
