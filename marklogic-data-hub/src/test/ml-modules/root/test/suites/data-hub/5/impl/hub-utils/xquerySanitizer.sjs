const HubUtils = require("/data-hub/5/impl/hub-utils.sjs")
const test = require("/test/test-helper.xqy");
const results = [];

const hubUtils = new HubUtils();

const textXML = fn.head(xdmp.unquote(`<root>
    <shouldMatch value1="true&quot; and @value2=&quot;false&quot;" />
    <shouldNotMatch value1="true" value2="false" />
</root>`));

const xpathExpr = hubUtils.xquerySanitizer`/root/*[@value1 = "${'true" and @value2="false"'}"]`;

const result = textXML.xpath(xpathExpr);

[
  test.assertEqual(1, fn.count(result), `Should have one node. got ${fn.count(result)}`),
  test.assertEqual('shouldMatch', fn.localName(result), `Node has wrong name`)
];
