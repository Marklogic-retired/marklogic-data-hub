/*
 * Create Headers Plugin for Global Corp data
 *
 * @param id       - the identifier returned by the collector
 * @param content  - the output of your content plugin
 * @param options  - an object containing options. Options are sent from Java
 *
 * @return - an object of headers
 */
function createHeaders(id, content, options) {
  return {
    employeeId: content.emp_id,
    dateOfHire: fn.substring(xs.string(xdmp.parseDateTime('[M01]/[D01]/[Y0001]', content.job_effective_date)), 1, 10),
    salary: xs.int(content.base_salary) + xs.int(content.bonus)
  };
}

module.exports = {
  createHeaders: createHeaders
};
