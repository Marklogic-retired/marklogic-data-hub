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
    let info = {};
    for (let [key, value] of Object.entries(data.properties)) {
      for (let [jKey, jValue] of Object.entries(value)) {
        let properties = {
          name: key,
          ref: jValue
        }
        info = {
          ...data.info,
          language: data.language,
          schema: data.$schema,
          properties: {...properties}
        }
      }
    }

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
              let refItem = {};
              if (jKey === 'items'){
                for (let [iKey, iValue] of Object.entries(jValue)) {
                  if(iKey === 'properties') {
                    for (let [yKey, yValue] of Object.entries(iValue)) {
                      let refname = { name: yKey };
                      Object.assign(refItem, refname);
                      for (let [zKey, zValue] of Object.entries(yValue)) {
                        let key = zKey;
                        let value = zValue;
                        if (key === '$ref') {
                          key = 'refPath';
                        }
                        let propertyParameter = { [key]: value};
                        Object.assign(refItem, propertyParameter);
                      }
                    }
                  }
                  propertyObject = {...propertyObject, refItem};
                }
              } else {
                let propertyParameter = { [key]: value};
                Object.assign(propertyObject, propertyParameter);
              }
            }
            definition.properties.push(propertyObject);
          }
        } else {
          definition = {...definition, [dKey]: dValue};
        }
      }
      entityDefinitions.push(definition)
    }
    return {...info, entityDefinitions};
  },
  convertPureJSON: (data) => {
    // console.log('Pure JSON Data', data);
  }
}