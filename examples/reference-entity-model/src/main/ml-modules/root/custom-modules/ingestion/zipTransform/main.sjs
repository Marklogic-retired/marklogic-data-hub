/**
 * This scaffolded step module provides a template for implementing your own logic as a DHF ingestion step.
 * All of the comments in this module are intended to explain how to implement a DHF ingestion step. You are free to delete
 * any or all of the comments at any point.
 */

function main(content, options) {
  const value = content.value;

  // Concatenating latitude and longitude allows for a geospatial element index to be easily added
  value.geoPoint = value.root.latitude + " " + value.root.longitude;

  // "zipCode" is a bit more descriptive than "zip"
  value.zipCode = value.root.zip;
  delete value.root.zip;

  content.value = value;
  return content;
}

 module.exports = {
   main
 };
