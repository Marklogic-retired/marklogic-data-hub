import * as _ from "lodash";
import {Step} from "../../../models/step.model";

/**
 * Ingestion config model object
 */
export class Ingestion {

  inputFilePath: string;
  inputFileType: 'aggregates' | 'archive' | 'delimited_text' | 'delimited_json' | 'documents' | 'forest' | 'rdf' | 'sequencefile';
  outputCollections: string; // comma separated list of text
  outputPermissions: string; // comma separated list of text
  documentType: "json" | 'xml';
  transformModule: string;
  transformNamespace: string;
  transformParams: string; // comma separated list of text

  static fromConfig(step): Step {
    const config = step.config;
    const newStep = _.cloneDeep(step);
    const result = new Ingestion();
    result.inputFilePath = config && config['input_file_path'] || '.';
    result.inputFileType = config && config['input_file_type'] || 'documents';
    result.outputCollections = config && config['output_collections'] || '';
    result.outputPermissions = config && config['output_permissions'] || 'rest-reader,read,rest-writer,update';
    result.documentType = config && config['document_type'] || 'json';
    result.transformModule = config && config['transform_module'] || '/data-hub/5/transforms/mlcp-flow-transform.sjs';
    result.transformNamespace = config && config['transform_namespace'] || 'http://marklogic.com/data-hub/mlcp-flow-transform';
    result.transformParams = config && config['transform_param'] || '';
    newStep.config = result;
    return newStep;
  }

  static fromUI(input: Step): Step {
    const config: any = {};
    config['input_file_path'] = input.config['inputFilePath'];
    config['input_file_type'] = input.config['inputFileType'];
    config['output_collections'] = input.config['outputCollections'];
    config['output_permissions'] = input.config['outputPermissions'];
    config['document_type'] = input.config['documentType'];
    config['transform_module'] = input.config['transformModule'];
    config['transform_namespace'] = input.config['transformNamespace'];
    config['transform_param'] = input.config['transformParams'];
    const newStep = _.cloneDeep(input);
    newStep.config = config;
    return newStep;
  }
}
