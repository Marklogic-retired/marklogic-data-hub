'use strict';

/*
 * Determine a target URI for storing the instance.
 * 
 * Relevant options:
 *   uriPrefix: optional str
 *   targetEntity: str
 *   primaryKey: optional str or Array(str)
 *   primaryKeyPrefix: optional str or Array(str)
 *   outputFormat: str (“xml” or “json”)
 *   generateId: optional bool (default false)
 * 
 * The generated URI will start with the uriPrefix, if specified.  The
 * uriPrefix should start with a slash and should not end with one.
 * 
 * After the prefix, if any, the URI will have a slash and then the
 * targetEntity name.
 * 
 * After the targetEntity will be one or more property names and
 * values, corresponding to the number of primaryKey settings, if
 * specified.  For each given primaryKey, its name and the
 * corresponding value of the instance will be appended to the URI,
 * separated by slashes.  If the cardinality of values for the given
 * key is other than 1, and generateId is false, this function will
 * return null.  If the cardinality is other than 1 and generateId is
 * true, a UUID will be used for that part of the URI.
 * 
 * If primaryKeyPrefix is specified, its value will be prepended to
 * any non-generated values.  If primaryKeyPrefix is singular, its
 * value will be prepended to every non-generated key value; if it is
 * an array, it must have the same cardinality as primaryKey, and each
 * prefix will be prepended to each corresponding key value.
 * 
 * If no primaryKey is specified and generateId is false, this
 * function will return null.  If no primaryKey is specified and
 * generateId is true, a UUID will be used instead of any key values.
 * 
 * The target URI will end with a period and the outputFormat.
 * 
 * Note that the destination URI is deterministic when key values are
 * used, but guaranteed to vary when UUIDs are generated.
 * 
 * In its simplest form, with targetEntity = “Person” and primaryKey =
 * “id”:
 *   /Person/id/1234.json
 * With a prefix of “/org.example” and an array of primary keys:
 *   /org.example/Person/dept/8763/id/1234.json
 * With a prefix of “/org.example” an array of primary keys, and a
 * singular prefix of X:
 *   /org.example/Person/dept/X8763/id/X1234.json
 * With a prefix of “/org.example”, an array of primary keys, and an
 * array of prefixes:
 *   /org.example/Person/dept/X8763/id/Y1234.json
 * With a prefix, no specified keys, and generateId true:
 *   /org.example/Person/05508897-011a-4356-ad6e-f87d978bf6b4.json
 */
function getTargetUri(instance, options) {
  let prefix = options.uriPrefix || "";
  let entityType = options.targetEntity;
  let primaryKeyNames = options.primaryKey;
  let primaryKeyPrefixes = options.primaryKeyPrefix || "";
  let generateId = options.generateId;
  let outputFormat = options.outputFormat || "json";

  // Verify and clean up the options.
  if (entityType === undefined ||
      entityType === null ||
      Array.isArray(entityType)) {
    throw Error("Can’t generate target URI; no targetEntity option specified");
  }

  if (primaryKeyNames === undefined ||
      primaryKeyNames === null) {
    primaryKeyNames = [];
  } else if (!(Array.isArray(primaryKeyNames))) {
    primaryKeyNames = [primaryKeyNames];
  }

  if (!(Array.isArray(primaryKeyPrefixes))) {
    primaryKeyPrefixes = [primaryKeyPrefixes];
  }

  if (primaryKeyPrefixes.length == 1) {
    let primaryKeyPrefix = primaryKeyPrefixes[0];
    primaryKeyPrefixes = [];
    for (const primaryKeyName of primaryKeyNames) {
      primaryKeyPrefixes.push(primaryKeyPrefix);
    }
  }

  if (primaryKeyNames.length != primaryKeyPrefixes.length) {
    throw Error("primaryKey and primaryKeyPrefix must have the same cardinality");
  }

  generateId = (
    generateId !== null &&
    generateId !== undefined &&
    (generateId === true || generateId.match(/^true$/i))
  );

  // Assemble the target URI from these pieces.
  let newUri = prefix + "/" + entityType;
  if (primaryKeyNames.length == 0) {
    if (generateId) {
      newUri += "/" + sem.uuidString();
    } else {
      return null;
    }
  } else {
    for (var i=0; i < primaryKeyNames.length; i++) {
      let primaryKeyName = primaryKeyNames[i];
      let primaryKeyPrefix = primaryKeyPrefixes[i];

      let primaryKeyValue = instance.xpath(
        "*:"+entityType + "/*:"+primaryKeyName + "/fn:string()"
      );
      if (fn.count(primaryKeyValue) == 1) {
        primaryKeyValue = fn.head(primaryKeyValue);
      } else {
        primaryKeyValue = null;
      }

      if (primaryKeyValue === undefined ||
          primaryKeyValue === null ||
          primaryKeyValue == "") {
        if (generateId) {
          primaryKeyValue = sem.uuidString();
        } else {
          return null;
        }
      } else {
        primaryKeyValue = primaryKeyPrefix + primaryKeyValue;
      }
      newUri += "/" + primaryKeyName + "/" + primaryKeyValue;
    }
  }
  newUri += "." + outputFormat;

  return newUri;
}

module.exports = {
  getTargetUri: getTargetUri
};
