xquery version "1.0-ml";

try {
  xdmp:javascript-eval('
declareUpdate();
const temporal = require("/MarkLogic/temporal.xqy");

temporal.documentProtect(
   "temporalCollection",
   "/test.json",
  {
    expireTime: fn.currentDateTime()
  }
);
')
} catch * {()};

try {
xdmp:javascript-eval('
declareUpdate();
const temporal = require("/MarkLogic/temporal.xqy");

temporal.documentWipe(
   "temporalCollection",
   "/test.json"
);
')
} catch * {()};

try {
xdmp:javascript-eval('
  declareUpdate();
  const temporal = require("/MarkLogic/temporal.xqy");

  temporal.collectionRemove("temporalCollection");`);

xdmp:javascript-eval(`
  declareUpdate();
  const temporal = require("/MarkLogic/temporal.xqy");

  temporal.axisRemove("system");
  temporal.axisRemove("valid");')
} catch * {()};

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
  config = admin.databaseDeleteRangeElementIndex(config, dbid, rangespec);
 });
admin.saveConfiguration(config);')
} catch * {()};

