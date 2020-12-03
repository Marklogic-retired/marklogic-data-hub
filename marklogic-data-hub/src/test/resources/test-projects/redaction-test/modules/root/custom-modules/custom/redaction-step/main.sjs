const rdt = require('/MarkLogic/redaction');

function main(content, options) {
  let doc = content.value;

  content.uri = '/redacted' + content.uri;
  content.value = rdt.redact(doc, ['redact-rule']);

  return content;
}

module.exports = {
  main: main
};
