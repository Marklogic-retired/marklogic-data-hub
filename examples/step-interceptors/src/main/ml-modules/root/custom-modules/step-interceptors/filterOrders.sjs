var contentArray;
var options;
var orderIdToRemove;

// Demonstrates an example of removing an object from the content array before the mapping step's "main" 
// function is run. Note that this will affect the counts of total, successful, and failed items - i.e. 
// the content object removed here will still count towards the total number of items processed, but it will not 
// count towards successful or failed items. 
const index = contentArray.findIndex(content => content.value.toObject().envelope.instance.OrderID === orderIdToRemove);
if (index > -1) {
  console.log("Removing order with ID of: " + orderIdToRemove);
  contentArray.splice(index, 1);
}

