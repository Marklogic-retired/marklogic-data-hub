
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
  let root = doc.root.toObject();

  let source;

  // for xml we need to use xpath
  if (root && xdmp.nodeKind(root) === 'element') {
    source = root.xpath('/*:envelope/*:instance/node()');
  }
  // for json we need to return the instance
  else if (root && root.envelope && root.envelope.instance) {
    source = root.envelope.instance;
  }
  // for everything else
  else {
    source = doc;
  }

  return extractInstanceSupportCall(source);
}

/**
 * Creates an object instance from some source document.
 * @param source  A document or node that contains
 *   data for populating a SupportCall
 * @return An object with extracted data and
 *   metadata about the instance.
 */
function extractInstanceSupportCall(source) {
  // the original source documents

  let id = xs.string(source.id);
  let description = xs.string(source.description);
  
  /* The following property is a local reference. */
  let caller = null;
  if (source.caller) {
    // either return an instance of a Customer
    caller = extractInstanceCustomer(source.caller);
  
    // or a reference to a Customer
    // caller = makeReferenceObject('Customer', source);
  };
  let callStartTime = xs.dateTime(source.callStartTime);
  let callEndTime = xs.dateTime(source.callEndTime);
  
  /* The following property is a local reference. */
  let clerk = null;
  if (source.clerk) {
    // either return an instance of a Employee
    clerk = extractInstanceEmployee(source.clerk);
  
    // or a reference to a Employee
    // clerk = makeReferenceObject('Employee', source);
  };
  
  /* The following property is a local reference. */
  let complianceOfficer = null;
  if (source.complianceOfficer) {
    // either return an instance of a Employee
    complianceOfficer = extractInstanceEmployee(source.complianceOfficer);
  
    // or a reference to a Employee
    // complianceOfficer = makeReferenceObject('Employee', source);
  };

  // return the instance object
  return {
      "SupportCall" : {
         'id': id,
         'description': description,
         'caller': caller,
         'callStartTime': callStartTime,
         'callEndTime': callEndTime,
         'clerk': clerk,
         'complianceOfficer': complianceOfficer
    }
  }
};
  
/**
 * Creates an object instance from some source document.
 * @param source  A document or node that contains
 *   data for populating a Customer
 * @return An object with extracted data and
 *   metadata about the instance.
 */
function extractInstanceCustomer(source) {
  // the original source documents

  let fullName = xs.string(source.fullName);
  let worksFor = xs.string(source.worksFor);
  let email = xs.string(source.email);
  let ssn = xs.string(source.ssn);

  // return the instance object
  return {
    'Customer' : {
        'fullName': fullName,
        'worksFor': worksFor,
        'email': email,
        'ssn': ssn
    }
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

  let fullName = xs.string(source.fullName);

  // return the instance object
  return {
    'Employee' : {
        'fullName': fullName
    }
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

