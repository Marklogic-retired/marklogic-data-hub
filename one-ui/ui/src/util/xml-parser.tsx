export const xmlParser = (xmlData) => {
  var parser = require('fast-xml-parser');
  var options = {
    attributeNamePrefix: "",
    attrNodeName: false, //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: true,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    localeRange: "", //To support non english character in tag/attribute values.
    parseTrueNumberOnly: false
  };

  return parser.parse(xmlData, options);
}

export const xmlDecoder = (xml) => {
  var he = require('he');
  return he.decode(xml);
}

