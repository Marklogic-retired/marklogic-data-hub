'use strict';
function checkAddress2(addr1, addr2){
	const mod1 = require('/custom-modules/mapping-functions/getPossibleAddress2.sjs');
	const mod2 = require('/custom-modules/mapping-functions/getAddress2Normalized.sjs');
	addr2 = fn.string(addr2);
	addr1 = fn.string(addr1);
  if (addr2 == "")	{
  	return(mod1.getPossibleAddress2(addr1))
  } else {
  	return(mod2.getAddress2Normalized(addr2));
  }
  
}
module.exports = {
    checkAddress2
  }