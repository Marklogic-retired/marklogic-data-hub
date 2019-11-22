const core = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");

function testParseDate() {
  return [
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("01/06/2014", "MM/DD/YYYY"))),
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("06/01/2014","DD/MM/YYYY"))),
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("01.06.2014","MM.DD.YYYY", ))),
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("06.01.2014", "DD.MM.YYYY"))),
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("20140106", "YYYYMMDD"))),
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("Jan 06, 2014", "Mon DD, YYYY")))
  ];
}

function testMoreParseDate() {
  return [
    test.assertEqual(xs.date("2018-01-02"), core.parseDate("01-02-2018", "MM-DD-YYYY")),

    test.assertEqual(xs.date("1996-07-16"), core.parseDate("Jul 16, 1996", "Mon DD, YYYY")),
    test.assertEqual(xs.date("1996-07-16"), core.parseDate("Jul 16,1996", "Mon DD, YYYY")),
    test.assertEqual(xs.date("1996-07-16"), core.parseDate("Jul 16, 1996", "Mon DD,YYYY")),
    test.assertEqual(xs.date("1996-07-16"), core.parseDate("Jul 16,1996", "Mon DD,YYYY")),

    test.assertEqual(null, core.parseDate("07.16.1996", "Mon DD,YYYY")),
    test.assertEqual(null, core.parseDate("notADate", "Mon DD,YYYY"))
  ];
}

function testInvalidDateFormat() {
  let error = null;
  try {
    core.parseDate("01-01-2019", "Mon YYYY DD");
  } catch (e) {
    error = e;
  }

  return [
    test.assertTrue(error != null, "An error should have been thrown due to an invalid date format"),
    test.assertEqual("The given date pattern (Mon YYYY DD) is not supported.", fn.string(error.name))
  ];
}

[]
  .concat(testParseDate())
  .concat(testMoreParseDate())
  .concat(testInvalidDateFormat())
;
