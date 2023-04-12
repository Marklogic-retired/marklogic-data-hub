const rdt = require("/MarkLogic/redaction");
const builder = new NodeBuilder();

function transform(context, params, content) {
    const redactParam = params.redact;
    context.outputType = "application/json";
    context.inputType = "application/json";
    if (fn.matches(redactParam, "(0|false|f|no|n)", "i")) {
        return content.toObject();
    } else {
        let response = content.toObject();
        let results = response.results;
        let newresults = [];
        for (var i = 0; i < results.length; i++) {
            let employee = results[i].extracted.content[0].Employee;
            delete employee.latitude;
            delete employee.longitude;
            delete employee.addressLineOne;
            delete employee.addressLineTwo;
            newresults.push(results[i]);
        }
        response["results"] = newresults;
        return response;
    }
};
exports.transform = transform;