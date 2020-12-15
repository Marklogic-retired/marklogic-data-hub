/**
 * A simple example of a custom merge function that orders the dates.
 *
 * @param propertyName
 * @param properties
 * @param mergeRule
 * @return {*}
 */
function mergeDob(propertyName, properties, mergeRule) {
  return properties.map((property) => {
      return Object.assign({}, property, {values: fn.string(property.values)});
    })
    .sort((a, b) => {
      if (a.values > b.values) return 1;
      if (a.values < b.values) return -1;
      return 0;
    });
}

exports.mergeDob = mergeDob;
