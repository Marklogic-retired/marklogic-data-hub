'use strict';
function getPossibleQuadrant2(Address1, Quad){
Address1 = fn.string(Address1);	
Quad = fn.string(Quad);
if (Quad == ""){
    const removePunctRegex = /[.,\/&;:\-_()]/g 
    let nopunct = Address1.replace(removePunctRegex, " ");
    let lessspace = fn.normalizeSpace(nopunct);
    let result = 'undefined';
    const findQuadRegex = /(.*) (NE|NW|SE|SW)(.*)/i;   //   <address no unit part> [space] <QuadrantValue> [space] <rest> 
    let quadCapture = lessspace.match(findQuadRegex);
        if (quadCapture == null){
          return Quad //fn.generateId([Quad]);
        }else{
         result = quadCapture[2]
        return result
       }
}else{
 return Quad	
}
}
module.exports = {
    getPossibleQuadrant2
  }