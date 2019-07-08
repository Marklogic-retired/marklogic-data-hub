'use strict'

function orderedMerge(propertyName, properties, propertySpec) {
  const sortedProperties = properties.map((property) => {
      return Object.assign({}, property, { values: fn.string(property.values) });
    })
  .sort((a, b) => {
    if (propertySpec.goHigh) {
      if (a.values > b.values) return -1;
      if (a.values < b.values) return 1;
    }
    else {
      if (a.values < b.values) return -1;
      if (a.values > b.values) return 1;
    }
    return 0;
  });
  const maxValues = propertySpec.maxValues || 99;
  return sortedProperties.slice(0,maxValues);
}

exports.customThing = orderedMerge;
