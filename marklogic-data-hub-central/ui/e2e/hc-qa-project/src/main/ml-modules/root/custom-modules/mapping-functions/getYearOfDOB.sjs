'use strict';
function getYearOfDOB(DOB){
  DOB = fn.string(DOB);
  if (DOB == ""){
    return DOB //fn.generateId([DOB])
  }else {
    let dobs = fn.tokenize(DOB, "/").toArray()
    let year = dobs[2]
    year = fn.concat(fn.substring('0000',1,(4-fn.stringLength(year))),year);
    return year;
  }
}
module.exports = {
    getYearOfDOB
  }