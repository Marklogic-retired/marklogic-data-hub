var contentArray;
var options;

// Demonstrates an example of adding objects to the content array after the mapping step's "main"
// function is run. Note that this will affect the counts of total, successful, and failed items.
const additionalContent = [];
contentArray.forEach(content => {
  let orderObject = content.value.toObject ? content.value.toObject(): content.value;
  let orderInstance = orderObject.envelope.instance;
  let orderID = orderInstance.Order.OrderID;
  if (orderInstance.Order.Products && orderInstance.Order.Products.length) {
    orderInstance.Order.Products.forEach((productData) => {
      additionalContent.push({
        uri: `/order/${orderID}/products/${productData.Product.ProductID}.json`,
        value: productData
      });
    });
  }
});

contentArray.push(...additionalContent);