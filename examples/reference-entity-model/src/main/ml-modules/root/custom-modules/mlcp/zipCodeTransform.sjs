/**
 * Performs a small amount of tweaking to the JSON document for each row in the zipCodes CSV file. 
 */
function transform(content, context) {
  const value = content.value.toObject();

  // Concatenating latitude and longitude allows for a geospatial element index to be easily added
  value.geoPoint = value.latitude + " " + value.longitude;

  // "zipCode" is a bit more descriptive than "zip"
  value.zipCode = value.zip;
  delete value.zip;

  content.value = value;
  return content;
}

module.exports = {
  transform
}