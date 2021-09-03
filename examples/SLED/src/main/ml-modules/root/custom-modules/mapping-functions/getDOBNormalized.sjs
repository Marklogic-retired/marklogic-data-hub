'use strict';
function getDOBNormalized(DOB){
  DOB = fn.string(DOB);
  if (DOB == ""){
    return fn.generateId([DOB]);
  }else {
    return DOB;
  }
}
module.exports = {
    getDOBNormalized
  }