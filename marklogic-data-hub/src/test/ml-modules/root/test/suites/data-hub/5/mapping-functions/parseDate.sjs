const core = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");

function testParseDate() {
  return [
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("MM/DD/YYYY", "01/06/2014"))),
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("DD/MM/YYYY", "06/01/2014"))),
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("MM.DD.YYYY", "01.06.2014"))),
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("DD.MM.YYYY", "06.01.2014"))),
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("YYYYMMDD", "20140106"))),
    test.assertTrue(xs.date("2014-01-06").eq(core.parseDate("Mon DD, YYYY", "Jan 06, 2014")))
  ];
}

function testMoreParseDate() {
  return [
    test.assertEqual(xs.date("2018-01-02"), core.parseDate("MM-DD-YYYY", "01-02-2018")),

    test.assertEqual(xs.date("1996-07-16"), core.parseDate("Mon DD, YYYY", "Jul 16, 1996")),
    test.assertEqual(xs.date("1996-07-16"), core.parseDate("Mon DD, YYYY", "Jul 16,1996")),
    test.assertEqual(xs.date("1996-07-16"), core.parseDate("Mon DD,YYYY", "Jul 16, 1996")),
    test.assertEqual(xs.date("1996-07-16"), core.parseDate("Mon DD,YYYY", "Jul 16,1996")),

    test.assertEqual(null, core.parseDate("Mon DD,YYYY", "07.16.1996")),
    test.assertEqual(null, core.parseDate("Mon DD,YYYY", "notADate"))
  ];
}

function testInvalidDateFormat() {
  let error = null;
  try {
    core.parseDate("Mon YYYY DD", "01-01-2019");
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
