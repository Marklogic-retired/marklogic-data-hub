'use strict';
function getPossibleLastName(FirstName, LastName){
  FirstName = fn.string(FirstName);
  LastName = fn.string(LastName);
let result = '';
 if (LastName == "") {
   if (FirstName == ""){
     result=LastName //fn.generateId([LastName]);
   }else{  
      const removePunctRegex = /[.,\/&;:\-_()]/g 
      let nopunct = FirstName.replace(removePunctRegex, "");
      let lessspace = fn.normalizeSpace(nopunct);
      let nameparts = fn.tokenize(lessspace, " ").toArray();
      let firstnamepart0 = nameparts[0];
      let firstnamepart1 = nameparts[1];
      if (firstnamepart1 !== null){
        result = firstnamepart1
      } else{
        result = fn.generateId([LastName]);
      }
      
   }
  } else{
    result = LastName;
  } 
  return result;
}
module.exports = {
    getPossibleLastName
  }