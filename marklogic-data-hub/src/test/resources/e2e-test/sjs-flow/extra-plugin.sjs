/*
 * Extra Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param options  - an object containing options. Options are sent from Java
 */
function doSomethingExtra(id, options) {
  if (options.extraGoBoom  === true && (id === '/input-2.json' || id === '/input-2.xml')) {
    fn.error(xs.QName("EXTRA-BOOM"), "I BLEW UP");
  }
  options.extraTest = 'extra';
}

module.exports = {
  doSomethingExtra: doSomethingExtra
};
