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

  let instance = {"Admission" : datahub.flow.flowUtils.getInstance(doc).toObject() } || {};
  let triples = datahub.flow.flowUtils.getTriples(doc) || [];
  let headers = datahub.flow.flowUtils.getHeaders(doc) || {};

  instance['$attachments'] = doc.envelope.instance;


   //let's assemble our admissions here, first we grab the patient and admission ID
  let patientID = instance.Admission.PatientID;
  let admissionID = instance.Admission.AdmissionID;

  //now, we search for the labs that match this patient ID and admission ID, then add those
  let diagnosesDocs = cts.search(cts.andQuery([cts.jsonPropertyRangeQuery('PatientID', '=', patientID), cts.jsonPropertyRangeQuery('AdmissionID', '=',admissionID),cts.collectionQuery(['DiagnosesCore'])]))

  const Diagnoses  = [];
                for (const diagnosisDoc of diagnosesDocs) {
                  let diagnosis = {};
                  diagnosis.PrimaryDiagnosisCode = diagnosisDoc.xpath('//PrimaryDiagnosisCode');
                  diagnosis.PrimaryDiagnosisDescription = diagnosisDoc.xpath('//PrimaryDiagnosisDescription');
                  Diagnoses.push({'Diagnosis' : diagnosis});
                };

  instance.Admission.Diagnoses = Diagnoses;

  //time to grab the labs and do the same thing
  let labsDocs = cts.search(
                  cts.andQuery([
                    cts.jsonPropertyRangeQuery('PatientID', '=', patientID),
                    cts.jsonPropertyRangeQuery('AdmissionID', '=',admissionID),
                    cts.collectionQuery(['LabsCore'])
                  ])
                 )

  const Labs  = [];
                for (const labDoc of labsDocs) {
                  let lab = {};
                  lab.Name = labDoc.xpath('//LabName');
                  lab.Value = labDoc.xpath('//LabValue');
                  lab.Units = labDoc.xpath('//LabUnits');
                  lab.Datetime = labDoc.xpath('//LabDateTime')
                  Labs.push({'Lab' : lab });
                };

  instance.Admission.Labs = Labs;

  //delete PatientID, since we only want AdmissionID, startdate and enddate from Admissions entity
  delete instance.Admission.PatientID;
  instance.info = {
                "title": "Admission",
                "version": "0.0.1"
                };

  //form our envelope here now, specifying our output format
  let envelope = datahub.flow.flowUtils.makeEnvelope(instance, headers, triples, outputFormat);

  //assign our envelope value
  content.value = envelope;

  //assign the uri we want
  content.uri = '/admissionComplete' + content.uri;

  return content;
}

module.exports = {
  main: main
};
