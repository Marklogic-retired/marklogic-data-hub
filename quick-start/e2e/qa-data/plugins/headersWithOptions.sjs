/*
 * Create Headers Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an object of headers
 */
function createHeaders(id, content, options) {
  let headers = {
    'user': xdmp.getCurrentUser(),
    'key1': options.hello,
    'key2': xs.decimal(options.myNumber)
  };
  return headers;
}

module.exports = {
  createHeaders: createHeaders
};