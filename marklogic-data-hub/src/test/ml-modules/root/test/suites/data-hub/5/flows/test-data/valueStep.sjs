const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();
const expectedValues = "comma-separatedurisofrecordstoprocess";
//Here we should receive a sequence of values, not a content object
function main(values, options) {
  let concatString = "";
  //check to see how many values we have, we should have more than 1
  if(fn.count(values) < 2) {
    throw Error("Fewer than expected values passed in");
  }
  //we should be able to loop through the list of values and identify them as strings
  for(let value of values){
    //normalize it to the value from a value object
    let valueNormalized = value.valueOf();
    //now we check to make sure its of type string, as it should be from the uri lexicon
    //if not, toss an error
    if(!valueNormalized instanceof String){
      let errMsg = valueNormalized + ' is not a string value.';
      datahub.debug.log({message: errMsg, type: 'error'});
      throw Error(errMsg);
    } else {
    concatString += valueNormalized;
    }
  }
  if(concatString !=  expectedValues) {
          datahub.debug.log({message: "Expected concat of values did not match.", type: 'error'});
          throw Error("Expected concat of values did not match. Got: " +concatString + " but was expecting:" + expectedValues);
  }

  return null;
}

module.exports = {
  main: main
};
