'use strict'

/*
* Create Content Plugin
*
* @param id         - the identifier returned by the collector
* @param options    - an object containing options. Options are sent from Java
*
* @return - your content
*/
function createContent(id, options) {
  let doc = cts.doc(id);

  let source;

  // for xml we need to use xpath
  if(doc && xdmp.nodeKind(doc) === 'element' && doc instanceof XMLDocument) {
    source = doc
  }
  // for json we need to return the instance
  else if(doc && doc instanceof Document) {
    source = fn.head(doc.root);
  }
  // for everything else
  else {
    source = doc;
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
  // now check to see if we have XML or json, then create a node clone from the root of the instance
  if (source instanceof Element || source instanceof ObjectNode) {
    let instancePath = '/*:envelope/*:instance';
    if(source instanceof Element) {
      //make sure we grab content root only
      instancePath += '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    source = new NodeBuilder().addNode(fn.head(source.xpath(instancePath))).toNode();
  }
  else{
    source = new NodeBuilder().addNode(fn.head(source)).toNode();
  }
  let name = !fn.empty(fn.head(source.xpath('/name'))) ? xs.string(fn.head(fn.head(source.xpath('/name')))) : null;
  let price = !fn.empty(fn.head(source.xpath('/price'))) ? xs.decimal(fn.head(fn.head(source.xpath('/price')))) : null;
  let ages = !fn.empty(fn.head(source.xpath('/ages'))) ? fn.head(source.xpath('/ages')) : [];
  
  /* The following property is a local reference. */
  let employee = null;
  if(fn.head(source.xpath('/employee'))) {
    // let's create and pass the node
    let employeeSource = new NodeBuilder();
    employeeSource.addNode(fn.head(source.xpath('/employee'))).toNode();
    // either return an instance of a Employee
    employee = extractInstanceEmployee(employeeSource);
  
    // or a reference to a Employee
    // employee = makeReferenceObject('Employee', employeeSource));
  };
  
  /* The following property is a local reference. */
  let employees = [];
  if(fn.head(source.xpath('/employees'))) {
    for(const item of Sequence.from(source.xpath('/employees'))) {
      // let's create and pass the node
      let itemSource = new NodeBuilder();
      itemSource.addNode(fn.head(item));
      // this will return an instance of a Employee
      employees.push(extractInstanceEmployee(itemSource.toNode()));
      // or uncomment this to create an external reference to a Employee
      //employees.push(makeReferenceObject('Employee', itemSource.toNode()));
    }
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
  let attachments = source;
  // now check to see if we have XML or json, then create a node clone to operate of off
  if (source instanceof Element || source instanceof ObjectNode) {
    let instancePath = '/';
    if(source instanceof Element) {
      //make sure we grab content root only
      instancePath = '/node()[not(. instance of processing-instruction() or . instance of comment())]';
    }
    source = new NodeBuilder().addNode(fn.head(source.xpath(instancePath))).toNode();
  }
  else{
    source = new NodeBuilder().addNode(fn.head(source)).toNode();
  }
  let id = !fn.empty(fn.head(source.xpath('/id'))) ? xs.string(fn.head(fn.head(source.xpath('/id')))) : null;
  let name = !fn.empty(fn.head(source.xpath('/name'))) ? xs.string(fn.head(fn.head(source.xpath('/name')))) : null;
  let salary = !fn.empty(fn.head(source.xpath('/salary'))) ? xs.decimal(fn.head(fn.head(source.xpath('/salary')))) : null;

  // return the instance object
  return {
  
    '$type': 'Employee',
    '$version': '0.0.1',
    'id': id,
    'name': name,
    'salary': salary
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

