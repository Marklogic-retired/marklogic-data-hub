const core = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");
const serverTimezone = sem.timezoneString(fn.currentDateTime());

let expectedDateTime = xs.dateTime(`2014-01-06T18:13:50${serverTimezone}`);

[
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("06/01/2014-18:13:50", "DD/MM/YYYY-hh:mm:ss"))),
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("06/01/2014 18:13:50", "DD/MM/YYYY hh:mm:ss"))),
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("20140106T181350", "YYYYMMDDThhmmss"))),
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("2014/01/06-18:13:50", "YYYY/MM/DD-hh:mm:ss"))),
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("2014/01/06 18:13:50", "YYYY/MM/DD hh:mm:ss"))),
  test.assertThrowsError(xdmp.function(xs.QName("dt.parseDateTime")), "2014/01/06T18:13:50", "YYYY/MM/DDThh:mm:ss", null)
];
