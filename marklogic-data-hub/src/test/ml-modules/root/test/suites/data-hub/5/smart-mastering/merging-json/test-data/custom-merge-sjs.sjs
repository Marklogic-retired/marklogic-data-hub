'use strict'

function orderedMerge(propertyName, properties, propertySpec) {
  const sortedProperties = properties.sort((a, b) => {
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
  return fn.subsequence(xdmp.arrayValues(sortedProperties), 1, maxValues);
}

exports.customThing = orderedMerge;
