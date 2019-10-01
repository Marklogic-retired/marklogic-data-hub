export const dateConverter = (date:string) => {
    var moment = require('moment');
    return moment(date).format("YYYY-MM-DD HH:mm");
}