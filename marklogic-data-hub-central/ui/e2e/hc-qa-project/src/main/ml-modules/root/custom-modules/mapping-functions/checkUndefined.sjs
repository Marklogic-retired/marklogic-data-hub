'use strict';
function checkUndefined(value){
  if (value == "")	{
  	return 'undefined'
  } else {
  	return value;
  }
  
}
module.exports = {
    checkUndefined
  }