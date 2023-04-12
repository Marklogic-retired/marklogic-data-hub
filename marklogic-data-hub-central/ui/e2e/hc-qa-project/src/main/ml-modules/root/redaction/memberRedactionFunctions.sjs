
const ru = require("./redactionUtils.sjs");

const streets = 
    "Main,Elm,First,Second,Third,Fourth,Fifth,Rosewater,Gilsan,Sisson,Hook,Skyway".split(",");

const streetTypes = 
    "Ave,Ave.,Avenue,Avenue,Ave,Avenue,St,St.,St,Street,St,Street,St,Street,St,Street,St,Street,Court,Ct,Lane,Ln".split(",");
    
const firstNames = 
    ("Mohamed, Youssef, Ahmed, Mahmoud, Mustafa, Yassin, Taha, Khaled, Hamza, Bilal, "
    + "Paulos, Petros, Gabreal, Giorgis, Yonas, "
    + "Shaimaa, Fatma, Maha, Reem, Farida, Aya, Shahd, Ashraqat, Sahar, "
    + "Ruth, Mariam, Helen, Christina, Hanna, Naomie, Martha, Meron, "
    + "Liam, Noah, William, James, Logan, Benjamin, Mason, Elijah, Oliver, Jacob, "
    + "James, John, Robert, Michael, William, David, Richard, Charles, Joseph, Thomas, "
    + "Emma, Olivia, Ava, Isabella, Sophia, Taylor, Charlotte, Amelia, Evelyn, Abigail, "
    + "Mary, Patricia, Linda, Barbara, Elizabeth, Jennifer, Maria, Susan, Margaret, Dorothy"
    ).split(", ");

const lastNames = 
    ("Cohen, Levi, Levy, Mizrachi, Mizrahi, Peretz, Biton, Dahan, Avraham, "
     + "Friedman, Feldman, Malka, Malcah, Azoulay, Katz, Yosef, Amar, Omer, "
     + "Smith,, Johnson,, Williams, Brown, Jones, Garcia, Miller, Davis, Rodriguez, Martinez, Hernandez, Lopez, Gonzales, Wilson, Anderson, Thomas, Taylor, Moore, Jackson, Martin, Lee, Perez, Thompson, White, Harris, Sanchez, Clark, Ramirez, Lewis, Robinson, Walker, Young"
    ).split(", ");

/** Deterministic, non-colliding SSN rewrite
 * redact a SSN by moving the digits a known, fixed offset per digit
 *  For increases security, hash the ssn, track all used SSNs and avoid re-using an old SSN
 */
function redactSSN(node) {
    let salt = "93485302945783948734020394857";
    let s = ""+node;
    let chars = [];
    for (var i = 0; i < s.length; i++) {
        let c = s.charAt(i);
        if (c >= '0' && c <= '9') {
            let digit = c - '0';
            let offset = salt.charAt(i) - '0';
            let newDigit = digit + offset;
            newDigit = (newDigit > 9) ? newDigit - 10 : newDigit;
            let newChar = "" + newDigit; 
            chars.push(newChar);
        } else {
            chars.push(c);
        }
    }
    let val = chars.join('');
    return ru.textNode(val);
}

function redactStreetLine1(node) {
    let num = xdmp.random(10000);
    let street = ru.pick(streets);
    let type = ru.pick(streetTypes);
    let val = "" + num + " " + street + " " + type;
    return ru.textNode(val);
}

function redactFirstName(node) {
    return ru.textNode(ru.pick(firstNames));
}

function redactLastName(node) {
    let v = ru.pick(lastNames);
    return ru.textNode(v);
}

function redactDOB(node, options) { 
    // xdmp.log("redacting DOB. input ="+node);
    let diff = options.maxYearsDifferent;
    diff = diff || 3; // default 3 years
    // note: this does not account for leap years so not exactly a +/- 3 years window
    let newDOB = ru.addDaysDateString(node, xdmp.random(365*diff*2) - 365*diff, "[D01]/[M01]/[Y0001]");
    // TODO nice to have a "past" flag in options causing dates to always be in the past
    // xdmp.log("computed new dob: "+newDOB);
    return ru.textNode(newDOB);
  };
  
  // leave the first name, but replace last name with hash symbols
  function redactFullName(node, options) { 
    let str = node.toString(); // probably a TextNode, so get a string. Unsure if this is required or if it will coerce.
    let secondWord = str.split(' ')[1]
    let redacted = str.replace(secondWord, "########")
    if (secondWord == null) { redacted = "###"} // if there is just one token, redact it all
    return ru.textNode(redacted);
  };

exports.redactStreetLine1 = redactStreetLine1;
exports.redactFirstName = redactFirstName;
exports.redactLastName = redactLastName;
exports.redactDOB = redactDOB;
exports.redactSSN = redactSSN;
exports.redactFullName = redactFullName;
