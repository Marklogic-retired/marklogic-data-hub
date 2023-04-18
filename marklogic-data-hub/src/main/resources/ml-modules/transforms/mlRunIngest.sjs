'use strict';

const mjsProxy = require("/data-hub/core/util/mjsProxy.sjs");
const ingestTransform = mjsProxy.requireMjsModule("/data-hub/core/stepRunner/ingestTransform.mjs");

function transform(context, params, content) {
  const results = ingestTransform.transform(context, params, content);
  Object.assign(context, results.context);
  return Sequence.from(results.content.map(r => {
    try {
      return xdmp.unquote(xdmp.quote(r))
    } catch (e) {
      return r;
    }
  }));
}

exports.transform = transform;