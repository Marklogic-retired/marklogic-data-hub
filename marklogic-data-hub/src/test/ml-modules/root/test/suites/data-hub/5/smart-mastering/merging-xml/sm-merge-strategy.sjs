const test = require('/test/test-helper.xqy');
const lib = require('/test/suites/merging-xml/lib/lib.xqy');

/**
 * Purpose of test: Ensure our error messages are checking for required parameters.
 *
 */

let httpOptions = {
  "credentialId": xs.unsignedLong(fn.string(test.DEFAULT_HTTP_OPTIONS.xpath('.//*:credential-id'))),
  "headers": { "Content-Type": "application/json", "Accept": "application/json"}
};

let uris = Object.keys(lib["TEST-DATA"]);
let uriParam = fn.stringJoin(uris.map((uri) => `rs:uri=${xdmp.urlEncode(uri)}`), "&");
let optParam = `rs:options=${lib["OPTIONS-NAME-WITH-DEFAULT-1"]}`;
let previewParam = "rs:preview=true";

let mergePreviewResp = test.httpPost("v1/resources/sm-merge?" + fn.stringJoin([uriParam,optParam,previewParam],"&"), httpOptions, null);
let header = fn.head(mergePreviewResp);
let body = fn.head(fn.tail(mergePreviewResp)).root;

[
  test.assertEqual("200", fn.string(header.xpath("/*:code"))),
  test.assertSameValues(uris, body.xpath("/*:envelope/*:headers/*:merges/*:document-uri").toArray().map((val) => fn.string(val))),
  test.assertSameValues("OH", body.xpath("/*:envelope/*:instance/MDM/Person/PersonType/Address/AddressType/LocationState").toArray().map((val) => fn.string(val)))
];

optParam = `rs:options=${lib["OPTIONS-NAME-WITH-DEFAULT-2"]}`;
mergePreviewResp = test.httpPost("v1/resources/sm-merge?" + fn.stringJoin([uriParam,optParam,previewParam],"&"), httpOptions, null);
header = fn.head(mergePreviewResp);
body = fn.head(fn.tail(mergePreviewResp)).root;

[
  test.assertEqual("200", fn.string(header.xpath("/*:code"))),
  test.assertSameValues(uris, body.xpath("/*:envelope/*:headers/*:merges/*:document-uri").toArray().map((val) => fn.string(val))),
  test.assertSameValues("PA", body.xpath("/*:envelope/*:instance/MDM/Person/PersonType/Address/AddressType/LocationState").toArray().map((val) => fn.string(val)))
];
