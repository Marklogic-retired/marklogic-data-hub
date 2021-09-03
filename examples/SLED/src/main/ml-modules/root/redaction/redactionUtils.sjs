
function pick(arr) {
    return arr[xdmp.random(arr.length - 1)]; // random(n) gives values 0-n inclusive, so reduce by 1
}

function textNode(val) {
    const builder = new NodeBuilder();
    builder.addText(val);
    return builder.toNode();
};

/** 
 * take in a date matching an xquery format pattern, parse it, add days, and reformat 
 * in the same string pattern. 
 * dateString - string formatted date
 * days - numeric number of days
 * pattern - conforms to https://www.w3.org/TR/xslt20/#date-picture-string
 * throws an error if the days or pattern is missing, or the date does not match the pattern/picture
 */
function addDaysDateString(dateString, days, pattern) { 
    if (days != 0 && !days) throw "Days not supplied to addDaysDateString. days param="+days;
    if (!dateString) throw "dateString not supplied to addDaysDateString. days param="+dateString;
    pattern = pattern || "[Y0001]-[M01]-[D01]"; // default pattern is ISO yyyy-mm-dd
    let date_xs = null;
    try{ 
        date_xs = xdmp.parseDateTime(pattern, dateString);   
    } catch (e) {
        throw "Unable to parse and convert dates. input="+ dateString+ " pattern="+pattern + " messsag="+ e.message;
    }
    const date = new Date(date_xs);
    const newDate = addDays(date, days);    
    let newDate_xs = xs.dateTime(newDate);
    return fn.formatDateTime(newDate_xs, pattern);
}
  

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

exports.textNode = textNode;
exports.pick = pick;
exports.addDaysDateString = addDaysDateString;