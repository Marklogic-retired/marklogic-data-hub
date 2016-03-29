/*
 * Collect IDs plugin
 *
 * @param options - a map containing options. Options are sent from Java
 *
 * @return - an array of ids or uris
 */
function collect(options) {
  var y = [];
  for (var x of fn.collection()) {
    var empid = x.root.content.emp_id;
    if (empid) {
      y.push(empid);
    }
  }
  return fn.distinctValues(xdmp.arrayValues(y));
}

module.exports = {
  collect: collect
};
