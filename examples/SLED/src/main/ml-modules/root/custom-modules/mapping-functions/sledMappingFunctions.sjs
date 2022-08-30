'use strict';
const config = require('/com.marklogic.hub/config.sjs')

function getPossibleAddress2(Address1, Address2){
  Address1 = fn.string(Address1);
  Address2 = fn.string(Address2);
  if (Address2 == ""){
    const removePunctRegex = /[.,\/&;:\-_()]/g
    let nopunct = Address1.replace(removePunctRegex, " ");
    let lessspace = fn.normalizeSpace(nopunct);
    let result = '';
    let unitpart2 = '';
    let unitpart3 = '';
    let unitPrefix = '';
    let unitSuffix = '';
    const findUnitRegex = /(.*) (Apt|apt|No|no|Unit|unit|#)(.*)/i;   //   <address no unit part> [space] <QuadrantValue> [space] <rest>
    let unitCapture = lessspace.match(findUnitRegex);
    if (unitCapture == null){
      return result
    }else{
      unitpart2 = unitCapture[2];
      unitpart3 = unitCapture[3];
      const UnitRegex = /(Apt|apt|No|no|Unit|unit|#).*/i;
      unitPrefix = unitpart2.replace(UnitRegex, "Unit ");
      if (unitpart3 == null){
        result = unitPrefix
      } else{
        unitSuffix = fn.normalizeSpace(unitpart3)
        result = unitPrefix.concat(unitSuffix)
      }
      return result
    }
  } else{
    return Address2
  }
}

function getAddress1Normalized(Address1){
  Address1 = fn.string(Address1);
  if (Address1 == ""){
    return Address1 //fn.generateId([Address1]);
  } else{
    const removePunctRegex = /[.,\/&;:\-_()]/g     // [alts for punct we remove in square brackets]
    let nopunct = Address1.replace(removePunctRegex, " ");
    let lessspace = fn.normalizeSpace(nopunct);
    const findUnitRegex = /(.*) ((Apt|No|Unit|#).*)/i;   //   <address no unit part> [space] <unit word><unit rest>
    let streetPart = '';
    let unitPart = '';
    let unitCapture = lessspace.match(findUnitRegex);
    if (unitCapture == null){
      streetPart = lessspace;
    } else {
      streetPart = unitCapture[1];   // unitcapture[0] is the full match string [1] is the first capture group match
      unitPart = unitCapture[2];     // need if check...
    }
    const AveRegex = / (AV|Ave|AVENUE|AVEN|AV|AVENU|AVN|AVNUE|ave|av).*/i;
    const StRegex = / (St|Str|Strt|st|str).*/i;
    const BlvdRegex = / (Blvd|Boul|Boulv|Boulevard|blvd|bou|blv).*/i;
    const AnexRegex = / (AN|Annex|Anex|Annx|Anx|Annex|anx).*/i;

    var standardStreet = streetPart.replace(AveRegex, " Avenue");
    standardStreet = standardStreet.replace(StRegex, " Street");
    standardStreet = standardStreet.replace(BlvdRegex, " Boulevard");
    standardStreet = standardStreet.replace(AnexRegex, " Anex");

    return standardStreet;
  }
}

function getAddress2Normalized(Address2){
  Address2 = fn.string(Address2);
  let result = ''
  if (Address2 == ""){
    result = Address2 //fn.generateId([Address2]);
  }else{
    const removePunctRegex = /[.,\/&;:\-_()]/g     // [alts for punct we remove in square brackets]
    let nopunct = Address2.replace(removePunctRegex, " ");
    let lessspace = fn.normalizeSpace(nopunct);
    const findUnitRegex = /(.*)(Apt|apt|No|no|Unit|unit|#)(.*)/i;
    let unitpart0 = '';
    let unitpart1 = '';
    let unitpart2 = '';
    let unitpart3 = '';
    let unitCapture = lessspace.match(findUnitRegex);
    if (unitCapture == null){
      unitpart2 = lessspace;
    } else {
      unitpart0 = unitCapture[0];
      unitpart1 = unitCapture[1];
      unitpart2 = unitCapture[2];
      unitpart3 = unitCapture[3];
    }
    const UnitRegex = /(Apt|apt|No|no|Unit|unit|#).*/i;

    let unitPrefix = '';
    let unitSuffix = '';

    unitPrefix = unitpart2.replace(UnitRegex, "Unit ");
    if (unitpart3 == null){
      result = unitPrefix
    }else{
      unitSuffix = fn.normalizeSpace(unitpart3)
      result = unitPrefix.concat(unitSuffix)
    }
  }

  return result;
}

function checkAddress2(addr1, addr2){
  addr2 = fn.string(addr2);
  addr1 = fn.string(addr1);
  if (addr2 == "")	{
    return(getPossibleAddress2(addr1))
  } else {
    return(getAddress2Normalized(addr2));
  }
}

function checkUndefined(value){
  if (value == "")	{
    return 'undefined'
  } else {
    return value;
  }
}

function addToDictionary(text,dictionaryname){
  let dictionaryuri = '/customDictionary/' + dictionaryname + '.json'
  xdmp.invokeFunction(() => updateDict(text, dictionaryuri ),{database: xdmp.database(config.FINALDATABASE)})
  return text
}

function updateDict(text,dictionaryuri){
  declareUpdate();
  var spell = require("/MarkLogic/spell");
  text = fn.string(text);
  spell.addWord( dictionaryuri, text)
}

function customHash64(str){
  if(str instanceof NullNode) {
    return null;
  }
  if (str==null) {
    return 'null';
  }
  if (str=='') {xdmp.log('empty str'); return '';}
  let v = ""+xdmp.hash64(str);
  return v;
}

function getDayOfDOB(DOB){
  DOB = fn.string(DOB);
  if (DOB == ""){
    return DOB //fn.generateId([DOB]);
  }else {
    let dobs = fn.tokenize(DOB, "/").toArray()
    let day = dobs[1]
    day = fn.concat(fn.substring('00',1,(2-fn.stringLength(day))),day);
    return day;
  }
}

function getDOBNormalized(DOB){
  DOB = fn.string(DOB);
  if (DOB == ""){
    return fn.generateId([DOB]);
  }else {
    return DOB;
  }
}

function getFirstLastNameSorted(FirstName, LastName){
  let fname = fn.string(FirstName);
  let lname = fn.string(LastName);
  let sortedName = fn.tokenize(fn.concat(fname,' ',lname),' ');
  let arrayname = sortedName.toArray();
  sortedName = arrayname.sort().toString();
  let result = ''
  return result = sortedName
}

function getFirstNameNormalized(FirstName){
  FirstName = fn.string(FirstName);
  let result = '';
  if (FirstName == ""){
    result=FirstName //fn.generateId([FirstName]);
  }else{
    const removePunctRegex = /[.,\/&;:\-_()]/g
    let nopunct = FirstName.replace(removePunctRegex, "");
    let lessspace = fn.normalizeSpace(nopunct);
    let nameparts = fn.tokenize(lessspace, " ").toArray();
    let firstnamepart0 = nameparts[0];
    let firstnamepart1 = nameparts[1]
    result = firstnamepart0
  }
  return result;
}

const core = require('/data-hub/5/mapping-functions/core-functions');
function getGenderNormalized(gender){
  gender = fn.string(gender);
  if (gender == ""){
    gender = gender //fn.generateId([gender]) ;
    return gender;
  }	else{
    let genderMap =  {"m": "Male", "male": "Male", "guy": "Male", "f": "Female", "girl": "Female", "female": "Female",
      "unknown": "Unknown", "unk": "Unknown", "u": "Unknown", "unkown": "Unknown"}
    return core.memoryLookup((gender), JSON.stringify(genderMap))
  }
}

function getLastNameNormalized(LastName){
  LastName = fn.string(LastName)
  let result = '';
  if (LastName == ""){
    result=LastName //fn.generateId([LastName]);
  }else{
    const removePunctRegex = /[.,\/&;:\-_()]/g
    let nopunct = LastName.replace(removePunctRegex, "");
    let lessspace = fn.normalizeSpace(nopunct);
    let nameparts = fn.tokenize(lessspace, " ").toArray();
    let lastnamepart0 = nameparts[0];
    let lastnamepart1 = nameparts[1]
    result = lastnamepart0
  }
  return result;
}

function getMonthOfDOB(DOB){
  DOB = fn.string(DOB);
  if (DOB == ""){
    return DOB //fn.generateId([DOB]);
  }else {
    let dobs = fn.tokenize(DOB, "/").toArray()
    let month = dobs[0]
    month = fn.concat(fn.substring('00',1,(2-fn.stringLength(month))),month);
    return month;
  }
}

function getPossibleLastName(FirstName, LastName){
  FirstName = fn.string(FirstName);
  LastName = fn.string(LastName);
  let result = '';
  if (LastName == "") {
    if (FirstName == ""){
      result=LastName //fn.generateId([LastName]);
    }else{
      const removePunctRegex = /[.,\/&;:\-_()]/g
      let nopunct = FirstName.replace(removePunctRegex, "");
      let lessspace = fn.normalizeSpace(nopunct);
      let nameparts = fn.tokenize(lessspace, " ").toArray();
      let firstnamepart0 = nameparts[0];
      let firstnamepart1 = nameparts[1];
      if (firstnamepart1 !== null){
        result = firstnamepart1
      } else{
        result = fn.generateId([LastName]);
      }

    }
  } else{
    result = LastName;
  }
  return result;
}

function getPossibleQuadrant(Address1){
  Address1 = fn.string(Address1);
  const removePunctRegex = /[.,\/&;:\-_()]/g
  let nopunct = Address1.replace(removePunctRegex, " ");
  let lessspace = fn.normalizeSpace(nopunct);
  let result = 'undefined';
  const findQuadRegex = /(.*) (NE|NW|SE|SW)(.*)/i;   //   <address no unit part> [space] <QuadrantValue> [space] <rest>
  let quadCapture = lessspace.match(findQuadRegex);
  if (quadCapture == null){
    return result
  }else{
    result = quadCapture[2]
    return result
  }
}

function getPossibleQuadrant2(Address1, Quad){
  Address1 = fn.string(Address1);
  Quad = fn.string(Quad);
  if (Quad == ""){
    const removePunctRegex = /[.,\/&;:\-_()]/g
    let nopunct = Address1.replace(removePunctRegex, " ");
    let lessspace = fn.normalizeSpace(nopunct);
    let result = 'undefined';
    const findQuadRegex = /(.*) (NE|NW|SE|SW)(.*)/i;   //   <address no unit part> [space] <QuadrantValue> [space] <rest>
    let quadCapture = lessspace.match(findQuadRegex);
    if (quadCapture == null){
      return Quad //fn.generateId([Quad]);
    }else{
      result = quadCapture[2]
      return result
    }
  }else{
    return Quad
  }
}

function getRaceNormalized(race){
  race = fn.string(race);
  if (race == ""){
    race = race //fn.generateId([race]) ;
    return race
  } else {
    let raceMap =  {"white": "White", "w": "White", "black": "Black", "b": "Black", "african american": "African American", "hispanic": "Hispanic",
      "latino": "Hispanic", "h": "Hispanic", "l": "Hispanic", "asian": "Asian", "a": "Asian", "american indian": "Native American",
      "native american": "Native American", "alaska native": "Native American", "native hawaiian": "Native Hawaiian",
      "other pacific islander": "Native Hawaiian", "pacific islander": "Native Hawaiian",
      "other": "Other", "unknown": "Unknown", "unk": "Unknown", "u": "Unknown", "unkown": "Unknown"}
    return core.memoryLookup((race), JSON.stringify(raceMap))
  }
}

function getSSNNormalized(SSN){
  SSN = fn.string(SSN);
  if (SSN == ""){
    return '';
//    return fn.generateId([SSN]);
  }else {
    return SSN;
  }
}

function getYearOfDOB(DOB){
  DOB = fn.string(DOB);
  if (DOB == ""){
    return DOB //fn.generateId([DOB])
  }else {
    let dobs = fn.tokenize(DOB, "/").toArray()
    let year = dobs[2]
    year = fn.concat(fn.substring('0000',1,(4-fn.stringLength(year))),year);
    return year;
  }
}

function getZip5Normalized(Zip5){
  Zip5 = fn.string(Zip5);
  if (Zip5 == ""){
    return Zip5 //fn.generateId([Zip5]);
  }else {
    Zip5 = fn.concat(fn.substring('00000',1,(5-fn.stringLength(Zip5))),Zip5);
    return Zip5;
  }
}
const sem = require("/MarkLogic/semantics.xqy");

// this function looks for a triple in the ICD-10 Ontology with a code value and returns the subject IRI as a string
function lookupICD10(code) {
  const triple = fn.head(xdmp.invokeFunction(() => cts.triples(null, null, fn.string(code), "=", [], cts.collectionQuery("ICD-10")), { database: xdmp.database(config.FINALDATABASE) }));
  return fn.exists(triple) ? fn.string(sem.tripleSubject(triple)): "";
}

module.exports = {
  addToDictionary,
  checkAddress2,
  checkUndefined,
  customHash64,
  getAddress1Normalized,
  getAddress2Normalized,
  getDayOfDOB,
  getDOBNormalized,
  getFirstLastNameSorted,
  getFirstNameNormalized,
  getGenderNormalized,
  getLastNameNormalized,
  getMonthOfDOB,
  getPossibleLastName,
  getPossibleAddress2,
  getPossibleQuadrant,
  getPossibleQuadrant2,
  getRaceNormalized,
  getSSNNormalized,
  getYearOfDOB,
  getZip5Normalized,
  lookupICD10
}