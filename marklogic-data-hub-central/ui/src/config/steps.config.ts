// Configuration information for steps (Load, Mapping, Matching, Merging, Custom)

const invalidJSONMessage = "Invalid JSON";
const stagingDb = "data-hub-STAGING";
const finalDb = "data-hub-FINAL";
const defaultTargetPerms = "data-hub-common,read,data-hub-common,update";
const validCapabilities = ["read", "update", "insert", "execute"];
const defaultSourceFormat = "json";
const defaultTargetFormat = "JSON";
const defaultProvGran = "off";
const defaultValidateEntity = "doNotValidate";
const defaultBatchSize = 100;
const defaultSelectedSource = "collections";
const defaultFieldSeparator = ",";

export default {
    invalidJSONMessage,
    stagingDb,
    finalDb,
    defaultTargetPerms,
    validCapabilities,
    defaultSourceFormat,
    defaultTargetFormat,
    defaultProvGran,
    defaultValidateEntity,
    defaultBatchSize,
    defaultSelectedSource,
    defaultFieldSeparator,
};
