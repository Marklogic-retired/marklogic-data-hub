'use strict';
function getSSNNormalized(SSN){
  SSN = fn.string(SSN);
  if (SSN == ""){
 	return '';
//    return fn.generateId([SSN]);
  }else {
    return SSN;
  }
}
module.exports = {
    getSSNNormalized
  }