var contentArray;
var options;

contentArray.forEach(content => {
  const contentValue = content.value.toObject();
  contentValue.test = "intercepted-" + contentValue.test;
  content.value = contentValue;
});

