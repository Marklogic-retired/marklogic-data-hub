xquery version "1.0-ml";

try {
xdmp:javascript-eval('
const admin = require("/MarkLogic/admin");

  let config = admin.getConfiguration();
  let dbid = xdmp.database();
  let rangespecs = [
    admin.databaseRangeElementIndex("dateTime", "", "systemStart", "", fn.false()),
    admin.databaseRangeElementIndex("dateTime", "", "systemEnd", "", fn.false()),
    admin.databaseRangeElementIndex("dateTime", "", "validStart", "", fn.false()),
    admin.databaseRangeElementIndex("dateTime", "", "validEnd", "", fn.false())];
 rangespecs.forEach((rangespec) => {
  try {
    config = admin.databaseAddRangeElementIndex(config, dbid, rangespec);
  } catch (e) {}
 });
admin.saveConfiguration(config);')
} catch * {()};

try {
xdmp:javascript-eval('
const temporal = require("/MarkLogic/temporal.xqy");

try {
  temporal.axisRemove("system");
  temporal.axisRemove("valid");
} catch (e) {
  
}
var output = new Array();
output.push(
  temporal.axisCreate(
   "system",
   cts.elementReference(xs.QName("systemStart")),
   cts.elementReference(xs.QName("systemEnd"))) 
  );

output.push(
  temporal.axisCreate(
   "valid",
   cts.elementReference(xs.QName("validStart")),
   cts.elementReference(xs.QName("validEnd"))) 
  );
output;')
} catch * {()};

try {
xdmp:javascript-eval('const temporal = require("/MarkLogic/temporal.xqy");

temporal.collectionCreate("temporalCollection", "system", "valid");')
} catch * {()};
