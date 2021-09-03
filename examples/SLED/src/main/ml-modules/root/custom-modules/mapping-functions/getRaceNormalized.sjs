'use strict';
const core = require('/data-hub/5/mapping-functions/core-functions');
function getRaceNormalized(race){
race = fn.string(race);
if (race == ""){
	race = race //fn.generateId([race]) ;
	return race
 } else {	
  let raceMap =  {"white": "White", "w": "White", "black": "Black", "b": "Black", "african american": "African American", "hispanic": "Hispanic", 
"latino": "Hispanic", "h": "Hispanic", "l": "Hispanic", "asian": "Asian", "a": "Asian", "american indian": "Native American", 
"native american": "Native American", "alaska native": "Native American", "native hawaiian": "Native Hawaiian", 
"other pacific islander": "Native Hawaiian", "pacific islander": "Native Hawaiian", 
"other": "Other", "unknown": "Unknown", "unk": "Unknown", "u": "Unknown", "unkown": "Unknown"}
  return core.memoryLookup((race), JSON.stringify(raceMap))
 }
}
module.exports = {
    getRaceNormalized
  }