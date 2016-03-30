/*
 * Create Headers Plugin
 *
 * @param id       - the identifier returned by the collector
 * @param content  - your final content
 * @param headers  - an array of header objects
 * @param triples  - an array of triples
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an array of header objects
 */
function createHeaders(id, content, headers, triples, options) {
  var latest = xs.date('1900-01-01');
  var salary;

  // console.log(content);
  for (var i = 0; i < content.salaryHistory.length; i++) {
    var history = content.salaryHistory[i];
    // console.log('history: ' + i);
    // console.log(history);
    var date = xs.date(xdmp.parseDateTime('[M01]/[D01]/[Y0001]', history.effectiveDate));
    if (date.gt(latest)) {
      salary = history.salary;
    }
  }

  return [
    {
      employeeId: content.id
    },
    {
      hireDate: xs.date(xdmp.parseDateTime('[M01]/[D01]/[Y0001]', content.hireDate))
    },
    {
      salary: xs.int(salary)
    }
  ];
}

module.exports = {
  createHeaders: createHeaders
};
