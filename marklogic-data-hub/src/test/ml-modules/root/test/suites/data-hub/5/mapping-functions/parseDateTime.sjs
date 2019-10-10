const core = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");
const serverTimezone = sem.timezoneString(fn.currentDateTime());

let expectedDateTime = xs.dateTime(`2014-01-06T18:13:50${serverTimezone}`);

[
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("DD/MM/YYYY-hh:mm:ss", "06/01/2014-18:13:50"))),
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("DD/MM/YYYY hh:mm:ss", "06/01/2014 18:13:50"))),
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("YYYYMMDDThhmmss", "20140106T181350"))),
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("YYYY/MM/DD-hh:mm:ss", "2014/01/06-18:13:50"))),
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("YYYY/MM/DD hh:mm:ss", "2014/01/06 18:13:50"))),
  test.assertThrowsError(xdmp.function(xs.QName("dt.parseDateTime")), "YYYY/MM/DDThh:mm:ss", "2014/01/06T18:13:50", null)
];
