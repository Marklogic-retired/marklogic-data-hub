
'use strict'

/*
 * Create Content Plugin
 *
 * @param id         - the identifier returned by the collector
 * @param options    - an object containing options. Options are sent from Java
 *
 * @return - your content
 */
function createContent(id, rawContent, options) {


  let source;

  // for xml we need to use xpath
  if (rawContent && xdmp.nodeKind(rawContent) === 'element') {
    source = rawContent.xpath('/*:envelope/*:instance/node()');
  }
  // for json we need to return the instance
  else if (rawContent && rawContent.envelope && rawContent.envelope.instance) {
    source = rawContent.envelope.instance;
  }
  // for everything else
  else {
    source = rawContent;
  }

  return extractInstanceMyFunTest(source);
}

/**
 * Creates an object instance from some source document.
 * @param source  A document or node that contains
 *   data for populating a my-fun-test
 * @return An object with extracted data and
 *   metadata about the instance.
 */
function extractInstanceMyFunTest(source) {
  // the original source documents
  let attachments = source;

  let name = xs.string(source.name);
  let price = xs.decimal(source.price);
  let ages = xs.int(source.ages);

  /* The following property is a local reference. */
  let employee = null;
  if (source.employee) {
    // either return an instance of a Employee
    employee = extractInstanceEmployee(item.Employee);

    // or a reference to a Employee
    // employee = makeReferenceObject('Employee', item);
  };

  /* The following property is a local reference. */
  let employees = [];
  if (source.employees) {
    // either return an instance of a Employee
    employees.push(extractInstanceEmployee(item.Employee));

    // or a reference to a Employee
    // employees.push(makeReferenceObject('Employee', item));
  };

  // return the instance object
  return {
    '$attachments': attachments,
    '$type': 'my-fun-test',
    '$version': '0.0.1',
    'name': name,
    'price': price,
    'ages': ages,
    'employee': employee,
    'employees': employees
  }
};

/**
 * Creates an object instance from some source document.
 * @param source  A document or node that contains
 *   data for populating a Employee
 * @return An object with extracted data and
 *   metadata about the instance.
 */
function extractInstanceEmployee(source) {
  // the original source documents
  let attachments = source;

  let name = xs.string(source.name);

  // return the instance object
  return {
    '$type': 'Employee',
    '$version': '0.0.1',
    'name': name
  }
};


function makeReferenceObject(type, ref) {
  return {
    '$type': type,
    '$ref': ref
  };
}

module.exports = {
  createContent: createContent
};

