'use strict';
function getZip5Normalized(Zip5){
  Zip5 = fn.string(Zip5);
  if (Zip5 == ""){
    return Zip5 //fn.generateId([Zip5]);
  }else {
    Zip5 = fn.concat(fn.substring('00000',1,(5-fn.stringLength(Zip5))),Zip5);
    return Zip5;
  }
}
module.exports = {
    getZip5Normalized
  }