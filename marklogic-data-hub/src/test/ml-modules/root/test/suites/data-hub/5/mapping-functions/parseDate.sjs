const core = require('/data-hub/5/mapping-functions/core.sjs');
const test = require("/test/test-helper.xqy");
const serverTimezone = sem.timezoneString(fn.currentDateTime());

function testParseDate() {
  let expectedDate = xs.date(`2014-01-06${serverTimezone}`);
  return [
    test.assertTrue(expectedDate.eq(core.parseDate("01/06/2014", "MM/DD/YYYY"))),
    test.assertTrue(expectedDate.eq(core.parseDate("06/01/2014","DD/MM/YYYY"))),
    test.assertTrue(expectedDate.eq(core.parseDate("01.06.2014","MM.DD.YYYY"))),
    test.assertTrue(expectedDate.eq(core.parseDate("06.01.2014", "DD.MM.YYYY"))),
    test.assertTrue(expectedDate.eq(core.parseDate("20140106", "YYYYMMDD"))),
    test.assertTrue(expectedDate.eq(core.parseDate("Jan 06, 2014", "Mon DD, YYYY")))
  ];
}

function testMoreParseDate() {
  let expectedDate2018 = xs.date(`2018-01-02${serverTimezone}`);
  let expectedDate1996 = xs.date(`1996-07-16${serverTimezone}`);
  return [
    test.assertTrue(expectedDate2018.eq(core.parseDate("01-02-2018", "MM-DD-YYYY"))),
    test.assertTrue(expectedDate1996.eq(core.parseDate("Jul 16, 1996", "Mon DD, YYYY"))),
    test.assertTrue(expectedDate1996.eq(core.parseDate("Jul 16,1996", "Mon DD, YYYY"))),
    test.assertTrue(expectedDate1996.eq(core.parseDate("Jul 16, 1996", "Mon DD,YYYY"))),
    test.assertTrue(expectedDate1996.eq(core.parseDate("Jul 16,1996", "Mon DD,YYYY"))),
    test.assertTrue(expectedDate1996.eq(core.parseDate("1996.07.16", "yyyy.MM.dd"))),

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
    test.assertEqual("The pattern 'Mon YYYY DD' cannot be applied to the value '01-01-2019'", fn.string(error.name))
  ];
}

[]
// TODO Figure out DST timezone difference issue 
//  .concat(testParseDate())
//  .concat(testMoreParseDate())
//  .concat(testInvalidDateFormat())
;
