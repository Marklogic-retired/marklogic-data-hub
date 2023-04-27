import esMappingLib from "/data-hub/5/builtins/steps/mapping/entity-services/lib.mjs";
const test = require("/test/test-helper.xqy");

function invokeService(excludeMLMappingFunctions = false) {
  return fn.head(xdmp.invoke(
    "/data-hub/data-services/mapping/getMappingFunctions.mjs",
    {"excludeMLMappingFunctions": excludeMLMappingFunctions}
  ));
}

const mapFuncs = invokeService(false);
function getFunctionInfo(mapFuncs, functionName){
  return mapFuncs.find(func => {
    return func.functionName == functionName
  });
}

const mapFuncsWithoutMLFunctions = invokeService(true);

let sumFunc = getFunctionInfo(mapFuncs,"sum");
let currentDatetime = getFunctionInfo(mapFuncs,"current-dateTime");
const assertions = [];
assertions.push(
  test.assertTrue(mapFuncs.length >= 100, fn.string(mapFuncs.length)),
  test.assertTrue(sumFunc != null),
  test.assertTrue(sumFunc["signature"].includes("sum")),
  test.assertTrue(currentDatetime != null),
  test.assertTrue(mapFuncs["fn:sum"] == null, "'fn:' has been stripped from the function name and signature"),
  test.assertTrue(isAlphabeticallySorted()),
  test.assertTrue(mapFuncsWithoutMLFunctions.length < mapFuncs.length && mapFuncsWithoutMLFunctions.length > 80, fn.string(mapFuncsWithoutMLFunctions.length))
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

