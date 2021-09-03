'use strict';
function getFirstNameNormalized(FirstName){
  FirstName = fn.string(FirstName);
let result = ''; 
   if (FirstName == ""){
     result=FirstName //fn.generateId([FirstName]);
   }else{  
      const removePunctRegex = /[.,\/&;:\-_()]/g 
      let nopunct = FirstName.replace(removePunctRegex, "");
      let lessspace = fn.normalizeSpace(nopunct);
      let nameparts = fn.tokenize(lessspace, " ").toArray();
      let firstnamepart0 = nameparts[0];
      let firstnamepart1 = nameparts[1]
      result = firstnamepart0
 }
  return result;
}
module.exports = {
    getFirstNameNormalized
  }