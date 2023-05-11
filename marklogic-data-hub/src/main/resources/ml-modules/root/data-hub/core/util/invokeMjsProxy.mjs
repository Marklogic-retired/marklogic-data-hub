import hubUtils from "/data-hub/5/impl/hub-utils.mjs";

const modulePaths = external.modulePaths;

const result = hubUtils.requireMjsModules(...modulePaths);

result;
