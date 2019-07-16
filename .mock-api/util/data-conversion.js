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
    convertedData = {}
    for (let [key, value] of Object.entries(data)) {
       if(key === 'definitions'){
         definitions = []
         for(let [mKey, mValue] of Object.entries(value)){
           definition = {
             name: mKey
           }
           for(let [jKey, jValue] of Object.entries(mValue)){
             if(jKey === 'properties'){
               let properties = []
               for(let [kKey, kValue] of Object.entries(jValue)){
                 let propertyObject = { name: kKey, type: kValue['type']};
                 let key = kKey;
                 let value = kValue;
                
                 if(kValue['items']){
                   let item = {};
                   for (let [iKey, iValue] of Object.entries(kValue['items'])) {
                     if(iKey === 'properties') {
                       for (let [yKey, yValue] of Object.entries(iValue)) {
                         let refname = { name: yKey };
                         Object.assign(item, refname);
                         for (let [zKey, zValue] of Object.entries(yValue)) {
                           if (zKey === '$ref') {
                             let key = 'refPath';
                             let value = zValue;
                             let propertyParameter = { [key]: value};
                             Object.assign(item, propertyParameter);
                           }
                         }
                       }
                     }else{
                       Object.assign(item, {[iKey]: iValue})
                     }
                   }
                   propertyObject = {...propertyObject, item};
                 } else {
                   propertyObject = {...propertyObject, ...value};
                 }
                 properties.push(propertyObject)           
               }
               definition = {...definition, "properties": properties};
             }else if(jKey === '$id'){
               definition = {...definition, 'id': jValue};
             }else{
               definition = {...definition, [jKey]: jValue};
             }
           }
           definitions.push(definition)
         }
         Object.assign(convertedData, {'definitions': definitions})
        
       }else if(key === 'properties'){
         properties = []
         for (let [mKey, mValue] of Object.entries(value)) {
           for (let [jKey, jValue] of Object.entries(mValue)) {
             let property = {
               name: mKey,
               ref: jValue
             }
             properties.push(property);
           }
         }
         Object.assign(convertedData, {'properties': properties})
       }else if(key === '$schema'){
         Object.assign(convertedData, {"schema": value})
       }else if(key === '$id'){
         Object.assign(convertedData, {'id': value})
       }else{
         Object.assign(convertedData,{[key]: value})
       }
   }
   console.log(convertedData)
   return convertedData;
  }
}