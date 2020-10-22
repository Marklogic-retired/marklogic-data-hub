const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

function invokeService() {
  return fn.head(xdmp.invoke(
    "/data-hub/5/data-services/mapping/getMappingFunctions.sjs",
    {}
  ));
}

const mapFuncs = invokeService();
function getFunctionInfo(functionName){
  return mapFuncs.find(func => {
    return func.functionName == functionName
  });
}

let sumFunc = getFunctionInfo("sum");
let currentDatetime = getFunctionInfo("current-dateTime");
const assertions = [];
assertions.push(
  test.assertTrue(mapFuncs.length >= 100),
  test.assertTrue(sumFunc != null),
  test.assertTrue(sumFunc["signature"].includes("sum")),
  test.assertTrue(currentDatetime != null),
  test.assertTrue(mapFuncs["fn:sum"] == null, "'fn:' has been stripped from the function name and signature"),
  test.assertTrue(isAlphabeticallySorted())
);

const functionsThatDontWork = esMappingLib.getXpathFunctionsThatDoNotWorkInMappingExpressions();
functionsThatDontWork.forEach(functionName => {
  assertions.push(
    test.assertFalse(mapFuncs.hasOwnProperty(functionName), "Expected function to not be available for mapping expressions: " + functionName)
  );
})
function isAlphabeticallySorted(){
  for(let i =0; i< mapFuncs.length; i++){
    if(!(i == 0 || String(mapFuncs[i].functionName).toLowerCase() > String(mapFuncs[i-1].functionName).toLowerCase())){
      test.fail( String(mapFuncs[i].functionName).toLowerCase() + "," +
        String(mapFuncs[i-1].functionName).toLowerCase() + " are not sorted alphabetically. Complete mapping functions:" + JSON.stringify(mapFuncs));
    }
  }
  return true;
}

assertions;

