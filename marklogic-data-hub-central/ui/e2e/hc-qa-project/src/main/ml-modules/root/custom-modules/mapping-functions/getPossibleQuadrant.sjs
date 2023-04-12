'use strict';
function getPossibleQuadrant(Address1){
Address1 = fn.string(Address1);	
const removePunctRegex = /[.,\/&;:\-_()]/g 
let nopunct = Address1.replace(removePunctRegex, " ");
let lessspace = fn.normalizeSpace(nopunct);
let result = 'undefined';
const findQuadRegex = /(.*) (NE|NW|SE|SW)(.*)/i;   //   <address no unit part> [space] <QuadrantValue> [space] <rest> 
let quadCapture = lessspace.match(findQuadRegex);
 if (quadCapture == null){
   return result
 }else{
   result = quadCapture[2]
   return result
 }
}
module.exports = {
    getPossibleQuadrant
  }