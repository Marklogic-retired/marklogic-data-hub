function cleanPrefix(input) {
  return input != null ? fn.string(input).replace(".", "") : null;
}

module.exports = {
  cleanPrefix
};
