const esMappingLib = require("/data-hub/5/builtins/steps/mapping/entity-services/lib.sjs");
const test = require("/test/test-helper.xqy");

const xpathFunctions = esMappingLib.getXpathMappingFunctions();
const mlFunctions = esMappingLib.getMarkLogicMappingFunctions();
[
  test.assertTrue(findFunction("sum") != null),
  test.assertTrue(findFunction("distinct-values") == null),
  test.assertTrue(findFunction("base-uri") == null),
  test.assertTrue(findFunction("document-uri") == null),
  test.assertTrue(findFunction("sum")["signature"].includes("sum")),
  test.assertTrue(findFunction("fn:sum") == null, "'fn:' has been stripped from the function name and signature"),
  test.assertTrue(echoCount() == 1 || echoCount() == 0, "echo() function if present should be present only once"),
  test.assertTrue(xpathFunctions.length >= 116,
    "As of 10.0-4 server, there are 116 mapping xpath functions (accounting for all excluded ones); " +
    "there may be more in a future version, but we expect at least that many to exist; actual length: " + xpathFunctions.length),

  test.assertTrue(mlFunctions.length >= 4,
    "There are 4 OOTB mapping functions that are being shipped with DHF; there may be more from other tests in the suite, " +
    "but we expect at least those 4 to exist. Found " + mlFunctions.length)
];
function findFunction(functionName){
  return xpathFunctions.find(func => {
    return func.functionName == functionName
  });
}

function echoCount(){
  let count = 0;
  mlFunctions.forEach((func) =>{
    if(func.functionName == 0){
      count ++;
    }
  })
  return count;
}
