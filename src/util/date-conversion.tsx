let latestJobError = 'Never been run';

export const dateConverter = (date:string) => {
    var moment = require('moment');
    return moment(date).format("YYYY-MM-DD HH:mm");
}

export const relativeTimeConverter = (date:string) => {
    let moment = require('moment');
    if(moment(date).isValid()){
        return moment(date).startOf('hour').fromNow();
    }
    else{
        return latestJobError;
    }
}

