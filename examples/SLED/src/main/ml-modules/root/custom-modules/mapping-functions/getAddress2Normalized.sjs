'use strict';
function getAddress2Normalized(Address2){
 Address2 = fn.string(Address2);
 let result = ''
   if (Address2 == ""){
     result = Address2 //fn.generateId([Address2]);
   }else{
   const removePunctRegex = /[.,\/&;:\-_()]/g     // [alts for punct we remove in square brackets]
   let nopunct = Address2.replace(removePunctRegex, " ");
   let lessspace = fn.normalizeSpace(nopunct);
   const findUnitRegex = /(.*)(Apt|apt|No|no|Unit|unit|#)(.*)/i;
   let unitpart0 = '';
   let unitpart1 = '';
   let unitpart2 = '';
   let unitpart3 = '';
   let unitCapture = lessspace.match(findUnitRegex);
    if (unitCapture == null){
      unitpart2 = lessspace;
    } else {
        unitpart0 = unitCapture[0];
        unitpart1 = unitCapture[1];
        unitpart2 = unitCapture[2];
        unitpart3 = unitCapture[3];
        }
     const UnitRegex = /(Apt|apt|No|no|Unit|unit|#).*/i;
      
     let unitPrefix = '';
     let unitSuffix = '';
    
     unitPrefix = unitpart2.replace(UnitRegex, "Unit ");
     if (unitpart3 == null){
       result = unitPrefix
      }else{
        unitSuffix = fn.normalizeSpace(unitpart3)
        result = unitPrefix.concat(unitSuffix)
      }
   }
   
     return result;
}
module.exports = {
    getAddress2Normalized
  }