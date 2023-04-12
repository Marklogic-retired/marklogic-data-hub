'use strict';
function getMonthOfDOB(DOB){
  DOB = fn.string(DOB);
  if (DOB == ""){
    return DOB //fn.generateId([DOB]);
  }else {
    let dobs = fn.tokenize(DOB, "/").toArray()
    let month = dobs[0]
    month = fn.concat(fn.substring('00',1,(2-fn.stringLength(month))),month);
    return month;
  }
}
module.exports = {
    getMonthOfDOB
  }