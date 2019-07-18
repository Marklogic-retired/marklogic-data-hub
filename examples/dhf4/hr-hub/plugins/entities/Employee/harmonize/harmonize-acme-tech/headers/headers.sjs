/*
 * Create Headers Plugin for Acme Tech data
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an object of headers
 */
function createHeaders(id, content, options) {
  var latest = xs.date('1900-01-01');
  var salary;

  // to grab the current salary we need to find the most recent effective date
  for (var i = 0; i < content.salaryHistory.length; i++) {
    var history = content.salaryHistory[i];
    var date = xs.date(xdmp.parseDateTime('[M01]/[D01]/[Y0001]', history.effectiveDate));
    if (date.gt(latest)) {
      salary = history.salary;
      latest = date;
    }
  }

  return {
    employeeId: content.id,
    dateOfHire: xs.date(xdmp.parseDateTime('[M01]/[D01]/[Y0001]', content.hireDate)),
    salary: xs.int(salary)
  };
}

module.exports = {
  createHeaders: createHeaders
};
