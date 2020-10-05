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
  test.assertTrue(expectedDateTime.eq(core.parseDateTime("2014.01.06 AD at 18:13:50", "yyyy.MM.dd G 'at' HH:mm:ss"))),
  test.assertThrowsError(xdmp.function(xs.QName("dt.parseDateTime")), "2014/01/06T18:13:50", "YYYY/MM/DDThh:mm:ss", null),
  test.assertEqual(null, core.parseDateTime(null, "DD/MM/YYYY-hh:mm:ss")),
  test.assertEqual(null, core.parseDateTime("", "DD/MM/YYYY-hh:mm:ss")),
  test.assertEqual(null, core.parseDate(undefined, "DD/MM/YYYY-hh:mm:ss")),
  test.assertEqual(null, core.parseDateTime(" ", "DD/MM/YYYY-hh:mm:ss"))
];
