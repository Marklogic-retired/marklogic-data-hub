const core = require('/data-hub/5/mapping-functions/core-functions.xqy');
const test = require("/test/test-helper.xqy");
const serverTimezone = sem.timezoneString(fn.currentDateTime());

function testParseDate() {
  const expectedDate = xs.string(xs.date(`2014-01-06${serverTimezone}`));

  return [
    test.assertEqual(expectedDate, core.parseDate("01/06/2014", "MM/DD/YYYY")),
    test.assertEqual(expectedDate, core.parseDate("06/01/2014","DD/MM/YYYY")),
    test.assertEqual(expectedDate, core.parseDate("01.06.2014","MM.DD.YYYY")),
    test.assertEqual(expectedDate, core.parseDate("06.01.2014", "DD.MM.YYYY")),
    test.assertEqual(expectedDate, core.parseDate("20140106", "YYYYMMDD")),
    test.assertEqual(expectedDate, core.parseDate("Jan 06, 2014", "Mon DD, YYYY")),

    test.assertEqual(null, core.parseDate(null, "MM-DD-YYYY")),
    test.assertEqual(null, core.parseDate(undefined, "MM-DD-YYYY")),
    test.assertEqual(null, core.parseDate("", "MM-DD-YYYY")),
    test.assertEqual(null, core.parseDate(" ", "MM-DD-YYYY"))
  ];
}

function testMoreParseDate() {
  const expectedDate2018 = xs.string(xs.date(`2018-01-02${serverTimezone}`));
  const expectedDate1996 = xs.string(xs.date(`1996-07-16${serverTimezone}`));
  return [
    test.assertEqual(expectedDate2018, core.parseDate("01-02-2018", "MM-DD-YYYY")),
    test.assertEqual(expectedDate1996, core.parseDate("Jul 16, 1996", "Mon DD, YYYY")),
    test.assertEqual(expectedDate1996, core.parseDate("Jul 16,1996", "Mon DD, YYYY")),
    test.assertEqual(expectedDate1996, core.parseDate("Jul 16, 1996", "Mon DD,YYYY")),
    test.assertEqual(expectedDate1996, core.parseDate("Jul 16,1996", "Mon DD,YYYY")),

    test.assertEqual(expectedDate1996, core.parseDate("16 Jul 1996", "DD Mon YYYY")),
    test.assertEqual(expectedDate1996, core.parseDate("16-Jul-1996", "DD-Mon-YYYY")),

    test.assertEqual(expectedDate1996, core.parseDate("1996.07.16", "yyyy.MM.dd")),

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
    test.assertEqual("The pattern 'Mon YYYY DD' cannot be applied to the value '01-01-2019'", fn.string(error.data[1]))
  ];
}

[]
 .concat(testParseDate())
 .concat(testMoreParseDate())
 .concat(testInvalidDateFormat())
;
