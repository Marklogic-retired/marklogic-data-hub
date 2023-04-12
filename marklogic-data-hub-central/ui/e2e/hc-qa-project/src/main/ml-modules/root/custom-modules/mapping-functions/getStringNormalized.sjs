'use strict';
function getStringNormalized(inputStr){
  inputStr = fn.string(inputStr);
  var outString
  if (inputStr == ""){
    return inputStr //fn.generateId([Address1]);
    } 
  else{
       outString = inputStr.replace(/([a-z])([a-z]*)/gi, (_, p1, p2) => p1.toUpperCase() + p2.toLowerCase())
       return outString;
      }
}
module.exports = {
    getStringNormalized
  }