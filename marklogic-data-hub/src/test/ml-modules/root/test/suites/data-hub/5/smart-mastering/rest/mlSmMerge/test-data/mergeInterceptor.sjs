'use strict';

var contentArray;
var options;

contentArray.forEach(content => {
  if (content.value.root instanceof ObjectNode) {
    const contentValue = content.value.toObject();
    contentValue.envelope.headers.interceptorCalled =  true;
    content.value = contentValue;
  }
});