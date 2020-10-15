const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

function invokeService() {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/mapping/getMappingFunctions.sjs",
    {}
  ));
}

const mapFuncs = invokeService();
const funcNames = Object.keys(mapFuncs);
const assertions = [
  test.assertTrue(funcNames.length >= 100),
  test.assertTrue(mapFuncs["sum"] != null),
  test.assertTrue(mapFuncs["sum"]["signature"].includes("sum")),
  test.assertTrue(mapFuncs["current-dateTime"] != null),
  test.assertTrue(mapFuncs["fn:sum"] == null, "'fn:' has been stripped from the function name and signature"),
  test.assertTrue(isAlphabeticallySorted())
];

const functionsThatDontWork = esMappingLib.getXpathFunctionsThatDoNotWorkInMappingExpressions();
functionsThatDontWork.forEach(functionName => {
  assertions.push(
    test.assertFalse(mapFuncs.hasOwnProperty(functionName), "Expected function to not be available for mapping expressions: " + functionName)
  );
})
function isAlphabeticallySorted(){
  for(let i =0; i< funcNames.length; i++){
    if(!(i == 0 || funcNames[i].toLowerCase() > funcNames[i-1].toLowerCase())){
      return false;
    }
  }
  return true;
}

assertions;

