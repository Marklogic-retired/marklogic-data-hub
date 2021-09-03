
const rdt = require('/MarkLogic/redaction');



function get(context, params) {
    let m = cts.doc(cts.uriMatch("/mmis/member/*").toArray()[1]);
    let redactedMember = rdt.redact(m, "member-redaction");
    return redactedMember
  };
  
  exports.GET = get;