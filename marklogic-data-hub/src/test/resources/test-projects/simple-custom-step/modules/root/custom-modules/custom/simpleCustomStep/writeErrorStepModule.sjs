// Useful for when your test needs a step that throws a write error
function main(content, options) {
  content.value = {"decimalProp": "this-should-blow-up"};
  return content;
}

module.exports = {
  main
};
