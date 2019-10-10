export const relativeTimeConverter = (date:string) => {
    var moment = require('moment');
    return moment(date).startOf('hour').fromNow()
}