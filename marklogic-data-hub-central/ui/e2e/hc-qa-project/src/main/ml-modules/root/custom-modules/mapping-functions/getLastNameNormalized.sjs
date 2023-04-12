'use strict';
function getLastNameNormalized(LastName){
  LastName = fn.string(LastName)
let result = ''; 
   if (LastName == ""){
     result=LastName //fn.generateId([LastName]);
   }else{  
      const removePunctRegex = /[.,\/&;:\-_()]/g 
      let nopunct = LastName.replace(removePunctRegex, "");
      let lessspace = fn.normalizeSpace(nopunct);
      let nameparts = fn.tokenize(lessspace, " ").toArray();
      let lastnamepart0 = nameparts[0];
      let lastnamepart1 = nameparts[1]
      result = lastnamepart0
 }
  return result;
}
module.exports = {
    getLastNameNormalized
  }