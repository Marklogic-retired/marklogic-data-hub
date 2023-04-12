'use strict';
function getPossibleAddress2(Address1, Address2){
  Address1 = fn.string(Address1);
  Address2 = fn.string(Address2);
if (Address2 == ""){
  const removePunctRegex = /[.,\/&;:\-_()]/g 
  let nopunct = Address1.replace(removePunctRegex, " ");
  let lessspace = fn.normalizeSpace(nopunct);
  let result = '';
  let unitpart2 = '';
  let unitpart3 = '';
  let unitPrefix = '';
  let unitSuffix = '';  
  const findUnitRegex = /(.*) (Apt|apt|No|no|Unit|unit|#)(.*)/i;   //   <address no unit part> [space] <QuadrantValue> [space] <rest> 
  let unitCapture = lessspace.match(findUnitRegex);
    if (unitCapture == null){
      return result
    }else{
        unitpart2 = unitCapture[2];
        unitpart3 = unitCapture[3];
    const UnitRegex = /(Apt|apt|No|no|Unit|unit|#).*/i;
    unitPrefix = unitpart2.replace(UnitRegex, "Unit ");
      if (unitpart3 == null){
        result = unitPrefix
        } else{
        unitSuffix = fn.normalizeSpace(unitpart3)
        result = unitPrefix.concat(unitSuffix)
        }
      return result
    }
} else{
   return Address2
  } 
}
module.exports = {
    getPossibleAddress2
  }