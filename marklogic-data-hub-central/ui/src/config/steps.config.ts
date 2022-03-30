// Configuration information for steps (Load, Mapping, Matching, Merging, Custom)

const invalidJSONMessage = "Invalid JSON";
const stagingDb = "data-hub-STAGING";
const finalDb = "data-hub-FINAL";
const defaultTargetPerms = "data-hub-common,read,data-hub-common,update";
const validCapabilities = ["read", "update", "insert", "execute"];
const defaultSourceFormat = "json";
const defaultTargetFormat = "json";
const defaultProvGran = "off";
const defaultValidateEntity = "doNotValidate";
const defaultSourceRecordScope = "instanceOnly";
const defaultBatchSize = 100;
const defaultMergeBatchSize = 1;
const defaultSelectedSource = "collections";
const defaultFieldSeparator = ",";
const toggleSourceRecordScopeMessage = "Changes to the source record scope affect existing mapping expressions. Adjust existing mapping expressions to reflect the new paths to your source fields.";

const defaultPrimaryUri = "$URI";
const defaultRelatedUri = (entityName) => `hubURI('${entityName}')`;

export default {
    invalidJSONMessage,
    stagingDb,
    finalDb,
    defaultTargetPerms,
    validCapabilities,
    defaultSourceRecordScope,
    defaultSourceFormat,
    defaultTargetFormat,
    defaultProvGran,
    defaultValidateEntity,
    defaultBatchSize,
    defaultMergeBatchSize,
    defaultSelectedSource,
    defaultFieldSeparator,
    defaultPrimaryUri,
    defaultRelatedUri,
    toggleSourceRecordScopeMessage
};
