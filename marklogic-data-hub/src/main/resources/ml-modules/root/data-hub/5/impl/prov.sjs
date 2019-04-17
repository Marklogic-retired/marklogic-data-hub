/**
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
'use strict';
const defaultConfig = require("/com.marklogic.hub/config.sjs");
const ps = require('/MarkLogic/provenance');
const op = require('/MarkLogic/optic');

class Provenance {
  /**
   * @desc Provenance Class constructor
   * @param {Object} [config] 
   * @param {string} [config.granularityLevel=coarse] - for setting the Prov object granularity level (currently unused)
   */
  constructor(config = null, datahub = null) {
    this.granularityLevels          = ['fine','coarse'];
    this.config = {};
    this.config.granularityLevel    = config && config.granularityLevel || 'coarse';
    this.config.JOBDATABASE         = defaultConfig.JOBDATABASE || 'data-hub-JOBS';
    this.config.autoCommit          = config && config.autoCommit !== undefined ? config.autoCommit : true;
    this.config.commitQueue         = [];
    if (datahub) {
      this.hubutils = datahub.hubUtils;
    } else {
      this.hubutils = {
        capitalize: (str) => { return (str) ? str.charAt(0).toUpperCase() + str.slice(1) : str; }
      };
    }
  }  

  /**
   * Get array of provTypes for a given step type for provenance record creation
   * @param {string} stepDefinitionType - step definition type ['ingestion','mapping','mastering','custom']
   */
  _validStepDefinitionType(stepDefinitionType) {
    return ['ingestion','mapping','mastering','custom'].includes(stepDefinitionType)
  }
  /**
   * Validate that the info Object to ensure the metadata passed doesn't stomp on roles or location values
   * @param {Object} info - object representing the information required to create prov info
   */
  _validProvInfoMetadata(info) {
    let protectedAttributeProps = ['roles', 'roleNames', 'location'];
    let isValid = info && info.metdata ? 
      info.metdata.every(val => !(protectedAttributeProps.includes(val))) :
      true;  // safe, because no metadata
    return isValid || Error(`The following metadata properties on "info" are not allowed: ${JSON.stringify(requiredInfoParams[stepType])}`);
  }

  /**
   * Validate that the info Object
   * @param {string} stepDefinitionType - step type ['ingestion','mapping','mastering','custom']
   * @param {Object} info - object representing the information required to create prov info
   */
  _validProvInfoForStepType(stepDefinitionType, info) {
    let requiredInfoParams = { 
      'ingestion': ['derivedFrom'],  // the entity, file or document URI that this ingested document was derived from
      'mapping': ['derivedFrom','influencedBy'],
      'mastering': ['derivedFrom','influencedBy'],
      'custom': ['derivedFrom','influencedBy']
    };
    let provTypes = {
      'ingestion': function () {
        return requiredInfoParams['ingestion'].every(val => Object.keys(info).includes(val));
      },
      'mapping': function () {
        return requiredInfoParams['mapping'].every(val => Object.keys(info).includes(val));
      },
      'mastering': function () {
        return requiredInfoParams['mastering'].every(val => Object.keys(info).includes(val));
      },
      'custom': function () {
        return requiredInfoParams['custom'].every(val => Object.keys(info).includes(val));
      }
    };
    let isValid = provTypes[stepDefinitionType]();
    return isValid || Error(`For Step Definition type ${stepDefinitionType}, the following properties on "info" are required: ${JSON.stringify(requiredInfoParams[stepDefinitionType])}`);
  }

  /**
   * @desc Validate a provenance record params
   * @param {string} [jobId] - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepName - the name of the step within a flow
   * @param {string} stepDefinitionName - the name of step definition within a flow
   * @param {string} stepDefinitionType - the type of step definition within a flow ['ingestion','mapping','mastering','custom']
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.status - the status of the step: 
   *                               ie. created/updated/deleted.  
   *                               Value is passed through to "provTypes".
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   */
  _validateCreateStepParams(jobId, flowId, stepName, stepDefinitionName, stepDefinitionType, docURI, info) {
    let isValid;
    if (flowId && stepName && stepDefinitionName && stepDefinitionType && info) {
      // check step type valid
      if (this._validStepDefinitionType(stepDefinitionType)) {
        let isProvInfoForStepTypeValid = (jobId) ? this._validProvInfoForStepType(stepDefinitionType, info) : true;
        let isProvInfoMetaValid = this._validProvInfoMetadata(info);
        // check prov info valid per type passed
        let hasError = isProvInfoForStepTypeValid instanceof Error || isProvInfoMetaValid instanceof Error;
        if (!hasError) {
          // function params are valid
          isValid = true;
        } else {
          // return Error that relates to prov info object
          isValid = (isProvInfoForStepTypeValid instanceof Error) ? isProvInfoForStepTypeValid : isProvInfoMetaValid;  
        }
      } else {
        isValid = new Error(`Step type ${stepDefinitionType} not defined.  Must be of type: 'ingestion','mapping','mastering','custom'.`);
      }
    } else {
      isValid = new Error(`Function requires all params 'flowId', 'stepName', 'stepDefinitionName', 'stepDefinitionType' and 'info' to be defined.`);
    }
    return isValid;
  }  

  /**
   * General create provenance record function that adds the same relations, 
   * attributes, dateTime & namespaces info each record requires.
   * @param {string} id - the identifier of this provenance information
   * @param {Object} options - provenance record options (see individual type requirements below)
   */
  _createRecord(id, options, metadata) {
    metadata = metadata || null;
    xdmp.eval(`
      const ps = require('/MarkLogic/provenance');
      xdmp.securityAssert("http://marklogic.com/xdmp/privileges/ps-user", "execute");

      options = options || {};
      options.dateTime = String(fn.currentDateTime());
      options.namespaces = { "dhf":"http://marklogic.com/dhf" }; // for user defined provenance types

      // relations
      options.relations = options.relations || {};
      options.relations.attributedTo = xdmp.getCurrentUser();

      // attributes
      options.attributes = options.attributes || {};
      options.attributes.roles = xdmp.getCurrentRoles().toArray().join(',');
      options.attributes.roleNames = xdmp.getCurrentRoles().toArray().map((r) => xdmp.roleName(r)).join(',');

      metadata = metadata || {};
      if (metadata)
        Object.assign(options.attributes, metadata)

      var record = ps.provenanceRecord(id, options);
      ps.provenanceRecordInsert(record);
      `,
      { id, options, metadata },
      {
        database: xdmp.database(this.config.JOBDATABASE),
        commit: 'auto',
        update: 'true',
        ignoreAmps: true
    })
    return id;
  }

  /**
   * @desc Create a provenance record when a document is run through an ingestion step
   * @param {string} jobId - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepName - the name of the step within a flow
   * @param {string} stepDefinitionName - the name of step definition within a flow
   * @param {string} docURI - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.derivedFrom - the entity, file or document URI that this ingested document was derived from
   * @param {string} info.influencedBy - the ingestion step the document was modified by
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   *   Ingest document from outside source
   *    provTypes: [ "ps:Flow", "ps:File" ],
   *    relations: 
   *      - generatedBy (job id)
   *      - derivedFrom (file)
   *      - derivedFrom (uri)
   *      - influencedBy (mapping)
   *      - associatedWith [flow id, step name, step definition name]
   *    attributes:
   *      - location (doc URI)
   */
  _createIngestionStepRecord(jobId, flowId, stepName, stepDefinitionName, docURI, info) {
    let provId = `${jobId + flowId + 'ingestion' + docURI}`;
    let provTypes = ['ps:Flow','ps:Entity','dhf:Entity','dhf:IngestionStep','dhf:IngestionStepEntity'];
    if (info && info.status)
      provTypes.push('dhf:Doc' + this.hubutils.capitalize(info.status));

    let recordOpts = {
      provTypes,
      relations: {
        associatedWith: [flowId, stepName, stepDefinitionName],
        generatedBy: jobId,
        derivedFrom: info && info.derivedFrom,
      },
      attributes: { location: docURI }
    };

    return (this.config.autoCommit) ? 
      this._createRecord(provId, recordOpts, info.metadata) : 
      this.config.commitQueue.push([provId, recordOpts, info.metadata]);
  }

  /**
   * @desc Create a provenance record when a document is run through a mapping step
   * @param {string} jobId - the ID of the job being executed (unique), this will generate
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepName - the name of the step within a flow
   * @param {string} stepDefinitionName - the name of step definition within a flow
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.derivedFrom - the entity, file or document URI that this ingested document was derived from
   * @param {string} info.influencedBy - the mapping step the document was modified by
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   *   Map Source document property to Entity Instance property
   *    provTypes: [ "ps:Flow", "ps:EntityProperty", "ps:Mapping", "dhf:ModelToModelMapping" ],
   *    relations:
   *      - generatedBy (job id)
   *      - derivedFrom (uri)
   *      - derivedFrom (array of uris) - not supported in current QuickStart
   *      - influencedBy (mapping)
   *      - influencedBy (component [aka. custom code])
   *      - associatedWith [flow id, step name, step definition name]
   *    attributes:
   *      - location (doc URI)
   */
  _createMappingStepRecord(jobId, flowId, stepName, stepDefinitionName, docURI, info) {
    let provId = `${jobId + flowId + 'mapping' + docURI}`;
    let provTypes = ['ps:Flow','ps:Entity','dhf:Entity','dhf:MappingStep','dhf:MappingStepEntity'];
    if (info && info.status)
      provTypes.push('dhf:Doc' + this.hubutils.capitalize(info.status));

    let recordOpts = {
      provTypes,
      relations: {
        associatedWith: [flowId, stepName, stepDefinitionName],
        generatedBy: jobId,
        derivedFrom: info && info.derivedFrom,
        influencedBy: info && info.influencedBy,
      },
      attributes: { location: docURI }
    };

    return (this.config.autoCommit) ? 
      this._createRecord(provId, recordOpts, info.metadata) : 
      this.config.commitQueue.push([provId, recordOpts, info.metadata]);
  }

  /**
   * @desc Create a provenance record when a document is run through a mastering step
   * @param {string} jobId - the ID of the job being executed (unique), this will generate
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepName - the name of the step within a flow
   * @param {string} stepDefinitionName - the name of step definition within a flow
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.derivedFrom - the entity, file or document URI that this ingested document was derived from
   * @param {string} info.influencedBy - the mastering step the document was modified by
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   *   Master Source doc property to Entity Instance property
   *    provTypes: [ "ps:Flow", "ps:EntityProperty", "dhf:Mastering" ],
   *    relations:
   *      - generatedBy (job id)
   *      - derivedFrom (uri)
   *      - derivedFrom (array of uris)
   *      - influencedBy (mastering)
   *      - influencedBy (component [aka. custom code])
   *      - associatedWith [flow id, step name, step definition name]
   *    attributes:
   *      - location (doc URI)
   */
  _createMasteringStepRecord(jobId, flowId, stepName, stepDefinitionName, docURI, info) {
    let provId = `${jobId + flowId + 'mastering' + docURI}`;
    let provTypes = ['ps:Flow','ps:Entity','dhf:Entity','dhf:MasteringStep','dhf:MasteringStepEntity'];
    if (info && info.status)
      provTypes.push('dhf:Doc' + this.hubutils.capitalize(info.status));

    let recordOpts = {
      provTypes,
      relations: {
        associatedWith: [flowId, stepName, stepDefinitionName],
        generatedBy: jobId,
        derivedFrom: info && info.derivedFrom,
        influencedBy: info && info.influencedBy,
      },
      attributes: { location: docURI }
    };

    return (this.config.autoCommit) ? 
      this._createRecord(provId, recordOpts, info.metadata) : 
      this.config.commitQueue.push([provId, recordOpts, info.metadata]);
  }

  /**
   * @desc Create a provenance record when a document is run through a custom step
   * @param {string} jobId - the ID of the job being executed (unique), this will generate
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepName - the name of the step within a flow
   * @param {string} stepDefinitionName - the name of step definition within a flow
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.derivedFrom - the entity, file or document URI that this ingested document was derived from
   * @param {string} info.influencedBy - the custom step the document was modified by
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   * Custom code transformations of source doc (prior to mapping/mastering) or Entity Instance (after mapping/mastering)
   *  provTypes: [ "ps:Flow", "ps:Entity", "dhf:Custom" ],
   *  relations:
   *    - generatedBy (job id)
   *    - derivedFrom (uri)
   *    - derivedFrom (array of uris)
   *    - influencedBy (component [aka. custom code])
   *    - associatedWith [flow id, step name, step definition name]
   *  attributes:
   *    - location (doc URI)
   */
  _createCustomStepRecord(jobId, flowId, stepName, stepDefinitionName, docURI, info) {
    let provId = `${jobId + flowId + 'custom' + docURI}`;
    let provTypes = ['ps:Flow','ps:Entity','dhf:Entity','dhf:CustomStep','dhf:CustomStepEntity'];
    if (info && info.status)
      provTypes.push('dhf:Doc' + this.hubutils.capitalize(info.status));
    
    let recordOpts = {
      provTypes,
      relations: {
        associatedWith: [flowId, stepName, stepDefinitionName],
        generatedBy: jobId,
        derivedFrom: info && info.derivedFrom,
        influencedBy: info && info.influencedBy,
      },
      attributes: { location: docURI }
    };

    return (this.config.autoCommit) ? 
      this._createRecord(provId, recordOpts, info.metadata) : 
      this.config.commitQueue.push([provId, recordOpts, info.metadata]);
  }

  /**
   * @desc Create a provenance record when a document is run through a Flow step
   * @param {string} [jobId] - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepName - the name of the step within a flow
   * @param {string} stepDefinitionName - the name of step definition within a flow
   * @param {string} stepDefinitionType - the type of step definition within a flow ['ingestion','mapping','mastering','custom']
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.status - the status of the step: 
   *                               ie. created/updated/deleted.  
   *                               Value is passed through to "provTypes".
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   */
  createStepRecord(jobId, flowId, stepName, stepDefinitionName, stepDefinitionType, docURI, info) {
    let resp;
    let isValid = this._validateCreateStepParams(jobId, flowId, stepName, stepDefinitionName, stepDefinitionType, docURI, info);
    if (!(isValid instanceof Error)) {
      let capitalizedStepType = this.hubutils.capitalize(stepDefinitionType);
      resp = this['_create' + capitalizedStepType + 'StepRecord'](jobId, flowId, stepName, stepDefinitionName, docURI, info);
    } else {
      resp = isValid
    }
    return resp;
  }

  /**
   * @desc Create a provenance record for a documents properties.  These records will be used to record property merges.
   * @param {string} jobId - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepName - the name of the step within a flow
   * @param {string} stepDefinitionName - the name of step definition within a flow
   * @param {string} stepDefinitionType - the type of step definition within a flow ['ingestion','mapping','mastering','custom']
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {string} docURI - the URI of the document being processed by this step
   * @param {Array}  properties - the properties of the document being processed by this step
   * @param {Object} info
   * @param {string} info.influencedBy - the Step ID assoicated this record
   * @return {Array} Document Prov ID, Document Prov IDs for properties as an Object of 
   *                  key/value pairs mapping property names to their provenance IDs, 
   *                  for use with follow-up createStepPropertyMergeRecords() call
   */
  createStepPropertyRecords(jobId, flowId, stepName, stepDefinitionName, stepDefinitionType, docURI, properties, info) {
    let resp;
    let docProvId;
    let docPropertyProvIds = {};
    let docPropertyProvIdsArray = [];
    let isValid = this._validateCreateStepParams(jobId, flowId, stepName, stepDefinitionName, stepDefinitionType, docURI, info);
    if (!(isValid instanceof Error)) {
      if (properties && properties.length > 0) {
        let capitalizedStepType = this.hubutils.capitalize(stepDefinitionType);
        for (let i=0; i<properties.length; i++) {
          let property = properties[i];
          let docPropProvId = `${jobId + flowId + stepDefinitionType + docURI}_${property}`
          let docPropProvOptions = {
            provTypes: [ 'ps:Flow', 'ps:EntityProperty', `dhf:${capitalizedStepType}`, 'dhf:EntityProperty', property ],
            relations: {
              associatedWith: [flowId, stepName, stepDefinitionName],
              generatedBy: jobId,
              influencedBy: info && info.influencedBy,
            },
            attributes: { location: docURI }        
          };
          // append to return Object  
          docPropertyProvIds[property] = docPropProvId; 
          docPropertyProvIdsArray.push(docPropProvId);
          (this.config.autoCommit) ? 
            this._createRecord(docPropProvId, docPropProvOptions, info.metadata) : 
            this.config.commitQueue.push([docPropProvId, docPropProvOptions, info.metadata]);
        }

        // create document record
        docProvId = `${jobId + flowId + stepDefinitionType + docURI}`;
        let provTypes = ['ps:Flow','ps:Entity','dhf:Entity',`dhf:${capitalizedStepType}Entity`];
        let recordOpts = {
          provTypes,
          relations: {
            associatedWith: [flowId, stepName, stepDefinitionName],
            generatedBy: jobId,
            hadMember: docPropertyProvIdsArray,
            influencedBy: info && info.influencedBy,
          },
          attributes: { location: docURI }
        };

        (this.config.autoCommit) ? 
          this._createRecord(docProvId, recordOpts, info.metadata) : 
          this.config.commitQueue.push([docProvId, recordOpts, info.metadata]);

        // construct response
        resp = [docProvId, docPropertyProvIds];
      } else {
        resp = new Error(`Function requires param 'properties' to be defined.`);
      }
    } else {
      resp = isValid
    }
    return resp;
  }  

  /**
   * @desc Create a provenance merge property record for multiple property records
   * @param {string} jobId - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepName - the name of the step within a flow
   * @param {string} stepDefinitionName - the name of step definition within a flow
   * @param {string} stepDefinitionType - the type of step definition within a flow ['ingestion','mapping','mastering','custom']
   * @param {string} propertyName - the name of the property being merged
   * @param {Array}  docURIs - the URIs of the documents associated with this merge
   * @param {Array}  propertyProvIds - the provenance record ids of the properties being merged by this step
   * @param {Object} info
   * @param {string} info.influencedBy - the Step ID assoicated this record
   * @return {Object} key/value pairs mapping property names to their provenance IDs, 
   *                  for use with follow-up createStepPropertyMergeRecords() call
   */
  createStepPropertyMergeRecord(jobId, flowId, stepName, stepDefinitionName, stepDefinitionType, propertyName, docURIs, propertyProvIds, info) {
    let resp = [];
    let isValid = this._validateCreateStepParams(jobId, flowId, stepName, stepDefinitionName, stepDefinitionType, docURI, info);
    if (!(isValid instanceof Error)) {
      if (docURIs && docURIs.length > 0 &&
        propertyProvIds && propertyProvIds.length > 0) {
        let capitalizedStepType = this.hubutils.capitalize(stepDefinitionType);
        let provId = `${jobId + flowId + stepDefinitionType + docURIs.concat()}_${propertyName}_merged`;
        let provTypes = ['ps:Flow','ps:Entity','dhf:MergedEntityProperty',`dhf:${capitalizedStepType}MergedEntityProperty`, propertyName];
        let recordOpts = {
          provTypes,
          relations: {
            associatedWith: [flowId, stepName, stepDefinitionName],
            generatedBy: jobId,
            derivedFrom: propertyProvIds,
            influencedBy: info && info.influencedBy,
          }
        };
        (this.config.autoCommit) ? 
          this._createRecord(provId, recordOpts, info.metadata) : 
          this.config.commitQueue.push([provId, recordOpts, info.metadata]);

        resp = provId;
      } else {
        resp = new Error(`Function requires param 'docURIs' & 'propertyProvIds' to be defined.`);
      }
    } else {
      resp = isValid
    }
    return resp;
  }
  
  /**
   * @desc Create a provenance merge record for multiple property records
   * @param {string} jobId - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepName - the name of the step within a flow
   * @param {string} stepDefinitionName - the name of step definition within a flow
   * @param {string} stepDefinitionType - the type of step definition within a flow ['ingestion','mapping','mastering','custom']
   * @param {Array}  docURI - the new URI of the document created after the merge
   * @param {Array}  propertyProvIds - the provenance record ids of the properties being merged by this step
   * @param {Object} info
   * @param {string} info.influencedBy - the Step ID assoicated this record
   * @return {Object} key/value pairs mapping property names to their provenance IDs, 
   *                  for use with follow-up createStepPropertyMergeRecords() call
   */
  createStepDocumentMergeRecord(jobId, flowId, stepName, stepDefinitionName, stepDefinitionType, newDocURI, documentProvIds, mergedPropertyProvIds, info) {
    let resp = [];
    let isValid = this._validateCreateStepParams(jobId, flowId, stepName, stepDefinitionName, stepDefinitionType, docURI, info);
    if (!(isValid instanceof Error)) { 
      if (documentProvIds && documentProvIds.length > 0 &&
        mergedPropertyProvIds && mergedPropertyProvIds.length > 0) {
        let capitalizedStepType = this.hubutils.capitalize(stepDefinitionType);
        let provId = `${jobId + flowId + stepDefinitionType + newDocURI}`;
        let provTypes = ['ps:Flow','ps:Entity','dhf:MergedEntity',`dhf:${capitalizedStepType}MergedEntity`];
        let recordOpts = {
          provTypes,
          relations: {
            associatedWith: [flowId, stepName, stepDefinitionName],
            generatedBy: jobId,
            derivedFrom: documentProvIds,
            hadMember: mergedPropertyProvIds,
            influencedBy: info && info.influencedBy,
          },
          attributes: { location: newDocURI }
        };
        (this.config.autoCommit) ? 
          this._createRecord(provId, recordOpts, info.metadata) : 
          this.config.commitQueue.push([provId, recordOpts, info.metadata]);
        resp = provId;
      } else {
        resp = new Error(`Function requires param 'documentProvIds' & 'mergedPropertyProvIds' to be defined.`);
      }
    } else {
      resp = isValid
    }
    return resp;
  }

  /**
   * @desc Commit all queued Provenance records.  Only works if config.autoCommit === false
   *       and records are being saved, rather than committed instantly.
   */
  commit() { 
    if (this.config.autoCommit === false && this.config.commitQueue.length > 0) {
      while (this.config.commitQueue.length) {
        this._createRecord( ...(this.config.commitQueue.shift()) );
      }
    }
  }

  /**
   * @desc Discard all queued Provenance records.  Only works if config.autoCommit === false
   *       and records are being saved, rather than committed instantly.
   */
  discard() { 
    if (this.config.autoCommit === false && this.config.commitQueue.length > 0) {
      this.config.commitQueue = [];
    }
  }

  // /**
  //  * @desc Create a provenance record when a Job is created immediately executed
  //  * @param {string} jobId - the ID of the job being executed (unique), this will generate 
  //  * @param {string} flowId - the unique ID of the flow
  //  * @param {Object} info
  //  * @param {string} info.status - the status of the job: 
  //  *                               ie. created/updated/deleted.  
  //  *                               Value is passed through to "provTypes".
  //  * @param {string} [info.metadata] - key/value pairs to document with the provenance record
  //  */
  // createJobRecord(jobId, flowId, info) {
  //   let resp;
  //   let provId = this.hubutils.uuid();
  //   let isProvInfoMetaValid = this._validProvInfoMetadata(info);

  //   if (!(isProvInfoMetaValid instanceof Error)) {
  //     let jobProvTypes = (info.status === 'started') ?
  //       ['ps:FlowRun', 'dhf:Job', 'dhf:Job' + this.hubutils.capitalize(info.status)] :
  //       ['ps:Flow', 'dhf:Job', 'dhf:Job' + this.hubutils.capitalize(info.status)];
  //     let recordOpts = {
  //       "provTypes" : jobProvTypes,
  //       "relations":{
  //         "generatedBy": jobId,
  //         "associatedWith": flowId
  //       }
  //     }
      
  //     if (this.config.autoCommit)
  //       resp = this._createRecord(provId, recordOpts, info.metadata);
  //     else {
  //       this.config.commitQueue.push([provId, recordOpts, info.metadata]);
  //       resp = provId; // will commit later, _createRecord just returns provId
  //     }
  //   } else {
  //     resp = isProvInfoMetaValid;
  //   }

  //   return resp;
  // }
  
  // /**
  //  * @desc Create a provenance record when a Flow is created
  //  * @param flowId - the name of the flow (unique)
  //  * @param {Object} info
  //  * @param {string} info.status - the status of the flow: 
  //  *                               ie. created/updated/deleted.  
  //  *                               Value is passed through to "provTypes".
  //  * @param {string} [info.metadata] - key/value pairs to document with the provenance record
  //  */
  // createFlowRecord(flowId, info) { 
  //   let resp;
  //   let provId = this.hubutils.uuid();
  //   let isProvInfoMetaValid = this._validProvInfoMetadata(info);

  //   if (!(isProvInfoMetaValid instanceof Error)) {
  //     let flowProvTypes = ['ps:Flow', 'dhf:Flow', 'dhf:Flow' + this.hubutils.capitalize(info.status)];
  //     let recordOpts = {
  //       "provTypes" : flowProvTypes,
  //       "relations":{
  //         "associatedWith": flowId
  //       }
  //     }
  //     if (this.config.autoCommit)
  //       resp = this._createRecord(provId, recordOpts, info.metadata);
  //     else {
  //       this.config.commitQueue.push([provId, recordOpts, info.metadata]);
  //       resp = provId; // will commit later, _createRecord just returns provId
  //     }
  //   } else {
  //     resp = isProvInfoMetaValid;
  //   }

  //   return resp;
  // }

  /**
   * @desc Create a provenance record when a Flow is created
   * @param docURI - The URI of the document
   * @param {Object} [info]
   * TODO: create more convenient ways to query
   */
  queryDocRecords(docURI, info) { 
    let resp;
    if (docURI)
      resp = xdmp.eval(`
        const ps = require('/MarkLogic/provenance');
        const op = require('/MarkLogic/optic');
        var match = {
          attributes: {
            location: docURI
          }
        };
        // TODO: change "out" so output for a single prov record is 
        // combined into a single Object in the Array
        var out = {
          dateTime: '?',
          provTypes: '?',  
          attributes : {'location' : '?'}
        };
        let kvPattern = ps.opTriplePattern(match, out);
        op.fromTriples(kvPattern).result().toArray();  
        `,
        { docURI },
        {
          database: xdmp.database(this.config.JOBDATABASE),
          commit: 'auto',
          update: 'true',
          ignoreAmps: true
      })
    else 
       resp = new Error(`Function requires param 'docURI' to be defined.`);
    
    return resp;
  }


  /**
   * @desc Create a provenance record when a Flow is created
   * @param docURI - The URI of the document
   * @param {Object} [info]
   * TODO: create more convenient ways to query
   */
  queryDocRecordsNoEval(docURI, info) { 
    let resp;
    if (docURI) {
      var match = {
        attributes: {
          location: docURI
        }
      };
      // TODO: change "out" so output for a single prov record is 
      // combined into a single Object in the Array
      var out = {
        dateTime: '?',
        provTypes: '?',  
        attributes : {'location' : '?'}
      };
      let kvPattern = ps.opTriplePattern(match, out);
      resp = op.fromTriples(kvPattern).result().toArray();  
    }
    else 
       resp = new Error(`Function requires param 'docURI' to be defined.`);
    
    return resp;
  }  
}

module.exports = Provenance
