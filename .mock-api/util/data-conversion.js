module.exports = {
  convertJSON: (data) => {
    const info = data.info;
    let entityDefinitions = [];
    for (let [key, value] of Object.entries(data.definitions)) {
      let definition = {
        name: key,
        properties: []
      }
    
      for (let [dKey, dValue] of Object.entries(value)) {
        if(dKey === 'properties') {
          for (let [mKey, mValue] of Object.entries(dValue)) {
            let propertyObject = { name: mKey };
            for (let [jKey, jValue] of Object.entries(mValue)) {
              let key = jKey;
              let value = jValue;
              if (jKey === '$ref') {
                key = 'ref';
              }
              if (jKey === 'items'){
                key = 'ref'
                value = jValue['$ref'];
              }
              let propertyParameter = { [key]: value};
              Object.assign(propertyObject, propertyParameter);
            }
            definition.properties.push(propertyObject);
          }
        } else {
          definition = {...definition, [dKey]: dValue};
        }
      }
      entityDefinitions.push(definition)
    }
    return { ...info, entityDefinitions};
  },
  convertRightNowJSON: (data) => {
    // console.log('Right Now Data', data);
  },
  convertPureJSON: (data) => {
    // console.log('Pure JSON Data', data);
  }
}