
function get(context, params) {
    const rdt = require('/MarkLogic/redaction');
    const jsearch = require('/MarkLogic/jsearch'); 
      
//defining the data we want extracted and returned
const query = params.q
const claims = jsearch.collections('ClaimFHIR');
//defining the custom grammar components
const myGrammar = {};
let searchQuery = cts.andQuery([cts.parse(query, myGrammar), cts.collectionQuery('ClaimFHIR') ]);
let estimate = cts.estimate(searchQuery);
// Use jSearch query to get all Claims documents for given parameter
let claimDocs =
  claims.documents()
    .where(cts.parse(query, myGrammar))
    .slice(0,fn.number(estimate))
    .result(); 
if (claimDocs.results == null) {
  // ABORT
  return {result: "No claims found matching query: '"+params.q+"'"}
}

//get all the patientIds array for all patient's claims for given parameter
let patientArray = [];
let patientid = "";
 for (var doc of claimDocs.results){
  patientid = doc.document.envelope.instance.ClaimFHIR.patient;
  patientArray.push(patientid)
}
// check user-roles and if user has redaction-user role than redact the document else no redaction
let roles = xdmp.getCurrentRoles()
let isRedactionUser = false ;
let roleNames = [];
for (var role of roles) { 
  roleNames.push(xdmp.roleName(role))  
  if(xdmp.roleName(role) == 'redaction-user'){
    isRedactionUser = true
  }
}
if (isRedactionUser){
        var memberDocs =  rdt.redact(cts.search(cts.andNotQuery(cts.andQuery(
        [cts.collectionQuery('sm-Member-mastered'),
         cts.wordQuery(patientArray)]),
         cts.jsonPropertyValueQuery("PrimaryInsuredId", patientArray)))
         ,"member-redaction") } 
else {
    return {result: "No results as user: "+xdmp.getCurrentUser()+" doesn't have the redaction permission"}
} 
// iterate thru each Redacted Member Doc and get the ONLY required properties of Member Entity
let resultMembers = [];
for (var member of memberDocs) {
  resultMembers.push({
    "DocURI": fn.documentUri(member),
    "User": xdmp.getCurrentUser(),
    "IsRedactionUser": isRedactionUser,
    "Member-Redacted": member.root.envelope.instance.Member
    }); 
} 
return resultMembers
}; 
  exports.GET = get;