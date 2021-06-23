const core = require('/data-hub/5/mapping-functions/core-functions.xqy');
const test = require("/test/test-helper.xqy");

const expectedDateTime = "2014-01-06T18:13:50";

[
  test.assertTrue(core.parseDateTime("06/01/2014-18:13:50", "DD/MM/YYYY-hh:mm:ss").startsWith(expectedDateTime)),
  test.assertTrue(core.parseDateTime("06/01/2014 18:13:50", "DD/MM/YYYY hh:mm:ss").startsWith(expectedDateTime)),
  test.assertTrue(core.parseDateTime("20140106T181350", "YYYYMMDDThhmmss").startsWith(expectedDateTime)),
  test.assertTrue(core.parseDateTime("2014/01/06-18:13:50", "YYYY/MM/DD-hh:mm:ss").startsWith(expectedDateTime)),
  test.assertTrue(core.parseDateTime("2014/01/06 18:13:50", "YYYY/MM/DD hh:mm:ss").startsWith(expectedDateTime)),
  test.assertTrue(core.parseDateTime("2014.01.06 AD at 18:13:50", "yyyy.MM.dd G 'at' HH:mm:ss").startsWith(expectedDateTime)),

  test.assertThrowsError(xdmp.function(xs.QName("dt.parseDateTime")), "2014/01/06T18:13:50", "YYYY/MM/DDThh:mm:ss", null),

  test.assertEqual(null, core.parseDateTime(null, "DD/MM/YYYY-hh:mm:ss")),
  test.assertEqual(null, core.parseDateTime("", "DD/MM/YYYY-hh:mm:ss")),
  test.assertEqual(null, core.parseDateTime(" ", "DD/MM/YYYY-hh:mm:ss"))
];
