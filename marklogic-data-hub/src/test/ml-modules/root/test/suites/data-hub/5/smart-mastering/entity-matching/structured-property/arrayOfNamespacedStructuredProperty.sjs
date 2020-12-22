const smTest = require("/test/suites/data-hub/5/smart-mastering/lib/masteringTestLib.sjs");

const entityXml = "<envelope xmlns='http://marklogic.com/entity-services'>\n" +
"  <instance>\n" +
"    <info>\n" +
"      <title>NamespacedCustomer</title>\n" +
"      <version/>\n" +
"    </info>\n" +
"    <exCustomer:NamespacedCustomer xmlns:exCustomer='http://example.org/customer'>\n" +
"      <exCustomer:shipping>\n" +
"        <exAddress:Address xmlns:exAddress='http://example.org/address'>\n" +
"          <exAddress:city>Osprey</exAddress:city>\n" +
"          <exAddress:state>Florida</exAddress:state>\n" +
"        </exAddress:Address>\n" +
"      </exCustomer:shipping>\n" +
"    </exCustomer:NamespacedCustomer>\n" +
"  </instance>\n" +
"</envelope>";


const options = {
  "targetEntityType": "http://example.org/NamespacedCustomer-0.0.1/NamespacedCustomer",
  "matchRulesets": [
    {
      "name": "shippingCityState",
      "weight": 5,
      "matchRules": [
        {
          "entityPropertyPath": "shipping.city",
          "matchType": "exact"
        },
        {
          "entityPropertyPath": "shipping.state",
          "matchType": "exact"
        }
      ]
    }
  ],
  "thresholds": [
    {
      "thresholdName": "sameThreshold",
      "action": "merge",
      "score": 5
    }
  ]
}

const matchSummary = smTest.matchXml(entityXml, options);

smTest.assertMatchExists(matchSummary, "/content/xmlShippingOspreyFlorida.xml");
