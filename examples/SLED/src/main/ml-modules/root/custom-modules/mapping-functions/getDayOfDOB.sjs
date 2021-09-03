'use strict';
function getDayOfDOB(DOB){
  DOB = fn.string(DOB);
  if (DOB == ""){
    return DOB //fn.generateId([DOB]);
  }else {
    let dobs = fn.tokenize(DOB, "/").toArray()
    let day = dobs[1]
    day = fn.concat(fn.substring('00',1,(2-fn.stringLength(day))),day);
    return day;
  }
}
module.exports = {
    getDayOfDOB
  }