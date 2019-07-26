/*
 * Collect IDs plugin
 *
 * @param options - a map containing options. Options are sent from Java
 *
 * @return - an array of ids or uris
 */
function collect(options) {

  // grab a list of the unique employee IDs out of the JSON data
  // This is a really bad way to do this. Use a range index instead
  var y = [];
  for (var x of fn.collection('load-global-corp')) {
    var empid = x.root.envelope.instance.emp_id;
    if (empid) {
      y.push(empid);
    }
  }
  return fn.distinctValues(xdmp.arrayValues(y));
}

module.exports = {
  collect: collect
};
