const DataHubSingleton = require("/data-hub/5/datahub-singleton.sjs");
const datahub = DataHubSingleton.instance();

//Here we should receive a sequence of values, not a content object
function main(values, options) {
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
    }
  }
  return null;
}

module.exports = {
  main: main
};
