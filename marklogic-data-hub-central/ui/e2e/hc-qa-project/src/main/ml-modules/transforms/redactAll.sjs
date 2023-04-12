const rdt = require("/MarkLogic/redaction");

function transform(context, params, content) {
    const redactParam = params.redact;
    if (fn.matches(redactParam, "(0|false|f|no|n)", "i")) {
        return content;
    } else {
        return rdt.redact(content, "redaction-all");
    }
};
exports.transform = transform;