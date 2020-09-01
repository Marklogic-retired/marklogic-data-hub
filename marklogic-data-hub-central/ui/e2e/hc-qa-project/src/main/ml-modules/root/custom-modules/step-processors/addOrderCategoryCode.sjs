var contentArray;

contentArray.forEach(content => {
  const contentValue = content.value;
  const employeeID = parseInt(contentValue.envelope.instance.EmployeeID);

  contentValue.envelope.headers.categoryCode = employeeID > 3 ? 'B' : 'A'; 

  content.value = contentValue;
})
