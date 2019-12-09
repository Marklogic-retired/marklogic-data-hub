const ingest = require("/data-hub/5/builtins/steps/ingestion/default/main.sjs");
const test = require("/test/test-helper.xqy");

let assertions = [];
function runJsonToXmlIngest() {
  let jsonObj = {
    "Region": "Asia",
    "Country": "India",
    "@SalesID": "12345",
    "Item Type": "Personal Care",
    "Sales Channel": "Online",
    "Order Priority": "H",
    "Order Date": "7/3/2015",
    "Order ID": "987149329",
    "Ship Date": "7/24/2015",
    "Units Sold": "86",
    "Unit Price": "8.73",
    "Unit Cost": "560.67",
    "Total Revenue": "70996.78",
    "Total Cost": "49225.62",
    "Total Profit": "21761.16"
  };
  let doc = fn.head(xdmp.toJSON(jsonObj));
  let result = ingest.main({uri: '/test.json', value: doc}, {
    outputFormat: 'xml'
  }).value;
  let instance = fn.head(result.xpath('/*:envelope/*:instance'));
  for (let objKey of Object.keys(jsonObj)) {
    if (jsonObj.hasOwnProperty(objKey)) {
      const elementName = (!xdmp.castableAs("http://www.w3.org/2001/XMLSchema", "QName", objKey)) ? xdmp.encodeForNCName(objKey) : objKey;
      assertions.push(test.assertEqual(jsonObj[objKey], fn.string(instance.xpath(`*:${elementName}`)), `XML element ${elementName} should have same value as JSON property ${objKey}`));
    }
  }
}

runJsonToXmlIngest();
assertions;
