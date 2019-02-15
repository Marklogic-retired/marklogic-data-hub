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
const HubUtils = require("/data-hub/5/impl/hub-utils.sjs");
const hubutils = new HubUtils();

class Provenance {
  /**
   * @desc Provenance Class constructor
   * @param {Object} [config] 
   * @param {string} [config.granularityLevel=coarse] - for setting the Prov object granularity level (currently unused)
   */
  constructor(config = null) {
    this.granularityLevels          = ['fine','coarse'];
    this.config = {};
    this.config.granularityLevel    = config && config.granularityLevel || 'coarse';
    this.config.JOBDATABASE         = defaultConfig.JOBDATABASE || 'data-hub-JOBS';
  }  

  /**
   * Get array of provTypes for a given step type for provenance record creation
   * @param {string} stepType - step type ['ingest','mapping','mastering','custom']
   */
  _validStepType(stepType) {
    return ['ingest','mapping','mastering','custom'].includes(stepType)
  }
  /**
   * Vaidate that the info Object to ensure the metadata passed doesn't stomp on roles or location values
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
   * Vaidate that the info Object 
   * @param {string} stepType - step type ['ingest','mapping','mastering','custom']
   * @param {Object} info - object representing the information required to create prov info
   */
  _validProvInfoForStepType(stepType, info) {
    let requiredInfoParams = { 
      'ingest': ['derivedFrom'],  // the entity, file or document URI that this ingested document was derived from
      'mapping': ['derivedFrom','influencedBy'],
      'mastering': ['derivedFrom','influencedBy'],
      'custom': ['derivedFrom','influencedBy']
    };
    let provTypes = {
      'ingest': function () {
        return requiredInfoParams['ingest'].every(val => Object.keys(info).includes(val));
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
    let isValid = provTypes[stepType]();
    return isValid || Error(`For Step type ${stepType}, the following properties on "info" are required: ${JSON.stringify(requiredInfoParams[stepType])}`);
  }

  /**
   * @desc Validate a provenance record params
   * @param {string} [jobId] - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.status - the status of the step: 
   *                               ie. created/updated/started/canceled/completed/deleted.  
   *                               Value is passed through to "provTypes".
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   */
  _validateCreateStepParams(jobId, flowId, stepType, docURI, info) {
    let isValid;
    if (flowId && stepType && info) {
      // check step type valid
      if (this._validStepType(stepType)) {
        let isProvInfoForStepTypeValid = (jobId) ? this._validProvInfoForStepType(stepType, info) : true;
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
        isValid = new Error(`Step type ${stepType} not defined.  Must be of type: 'ingest','mapping','mastering','custom'.`);
      }
    } else {
      isValid = new Error(`Function requires all params 'flowId','stepType' and 'info' to be defined.`);
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
      xdmp.securityAssert("http://marklogic.com//xdmp/privileges/provenance/ps-user", "execute");

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
   * @desc Create a provenance record when a document is run through an ingest step
   * @param {string} [jobId] - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.derivedFrom - the entity, file or document URI that this ingested document was derived from
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   *   Ingest document from outside source
   *    provTypes: [ "ps:Flow", "ps:File" ],
   *    relations: 
   *      - generatedBy (job id)
   *      - derivedFrom (file)
   *      - derivedFrom (uri)
   *      - associatedWith (flow id)
   *    attributes:
   *      - location (doc URI)
   */
  _createIngestStepRecord(jobId, flowId, stepType, docURI, info) {
    let provId = hubutils.uuid();
    let provTypes = ['ps:Flow','dhf:Ingest'];
    if (info && info.status)
      provTypes.push('dhf:Step' + hubutils.capitalize(info.status));

    let recordOpts = {
      provTypes,
      relations: {
        associatedWith: flowId,
        generatedBy: jobId || undefined,
        derivedFrom: info && info.derivedFrom,
      },
      // if we have a docURI, then we're recording the step execution on a document
      // if not, then we're recording the state of the step itself changing
      attributes: docURI ? { location: docURI } : undefined
    };

    return this._createRecord(provId, recordOpts, info.metadata);
  }

  /**
   * @desc Create a provenance record when a document is run through a mapping step
   * @param {string} [jobId] - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.derivedFrom - the entity, file or document URI that this ingested document was derived from
   * @param {string} info.influencedBy - the mapping or component [aka. custom code] the document modified by
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   *   Map Source document property to Entity Instance property
   *    provTypes: [ "ps:Flow", "ps:EntityProperty", "ps:Mapping", "dhf:ModelToModelMapping" ],
   *    relations:
   *      - generatedBy (job id)
   *      - derivedFrom (uri)
   *      - derivedFrom (array of uris) - not supported in current QuickStart
   *      - influencedBy (mapping)
   *      - influencedBy (component [aka. custom code])
   *      - associatedWith (flow id)
   *    attributes:
   *      - location (doc URI)
   */
  _createMappingStepRecord(jobId, flowId, stepType, docURI, info) {
    let provId = hubutils.uuid();
    let provTypes = ['ps:Flow','ps:EntityProperty','ps:Mapping','dhf:Mapping'];
    if (info && info.status)
      provTypes.push('dhf:Step' + hubutils.capitalize(info.status));

    let recordOpts = {
      provTypes,
      relations: {
        associatedWith: flowId,
        generatedBy: jobId || undefined,
        derivedFrom: info && info.derivedFrom,
        influencedBy: info && info.influencedBy,
      },
      // if we have a docURI, then we're recording the step execution on a document
      // if not, then we're recording the state of the step itself changing
      attributes: docURI ? { location: docURI } : undefined
    };

    return this._createRecord(provId, recordOpts, info.metadata)
  }

  /**
   * @desc Create a provenance record when a document is run through a mastering step
   * @param {string} [jobId] - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.derivedFrom - the entity, file or document URI that this ingested document was derived from
   * @param {string} info.influencedBy - the mapping or component [aka. custom code] the document modified by
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   *   Master Source doc property to Entity Instance property
   *    provTypes: [ "ps:Flow", "ps:EntityProperty", "dhf:Mastering" ],
   *    relations:
   *      - generatedBy (job id)
   *      - derivedFrom (uri)
   *      - derivedFrom (array of uris)
   *      - influencedBy (mapping)
   *      - influencedBy (component [aka. custom code])
   *      - associatedWith (flow id)
   *    attributes:
   *      - location (doc URI)
   */
  _createMasteringStepRecord(jobId, flowId, stepType, docURI, info) {
    let provId = hubutils.uuid();
    let provTypes = ['ps:Flow','ps:EntityProperty','dhf:Mastering'];
    if (info && info.status)
      provTypes.push('dhf:Step' + hubutils.capitalize(info.status));

    let recordOpts = {
      provTypes,
      relations: {
        associatedWith: flowId,
        generatedBy: jobId || undefined,
        derivedFrom: info && info.derivedFrom,
        influencedBy: info && info.influencedBy,
      },
      // if we have a docURI, then we're recording the step execution on a document
      // if not, then we're recording the state of the step itself changing
      attributes: docURI ? { location: docURI } : undefined
    };

    return this._createRecord(provId, recordOpts, info.metadata)
  }

   /**
   * @desc Create a provenance record when a document is run through a custom step
   * @param {string} [jobId] - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   * Custom code transformations of source doc (prior to mapping/mastering) or Entity Instance (after mapping/mastering)
   *  provTypes: [ "ps:Flow", "ps:Entity", "dhf:Custom" ],
   *  relations:
   *    - generatedBy (job id)
   *    - derivedFrom (uri)
   *    - derivedFrom (array of uris)
   *    - influencedBy (component [aka. custom code])
   *    - associatedWith (flow id)     
   *  attributes:
   *    - location (doc URI)
   */
  _createCustomStepRecord(jobId, flowId, stepType, docURI, info) {
    let provId = hubutils.uuid();
    let provTypes = ['ps:Flow','ps:Entity','dhf:Custom'];
    if (info && info.status)
      provTypes.push('dhf:Step' + hubutils.capitalize(info.status));
    
    let recordOpts = {
      provTypes,
      relations: {
        associatedWith: flowId,
        generatedBy: jobId || undefined,
        derivedFrom: info && info.derivedFrom,
        influencedBy: info && info.influencedBy,
      },
      // if we have a docURI, then we're recording the step execution on a document
      // if not, then we're recording the state of the step itself changing
      attributes: docURI ? { location: docURI } : undefined
    };

    return this._createRecord(provId, recordOpts, info.metadata)
  }

  /**
   * @desc Create a provenance record when a document is run through a Flow step
   * @param {string} [jobId] - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
   * @param {string} [docURI] - the URI of the document being modified by this step
   * @param {Object} info
   * @param {string} info.status - the status of the step: 
   *                               ie. created/updated/started/canceled/completed/deleted.  
   *                               Value is passed through to "provTypes".
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   */
  createStepRecord(jobId, flowId, stepType, docURI, info) {
    let resp;
    let isValid = this._validateCreateStepParams(jobId, flowId, stepType, docURI, info);
    if (!(isValid instanceof Error)) {
      let capitalizedName = hubutils.capitalize(stepType);
      resp = this['_create' + capitalizedName + 'StepRecord'](jobId, flowId, stepType, docURI, info);
    } else {
      resp = isValid
    }
    return resp;
  }

  /**
   * @desc Create a provenance record when a Job is created immediately executed
   * @param {string} jobId - the ID of the job being executed (unique), this will generate 
   * @param {string} flowId - the unique ID of the flow
   * @param {Object} info
   * @param {string} info.status - the status of the job: 
   *                               ie. created/updated/started/canceled/completed/deleted.  
   *                               Value is passed through to "provTypes".
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   */
  createJobRecord(jobId, flowId, info) {
    let resp;
    let provId = hubutils.uuid();
    let isProvInfoMetaValid = this._validProvInfoMetadata(info);

    if (!(isProvInfoMetaValid instanceof Error)) {
      let jobProvTypes = (info.status === 'started') ?
        ['ps:FlowRun', 'dhf:Job', 'dhf:Job' + hubutils.capitalize(info.status)] :
        ['ps:Flow', 'dhf:Job', 'dhf:Job' + hubutils.capitalize(info.status)];
      let recordOpts = {
        "provTypes" : jobProvTypes,
        "relations":{
          "generatedBy": jobId,
          "associatedWith": flowId
        }
      }
      resp = this._createRecord(provId, recordOpts, info.metadata);
    } else {
      resp = isProvInfoMetaValid;
    }

    return resp;
  }
  
  /**
   * @desc Create a provenance record when a Flow is created
   * @param flowId - the name of the flow (unique)
   * @param {Object} info
   * @param {string} info.status - the status of the flow: 
   *                               ie. created/updated/started/canceled/completed/deleted.  
   *                               Value is passed through to "provTypes".
   * @param {string} [info.metadata] - key/value pairs to document with the provenance record
   */
  createFlowRecord(flowId, info) { 
    let resp;
    let provId = hubutils.uuid();
    let isProvInfoMetaValid = this._validProvInfoMetadata(info);

    if (!(isProvInfoMetaValid instanceof Error)) {
      let flowProvTypes = ['ps:Flow', 'dhf:Flow', 'dhf:Flow' + hubutils.capitalize(info.status)];
      let recordOpts = {
        "provTypes" : flowProvTypes,
        "relations":{
          "associatedWith": flowId
        }
      }
      resp = this._createRecord(provId, recordOpts, info.metadata);
    } else {
      resp = isProvInfoMetaValid;
    }

    return resp;
  }

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
