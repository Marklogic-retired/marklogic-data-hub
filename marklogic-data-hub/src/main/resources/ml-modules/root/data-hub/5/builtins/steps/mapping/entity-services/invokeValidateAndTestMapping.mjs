import esMappingLib from "/data-hub/5/builtins/steps/mapping/entity-services/lib.mjs";

const input = external.input;
const uri = external.uri;

esMappingLib.validateAndTestMapping(input.toObject(), uri);
