/*
  Copyright 2012-2019 MarkLogic Corporation

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

const DataHub = require("/data-hub/5/datahub.sjs");
const datahub = new DataHub();

function main(content, options) {

  let outputFormat = options.outputFormat ? options.outputFormat.toLowerCase() : datahub.flow.consts.DEFAULT_FORMAT;

  let doc = content.value;
  if (doc && (doc instanceof Document || doc instanceof XMLDocument)) {
    doc = fn.head(doc.root);
  }

  let instance = {'Patients':{}};
  let triples = datahub.flow.flowUtils.getTriples(doc) || [];
  let headers = datahub.flow.flowUtils.getHeaders(doc) || {};

  instance['$attachments'] = doc.envelope.instance.toObject();

  //let's assemble our patients here, first we grab the patient ID
  let patientID = doc.envelope.instance.PatientID;

  //now, we search for the admissions docs that match this patient ID and harmonize
  let admissionsDocs = cts.search(cts.andQuery([cts.jsonPropertyRangeQuery('PatientID', '=', patientID),cts.collectionQuery(['CompletedAdmissions'])]));

  const admissions  = [];
	for (const admissionDoc of admissionsDocs) {
	  let admission = admissionDoc.xpath('/envelope/instance').toObject()[0];
	  admissions.push(admission);
	};

   instance.Patients.admissions = admissions;

   instance.Patients.PatientID = doc.envelope.instance.PatientID;
   instance.Patients.gender = doc.envelope.instance.PatientGender;
   instance.Patients.dob = doc.envelope.instance.PatientDateOfBirth;
   instance.Patients.race = doc.envelope.instance.PatientRace;
   instance.Patients['marital-status'] = doc.envelope.instance.PatientMaritalStatus;
   instance.Patients.language = doc.envelope.instance.PatientLanguage;
   instance.Patients.percentagebelowpoverty = xs.decimal(doc.envelope.instance.PatientPopulationPercentageBelowPoverty);

   instance.info = {
	"title": "Patients",
	"version": "0.0.1"
	};

  //form our envelope here now, specifying our output format
  let envelope = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  //assign our envelope value
  content.value = envelope;

  //assign the uri we want, in this case the same
  content.uri = '/patients/admissions'+content.uri;

  return content;
}

module.exports = {
  main: main
};
