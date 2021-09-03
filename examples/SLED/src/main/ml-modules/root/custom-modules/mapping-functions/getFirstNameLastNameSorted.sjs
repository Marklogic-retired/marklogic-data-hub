'use strict';
function getFirstLastNameSorted(FirstName, LastName){
  let fname = fn.string(FirstName);
  let lname = fn.string(LastName);
  let sortedName = fn.tokenize(fn.concat(fname,' ',lname),' ');
  let arrayname = sortedName.toArray();
  sortedName = arrayname.sort().toString();
  let result = ''
  return result = sortedName
 }
module.exports = {
    getFirstLastNameSorted
  }