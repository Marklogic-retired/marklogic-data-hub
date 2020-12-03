export const xmlParser = (xmlData) => {
  let parser = require("fast-xml-parser");
  let options = {
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
};

export const xmlParserForMapping = (xmlData) => {
  let parser = require("fast-xml-parser");
  let options = {
    attributeNamePrefix: "@",
    attrNodeName: false, //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: false,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    localeRange: "", //To support non english character in tag/attribute values.
    parseTrueNumberOnly: false
  };

  return parser.parse(xmlData, options);
};

export const xmlDecoder = (xml) => {
  let he = require("he");
  return he.decode(xml);
};

export const xmlFormatter = (xml) => {
  let format = require("xml-formatter");
  return format(xml, {
    indentation: "  ",
    filter: (node) => node.type !== "Comment",
    collapseContent: true,
    lineSeparator: "\n"
  });
};

export const jsonFormatter = (json) => {
  return JSON.stringify(json, undefined, 2);
};


