/*
 * Create Headers Plugin for Global Corp data
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
  return [
    {
      employeeId: content.emp_id
    },
    {
      hireDate: xs.date(xdmp.parseDateTime('[M01]/[D01]/[Y0001]', content.hire_date))
    },
    {
      salary: xs.int(content.base_salary) + xs.int(content.bonus)
    }
  ];
}

module.exports = {
  createHeaders: createHeaders
};
