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
const hubConfig = require("/com.marklogic.hub/config.sjs");

class Prov {
    /**
     * @desc Provenance Class constructor
     * @param {Object} [config] 
     * @param {string} [config.granularityLevel=coarse] - for setting the Prov object granularity level (currently unused)
     */
    constructor(config) {
      this.granularityLevels  = ['fine','coarse'];
      this.granularityLevel   = config && config.granularityLevel || 'coarse';
      this.jobsDatabase       = hubConfig.JOBDATABASE;
    }

    /**
     * Get array of provTypes for a given step type for provenance record creation
     * @param {string} stepType - step type ['ingest','mapping','mastering','custom']
     */
    _validStepType(stepType) {
      return ['ingest','mapping','mastering','custom'].includes(stepType)
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
          return rquiredInfoParams['ingest'].every(val => Object.keys(info).includes(val)) || Error('');
        },
        'mapping': function () {
          return rquiredInfoParams['mapping'].every(val => Object.keys(info).includes(val));
        },
        'mastering': function () {
          return rquiredInfoParams['mastering'].every(val => Object.keys(info).includes(val));
        },
        'custom': function () {
          return rquiredInfoParams['custom'].every(val => Object.keys(info).includes(val));
        }
      };
      return provTypes[stepType]() ? 
        true : 
        Error(`For Step type ${stepType}, the following properties on "info" are required: ${JSON.stringify(requiredInfoParams[stepType])}`);
    }

    /**
     * Get array of provTypes for a given step type for provenance record creation
     * @param {string} stepType - step type ['ingest','mapping','mastering','custom']
     */
    _getProvTypesByStep(stepType) {
      let provTypes = {
        'ingest': function () {
          return ['ps:Flow','ps:File']  // is there a "ps:Source ? for a non-file source or something similar?"
        },
        'mapping': function () {
          return ['ps:Flow','ps:EntityProperty','ps:Mapping','dhf:ModelToModelMapping']
        },
        'mastering': function () {
          return ['ps:Flow','ps:EntityProperty','dhf:Mastering']
        },
        'custom': function () {
          return ['ps:Flow','ps:Entity','dhf:Custom']
        }
      };
      return provTypes[stepType] ? provTypes[stepType]() : null;
    }
    

    /**
     * General create provenance record function that adds the same relations, 
     * attributes, dateTime & namespaces info each record requires.
     * @param {string} id - the identifier of this provenance information
     * @param {Object} options - provenance record options (see individual type requirements below)
     */
    _createRecord(id, options) {
      xdmp.securityAssert("http://marklogic.com//xdmp/privileges/provenance/ps-user", "execute");

      options = options || {};
      options.dateTime = String(fn.currentDateTime());
      options.namespaces = { "dhf":"http://marklogic.com/dhf" }; // for user defined provenance types

      // relations
      options.relations = options.relations || {};
      options.relations.attributedTo = xdmp.getCurrentUser();

      // attributes
      options.attributes = options.attributes || {};
      options.attributes.roles = xdmp.getCurrentRoles().toArray();
      options.attributes.roleNames = xdmp.getCurrentRoles().toArray().map((r) => xdmp.roleName(r));
      
      var record = ps.provenanceRecord(id, options);
      ps.provenanceRecordInsert(record);

      // TODO: eval with this.jobsDatabase used as target  
    }

    /**
     * @desc Create a provenance record when a document is run through an ingest step
     * @param {string} jobId - the ID of the job being executed (unique), this will generate 
     * @param {string} flowId - the unique ID of the flow
     * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
     * @param {string} docURI - the unique ID of the flow (undefined on ingest)
     * @param {Object} info
     * @param {string} info.derivedFrom - the entity, file or document URI that this ingested document was derived from
     * @param {string} [info.metadata] - key/value pairs to document with the provenance record
     *   Ingest document from outside source
     *    provTypes: [ "ps:Flow", "ps:File" ],
     *    relations: 
     *      - generatedBy (job id)
     *      - derivedFrom (file)
     *      - associatedWith (flow id)
     *    attributes:
     *      - location (doc URI)
     */
    _createIngestStepRecord(jobId, flowId, stepType, docURI, info) {
      let recordOpts = {
        provTypes : this._getProvTypesByStep(stepType),
        relations: {
          associatedWith: flowId,
          generatedBy: jobId,
          derivedFrom: info && info.derivedFrom,
        },
        attributes: {
          location: docURI
        }
      };
      this._createRecord(provId, recordOpts);
    }

    /**
     * @desc Create a provenance record when a document is run through a mapping step
     * @param {string} jobId - the ID of the job being executed (unique), this will generate 
     * @param {string} flowId - the unique ID of the flow
     * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
     * @param {string} docURI - the unique ID of the flow (undefined on ingest)
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
      let recordOpts = {
        provTypes : this._getProvTypesByStep(stepType),
        relations: {
          associatedWith: flowId,
          generatedBy: jobId,
          derivedFrom: info && info.derivedFrom,
          influencedBy: info && info.influencedBy,
        },
        attributes: {
          location: docURI
        }
      };
      this._createRecord(provId, recordOpts)
    }

    /**
     * @desc Create a provenance record when a document is run through a mastering step
     * @param {string} jobId - the ID of the job being executed (unique), this will generate 
     * @param {string} flowId - the unique ID of the flow
     * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
     * @param {string} docURI - the unique ID of the flow (undefined on ingest)
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
      let recordOpts = {
        provTypes : this._getProvTypesByStep(stepType),
        relations: {
          associatedWith: flowId,
          generatedBy: jobId,
          derivedFrom: info && info.derivedFrom,
          influencedBy: info && info.influencedBy,
        },
        attributes: {
          location: docURI
        }
      };
      this._createRecord(provId, recordOpts)
    }

     /**
     * @desc Create a provenance record when a document is run through a custom step
     * @param {string} jobId - the ID of the job being executed (unique), this will generate 
     * @param {string} flowId - the unique ID of the flow
     * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
     * @param {string} docURI - the unique ID of the flow (undefined on ingest)
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
      let recordOpts = {
        provTypes : this._getProvTypesByStep(stepType),
        relations: {
          associatedWith: flowId,
          generatedBy: jobId,
          derivedFrom: info && info.derivedFrom,
          influencedBy: info && info.influencedBy,
        },
        attributes: {
          location: docURI
        }
      };
      this._createRecord(provId, recordOpts)
    }

    
    /**
     * @desc Create a provenance record when a document is run through a Flow step
     * @param {string} jobId - the ID of the job being executed (unique), this will generate 
     * @param {string} flowId - the unique ID of the flow
     * @param {string} stepType - the type of step within a flow ['ingest','mapping','mastering','custom']
     * @param {string} docURI - the unique ID of the flow (undefined on ingest)
     * @param {Object} info
     * @param {string} [info.metadata] - key/value pairs to document with the provenance record
     */
    createStepRecord(jobId, flowId, stepType, docURI, info) {
      let resp;
      // check required params passed
      if (jobId && flowId && stepType && docURI) {
        // check step type valid
        if (this._validStepType(stepType)) {
          let isProvInfoValid = this._validProvInfoForStepType(stepType, info);
          // check prov info valid per type passed
          if (isProvInfoValid && !(isProvInfoValid instanceof Error)) {
            // all is well, call step appropriate private function
            let capitalizedName = stepType.charAt(0).toUpperCase() + stepType.slice(1);
            resp = this['_create' + capitalizedName + 'StepRecord'](jobId, flowId, stepType, docURI, info);
          } else {
            resp = isProvInfoValid;  // return Error that relates to prov info object
          }
        } else {
          resp = new Error(`Step type ${stepType} not defined.  Must be of type: 'ingest','mapping','mastering','custom'.`);
        }
      } else {
        resp = new Error(`Function requires all params 'jobId','flowId','stepType','docURI' and 'info' to be defined.`);
      }
      return resp;
    }

    /**
     * @desc Create a provenance record when a Job is created immediately executed
     * @param {string} jobId - the ID of the job being executed (unique), this will generate 
     * @param {string} flowId - the unique ID of the flow
     * @param {Object} [options]
     * @param {string} [options.metadata] - key/value pairs to document with the provenance record
     */
    createJobRecord(jobId, flowId, info) {
      let recordOpts = {
        "provTypes" : [ "ps:FlowRun" ],
        "relations":{
          "associatedWith": flowId
        }
      }
      this._createRecord(jobId, recordOpts);
    }    

    /**
     * @desc Create a provenance record when a Flow is created
     * @param flowId - the name of the flow (unique)
     * @param {Object} [options] - The employee who is responsible for the project.
     * @param {string} [options.metadata] - key/value pairs to document with the provenance record
     * ! AFAIK - there is no requirement to create provenance information for Flows themselves, just their steps
     */
    createFlowRecord(flowId, options) { }

}

module.exports = Prov