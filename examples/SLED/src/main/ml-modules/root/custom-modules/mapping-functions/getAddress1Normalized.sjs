'use strict';
function getAddress1Normalized(Address1){
  Address1 = fn.string(Address1);
  if (Address1 == ""){
    return Address1 //fn.generateId([Address1]);
  } else{
  const removePunctRegex = /[.,\/&;:\-_()]/g     // [alts for punct we remove in square brackets]
  let nopunct = Address1.replace(removePunctRegex, " ");
  let lessspace = fn.normalizeSpace(nopunct);
  const findUnitRegex = /(.*) ((Apt|No|Unit|#).*)/i;   //   <address no unit part> [space] <unit word><unit rest> 
  let streetPart = '';
  let unitPart = '';
  let unitCapture = lessspace.match(findUnitRegex);
    if (unitCapture == null){
      streetPart = lessspace;
    } else {
        streetPart = unitCapture[1];   // unitcapture[0] is the full match string [1] is the first capture group match
        unitPart = unitCapture[2];     // need if check...
        }
  const AveRegex = / (AV|Ave|AVENUE|AVEN|AV|AVENU|AVN|AVNUE|ave|av).*/i;
  const StRegex = / (St|Str|Strt|st|str).*/i;
  const BlvdRegex = / (Blvd|Boul|Boulv|Boulevard|blvd|bou|blv).*/i;
  const AnexRegex = / (AN|Annex|Anex|Annx|Anx|Annex|anx).*/i;

  var standardStreet = streetPart.replace(AveRegex, " Avenue");
      standardStreet = standardStreet.replace(StRegex, " Street");
      standardStreet = standardStreet.replace(BlvdRegex, " Boulevard");
      standardStreet = standardStreet.replace(AnexRegex, " Anex");

 return standardStreet;
 }
}
module.exports = {
    getAddress1Normalized
  }