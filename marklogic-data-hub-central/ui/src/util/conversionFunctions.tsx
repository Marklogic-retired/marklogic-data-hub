const convertDateFromISO = (InputDate) => {
  let date = new Date(InputDate);
  let year = date.getFullYear();
  let month: any = date.getMonth() + 1;
  let dt: any = date.getDate();
  let hr = date.getHours();
  let min: any = date.getMinutes();
  let dayTime = (hr < 12 && hr >= 0) ? 'AM' : 'PM';

  if (dt < 10) {
    dt = '0' + dt;
  }
  if (month < 10) {
    month = '0' + month;
  }
  if (hr == 0) {
    hr = 12;
  }
  if (hr > 12) {
    hr = hr - 12;
  }
  if (min < 10) {
    min = '0' + min;
  }


  return (month + '/' + dt + '/' + year + ' ' + hr + ':' + min + dayTime);

};

const sortStepsByUpdated = (stepData) => {
    let sortedData = stepData.sort((step1, step2) => {
        if(step1.lastUpdated > step2.lastUpdated){
            return -1;
        }

        if(step1.lastUpdated < step2.lastUpdated){
            return 1;
        }
    });
    return sortedData;
};

const getInitialChars = (str, num, suffix) => {
  suffix = suffix ? suffix : '...';
  let result = str;
  if (typeof str === 'string' && str.length > num) {
    result = str.substr(0, num) + suffix;
  }
  return result;
};

const extractCollectionFromSrcQuery = (query) => {
  if (query.includes('[') && query.includes(']')) {
    let srcCollection = query.substring(
      query.lastIndexOf("[") + 2,
      query.lastIndexOf("]") - 1
    );
    return getInitialChars(srcCollection, 30, '...');
  } else if (query.includes('(') && query.includes(')')) {
    let srcCollection = query.substring(
      query.lastIndexOf("(") + 2,
      query.lastIndexOf(")") - 1
    );
    return getInitialChars(srcCollection, 30, '...');
  }
  else {
    return getInitialChars(query, 30, '...');
  }
};

const getLastChars = (str, num, prefix) => {
  prefix = prefix ? prefix : '...';
  let result = str;
  if (typeof str === 'string' && str.length > num) {
    result = prefix + str.substr(str.length - num);
  }
  return result;
};

const formatCardUri = (str) => {
  if (str.length <= 25) {
    return str;
  } else {
    return str.substring(0, 5).concat('...').concat(str.substring(str.length -20));
  }
};

export {
  convertDateFromISO,
  getInitialChars,
  getLastChars,
  formatCardUri,
  extractCollectionFromSrcQuery,
  sortStepsByUpdated
};
